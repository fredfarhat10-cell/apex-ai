/** Shared between the app and the /api/reframe server function. Keep this file dependency-free. */

export type ReframeAnswerKey = "breaking" | "stepAway" | "works" | "yourself" | "floor90";

export const REFRAME_QUESTIONS: { key: ReframeAnswerKey; question: string; hint: string }[] = [
  {
    key: "breaking",
    question: "What have you promised yourself that keeps breaking?",
    hint: "Vague promises break, and each break costs a little self-trust. Name one or two.",
  },
  {
    key: "stepAway",
    question: "When do you stop or step away, and what happens just before?",
    hint: "People often leave right before a verdict: a result, a reply, a hard moment.",
  },
  {
    key: "works",
    question: "What already works for you without willpower?",
    hint: "A blocker, a routine, a place, a person. Design beats willpower.",
  },
  {
    key: "yourself",
    question: "Where are you fully yourself?",
    hint: "Effort you don't debate gives energy instead of taking it.",
  },
  {
    key: "floor90",
    question: "What would a floor look like for you in 90 days?",
    hint: "Not your best day. The worst day you'd still accept.",
  },
];

export const ANSWER_MAX_CHARS = 1200;

export interface ReframeRequest {
  answers: Record<ReframeAnswerKey, string>;
  templates: { id: string; area: "body" | "mind" | "people" | "mission"; title: string }[];
}

export interface ReframeResponse {
  summary: string;
  areaLines: { body: string; mind: string; people: string; mission: string };
  suggestedTemplateIds: string[];
}
