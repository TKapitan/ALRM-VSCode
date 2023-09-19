import * as vscode from "vscode";

import { ISnippets } from "./snippets/ISnippets";
import SnippetsDefault from "./snippets/SnippetsDefault";
import SnippetsWaldo from "./snippets/SnippetsWaldo";

export const CONFIG_KEY = "al-id-range-manager";
export const AUTH_TYPE_BASIC = "Basic";

type ApiType = "OnPrem" | "Cloud";
type AuthenticationType = "Basic" | "Oauth";

export default class Settings {
  readonly apiType?: ApiType;
  readonly apiBaseUrl?: string;
  readonly apiTenant?: string;
  readonly apiEnvironment?: string;
  readonly apiCompanyId?: string;
  readonly apiUsername?: string;
  readonly apiPassword?: string;
  readonly apiVersion?: string;
  readonly authenticationType?: AuthenticationType;

  readonly secretStorage: vscode.SecretStorage;
  readonly snippets: ISnippets;

  constructor({
    apiType,
    baseUrl,
    tenant,
    version,
    environment,
    companyId,
    username,
    password,
    authenticationType,
    secretStorage,
    snippets,
  }: {
    apiType: ApiType | undefined;
    baseUrl: string | undefined;
    tenant: string | undefined;
    environment: string | undefined;
    companyId: string | undefined;
    username: string | undefined;
    password: string | undefined;
    version: string | undefined;
    authenticationType: AuthenticationType | undefined;
    secretStorage: vscode.SecretStorage;
    snippets: ISnippets;
  }) {
    this.apiType = apiType;
    this.apiBaseUrl = baseUrl;
    this.apiTenant = tenant;
    this.apiEnvironment = environment;
    this.apiCompanyId = companyId;
    this.apiVersion = version;
    this.authenticationType = authenticationType;

    this.apiUsername = username;
    this.apiPassword = password;

    this.secretStorage = secretStorage;
    this.snippets = snippets;
  }

  public validate(): boolean {
    if (
      this.apiBaseUrl === "" ||
      this.apiUsername === "" ||
      this.apiPassword === ""
    ) {
      return false;
    }
    return true;
  }
}

type SettingsChangeListener = (settings: Settings) => void;
type GetSettingsAndListenResult = {
  settings: Settings;
  removeListener: () => void;
};

export class SettingsProvider {
  private static secretStorage: vscode.SecretStorage;
  private static settings?: Settings;

  static configure(secretStorage: vscode.SecretStorage): void {
    SettingsProvider.secretStorage = secretStorage;

    this.settings = this.parseConfig(); // TODO this can fail
  }

  static getSettingsAndSubscribe(
    listener: SettingsChangeListener,
  ): GetSettingsAndListenResult {
    this.onResetSubscriptions.push(listener);

    return {
      settings: SettingsProvider.getSettings(),
      removeListener: () =>
        this.onResetSubscriptions.filter((e) => e !== listener),
    };
  }

  static getSettings(): Settings {
    if (this.settings) {
      return this.settings;
    }

    this.settings = this.parseConfig(); // TODO this can fail
    return this.settings;
  }

  static reset(): void {
    this.settings = undefined;
    this.settings = this.parseConfig(); // TODO this can fail

    SettingsProvider.onReset(this.settings);
  }

  private static onResetSubscriptions: Array<SettingsChangeListener> = [];

  static onReset(settings: Settings): void {
    for (const listener of SettingsProvider.onResetSubscriptions) {
      listener(settings);
    }
  }

  static parseConfig(): Settings {
    const config = vscode.workspace.getConfiguration(CONFIG_KEY);

    const apiType = config.get<string>("apiType");
    const version = config.get<string>("apiVersion");
    const environment = config.get<string>("environment");

    // FIXME should this be here?
    // if (integrationApi.isDeprecated()) {
    //   showWarningMessage(
    //     `You are using deprecated API version ${selectedApiVersion}. Please update your BC backend app & setting in the VS Code.`,
    //   );
    // }

    let snippets: ISnippets;
    const selectedSnippets = config.get<string>("snippets");
    switch (selectedSnippets) {
      case "Waldo's CRS AL Language Snippets":
        snippets = SnippetsWaldo.instance;
        break;
      default:
        snippets = SnippetsDefault.instance;
        break;
    }

    const baseUrl = config.get<string>("baseUrlWithoutVersion");
    const companyId = config.get<string>("companyId");
    const tenant = config.get<string>("tenant");
    const username = config.get<string>("username");
    const password = config.get<string>("password");
    const authenticationType = config.get<string>("authenticationType");

    if (authenticationType !== "Basic" && authenticationType !== "Oauth") {
      throw new Error(
        `Invalid authenticationType ${authenticationType}, supported values are: ['Basic', 'Oauth'].`,
      );
    }

    if (apiType !== "OnPrem" && apiType !== "Cloud") {
      throw new Error(
        `Invalid apiType ${apiType}, supported values are: ['OnPrem', 'Cloud'].`,
      );
    }

    return new Settings({
      apiType,
      baseUrl,
      tenant,
      version,
      environment,
      companyId,
      username,
      password,
      authenticationType,
      secretStorage: SettingsProvider.secretStorage,
      snippets,
    });
  }

  static addConfigurationChangeListener(): vscode.Disposable {
    return vscode.workspace.onDidChangeConfiguration(
      (e: vscode.ConfigurationChangeEvent) => {
        if (!e.affectsConfiguration(CONFIG_KEY)) {
          return;
        }

        SettingsProvider.reset();
      },
    );
  }
}
