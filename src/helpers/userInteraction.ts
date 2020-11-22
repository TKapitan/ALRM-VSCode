import * as vscode from 'vscode';
import { CONFIG_KEY } from '../services/settings';

export async function showInformationMessage(message: string, items?: string[]): Promise<string | undefined> {
    return await vscode.window.showInformationMessage(message, ...(items ?? []));
}

export async function showWarningMessage(message: string, items?: string[]): Promise<string | undefined> {
    return await vscode.window.showWarningMessage(message, ...(items ?? []));
}

export async function showErrorMessage(error: unknown, items?: string[]): Promise<string | undefined> {
    let errorMessage: string;
    if (typeof error === 'string'){
        errorMessage = error;
    } else if (typeof error === 'object' && error instanceof Error){
        errorMessage = error.message;
    } else if (typeof error === 'object'){
        errorMessage = error?.toString() || '';
    } else{
        errorMessage = error + '';
    }
    return await vscode.window.showErrorMessage(errorMessage, ...(items ?? []));
}

export async function getUserInput(prompt?: string): Promise<string | undefined> {
    return await vscode.window.showInputBox({ prompt: prompt });
}

export async function getUserSelection(items: string[]): Promise<string | undefined> {
    return await vscode.window.showQuickPick(items);
}

export async function promptInitialization():Promise<void> {
    const initializeAction = 'Initialize';

    const result = await showErrorMessage('Extension is not initialized', [initializeAction]);
    if (result === initializeAction){
        vscode.commands.executeCommand('al-id-range-manager.initialize'); // XXX create a dict
    }
}


export async function promptMissingSettings():Promise<void> {
    const openSettingsAction = 'Open Settings';

    const result = await showWarningMessage('Connection info is missing', [openSettingsAction]);
    if (result === openSettingsAction) {
        vscode.commands.executeCommand('workbench.action.openSettings', CONFIG_KEY); // XXX create a dict
    }
}
