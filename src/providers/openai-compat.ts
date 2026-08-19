import OpenAI, { APIError } from "openai";
import * as vscode from "vscode";
import { AIProvider, ProviderId } from "./types";
import { buildCommitPrompt } from "../prompt/builder";

interface OpenAICompatConfig {
  id: ProviderId;
  baseURL: string;
  defaultModel: string;
  configKey: string;
  fallbackModel?: string;
  fallbackConfigKey?: string;
}

const PROVIDER_CONFIGS: Record<string, OpenAICompatConfig> = {
  openai: {
    id: "openai",
    baseURL: "https://api.openai.com/v1",
    defaultModel: "gpt-4o-mini",
    configKey: "aiCommitGen.openai.model",
  },
  groq: {
    id: "groq",
    baseURL: "https://api.groq.com/openai/v1",
    defaultModel: "openai/gpt-oss-120b",
    configKey: "aiCommitGen.groq.model",
    fallbackModel: "qwen/qwen3.6-27b",
    fallbackConfigKey: "aiCommitGen.groq.fallbackModel",
  },
  zai: {
    id: "zai",
    baseURL: "https://open.bigmodel.cn/api/paas/v4",
    defaultModel: "glm-4-flash",
    configKey: "aiCommitGen.zai.model",
  },
};

export class OpenAICompatProvider implements AIProvider {
  readonly id: ProviderId;
  private client: OpenAI;
  private configKey: string;
  private defaultModel: string;
  private fallbackModel?: string;
  private fallbackConfigKey?: string;

  constructor(providerKey: string, apiKey: string) {
    const config = PROVIDER_CONFIGS[providerKey];
    if (!config) {
      throw new Error(`Unknown OpenAI-compatible provider: ${providerKey}`);
    }
    this.id = config.id;
    this.configKey = config.configKey;
    this.defaultModel = config.defaultModel;
    this.fallbackModel = config.fallbackModel;
    this.fallbackConfigKey = config.fallbackConfigKey;
    this.client = new OpenAI({
      apiKey,
      baseURL: config.baseURL,
    });
  }

  async generateCommitMessage(diff: string): Promise<string> {
    const model = this.getConfiguredModel(this.configKey, this.defaultModel)!;
    const { system, user } = buildCommitPrompt(diff);

    try {
      return await this.createCompletion(model, system, user);
    } catch (err) {
      const fallbackModel = this.getConfiguredModel(
        this.fallbackConfigKey,
        this.fallbackModel
      );
      if (!fallbackModel || !this.shouldFallback(err)) {
        throw err;
      }
      return this.createCompletion(fallbackModel, system, user);
    }
  }

  private getConfiguredModel(
    configKey: string | undefined,
    defaultModel: string | undefined
  ): string | undefined {
    if (!configKey) {
      return defaultModel;
    }
    return (
      vscode.workspace.getConfiguration().get<string>(configKey) || defaultModel
    );
  }

  private shouldFallback(err: unknown): boolean {
    return err instanceof APIError && (err.status === 400 || err.status === 404);
  }

  private async createCompletion(
    model: string,
    system: string,
    user: string
  ): Promise<string> {
    const response = await this.client.chat.completions.create({
      model,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature: 0.3,
      max_tokens: 500,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from AI provider");
    }
    return content.trim();
  }
}
