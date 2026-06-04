import * as vscode from "vscode";
import { ProviderRegistry } from "../providers/registry";
import {
  getStagedDiff,
  hasStagedChanges,
  hasUnstagedChanges,
  stageAllChanges,
  truncateDiff,
} from "../git/diff";

interface GitRepository {
  inputBox: {
    value: string;
  };
}

interface GitApi {
  repositories: GitRepository[];
}

interface GitExtension {
  getAPI(version: 1): GitApi;
}

async function setCommitInputMessage(message: string): Promise<void> {
  const gitExtension = vscode.extensions.getExtension<GitExtension>("vscode.git");
  const gitApi = gitExtension?.exports.getAPI(1);
  const repository = gitApi?.repositories[0];

  if (repository) {
    repository.inputBox.value = message;
    return;
  }

  vscode.scm.inputBox.value = message;
}

export function registerGenerateCommand(
  context: vscode.ExtensionContext,
  registry: ProviderRegistry
): void {
  let isGenerating = false;

  context.subscriptions.push(
    vscode.commands.registerCommand("aiCommitGen.generating", () => {})
  );

  const disposable = vscode.commands.registerCommand("aiCommitGen.generate", async () => {
    if (isGenerating) {
      return;
    }

    isGenerating = true;
    await vscode.commands.executeCommand("setContext", "aiCommitGen.generating", true);

    try {
      const config = vscode.workspace.getConfiguration();
      const autoStage = config.get<boolean>("aiCommitGen.autoStage", true);
      let stagedChanges = await hasStagedChanges();

      if (!stagedChanges && autoStage && (await hasUnstagedChanges())) {
        await vscode.window.withProgress(
          {
            location: vscode.ProgressLocation.Notification,
            title: "AI Commit Gen",
            cancellable: false,
          },
          async (progress) => {
            progress.report({ message: "Staging changes..." });
            await stageAllChanges();
          }
        );
        stagedChanges = await hasStagedChanges();
      }

      if (!stagedChanges) {
        vscode.window.showWarningMessage(
          autoStage
            ? "No changes found to stage or generate from."
            : "No staged changes found. Stage files first or enable AI Commit Gen auto staging."
        );
        return;
      }

      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: "AI Commit Gen",
          cancellable: true,
        },
        async (progress, token) => {
          progress.report({ message: "Reading staged changes..." });

          let diff = await getStagedDiff();
          if (token.isCancellationRequested) return;

          const maxDiffSize = config.get<number>("aiCommitGen.maxDiffSize", 10000);
          diff = truncateDiff(diff, maxDiffSize);

          progress.report({
            message: `Generating commit message (${registry.getActiveId()})...`,
          });

          const provider = await registry.getActiveProvider();
          const message = await provider.generateCommitMessage(diff);

          if (token.isCancellationRequested) return;

          vscode.commands.executeCommand("workbench.view.scm");
          await setCommitInputMessage(message);

          vscode.window.showInformationMessage("Commit message generated!");
        }
      );
    } catch (err: any) {
      if (err.message.includes("No API key")) {
        const action = "Set API Key";
        const result = await vscode.window.showErrorMessage(err.message, action);
        if (result === action) {
          vscode.commands.executeCommand("aiCommitGen.setApiKey");
        }
      } else {
        vscode.window.showErrorMessage(`AI Commit Gen error: ${err.message}`);
      }
    } finally {
      isGenerating = false;
      await vscode.commands.executeCommand("setContext", "aiCommitGen.generating", false);
    }
  });

  context.subscriptions.push(disposable);
}
