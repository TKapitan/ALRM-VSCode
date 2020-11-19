// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { InitiliazeCommand } from './commands/initialize';
import { NewObjectCommand } from './commands/newObject';
import { NewObjectLineCommand } from './commands/newObjectLine';
import { promptMissingSettings } from './helpers/userInteraction';
import { Settings } from './services/settings';

export function activate(context: vscode.ExtensionContext) {
	let settings = new Settings();
	if (!settings.validate())
		promptMissingSettings();

	let disposables =
		[
			vscode.commands.registerCommand('al-id-range-manager.initialize', InitiliazeCommand),
			vscode.commands.registerCommand('al-id-range-manager.newObject', NewObjectCommand),
			vscode.commands.registerCommand('al-id-range-manager.newObjectLine', NewObjectLineCommand),
		];

	context.subscriptions.push(...disposables);
}

export function deactivate() { }
