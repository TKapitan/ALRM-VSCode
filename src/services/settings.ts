import * as vscode from 'vscode';

export const CONFIG_KEY = 'al-id-range-manager';

export default class Settings {
    private _apiBaseUrl?: string;
    private _apiUsername?: string;
    private _apiPassword?: string;
    private static _instance: Settings;

    public get apiBaseUrl() :string { return this._apiBaseUrl || ''; }
    public get apiUsername() :string { return this._apiUsername || ''; }
    public get apiPassword() :string { return this._apiPassword || ''; }

    private constructor() {
        this.parseConfig();
    }

    public static get instance(): Settings
    {
        return this._instance || (this._instance = new this());
    }

    private parseConfig() {
        const config = vscode.workspace.getConfiguration(CONFIG_KEY);

        this._apiBaseUrl = config.get('baseUrl');
        this._apiUsername = config.get('username');
        this._apiPassword = config.get('password');
    }

    public validate(): boolean {
        if (this.apiBaseUrl === '' || this.apiUsername === '' || this.apiPassword === ''){
            return false;
        }
        return true;
    }
}