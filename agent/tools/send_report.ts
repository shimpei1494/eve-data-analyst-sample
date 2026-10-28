import { defineTool } from "eve/tools";
import { always } from "eve/tools/approval";
import { z } from "zod";

export default defineTool({
  description:
    "Send an analysis report to the team channel. Runs only after the user approves it. " +
    "Write the report body in Japanese Markdown.",
  inputSchema: z.object({
    title: z.string().min(1).max(120),
    body: z.string().min(1).max(4000),
  }),
  // An outbound side effect: pause the turn until a person approves this exact report.
  approval: {
    request: always(),
    prompt: ({ input }) => `レポート「${input.title}」をチームに送信しますか?`,
  },
  async execute({ title, body }) {
    const webhookUrl = process.env.REPORT_WEBHOOK_URL;
    const text = `*${title}*\n\n${body}`;
    if (!webhookUrl) {
      // Demo mode: no destination configured, so nothing leaves the app.
      return { delivered: false, mode: "demo", title, preview: text };
    }
    // Slack incoming webhooks read `text`; Discord webhooks read `content`.
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text, content: text.slice(0, 2000) }),
    });
    if (!response.ok) {
      throw new Error(`Webhook returned HTTP ${response.status}`);
    }
    return { delivered: true, mode: "webhook", title };
  },
});
