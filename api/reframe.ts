/**
 * POST /api/reframe — turns the five onboarding answers into a short "your pattern" summary.
 *
 * Runs on the server (Vercel Function) so the Anthropic API key never reaches the phone.
 * Set ANTHROPIC_API_KEY in the Vercel project's environment variables.
 * If this endpoint fails for any reason, the app falls back to an offline summary.
 */
import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import * as z from "zod";
import type { ReframeResponse } from "../src/lib/reframeShared";

const ANSWER_MAX_CHARS = 1200; // keep in sync with src/lib/reframeShared.ts

const answer = z.string().max(ANSWER_MAX_CHARS);
const RequestSchema = z.object({
  answers: z.object({ breaking: answer, stepAway: answer, works: answer, yourself: answer, floor90: answer }),
  templates: z
    .array(z.object({ id: z.string().max(40), area: z.enum(["body", "mind", "people", "mission"]), title: z.string().max(160) }))
    .max(60),
});

const OutputSchema = z.object({
  summary: z.string().describe("3 to 5 sentences, second person, quoting the user's own words in quotation marks."),
  areaLines: z.object({
    body: z.string().describe("One sentence for the Body area."),
    mind: z.string().describe("One sentence for the Mind area."),
    people: z.string().describe("One sentence for the People area."),
    mission: z.string().describe("One sentence for the Mission area."),
  }),
  suggestedTemplateIds: z.array(z.string()).describe("3 or 4 template ids per area, taken only from the provided list."),
});

const SYSTEM = `You help a new user of Set Point Protocol, a daily-practice app, see their own pattern before they choose their protocols.

The app's view, which shapes how you read their answers:
- Vague promises break, and each break costs self-trust. Small, exact promises hold.
- People often step away right before a verdict (a result, a reply, a hard moment).
- Design beats willpower: what already works without effort is the strongest clue.
- Effort that isn't debated gives energy.
- A miss is one vote, not a verdict. There are no streaks and no resets.

Write a short "your pattern" summary that quotes the user's own words back to them (in quotation marks), then one sentence per area: Body, Mind, People, Mission. Each area sentence should point toward one small, exact promise that fits what they told you.

Tone: calm, direct, warm, plain English, second person. No praise inflation, no hype, no exclamation marks.
Never: mention streaks or "day X"; use "never again"; diagnose; make medical, mental-health or health-outcome claims; say "rewire your brain" or "scientifically proven"; mention or describe adult content (if the user hints at a habit they are reducing, refer to it neutrally as "urges").
If an answer is empty or unclear, work with what you have and do not invent details about the user.

Also pick 3 or 4 template ids per area from the provided template list that best fit their answers. Only use ids from that list.`;

const client = new Anthropic();

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });
}

export async function POST(request: Request): Promise<Response> {
  if (!process.env.ANTHROPIC_API_KEY) return json({ error: "not_configured" }, 503);

  let input: z.infer<typeof RequestSchema>;
  try {
    input = RequestSchema.parse(await request.json());
  } catch {
    return json({ error: "bad_request" }, 400);
  }

  const a = input.answers;
  const userText = [
    `What I've promised myself that keeps breaking:\n${a.breaking || "(no answer)"}`,
    `When I stop or step away, and what happens just before:\n${a.stepAway || "(no answer)"}`,
    `What already works for me without willpower:\n${a.works || "(no answer)"}`,
    `Where I'm fully myself:\n${a.yourself || "(no answer)"}`,
    `What a floor would look like for me in 90 days:\n${a.floor90 || "(no answer)"}`,
    `Template list (id | area | title):\n${input.templates.map((t) => `${t.id} | ${t.area} | ${t.title}`).join("\n")}`,
  ].join("\n\n");

  try {
    // create() rather than parse(): parse() throws on an empty refusal before stop_reason can be checked.
    const response = await client.beta.messages.create({
      model: "claude-opus-5-5",
      max_tokens: 16000,
      output_config: { effort: "medium", format: betaZodOutputFormat(OutputSchema) },
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system: SYSTEM,
      messages: [{ role: "user", content: userText }],
    });

    if (response.stop_reason !== "end_turn") {
      console.error("reframe: no usable output, stop_reason =", response.stop_reason);
      return json({ error: "no_output" }, 502);
    }
    const text = response.content.flatMap((b) => (b.type === "text" ? [b.text] : [])).join("");
    let parsed: z.infer<typeof OutputSchema>;
    try {
      parsed = OutputSchema.parse(JSON.parse(text));
    } catch {
      console.error("reframe: output did not match the schema");
      return json({ error: "no_output" }, 502);
    }
    const allowed = new Set(input.templates.map((t) => t.id));
    const out: ReframeResponse = {
      ...parsed,
      suggestedTemplateIds: parsed.suggestedTemplateIds.filter((id) => allowed.has(id)),
    };
    return json(out);
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) return json({ error: "busy" }, 429);
    if (error instanceof Anthropic.AuthenticationError) {
      console.error("reframe: Anthropic API key rejected");
      return json({ error: "not_configured" }, 503);
    }
    if (error instanceof Anthropic.APIError) {
      console.error("reframe: API error", error.status, error.message);
      return json({ error: "upstream" }, 502);
    }
    console.error("reframe: unexpected error", error);
    return json({ error: "internal" }, 500);
  }
}
