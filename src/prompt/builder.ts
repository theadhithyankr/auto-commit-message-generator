export interface PromptMessages {
  system: string;
  user: string;
}

export function buildCommitPrompt(diff: string): PromptMessages {
  const system = `You are an expert at writing concise, meaningful git commit messages.

Rules:
- Use Conventional Commits format: type(scope): description
- Types: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert
- Keep the subject line under 72 characters
- Only include a body if the change is complex and needs explanation
- Do NOT wrap the message in quotes or code blocks
- Return ONLY the commit message, nothing else
- If there are multiple types of changes, use the most significant one as the type
- Be specific about what changed, not how it changed`;

  const user = `Based on the following git diff of staged changes, generate a commit message:

${diff}`;

  return { system, user };
}
