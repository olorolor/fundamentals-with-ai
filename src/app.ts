import { readProfile, writeProfile } from "./state/profile.js";
import { showMainMenu } from "./ui/menu.js";
import { runDiagnostic } from "./diagnostic/diagnostic.js";
import { runModule } from "./modules/module-runner.js";
import { runExplore } from "./explore/explore-runner.js";
import { runReview } from "./review/review-runner.js";
import { reportProgress } from "./webhook/reporter.js";
import { SessionStore } from "./state/session-store.js";
import type { AppConfig } from "./types.js";

export async function runApp(config: AppConfig): Promise<void> {
  const sessions = new SessionStore(config.dataDir);
  let profile = readProfile(config.dataDir);

  // Run diagnostic if no profile exists
  if (!profile || !profile.diagnosis_completed) {
    profile = await runDiagnostic();
    writeProfile(config.dataDir, profile);
    await reportProgress(config.webhookUrl, {
      event: "diagnostic_completed",
      profile: profile.profile,
      recommendation: profile.recommendation,
    });

    // Show summary
    console.log("\n========================================");
    console.log("  진단 완료!");
    console.log("========================================");
    console.log(`\n  추천 시작점: ${profile.recommendation.start_skill}`);
    console.log(`  이유: ${profile.recommendation.reason}`);
    console.log("");
  } else {
    console.log("\n기존 학습 프로필을 불러왔습니다.");
    console.log(`  직무: ${profile.profile.role}`);
    console.log(`  목표: ${profile.profile.goal}`);
    const completed = profile.progress.completed_skills;
    if (completed.length > 0) {
      console.log(`  완료: ${completed.join(", ")}`);
    }
  }

  // Main menu loop
  let running = true;
  while (running) {
    profile = readProfile(config.dataDir)!;

    const choice = await showMainMenu(profile);

    switch (choice.type) {
      case "module": {
        const result = await runModule(
          config,
          profile,
          choice.moduleId,
          sessions,
        );

        if (result.completed) {
          if (!profile.progress.completed_skills.includes(choice.moduleId)) {
            profile.progress.completed_skills.push(choice.moduleId);
          }
          profile.progress.current_skill = null;
          writeProfile(config.dataDir, profile);
          sessions.clear(choice.moduleId);

          await reportProgress(config.webhookUrl, {
            event: "module_completed",
            moduleId: choice.moduleId,
          });

          console.log(`\n${choice.moduleId} 완료!`);
        } else if (result.sessionId) {
          profile.progress.current_skill = choice.moduleId;
          writeProfile(config.dataDir, profile);
          sessions.save(choice.moduleId, result.sessionId);
        }
        break;
      }

      case "explore": {
        await runExplore(config, profile, sessions);
        break;
      }

      case "review": {
        await runReview(config, profile, sessions);
        profile.progress.last_review_at =
          new Date().toISOString().split("T")[0]!;
        writeProfile(config.dataDir, profile);
        break;
      }

      case "quit": {
        running = false;
        break;
      }
    }
  }

  console.log("\n학습을 마칩니다. 다음에 또 만나요!\n");
}
