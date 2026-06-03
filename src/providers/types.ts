export type ProviderId = "openai" | "anthropic" | "gemini" | "groq" | "zai";

export interface ProviderInfo {
  id: ProviderId;
  label: string;
  description: string;
  signupUrl: string;
}

export const PROVIDERS: ProviderInfo[] = [
  { id: "openai", label: "OpenAI (ChatGPT)", description: "GPT-4o, GPT-4o-mini, etc.", signupUrl: "https://platform.openai.com/api-keys" },
  { id: "anthropic", label: "Anthropic (Claude)", description: "Claude Sonnet, Haiku, etc.", signupUrl: "https://console.anthropic.com/settings/keys" },
  { id: "gemini", label: "Google Gemini", description: "Gemini 2.0 Flash, Pro, etc.", signupUrl: "https://aistudio.google.com/apikey" },
  { id: "groq", label: "Groq", description: "Llama, Mixtral — ultra-fast inference", signupUrl: "https://console.groq.com/keys" },
  { id: "zai", label: "z.ai (Zhipu)", description: "GLM-4, GLM-4-Flash, etc.", signupUrl: "https://open.bigmodel.cn/usercenter/apikeys" },
];

export interface AIProvider {
  readonly id: ProviderId;
  generateCommitMessage(diff: string): Promise<string>;
}
