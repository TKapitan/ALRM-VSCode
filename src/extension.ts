import * as vscode from "vscode";

import InitiliazeCommand from "./commands/initialize";
import NewObjectCommand from "./commands/newObject";
import NewObjectLineCommand from "./commands/newObjectLine";
import SwitchObjectIDsCommand from "./commands/switchObjectIDs";
import SynchronizeCommand from "./commands/synchronize";
import { showWarningMessage } from "./helpers/userInteraction";
import { IntegrationApiProvider } from "./services/api/IIntegrationApi";
import { clearTokens } from "./services/oauth";
import { SettingsProvider } from "./services/settings";

export function activate(context: vscode.ExtensionContext): void {
  const api = IntegrationApiProvider.validate();
  if (api?.isDeprecated()) {
    showWarningMessage(
      "You are using deprecated API version. Please update your BC backend app & setting in the VS Code.",
    );
  }

  SettingsProvider.configure(context.secrets);

  const disposables = [
    vscode.commands.registerCommand(
      "al-id-range-manager.initialize",
      InitiliazeCommand,
    ),
    vscode.commands.registerCommand(
      "al-id-range-manager.synchronize",
      SynchronizeCommand,
    ),
    vscode.commands.registerCommand(
      "al-id-range-manager.newObject",
      NewObjectCommand,
    ),
    vscode.commands.registerCommand(
      "al-id-range-manager.newObjectLine",
      NewObjectLineCommand,
    ),
    vscode.commands.registerCommand(
      "al-id-range-manager.switchObjectIDs",
      SwitchObjectIDsCommand,
    ),
    vscode.commands.registerCommand(
      "al-id-range-manager.clearCredentials",
      () => clearTokens(context.secrets),
    ),
    SettingsProvider.addConfigurationChangeListener(),
  ];

  context.subscriptions.push(...disposables);
}

export function deactivate(): void {
  //
}
