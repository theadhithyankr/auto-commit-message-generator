import Anthropic from "@anthropic-ai/sdk";
import * as vscode from "vscode";
import { AIProvider } from "./types";
import { buildCommitPrompt } from "../prompt/builder";

export class AnthropicProvider implements AIProvider {
  readonly id = "anthropic" as const;
  private client: Anthropic;

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey });
  }

  async generateCommitMessage(diff: string): Promise<string> {
    const model =
      vscode.workspace.getConfiguration().get<string>("aiCommitGen.anthropic.model") ||
      "claude-sonnet-4-20250514";
    const { system, user } = buildCommitPrompt(diff);

    const response = await this.client.messages.create({
      model,
      max_tokens: 500,
      system,
      messages: [{ role: "user", content: user }],
    });

    const textBlock = response.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("No text response from Anthropic");
    }
    return textBlock.text.trim();
  }
}
