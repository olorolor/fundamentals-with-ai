import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import type { LearnerProfile } from "../types.js";

const PROFILE_FILE = "learner-profile.json";

export function readProfile(dataDir: string): LearnerProfile | null {
  const path = resolve(dataDir, PROFILE_FILE);
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, "utf-8"));
}

export function writeProfile(
  dataDir: string,
  profile: LearnerProfile,
): void {
  const path = resolve(dataDir, PROFILE_FILE);
  profile.updated_at = new Date().toISOString().split("T")[0]!;
  writeFileSync(path, JSON.stringify(profile, null, 2), "utf-8");
}
