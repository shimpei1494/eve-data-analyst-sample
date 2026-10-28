import { DefaultSandbox, defineSandbox } from "eve/sandbox";

// Docker locally, Vercel Sandbox on Vercel. Analysis packages are installed once into the
// template, so every session starts with them ready.
export const environment = DefaultSandbox.environment({
  prepare: async (sandbox) => {
    const commands = [
      "sudo apt-get update && sudo apt-get install -y python3 python3-venv",
      "python3 -m venv /workspace/.venv",
      "/workspace/.venv/bin/python -m pip install pandas==2.3.3 matplotlib==3.10.8",
      "/workspace/.venv/bin/python -c \"import pandas, matplotlib; print('Analysis dependencies ready')\"",
    ];
    for (const command of commands) {
      const result = await sandbox.run({ command });
      if (result.exitCode !== 0) {
        throw new Error(
          `Sandbox setup failed (exit ${result.exitCode}): ${result.stderr || result.stdout}`,
        );
      }
    }
  },
});

export default defineSandbox(() => environment.open());
