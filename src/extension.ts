import * as vscode from "vscode";
import { SecretsManager } from "./config/secrets";
import { ProviderRegistry } from "./providers/registry";
import { registerGenerateCommand } from "./commands/generate";
import {
  registerSwitchProviderCommand,
  registerSetApiKeyCommand,
} from "./commands/switchProvider";
import { CommitGenStatusBar } from "./ui/statusBar";

export function activate(context: vscode.ExtensionContext) {
  const secrets = new SecretsManager(context.secrets);
  const registry = new ProviderRegistry(secrets);

  registerGenerateCommand(context, registry);
  registerSwitchProviderCommand(context, registry);
  registerSetApiKeyCommand(context, registry, secrets);

  const statusBar = new CommitGenStatusBar(registry);
  context.subscriptions.push(statusBar);
}

export function deactivate() {}
