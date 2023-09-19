import * as vscode from "vscode";

import InitiliazeCommand from "./commands/initialize";
import NewObjectCommand from "./commands/newObject";
import NewObjectLineCommand from "./commands/newObjectLine";
import SwitchObjectIDsCommand from "./commands/switchObjectIDs";
import SynchronizeCommand from "./commands/synchronize";
import {
  promptMissingSettings,
  showInformationMessage,
} from "./helpers/userInteraction";
import { clearTokens, getAccessToken } from "./services/oauth";
import { CONFIG_KEY, SettingsProvider } from "./services/settings";

export function activate(context: vscode.ExtensionContext): void {
  // TODO
  // const settings = Settings.instance;
  // if (!settings.validate()) {
  //   promptMissingSettings();
  // }

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
    vscode.workspace.onDidChangeConfiguration(listener),
    SettingsProvider.addConfigurationChangeListener(),
  ];

  context.subscriptions.push(...disposables);
}

function listener(e: vscode.ConfigurationChangeEvent) {
  const affectsConfiguration = e.affectsConfiguration(CONFIG_KEY);
  showInformationMessage(`affectsConfiguration: ${affectsConfiguration}`);
}

export function deactivate(): void {
  //
}
