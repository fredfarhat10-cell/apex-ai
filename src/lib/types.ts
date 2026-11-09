export type AreaId = "body" | "mind" | "people" | "mission";
export type Kind = "rule" | "trigger" | "daily";
export type Outcome = "kept" | "missed" | "didNotFire";
/** Local calendar date, "YYYY-MM-DD". */
export type DateKey = string;

export const AREA_IDS: AreaId[] = ["body", "mind", "people", "mission"];
export const AREA_NAMES: Record<AreaId, string> = {
  body: "Body",
  mind: "Mind",
  people: "People",
  mission: "Mission",
};
export const MAX_ACTIVE_PER_AREA = 10;

export interface Area {
  id: AreaId;
  name: string;
  order: number;
  /** While this date is today or later, Today shows each protocol's smallest version. */
  shrunkUntil?: DateKey;
}

export interface Protocol {
  id: string;
  areaId: AreaId;
  kind: Kind;
  title: string;
  minimumVersion: string;
  level: number;
  isActive: boolean;
  order: number;
  templateId?: string;
  levelUpIdea?: string;
  /** The "Evening log" Daily: kept automatically when the evening log is saved. */
  auto?: "eveningLog";
}

export interface DailyEntry {
  date: DateKey;
  scores: Record<AreaId, number | null>;
  proofText: string;
  tomorrowFirstMove: string;
  loggedAt: string;
}

export type SlipState = "bored" | "avoiding" | "cue" | "tired" | "lonely" | "stressed" | "other";
export const SLIP_STATES: { id: SlipState; label: string }[] = [
  { id: "bored", label: "Bored" },
  { id: "avoiding", label: "Avoiding" },
  { id: "cue", label: "Cue / memory" },
  { id: "tired", label: "Tired" },
  { id: "lonely", label: "Lonely" },
  { id: "stressed", label: "Stressed" },
  { id: "other", label: "Other" },
];

export interface SlipLog {
  id: string;
  timestamp: string;
  areaId: AreaId;
  place: string;
  state: SlipState;
  note: string;
}

export interface ProofEntry {
  id: string;
  date: DateKey;
  text: string;
  source: "onboarding" | "daily" | "manual";
}

export interface Statement {
  id: string;
  text: string;
  order: number;
  linkedProofId?: string;
}

export interface ParkedIdea {
  id: string;
  text: string;
  createdAt: string;
  unlocksAt: string;
  broughtToReview?: boolean;
}

export interface WeeklyMove {
  id: string;
  title: string;
  order: number;
  isActive: boolean;
}

export interface AreaWeekSummary {
  average: number | null;
  floor: number | null;
  loggedDays: number;
  floorNote: string;
}

export interface WeeklyReview {
  weekStart: DateKey;
  areas: Record<AreaId, AreaWeekSummary>;
  /** Protocol ids levelled up in this review (max one per area). */
  upgrades: string[];
  shrinkApplied: AreaId[];
  priorities: [string, string, string];
  notes: string;
  savedAt: string;
}

export interface SetupTask {
  templateId: string;
  text: string;
  done: boolean;
}

export interface ReframeAnswers {
  breaking: string;
  stepAway: string;
  works: string;
  yourself: string;
  floor90: string;
}

export interface PatternSummary {
  summary: string;
  areaLines: Record<AreaId, string>;
  suggestedTemplateIds: string[];
  source: "ai" | "offline";
}

export interface OnboardingProfile {
  answers: ReframeAnswers;
  pattern?: PatternSummary;
  completedAt?: string;
}

export interface Settings {
  morningTime: string; // "HH:MM"
  eveningTime: string; // "HH:MM"
}

export interface AppState {
  version: 1;
  areas: Area[];
  protocols: Protocol[];
  /** checks[date][protocolId] = outcome. Only explicit choices before the evening log; complete after it. */
  checks: Record<DateKey, Record<string, Outcome>>;
  entries: Record<DateKey, DailyEntry>;
  slips: SlipLog[];
  proof: ProofEntry[];
  statements: Statement[];
  /** Dates on which the morning statements were acknowledged. */
  statementsReadOn: DateKey[];
  parked: ParkedIdea[];
  weeklyMoves: WeeklyMove[];
  /** weeklyMoveChecks[weekStart][moveId] = done */
  weeklyMoveChecks: Record<DateKey, Record<string, boolean>>;
  reviews: Record<DateKey, WeeklyReview>;
  setupTasks: SetupTask[];
  profile?: OnboardingProfile;
  settings: Settings;
}
