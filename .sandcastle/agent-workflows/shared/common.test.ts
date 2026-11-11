import { describe, it, expect } from "vitest";
import { providerConfig } from "./provider";

describe("providerConfig", () => {
  it("defaults to the Claude subscription", () => {
    expect(providerConfig({ CLAUDE_CODE_OAUTH_TOKEN: "token" })).toEqual({
      model: "claude-opus-5-5",
      env: { CLAUDE_CODE_OAUTH_TOKEN: "token" },
    });
  });

  it("uses FACTORY_MODEL for Claude", () => {
    expect(
      providerConfig({
        CLAUDE_CODE_OAUTH_TOKEN: "token",
        FACTORY_MODEL: "claude-sonnet-5-5",
      })
    ).toEqual({
      model: "claude-sonnet-5-5",
      env: { CLAUDE_CODE_OAUTH_TOKEN: "token" },
    });
  });

  it("uses the DeepSeek defaults", () => {
    expect(
      providerConfig({
        FACTORY_PROVIDER: "deepseek",
        FACTORY_PROVIDER_KEY: "key",
      })
    ).toEqual({
      model: "deepseek-flash",
      env: {
        ANTHROPIC_BASE_URL: "https://api.deepseek.com/anthropic",
        ANTHROPIC_API_KEY: "key",
        ANTHROPIC_AUTH_TOKEN: "",
        ANTHROPIC_MODEL: "deepseek-flash",
        ANTHROPIC_DEFAULT_OPUS_MODEL: "deepseek-flash",
        ANTHROPIC_DEFAULT_SONNET_MODEL: "deepseek-flash",
        ANTHROPIC_DEFAULT_HAIKU_MODEL: "deepseek-flash",
        ANTHROPIC_SMALL_FAST_MODEL: "deepseek-flash",
        CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC: "1",
      },
    });
  });

  it("uses FACTORY_MODEL for Qwen", () => {
    expect(
      providerConfig({
        FACTORY_PROVIDER: "qwen",
        FACTORY_MODEL: "qwen3.8-pro",
        FACTORY_PROVIDER_KEY: "key",
      })
    ).toEqual({
      model: "qwen3.8-pro",
      env: {
        ANTHROPIC_BASE_URL:
          "https://ap-southeast-1.maas.qwencloudapi.com/apps/anthropic",
        ANTHROPIC_API_KEY: "key",
        ANTHROPIC_AUTH_TOKEN: "",
        ANTHROPIC_MODEL: "qwen3.8-pro",
        ANTHROPIC_DEFAULT_OPUS_MODEL: "qwen3.8-pro",
        ANTHROPIC_DEFAULT_SONNET_MODEL: "qwen3.8-pro",
        ANTHROPIC_DEFAULT_HAIKU_MODEL: "qwen3.8-pro",
        ANTHROPIC_SMALL_FAST_MODEL: "qwen3.8-pro",
        CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC: "1",
      },
    });
  });

  it("uses FACTORY_BASE_URL for the gateway", () => {
    expect(
      providerConfig({
        FACTORY_PROVIDER: "gateway",
        FACTORY_BASE_URL: "https://gateway.example.com",
        FACTORY_PROVIDER_KEY: "key",
      })
    ).toEqual({
      model: "deepseek/deepseek-v4.1-flash",
      env: {
        ANTHROPIC_BASE_URL: "https://gateway.example.com",
        ANTHROPIC_API_KEY: "key",
        ANTHROPIC_AUTH_TOKEN: "",
        ANTHROPIC_MODEL: "deepseek/deepseek-v4.1-flash",
        ANTHROPIC_DEFAULT_OPUS_MODEL: "deepseek/deepseek-v4.1-flash",
        ANTHROPIC_DEFAULT_SONNET_MODEL: "deepseek/deepseek-v4.1-flash",
        ANTHROPIC_DEFAULT_HAIKU_MODEL: "deepseek/deepseek-v4.1-flash",
        ANTHROPIC_SMALL_FAST_MODEL: "deepseek/deepseek-v4.1-flash",
        CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC: "1",
      },
    });
  });
});
