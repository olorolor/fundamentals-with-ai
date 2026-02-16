import * as readline from "node:readline/promises";
import type { PermissionResult } from "@anthropic-ai/claude-code";

interface AskUserQuestionOption {
  label: string;
  description: string;
}

interface AskUserQuestionItem {
  question: string;
  header: string;
  options: AskUserQuestionOption[];
  multiSelect: boolean;
}

export async function handleAskUserQuestion(
  input: Record<string, unknown>,
): Promise<PermissionResult> {
  const questions = (input.questions ?? []) as AskUserQuestionItem[];
  const answers: Record<string, string> = {};

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  for (const q of questions) {
    console.log(`\n${q.question}\n`);
    q.options.forEach((opt, i) => {
      console.log(`  ${i + 1}) ${opt.label}`);
      if (opt.description) {
        console.log(`     ${opt.description}`);
      }
    });

    if (q.multiSelect) {
      console.log("\n  (번호를 쉼표로 구분하거나 직접 입력)");
    }

    const response = (await rl.question("\n> ")).trim();

    if (q.multiSelect) {
      const indices = response
        .split(",")
        .map((s) => parseInt(s.trim()) - 1);
      const validLabels = indices
        .filter((i) => i >= 0 && i < q.options.length)
        .map((i) => q.options[i]!.label);
      answers[q.question] =
        validLabels.length > 0 ? validLabels.join(", ") : response;
    } else {
      const num = parseInt(response);
      if (!isNaN(num) && num >= 1 && num <= q.options.length) {
        answers[q.question] = q.options[num - 1]!.label;
      } else {
        answers[q.question] = response;
      }
    }
  }

  rl.close();

  return {
    behavior: "allow",
    updatedInput: { ...input, answers } as Record<string, unknown>,
  };
}
