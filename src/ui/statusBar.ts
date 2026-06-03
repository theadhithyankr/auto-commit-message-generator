import * as vscode from "vscode";
import { ProviderRegistry } from "../providers/registry";
import { PROVIDERS } from "../providers/types";

export class CommitGenStatusBar {
  private statusItem: vscode.StatusBarItem;

  constructor(private registry: ProviderRegistry) {
    this.statusItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Left,
      50
    );
    this.statusItem.command = "aiCommitGen.switchProvider";
    this.statusItem.tooltip = "AI Commit Gen — click to switch provider";
    this.update();
    this.statusItem.show();
  }

  update(): void {
    const activeId = this.registry.getActiveId();
    const provider = PROVIDERS.find((p) => p.id === activeId);
    this.statusItem.text = `$(sparkle) ${provider?.label || activeId}`;
  }

  dispose(): void {
    this.statusItem.dispose();
  }
}
