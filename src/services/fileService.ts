import { join } from 'path';
import * as vscode from 'vscode';
import * as fs from 'fs';
import App from '../models/app';
import { ObjectType, objectTypeSnippetFileName } from '../models/objectType';

const ALLANGUAGE = 'ms-dynamics-smb.al';

export function readAppJson(workspaceFolderUri?: vscode.Uri): App {
    if (!workspaceFolderUri) {
        workspaceFolderUri = getCurrentWorkspaceUri();
    }

    const appJsonFileName: string = join(workspaceFolderUri.fsPath, 'app.json');

    if (!fs.existsSync(appJsonFileName)) {
        throw new Error('App.json not found!');
    }
    const app: App = App.fromJson(require(appJsonFileName));
    if (app === null || app.id === '') {
        throw new Error('App.json is not valid!');
    }
    return app;
}

export function getCurrentWorkspaceUri(): vscode.Uri {
    let workspaceFolder: vscode.Uri | undefined;
    if (vscode.window.activeTextEditor !== undefined) {
        workspaceFolder = vscode.workspace.getWorkspaceFolder(vscode.window.activeTextEditor.document.uri)?.uri;
    }
    if (!workspaceFolder && vscode.workspace.workspaceFolders !== undefined && vscode.workspace.workspaceFolders.length !== 0) {
        workspaceFolder = vscode.workspace.workspaceFolders[0].uri;
    }
    if (!workspaceFolder) {
        throw new Error('No opened project. Open any project first then run the command again!');
    }
    return workspaceFolder;
}

export function readSnippetFile(objectType: ObjectType): Buffer {
    const userProfilePath = require('os').homedir();
    if (!userProfilePath) {
        throw new Error('User profile inaccessible!');
    }

    const files = fs.readdirSync(join(userProfilePath, '.vscode', 'extensions'));
    const snippetFileName = objectTypeSnippetFileName(objectType);
    const alLanguageExtDirs = files.filter(e => e.startsWith(ALLANGUAGE));

    for (const i in alLanguageExtDirs) {
        const snippetFilePath = join(userProfilePath, '.vscode', 'extensions', alLanguageExtDirs[i], 'snippets', snippetFileName);

        if (fs.existsSync(snippetFilePath)) {
            return fs.readFileSync(snippetFilePath);
        }
    }

    throw new Error(`Snippet file ${snippetFileName} not found!`);
}

export function readCurrentFile(): string | undefined {
    return vscode.window.activeTextEditor?.document.getText();
}