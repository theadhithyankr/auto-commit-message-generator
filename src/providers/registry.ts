import * as vscode from "vscode";
import { AIProvider, ProviderId } from "./types";
import { OpenAICompatProvider } from "./openai-compat";
import { AnthropicProvider } from "./anthropic";
import { GeminiProvider } from "./gemini";
import { SecretsManager } from "../config/secrets";

export class ProviderRegistry {
  private activeProviderId: ProviderId;

  constructor(private secrets: SecretsManager) {
    this.activeProviderId =
      vscode.workspace.getConfiguration().get<ProviderId>("aiCommitGen.provider") ||
      "openai";
  }

  getActiveId(): ProviderId {
    return this.activeProviderId;
  }

  setActive(providerId: ProviderId): void {
    this.activeProviderId = providerId;
    vscode.workspace.getConfiguration().update(
      "aiCommitGen.provider",
      providerId,
      vscode.ConfigurationTarget.Global
    );
  }

  async getActiveProvider(): Promise<AIProvider> {
    const apiKey = await this.secrets.requireApiKey(this.activeProviderId);
    return this.createProvider(this.activeProviderId, apiKey);
  }

  private createProvider(id: ProviderId, apiKey: string): AIProvider {
    switch (id) {
      case "openai":
      case "groq":
      case "zai":
        return new OpenAICompatProvider(id, apiKey);
      case "anthropic":
        return new AnthropicProvider(apiKey);
      case "gemini":
        return new GeminiProvider(apiKey);
      default:
        throw new Error(`Unknown provider: ${id}`);
    }
  }
}
