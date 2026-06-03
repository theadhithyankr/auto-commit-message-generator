import * as vscode from "vscode";
import { ProviderRegistry } from "../providers/registry";
import { getStagedDiff, hasStagedChanges, truncateDiff } from "../git/diff";

export function registerGenerateCommand(
  context: vscode.ExtensionContext,
  registry: ProviderRegistry
): void {
  const disposable = vscode.commands.registerCommand("aiCommitGen.generate", async () => {
    try {
      if (!(await hasStagedChanges())) {
        vscode.window.showWarningMessage(
          "No staged changes found. Stage files first with `git add`."
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

          const maxDiffSize = vscode.workspace
            .getConfiguration()
            .get<number>("aiCommitGen.maxDiffSize", 10000);
          diff = truncateDiff(diff, maxDiffSize);

          progress.report({
            message: `Generating commit message (${registry.getActiveId()})...`,
          });

          const provider = await registry.getActiveProvider();
          const message = await provider.generateCommitMessage(diff);

          if (token.isCancellationRequested) return;

          vscode.commands.executeCommand("workbench.view.scm");
          const scmInput = vscode.scm.inputBox;
          if (scmInput) {
            scmInput.value = message;
          }

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
    }
  });

  context.subscriptions.push(disposable);
}
