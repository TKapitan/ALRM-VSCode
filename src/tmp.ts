import { join } from 'path';
import * as vscode from 'vscode';
import { getCurrentWorkspaceUri, readAppJson } from './services/fileService';

export async function tmp() {
    const newFileUri = vscode.Uri.parse(join('untitled:', getCurrentWorkspaceUri().fsPath, 'test.al'));

    let textDocument = await vscode.workspace.openTextDocument({
        language: 'al',
        content: 'codeunit 50000 "ART AA AE"\n{\n}\n',
    });

    let edit = new vscode.WorkspaceEdit();
    edit.insert(newFileUri, new vscode.Position(0, 0), 'tmp');

    let success = await vscode.workspace.applyEdit(edit);
    if (success) {
        let textEditor = await vscode.window.showTextDocument(textDocument);
        textEditor.insertSnippet(new vscode.SnippetString('123'));
    }
}
