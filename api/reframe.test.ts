import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

// A stand-in for the Anthropic API so the function can be exercised without a key or network.
let server: Server;
let lastBody: Record<string, unknown> | null = null;
let lastHeaders: Record<string, string | string[] | undefined> = {};
let reply: { status: number; body: unknown } = { status: 200, body: {} };

const goodOutput = {
  summary: "You said “gym every day” keeps breaking.",
  areaLines: { body: "Body line.", mind: "Mind line.", people: "People line.", mission: "Mission line." },
  suggestedTemplateIds: ["body.wake", "made.up", "mind.read"],
};

const message = (text: string, stop_reason = "end_turn") => ({
  id: "msg_test",
  type: "message",
  role: "assistant",
  model: "claude-opus-5-5",
  content: [{ type: "text", text }],
  stop_reason,
  stop_sequence: null,
  usage: { input_tokens: 10, output_tokens: 10 },
});

let POST: (r: Request) => Promise<Response>;

beforeAll(async () => {
  server = createServer((req, res) => {
    let data = "";
    req.on("data", (c) => (data += c));
    req.on("end", () => {
      lastBody = JSON.parse(data || "{}");
      lastHeaders = req.headers;
      res.writeHead(reply.status, { "content-type": "application/json" });
      res.end(JSON.stringify(reply.body));
    });
  });
  await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
  const port = (server.address() as AddressInfo).port;
  process.env.ANTHROPIC_API_KEY = "test-key";
  process.env.ANTHROPIC_BASE_URL = `http://127.0.0.1:${port}`;
  ({ POST } = await import("./reframe"));
});

afterAll(() => server.close());

const req = (body: unknown) => new Request("http://x/api/reframe", { method: "POST", body: JSON.stringify(body) });
const validInput = {
  answers: { breaking: "gym every day", stepAway: "", works: "", yourself: "", floor90: "" },
  templates: [
    { id: "body.wake", area: "body", title: "Wake at a fixed time" },
    { id: "mind.read", area: "mind", title: "Read before the first scroll" },
  ],
};

describe("POST /api/reframe", () => {
  it("sends a structured-output request and returns the parsed pattern, dropping unknown template ids", async () => {
    reply = { status: 200, body: message(JSON.stringify(goodOutput)) };
    const res = await POST(req(validInput));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.summary).toContain("gym every day");
    expect(json.suggestedTemplateIds).toEqual(["body.wake", "mind.read"]);

    expect(lastBody?.model).toBe("claude-opus-5-5");
    expect(lastBody?.fallbacks).toBe("default");
    expect((lastBody?.output_config as { format: { type: string } }).format.type).toBe("json_schema");
    expect(String(lastHeaders["anthropic-beta"])).toContain("server-side-fallback-2026-07-01");
    expect(`${lastHeaders["x-api-key"] ?? ""} ${lastHeaders["authorization"] ?? ""}`).toContain("test-key");
  });

  it("rejects oversized or malformed input", async () => {
    const big = { ...validInput, answers: { ...validInput.answers, breaking: "x".repeat(5000) } };
    expect((await POST(req(big))).status).toBe(400);
    expect((await POST(req({ nope: true }))).status).toBe(400);
  });

  it("reports a refusal as no output", async () => {
    reply = { status: 200, body: message("", "refusal") };
    expect((await POST(req(validInput))).status).toBe(502);
  });

  it("rejects output that doesn't match the schema", async () => {
    reply = { status: 200, body: message(JSON.stringify({ summary: "only this" })) };
    expect((await POST(req(validInput))).status).toBe(502);
  });

  it("maps a bad key to not_configured", async () => {
    reply = { status: 401, body: { type: "error", error: { type: "authentication_error", message: "invalid x-api-key" } } };
    const res = await POST(req(validInput));
    expect(res.status).toBe(503);
    expect((await res.json()).error).toBe("not_configured");
  });
});
