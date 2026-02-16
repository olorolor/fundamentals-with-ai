import { loadClaudeMd } from "./loader.js";
import type { LearnerProfile } from "../types.js";

export function buildSystemPrompt(
  contentDir: string,
  moduleSkillContent: string,
  profile: LearnerProfile | null,
): string {
  const claudeMd = loadClaudeMd(contentDir);

  const parts: string[] = [];

  // Role definition
  parts.push(`You are an AI tutor for an educational program called "AI for AI".
You teach LLM and AI Agent concepts through interactive 1:1 conversation.
You MUST follow all educational principles defined below.
You communicate in Korean (한국어) unless the learner switches to another language.`);

  // Educational principles (How)
  parts.push("\n--- EDUCATIONAL PRINCIPLES (How) ---\n");
  parts.push(claudeMd);

  // Module-specific content (What)
  parts.push("\n--- CURRENT MODULE CONTENT (What) ---\n");
  parts.push(moduleSkillContent);

  // Learner profile
  if (profile?.diagnosis_completed) {
    parts.push("\n--- LEARNER PROFILE ---\n");
    parts.push(`Role: ${profile.profile.role}`);
    parts.push(`Seniority: ${profile.profile.seniority}`);
    parts.push(`AI Experience: ${profile.profile.ai_experience}`);
    parts.push(
      `Prior Knowledge: ${profile.profile.prior_knowledge.join(", ")}`,
    );
    parts.push(`Goal: ${profile.profile.goal}`);
    parts.push("\nUse this profile to tailor analogies, examples, depth, and pacing.");
  }

  // Progress context for cross-review
  if (profile?.progress?.completed_skills?.length) {
    parts.push("\n--- LEARNING PROGRESS ---\n");
    parts.push(
      `Completed modules: ${profile.progress.completed_skills.join(", ")}`,
    );
    parts.push(
      "Use cross-review: naturally reference concepts from completed modules when relevant.",
    );
  }

  // Interaction rules
  parts.push("\n--- INTERACTION RULES ---\n");
  parts.push(`- Use ASCII diagrams and tables for visual explanations.
- Keep sessions to 10-15 minutes of content.
- When you detect the session is reaching 10-15 minutes of content, summarize progress and present next options.
- Adapt question format (multiple choice vs open-ended) based on learner response patterns.
- Do not ask for personal identifying information (name, contact info).
- If the learner wants to switch to explore mode, switch to concise dictionary-like explanations.
- If the learner wants to go deeper, continue in learn mode with Socratic questioning.
- When you determine the learner has met the completion criteria (완료 기준) defined in the module content, output the marker [MODULE_COMPLETE] at the end of your message, then announce completion and suggest next steps.`);

  return parts.join("\n");
}
