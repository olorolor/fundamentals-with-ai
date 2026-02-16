import { readFileSync } from "node:fs";
import { resolve } from "node:path";

export function loadSkillContent(
  contentDir: string,
  skillId: string,
): string {
  const path = resolve(contentDir, "skills", skillId, "SKILL.md");
  return readFileSync(path, "utf-8");
}

export function loadClaudeMd(contentDir: string): string {
  return readFileSync(resolve(contentDir, "CLAUDE.md"), "utf-8");
}
