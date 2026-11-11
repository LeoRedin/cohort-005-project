import * as fs from "node:fs";
import * as path from "node:path";
import * as sandcastle from "@ai-hero/sandcastle";
import { providerConfig } from "./provider";

export const outputDir = (): string => process.env.OUTPUT_DIR ?? "/tmp";

export const required = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    console.error(`Missing required env var: ${name}`);
    process.exit(1);
  }
  return value;
};

export const writeJson = (filename: string, value: unknown): void => {
  fs.mkdirSync(outputDir(), { recursive: true });
  fs.writeFileSync(
    path.join(outputDir(), filename),
    JSON.stringify(value, null, 2)
  );
};

// The one agent every factory workflow runs. The provider comes from
// FACTORY_PROVIDER (default "claude"), so the same workflows can run against a
// Claude subscription or any Anthropic-compatible endpoint via
// FACTORY_PROVIDER_KEY.
//
// Sandcastle runs every agent with its permission checks skipped, so it can
// use any tool. Claude Code also accepts `permissionMode: "auto"` here for
// AI-mediated approvals instead (Claude only; other agents don't offer it).
export const claudeAgent = () => {
  const { model, env } = providerConfig(process.env);
  return sandcastle.claudeCode(model, { env });
};
