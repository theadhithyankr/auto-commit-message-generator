import OpenAI from "openai";
import * as vscode from "vscode";
import { AIProvider, ProviderId } from "./types";
import { buildCommitPrompt } from "../prompt/builder";

interface OpenAICompatConfig {
  id: ProviderId;
  baseURL: string;
  defaultModel: string;
  configKey: string;
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
    defaultModel: "llama-3.3-70b-versatile",
    configKey: "aiCommitGen.groq.model",
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

  constructor(providerKey: string, apiKey: string) {
    const config = PROVIDER_CONFIGS[providerKey];
    if (!config) {
      throw new Error(`Unknown OpenAI-compatible provider: ${providerKey}`);
    }
    this.id = config.id;
    this.configKey = config.configKey;
    this.defaultModel = config.defaultModel;
    this.client = new OpenAI({
      apiKey,
      baseURL: config.baseURL,
    });
  }

  async generateCommitMessage(diff: string): Promise<string> {
    const model =
      vscode.workspace.getConfiguration().get<string>(this.configKey) ||
      this.defaultModel;
    const { system, user } = buildCommitPrompt(diff);

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
