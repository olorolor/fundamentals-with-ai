import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const SESSIONS_FILE = "sessions.json";

export class SessionStore {
  private path: string;
  private data: Record<string, string>;

  constructor(dataDir: string) {
    this.path = resolve(dataDir, SESSIONS_FILE);
    this.data = existsSync(this.path)
      ? JSON.parse(readFileSync(this.path, "utf-8"))
      : {};
  }

  get(moduleId: string): string | undefined {
    return this.data[moduleId];
  }

  save(moduleId: string, sessionId: string): void {
    this.data[moduleId] = sessionId;
    writeFileSync(this.path, JSON.stringify(this.data, null, 2), "utf-8");
  }

  clear(moduleId: string): void {
    delete this.data[moduleId];
    writeFileSync(this.path, JSON.stringify(this.data, null, 2), "utf-8");
  }
}
