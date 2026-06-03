import * as vscode from "vscode";
import { ProviderId } from "../providers/types";

const KEY_PREFIX = "aiCommitGen.apiKey.";

function secretKey(provider: ProviderId): string {
  return `${KEY_PREFIX}${provider}`;
}

export class SecretsManager {
  constructor(private secrets: vscode.SecretStorage) {}

  async getApiKey(provider: ProviderId): Promise<string | undefined> {
    return this.secrets.get(secretKey(provider));
  }

  async setApiKey(provider: ProviderId, key: string): Promise<void> {
    await this.secrets.store(secretKey(provider), key);
  }

  async deleteApiKey(provider: ProviderId): Promise<void> {
    await this.secrets.delete(secretKey(provider));
  }

  async requireApiKey(provider: ProviderId): Promise<string> {
    const key = await this.getApiKey(provider);
    if (!key) {
      throw new Error(
        `No API key set for ${provider}. Run "AI Commit Gen: Set API Key" first.`
      );
    }
    return key;
  }
}
