import { GoogleGenerativeAI } from "@google/generative-ai";
import * as vscode from "vscode";
import { AIProvider } from "./types";
import { buildCommitPrompt } from "../prompt/builder";

export class GeminiProvider implements AIProvider {
  readonly id = "gemini" as const;
  private genAI: GoogleGenerativeAI;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async generateCommitMessage(diff: string): Promise<string> {
    const model =
      vscode.workspace.getConfiguration().get<string>("aiCommitGen.gemini.model") ||
      "gemini-2.0-flash";
    const { system, user } = buildCommitPrompt(diff);

    const genModel = this.genAI.getGenerativeModel({
      model,
      systemInstruction: system,
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 500,
      },
    });

    const result = await genModel.generateContent(user);
    const response = result.response;
    const text = response.text();
    if (!text) {
      throw new Error("No response from Gemini");
    }
    return text.trim();
  }
}
