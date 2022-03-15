import * as vscode from 'vscode';
import InitiliazeCommand from './commands/initialize';
import SynchronizeCommand from './commands/synchronize';
import SwitchObjectIDsCommand from './commands/switchObjectIDs';
import NewObjectCommand from './commands/newObject';
import NewObjectLineCommand from './commands/newObjectLine';
import { promptMissingSettings } from './helpers/userInteraction';
import Settings from './services/settings';

export function activate(context: vscode.ExtensionContext): void {
	const settings = Settings.instance;
	if (!settings.validate()) {
		promptMissingSettings();
	}
	const disposables =
		[
			vscode.commands.registerCommand('al-id-range-manager.initialize', InitiliazeCommand),
			vscode.commands.registerCommand('al-id-range-manager.synchronize', SynchronizeCommand),
			vscode.commands.registerCommand('al-id-range-manager.newObject', NewObjectCommand),
			vscode.commands.registerCommand('al-id-range-manager.newObjectLine', NewObjectLineCommand),
			vscode.commands.registerCommand('al-id-range-manager.switchObjectIDs', SwitchObjectIDsCommand),

			
		];

	context.subscriptions.push(...disposables);
}

export function deactivate(): void {
	throw new Error('Not implemented yet!');
}
