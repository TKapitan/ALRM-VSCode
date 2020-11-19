import * as vscode from 'vscode';

export function showInformationMessage(message: string) {
    vscode.window.showInformationMessage(message);
}

export function showErrorMessage(error: any) {
    let errorMessage: string;
    if (typeof error === 'string')
        errorMessage = error;
    else if (typeof error === 'object' && error instanceof Error)
        errorMessage = error.message;
    else
        errorMessage = error.toString();

    vscode.window.showErrorMessage(errorMessage);
}

export async function getUserInput(prompt?: string): Promise<string | undefined> {
    return await vscode.window.showInputBox({ prompt: prompt });
}

export async function getUserSelection(items: string[]): Promise<string | undefined> {
    return await vscode.window.showQuickPick(items);
}