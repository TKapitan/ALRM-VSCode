// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { InitiliazeCommand } from './commands/initialize';
import { NewObjectCommand } from './commands/newObject';
import * as tmp from './tmp';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "al-id-range-manager" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposables =
		[
			vscode.commands.registerCommand('al-id-range-manager.helloWorld', () => {
				vscode.window.showInformationMessage('Hello World from AL Id Range Manager!');
			}),
			vscode.commands.registerCommand('al-id-range-manager.initialize', InitiliazeCommand),
			vscode.commands.registerCommand('al-id-range-manager.newObject', NewObjectCommand),
			vscode.commands.registerCommand('al-id-range-manager.test', tmp.tmp)
		];

	context.subscriptions.concat(disposables);
}

// this method is called when your extension is deactivated
export function deactivate() { }
