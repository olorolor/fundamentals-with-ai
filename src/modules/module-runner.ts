import * as readline from "node:readline/promises";
import { query } from "@anthropic-ai/claude-code";
import { buildSystemPrompt } from "../content/system-prompt.js";
import { loadSkillContent } from "../content/loader.js";
import { handleAskUserQuestion } from "../ui/ask.js";
import { SessionStore } from "../state/session-store.js";
import type { AppConfig, LearnerProfile, ModuleResult } from "../types.js";

async function canUseTool(
  toolName: string,
  input: Record<string, unknown>,
) {
  if (toolName === "AskUserQuestion") {
    return handleAskUserQuestion(input);
  }
  return { behavior: "allow" as const, updatedInput: input };
}

export async function runModule(
  config: AppConfig,
  profile: LearnerProfile,
  moduleId: string,
  sessions: SessionStore,
): Promise<ModuleResult> {
  const skillContent = loadSkillContent(config.contentDir, moduleId);
  const systemPrompt = buildSystemPrompt(
    config.contentDir,
    skillContent,
    profile,
  );

  const existingSessionId = sessions.get(moduleId);

  console.log("\n----------------------------------------");
  console.log(`  ${moduleId} 시작`);
  console.log("  (메뉴로 돌아가려면 /menu, 종료하려면 /quit)");
  console.log("----------------------------------------\n");

  let completed = false;
  let sessionId = existingSessionId || "";

  const initialPrompt = existingSessionId
    ? "이어서 진행해주세요. (Continuing from where we left off.)"
    : `Begin teaching this module. Start with the core question (핵심 질문) from the module definition.
Follow the educational principles in your system prompt.
Use Socratic questioning and analogies relevant to the learner's role.`;

  const response = query({
    prompt: initialPrompt,
    options: {
      customSystemPrompt: systemPrompt,
      allowedTools: ["AskUserQuestion"],
      model: config.model,
      permissionMode: "default",
      ...(existingSessionId ? { resume: existingSessionId } : {}),
      canUseTool,
    },
  });

  for await (const message of response) {
    if (message.type === "system" && message.subtype === "init") {
      sessionId = message.session_id;
    }

    if (message.type === "assistant") {
      for (const block of message.message.content) {
        if ("text" in block && typeof block.text === "string") {
          process.stdout.write(block.text);
          if (block.text.includes("[MODULE_COMPLETE]")) {
            completed = true;
          }
        }
      }
    }

    if (message.type === "result") {
      break;
    }
  }

  // If the single-prompt query ended, enter multi-turn loop
  if (!completed) {
    completed = await multiTurnLoop(config, systemPrompt, sessionId);
  }

  return { completed, sessionId };
}

async function multiTurnLoop(
  config: AppConfig,
  systemPrompt: string,
  sessionId: string,
): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  let completed = false;

  try {
    while (!completed) {
      const userInput = (await rl.question("\n> ")).trim();

      if (!userInput) continue;
      if (userInput === "/menu" || userInput === "/quit") break;

      const response = query({
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

      for await (const message of response) {
        if (message.type === "assistant") {
          for (const block of message.message.content) {
            if ("text" in block && typeof block.text === "string") {
              process.stdout.write(block.text);
              if (block.text.includes("[MODULE_COMPLETE]")) {
                completed = true;
              }
            }
          }
        }

        if (message.type === "result") {
          break;
        }
      }
    }
  } finally {
    rl.close();
  }

  return completed;
}
