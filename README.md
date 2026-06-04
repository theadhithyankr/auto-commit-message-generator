# AI Commit Gen

AI Commit Gen writes Conventional Commit messages from your Git changes directly inside VS Code's Source Control view.

## Features

- Generate commit messages from the Source Control toolbar.
- Fill the Git commit message input automatically.
- Auto-stage unstaged and untracked changes when nothing is staged.
- Show a loading state while the provider is generating.
- Switch between OpenAI, Anthropic Claude, Google Gemini, Groq, and z.ai.
- Store API keys securely with VS Code Secret Storage.

## Usage

1. Open a Git repository in VS Code.
2. Make a change in your project.
3. Open Source Control.
4. Click the AI Commit Gen button in the Source Control toolbar.
5. If prompted, choose a provider and set its API key.
6. Review the generated message, then commit.

If files are already staged, AI Commit Gen generates from the staged diff only. If nothing is staged and `aiCommitGen.autoStage` is enabled, it stages all current changes first.

## Commands

- `AI Commit Gen: Generate Message`
- `AI Commit Gen: Switch Provider`
- `AI Commit Gen: Set API Key`

## Settings

| Setting | Default | Description |
| --- | --- | --- |
| `aiCommitGen.provider` | `openai` | AI provider used for generation. |
| `aiCommitGen.autoStage` | `true` | Stage all changes before generation when nothing is staged. |
| `aiCommitGen.maxDiffSize` | `10000` | Maximum diff size sent to the provider. |
| `aiCommitGen.openai.model` | `gpt-4o-mini` | OpenAI model. |
| `aiCommitGen.anthropic.model` | `claude-sonnet-4-20250514` | Anthropic model. |
| `aiCommitGen.gemini.model` | `gemini-2.0-flash` | Gemini model. |
| `aiCommitGen.groq.model` | `llama-3.3-70b-versatile` | Groq model. |
| `aiCommitGen.zai.model` | `glm-4-flash` | z.ai model. |

## Privacy

AI Commit Gen sends the selected Git diff to the configured AI provider. API keys are stored in VS Code Secret Storage and are not written to repository files.

Review generated messages before committing. Disable `aiCommitGen.autoStage` if you want to manually control exactly which files are included.

## Local Development

```powershell
npm install
npm run compile
```

Press `F5` in VS Code to launch an Extension Development Host.

## Package Locally

```powershell
npm run package
```

Install the generated VSIX:

```powershell
code --install-extension spreadle-ai-commit-gen-0.1.0.vsix
```

## Publish

Create or verify the `spreadle` publisher in the Visual Studio Marketplace, then run:

```powershell
npx vsce login spreadle
npx vsce publish
```

The extension is bundled with esbuild before packaging and publishing.
