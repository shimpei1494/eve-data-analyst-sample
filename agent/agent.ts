import { defineAgent } from "eve";

// Defaults to a model the AI Gateway free tier can call. Set EVE_MODEL (and redeploy)
// to switch, e.g. "openai/gpt-6-luna-fast" once the team has paid AI Gateway credits.
export default defineAgent({
  model: process.env.EVE_MODEL ?? "nvidia/nemotron-3.5-lightning-free",
  reasoning: "provider-default",
});
