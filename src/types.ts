export interface AppConfig {
  dataDir: string;
  contentDir: string;
  webhookUrl?: string;
  model?: string;
  resume?: boolean;
}

export interface LearnerProfile {
  diagnosis_completed: boolean;
  updated_at: string;
  profile: {
    role: string;
    seniority: string;
    ai_experience: string;
    prior_knowledge: string[];
    goal: string;
  };
  recommendation: {
    start_skill: string;
    reason: string;
  };
  progress: {
    completed_skills: string[];
    current_skill: string | null;
    last_review_at: string | null;
  };
}

export interface ModuleResult {
  completed: boolean;
  sessionId: string;
}

export type MenuChoice =
  | { type: "module"; moduleId: string }
  | { type: "explore" }
  | { type: "review" }
  | { type: "quit" };

export interface ModuleInfo {
  id: string;
  label: string;
  shortKey: string;
}

export const MODULES: ModuleInfo[] = [
  { id: "module1-llm-basics", label: "Module 1: LLM 기초", shortKey: "1" },
  {
    id: "module2-tokens-context",
    label: "Module 2: Token과 Context",
    shortKey: "2",
  },
  {
    id: "module3-rag-embedding",
    label: "Module 3: RAG와 Embedding",
    shortKey: "3",
  },
  { id: "module4-agent", label: "Module 4: Agent", shortKey: "4" },
  {
    id: "module5-tools-ecosystem",
    label: "Module 5: 도구와 생태계",
    shortKey: "5",
  },
  {
    id: "module6-strategy",
    label: "Module 6: 전략과 의사결정",
    shortKey: "6",
  },
];
