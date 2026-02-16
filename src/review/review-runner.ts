import * as readline from "node:readline/promises";
import { query } from "@anthropic-ai/claude-code";
import { buildSystemPrompt } from "../content/system-prompt.js";
import { loadSkillContent } from "../content/loader.js";
import { handleAskUserQuestion } from "../ui/ask.js";
import { SessionStore } from "../state/session-store.js";
import type { AppConfig, LearnerProfile } from "../types.js";

async function canUseTool(
  toolName: string,
  input: Record<string, unknown>,
) {
  if (toolName === "AskUserQuestion") {
    return handleAskUserQuestion(input);
  }
  return { behavior: "allow" as const, updatedInput: input };
}

export async function runReview(
  config: AppConfig,
  profile: LearnerProfile,
  _sessions: SessionStore,
): Promise<void> {
  const skillContent = loadSkillContent(config.contentDir, "review");
  const systemPrompt = buildSystemPrompt(
    config.contentDir,
    skillContent,
    profile,
  );

  const completedList =
    profile.progress.completed_skills.length > 0
      ? profile.progress.completed_skills.join(", ")
      : "없음 (아직 완료한 모듈이 없습니다)";

  console.log("\n========================================");
  console.log("  종합 복습 (Review)");
  console.log(`  완료 모듈: ${completedList}`);
  console.log("  (메뉴로 돌아가려면 /menu)");
  console.log("========================================\n");

  const initialPrompt = `Run the review process as defined in the review skill.
Completed modules: ${completedList}.
Follow the review structure: check understanding per module, identify gaps, suggest re-study paths, and create a 2-week action plan.
Respond in Korean.`;

  const response = query({
    prompt: initialPrompt,
    options: {
      customSystemPrompt: systemPrompt,
      allowedTools: ["AskUserQuestion"],
      model: config.model,
      permissionMode: "default",
      canUseTool,
    },
  });

  let sessionId: string | undefined;

  for await (const message of response) {
    if (message.type === "system" && message.subtype === "init") {
      sessionId = message.session_id;
    }

    if (message.type === "assistant") {
      for (const block of message.message.content) {
        if ("text" in block && typeof block.text === "string") {
          process.stdout.write(block.text);
        }
      }
    }

    if (message.type === "result") {
      break;
    }
  }

  // Multi-turn for review follow-up
  if (sessionId) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    try {
      while (true) {
        const userInput = (await rl.question("\n> ")).trim();
        if (!userInput || userInput === "/menu" || userInput === "/quit")
          break;

        const followUp = query({
          prompt: userInput,
          options: {
            customSystemPrompt: systemPrompt,
            allowedTools: ["AskUserQuestion"],
            model: config.model,
            permissionMode: "default",
            resume: sessionId,
            canUseTool,
          },
        });

        console.log("");

        for await (const msg of followUp) {
          if (msg.type === "assistant") {
            for (const block of msg.message.content) {
              if ("text" in block && typeof block.text === "string") {
                process.stdout.write(block.text);
              }
            }
          }
          if (msg.type === "result") break;
        }
      }
    } finally {
      rl.close();
    }
  }
}
