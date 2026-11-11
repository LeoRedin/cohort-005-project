export type ProviderConfig = {
  readonly model: string;
  readonly env: Record<string, string>;
};

// Every non-Claude provider speaks the Anthropic API, so only the base URL and
// default model change between them.
const anthropicProviders = {
  deepseek: {
    baseUrl: "https://api.deepseek.com/anthropic",
    model: "deepseek-flash",
  },
  qwen: {
    baseUrl: "https://ap-southeast-1.maas.qwencloudapi.com/apps/anthropic",
    model: "qwen3.8-flash",
  },
  gateway: {
    baseUrl: "https://ai-gateway.vercel.sh",
    model: "deepseek/deepseek-v4.1-flash",
  },
} as const;

type AnthropicProvider = keyof typeof anthropicProviders;

const required = (env: NodeJS.ProcessEnv, name: string): string => {
  const value = env[name];
  if (!value) {
    console.error(`Missing required env var: ${name}`);
    process.exit(1);
  }
  return value;
};

// Picks the provider the factory agents run against. `FACTORY_PROVIDER`
// defaults to the Claude subscription; the others talk to any Anthropic-
// compatible endpoint using a key.
export const providerConfig = (env: NodeJS.ProcessEnv): ProviderConfig => {
  const provider = env.FACTORY_PROVIDER || "claude";

  if (provider === "claude") {
    return {
      model: env.FACTORY_MODEL || "claude-opus-5-5",
      env: {
        CLAUDE_CODE_OAUTH_TOKEN: required(env, "CLAUDE_CODE_OAUTH_TOKEN"),
      },
    };
  }

  if (provider in anthropicProviders) {
    const config = anthropicProviders[provider as AnthropicProvider];
    const model = env.FACTORY_MODEL || config.model;

    return {
      model,
      env: {
        ANTHROPIC_BASE_URL: env.FACTORY_BASE_URL || config.baseUrl,
        ANTHROPIC_API_KEY: required(env, "FACTORY_PROVIDER_KEY"),
        ANTHROPIC_AUTH_TOKEN: "",
        ANTHROPIC_MODEL: model,
        ANTHROPIC_DEFAULT_OPUS_MODEL: model,
        ANTHROPIC_DEFAULT_SONNET_MODEL: model,
        ANTHROPIC_DEFAULT_HAIKU_MODEL: model,
        ANTHROPIC_SMALL_FAST_MODEL: model,
        CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC: "1",
      },
    };
  }

  console.error(`Unknown provider: ${provider}`);
  process.exit(1);
};
