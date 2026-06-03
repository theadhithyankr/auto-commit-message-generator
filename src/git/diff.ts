import { exec } from "child_process";
import { promisify } from "util";
import * as vscode from "vscode";

const execAsync = promisify(exec);

async function getGitRoot(): Promise<string | undefined> {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) {
    return undefined;
  }
  return workspaceFolders[0].uri.fsPath;
}

export async function getStagedDiff(): Promise<string> {
  const gitRoot = await getGitRoot();
  if (!gitRoot) {
    throw new Error("No workspace folder open");
  }

  try {
    const { stdout } = await execAsync("git diff --cached --no-color", {
      cwd: gitRoot,
      maxBuffer: 10 * 1024 * 1024,
    });
    return stdout.trim();
  } catch (err: any) {
    if (err.code === "ENOENT") {
      throw new Error("git is not installed or not in PATH");
    }
    throw new Error(`Failed to get staged diff: ${err.message}`);
  }
}

export async function hasStagedChanges(): Promise<boolean> {
  const gitRoot = await getGitRoot();
  if (!gitRoot) {
    return false;
  }

  try {
    const { stdout } = await execAsync("git diff --cached --name-only", {
      cwd: gitRoot,
    });
    return stdout.trim().length > 0;
  } catch {
    return false;
  }
}

export function truncateDiff(diff: string, maxChars: number): string {
  if (diff.length <= maxChars) {
    return diff;
  }
  return diff.slice(0, maxChars) + "\n... (truncated)";
}
