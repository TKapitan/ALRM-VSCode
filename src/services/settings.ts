import * as vscode from 'vscode';
import { IIntegrationApi } from './api/IIntegrationApi';
import IntegrationApiv1n0 from './api/IntegrationApiv1n0';
import IntegrationApiv1n1 from './api/IntegrationApiv1n1';

export const CONFIG_KEY = 'al-id-range-manager';
export const AUTH_TYPE_BASIC = 'Basic';

export default class Settings {
    private _apiBaseUrl?: string;
    private _apiTenant?: string;
    private _apiUsername?: string;
    private _apiPassword?: string;
    private _authenticationType?: string;
    private _useAssignableRange?: boolean;
    private _integrationApi?: IIntegrationApi;
    private static _instance: Settings;

    public get apiBaseUrl(): string { return this._apiBaseUrl || ''; }
    public get apiTenant(): string { return this._apiTenant || ''; }
    public get apiUsername(): string { return this._apiUsername || ''; }
    public get apiPassword(): string { return this._apiPassword || ''; }
    public get authenticationType(): string { return this._authenticationType || ''; }
    public get useAssignableRange(): boolean { return this._useAssignableRange || false; }
    public get integrationApi(): IIntegrationApi { return this._integrationApi || IntegrationApiv1n0.instance; }

    private constructor() {
        this.parseConfig();
    }

    public static get instance(): Settings {
        return this._instance || (this._instance = new this());
    }

    private parseConfig() {
        const config = vscode.workspace.getConfiguration(CONFIG_KEY);

        this._apiBaseUrl = config.get('baseUrl');
        this._apiTenant = config.get('tenant');
        this._apiUsername = config.get('username');
        this._apiPassword = config.get('password');
        this._authenticationType = config.get('authenticationType');
        this._useAssignableRange = false;
        if (config.get('assignableRange') === 'API') {
            this._useAssignableRange = true;
        }
        switch (config.get('integrationApiVersion')) {
            case '1.1':
                this._integrationApi = IntegrationApiv1n1.instance;
                break;
            default:
                this._integrationApi = IntegrationApiv1n0.instance;
                break;
        }
    }

    public validate(): boolean {
        if (this.apiBaseUrl === '' || this.apiUsername === '' || this.apiPassword === '') {
            return false;
        }
        return true;
    }
}