import { defineTool } from "eve/tools";
import { z } from "zod";

const MAX_BYTES = 1024 * 1024;

export default defineTool({
  description:
    "Show a PNG chart that you saved in the sandbox to the user. " +
    "Call this after saving a chart with matplotlib; the image is not visible until you do.",
  inputSchema: z.object({
    path: z.string().min(1).describe("Absolute sandbox path of the PNG, e.g. /workspace/charts/sales.png"),
    caption: z.string().max(200).describe("One-line caption in Japanese."),
  }),
  async execute({ path, caption }, ctx) {
    const sandbox = await ctx.getSandbox();
    const png = await sandbox.readBinaryFile({ path });
    if (!png || png.byteLength === 0) {
      throw new Error(`No PNG found at ${path}. Save the chart first.`);
    }
    if (png.byteLength > MAX_BYTES) {
      throw new Error("The chart exceeds 1 MiB. Lower the dpi or plot fewer points.");
    }
    return { path, caption, pngBase64: Buffer.from(png).toString("base64") };
  },
  // The model only needs to know the chart is on screen, not its bytes.
  toModelOutput({ path }) {
    return { type: "text", value: `Displayed ${path} to the user.` };
  },
});
