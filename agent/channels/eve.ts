import { eveChannel } from "eve/channels/eve";
import { httpBasic, localDev, placeholderAuth, vercelOidc } from "eve/channels/auth";

// The browser reuses the Basic credentials it entered for the page (see proxy.ts),
// so one shared password protects both the chat UI and the agent API.
const password = process.env.DEMO_PASSWORD;

export default eveChannel({
  auth: [
    vercelOidc(),
    ...(password ? [httpBasic({ username: "demo", password }, { realm: "eve-data-analyst" })] : []),
    localDev(),
    // Rejects production browser requests until DEMO_PASSWORD is set.
    placeholderAuth(),
  ],
});
