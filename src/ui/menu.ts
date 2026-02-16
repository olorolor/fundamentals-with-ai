import * as readline from "node:readline/promises";
import { MODULES, type LearnerProfile, type MenuChoice } from "../types.js";

export async function showMainMenu(
  profile: LearnerProfile,
): Promise<MenuChoice> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const completed = new Set(profile.progress.completed_skills || []);

  console.log("\n========================================");
  console.log("  AI for AI - AI가 직접 가르치는 AI 교육");
  console.log("========================================\n");

  console.log("학습 모듈:");
  for (const mod of MODULES) {
    const status = completed.has(mod.id) ? "[완료]" : "[    ]";
    const current =
      profile.progress.current_skill === mod.id ? " <-- 진행 중" : "";
    console.log(`  ${mod.shortKey}) ${status} ${mod.label}${current}`);
  }

  console.log("");
  console.log("  E) 탐색 모드 (Explore) - AI 키워드/트렌드 빠르게 탐색");
  console.log("  R) 종합 복습 (Review) - 학습 내용 정리 및 점검");
  console.log("  Q) 종료");

  if (
    profile.recommendation?.start_skill &&
    !completed.has(profile.recommendation.start_skill)
  ) {
    console.log("");
    console.log(`  추천: ${profile.recommendation.start_skill}`);
    console.log(`  이유: ${profile.recommendation.reason}`);
  }

  const answer = (await rl.question("\n선택: ")).trim();
  rl.close();

  const num = parseInt(answer);
  if (num >= 1 && num <= 6) {
    return { type: "module", moduleId: MODULES[num - 1]!.id };
  }
  if (answer.toLowerCase() === "e") return { type: "explore" };
  if (answer.toLowerCase() === "r") return { type: "review" };
  if (answer.toLowerCase() === "q") return { type: "quit" };

  console.log("잘못된 입력입니다. 다시 선택해주세요.");
  return showMainMenu(profile);
}
