import * as vscode from "vscode";
import { ProviderRegistry } from "../providers/registry";
import { PROVIDERS } from "../providers/types";
import { SecretsManager } from "../config/secrets";

export function registerSwitchProviderCommand(
  context: vscode.ExtensionContext,
  registry: ProviderRegistry
): void {
  const disposable = vscode.commands.registerCommand(
    "aiCommitGen.switchProvider",
    async () => {
      const items = PROVIDERS.map((p) => ({
        label: p.label,
        description: p.description,
        providerId: p.id,
      }));

      const activeId = registry.getActiveId();
      const selected = await vscode.window.showQuickPick(items, {
        placeHolder: `Current: ${PROVIDERS.find((p) => p.id === activeId)?.label}`,
      });

      if (selected) {
        registry.setActive(selected.providerId);
        vscode.window.showInformationMessage(`Switched to ${selected.label}`);
      }
    }
  );

  context.subscriptions.push(disposable);
}

export function registerSetApiKeyCommand(
  context: vscode.ExtensionContext,
  registry: ProviderRegistry,
  secrets: SecretsManager
): void {
  const disposable = vscode.commands.registerCommand(
    "aiCommitGen.setApiKey",
    async () => {
      const items = PROVIDERS.map((p) => ({
        label: p.label,
        description: p.description,
        providerId: p.id,
      }));

      const selected = await vscode.window.showQuickPick(items, {
        placeHolder: "Select provider to set API key for",
      });

      if (!selected) return;

      const providerInfo = PROVIDERS.find((p) => p.id === selected.providerId);
      const openSignup = "Get API Key (opens browser)";

      const apiKey = await vscode.window.showInputBox({
        prompt: `API key for ${selected.label}`,
        placeHolder: "Paste your API key here",
        password: true,
        ignoreFocusOut: true,
      });

      if (apiKey === undefined) {
        if (providerInfo) {
          const result = await vscode.window.showInformationMessage(
            `Don't have a ${selected.label} API key?`,
            openSignup
          );
          if (result === openSignup) {
            vscode.env.openExternal(vscode.Uri.parse(providerInfo.signupUrl));
          }
        }
        return;
      }

      if (apiKey.length > 0) {
        await secrets.setApiKey(selected.providerId, apiKey);
        vscode.window.showInformationMessage(`API key saved for ${selected.label}`);
      }
    }
  );

  context.subscriptions.push(disposable);
}
