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

export async function runExplore(
  config: AppConfig,
  profile: LearnerProfile,
  _sessions: SessionStore,
): Promise<void> {
  const skillContent = loadSkillContent(config.contentDir, "explore");
  const systemPrompt = buildSystemPrompt(
    config.contentDir,
    skillContent,
    profile,
  );

  console.log("\n========================================");
  console.log("  탐색 모드 (Explore Mode)");
  console.log("  궁금한 AI 키워드나 도구를 입력하세요.");
  console.log("  (메뉴로 돌아가려면 /menu)");
  console.log("========================================\n");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  let sessionId: string | undefined;

  try {
    while (true) {
      const topic = (await rl.question("탐색할 키워드: ")).trim();

      if (!topic) continue;
      if (topic === "/menu" || topic === "/quit") break;

      const prompt = sessionId
        ? topic
        : `Learner wants to explore: "${topic}". Follow the explore skill output format (4 blocks, 5 sentences max). Respond in Korean.`;

      const response = query({
        prompt,
        options: {
          customSystemPrompt: systemPrompt,
          allowedTools: ["AskUserQuestion"],
          model: config.model,
          permissionMode: "default",
          ...(sessionId ? { resume: sessionId } : {}),
          canUseTool,
        },
      });

      console.log("");

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

      console.log("\n");
    }
  } finally {
    rl.close();
  }
}
