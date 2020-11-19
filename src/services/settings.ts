import * as vscode from 'vscode';

export const CONFIG_KEY: string = 'al-id-range-manager';

export class Settings {
    private apiBaseUrl?: string;
    private apiUsername?: string;
    private apiPassword?: string;

    public get ApiBaseUrl() { return this.apiBaseUrl; }
    public get ApiUsername() { return this.apiUsername; }
    public get ApiPassword() { return this.apiPassword; }

    constructor() {
        this.parseConfig();
    }

    private parseConfig() {
        let config = vscode.workspace.getConfiguration(CONFIG_KEY);

        this.apiBaseUrl = config.get('baseUrl');
        this.apiUsername = config.get('username');
        this.apiPassword = config.get('password');
    }

    public validate(): boolean {
        if ((this.ApiBaseUrl ?? '') === '' || (this.ApiUsername ?? '') === '' || (this.ApiPassword ?? '') === '')
            return false;

        return true;
    }
}