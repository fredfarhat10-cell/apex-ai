import type { AreaId, Kind } from "./types";

export interface TemplateProtocol {
  id: string;
  areaId: AreaId;
  kind: Kind;
  title: string;
  minimumVersion: string;
  levelUpIdea?: string;
  setupTask?: string;
  /** Always included and cannot be removed during onboarding. */
  locked?: boolean;
}

const t = (
  id: string,
  areaId: AreaId,
  kind: Kind,
  title: string,
  minimumVersion: string,
  extra: Partial<TemplateProtocol> = {},
): TemplateProtocol => ({ id, areaId, kind, title, minimumVersion, ...extra });

export const TEMPLATES: TemplateProtocol[] = [
  // Body
  t("body.wake", "body", "rule", "Wake at a fixed time", "Same time, including weekends", {
    levelUpIdea: "Out of bed within 2 minutes of the alarm",
    setupTask: "Set one alarm for your wake time, every day of the week",
  }),
  t("body.lights", "body", "rule", "Lights out at a fixed time", "In bed within 30 minutes of it", {
    levelUpIdea: "Lights out on the minute",
  }),
  t("body.move", "body", "daily", "Move hard: gym, sport, run or swim", "10 minutes; rest day, a 30-minute walk", {
    levelUpIdea: "30 minutes, with one number you track",
  }),
  t("body.daylight", "body", "daily", "Daylight in the first hour", "5 minutes outside", {
    levelUpIdea: "15 minutes outside, walking",
  }),
  t("body.protein", "body", "daily", "Protein in every meal", "One protein item at each meal", {
    levelUpIdea: "A palm-sized portion at each meal",
  }),
  t("body.samefood", "body", "rule", "Same weekday breakfast and lunch", "Decided once", {
    setupTask: "Write down your weekday breakfast and lunch",
  }),
  t("body.mobility", "body", "daily", "Mobility block", "10 minutes", { levelUpIdea: "20 minutes, full routine" }),
  t("body.screens", "body", "rule", "Screens at eye height, never in bed", "Laptop raised, phone off the bed", {
    setupTask: "Raise your screen to eye height",
  }),
  t("body.sat45", "body", "trigger", "Sat 45 minutes: stand, move, reset", "Stand up for 1 minute"),
  t("body.caffeine", "body", "rule", "No caffeine after 14:00", "Last coffee before 14:00", {
    levelUpIdea: "Last coffee before 12:00",
  }),

  // Mind
  t("mind.blockers", "mind", "rule", "Blockers on phone and computer", "Blockers stay on", {
    setupTask: "Install a blocker on your phone and computer",
  }),
  t("mind.phonebed", "mind", "rule", "Phone out of the bedroom by a set time", "Phone charging outside the bedroom", {
    setupTask: "Move your charger out of the bedroom",
  }),
  t("mind.firsthour", "mind", "rule", "First hour of the day phone-free", "First 20 minutes phone-free", {
    levelUpIdea: "First 90 minutes phone-free",
  }),
  t("mind.read", "mind", "daily", "Read before the first scroll", "5 pages", { levelUpIdea: "20 pages" }),
  t("mind.breath", "mind", "daily", "5 minutes sitting with your breath", "2 minutes", {
    levelUpIdea: "10 minutes",
  }),
  t("mind.boredscreen", "mind", "trigger", "Bored and alone with a screen: leave the room for 10 minutes", "Leave the room for 2 minutes"),
  t("mind.avoiding", "mind", "trigger", "Avoiding something: do 5 minutes of it first", "Open it and do 1 minute"),
  t("mind.urge", "mind", "trigger", "An urge appears: name it, stand up, change rooms", "Name it and stand up"),
  t("mind.afterslip", "mind", "trigger", "After a slip: log it, no vow", "Log it"),
  t("mind.eveninglog", "mind", "daily", "Evening log", "Done when you save the evening log", { locked: true }),

  // People
  t("people.newconvo", "people", "daily", "Start one conversation with someone new", "Eye contact and a hello", {
    levelUpIdea: "A question that keeps it going for 2 minutes",
  }),
  t("people.workaround", "people", "daily", "One work or study block around people", "30 minutes in a shared space", {
    levelUpIdea: "Half a day around people",
  }),
  t("people.message", "people", "daily", "Message one friend or family member", "One message"),
  t("people.compliment", "people", "daily", "One specific compliment or thank-you", "One sentence, said or sent"),
  t("people.truething", "people", "rule", "Say the true thing, no persona", "Once today, say what you actually think"),
  t("people.defaultyes", "people", "rule", "Default yes to invitations unless it breaks sleep or a deadline", "Say yes to the next one"),
  t("people.phoneaway", "people", "rule", "Phone away when with people", "Phone face down and silent"),
  t("people.3seconds", "people", "trigger", "See someone you want to talk to: speak within 3 seconds", "Make eye contact and smile"),
  t("people.bringfriend", "people", "trigger", "Going somewhere new: bring a friend", "Ask one person to come"),
  t("people.awkward", "people", "trigger", "Awkward moment: call it a rep and add it to Proof", "Call it a rep"),

  // Mission
  t("mission.deepwork", "mission", "daily", "Deep work on your main priority", "20 minutes", {
    levelUpIdea: "90 minutes, one block",
  }),
  t("mission.side", "mission", "daily", "Work on your side project, end with something shipped", "20 minutes", {
    levelUpIdea: "45 minutes, ship something visible",
  }),
  t("mission.career", "mission", "daily", "One career or next-step action", "One email, form or message"),
  t("mission.hardfirst", "mission", "rule", "Hardest block first", "Start the hardest task before anything else"),
  t("mission.oneproject", "mission", "rule", "One project at a time", "Work only on the current project"),
  t("mission.phoneroom", "mission", "rule", "Phone in another room during deep work", "Phone out of reach", {
    setupTask: "Choose where your phone goes during deep work",
  }),
  t("mission.park", "mission", "trigger", "New idea: park it for 7 days", "Write it in Parked ideas"),
  t("mission.toomuch", "mission", "trigger", "“Too much work” thought: smallest next step, ship it ugly", "Name the smallest next step"),
  t("mission.stuck", "mission", "trigger", "Stuck for 15 minutes: ask, don't switch", "Write the question down"),
  t("mission.attend", "mission", "rule", "Attend every class or meeting", "Show up on time"),
];

export const TEMPLATE_BY_ID: Record<string, TemplateProtocol> = Object.fromEntries(TEMPLATES.map((x) => [x.id, x]));

export const EVENING_LOG_TEMPLATE_ID = "mind.eveninglog";

export const STATEMENT_EXAMPLES = [
  "I keep small promises to myself.",
  "I do the hardest block first.",
  "When I slip, I log it and take the next protocol.",
  "I speak to people I want to talk to.",
  "I ship things before they feel ready.",
  "I protect my sleep.",
];
