import * as vscode from "vscode";

import { promptMissingSettings } from "../helpers/userInteraction";
import { ISnippets } from "./snippets/ISnippets";
import SnippetsDefault from "./snippets/SnippetsDefault";
import SnippetsWaldo from "./snippets/SnippetsWaldo";

export const CONFIG_KEY = "al-id-range-manager";
export const AUTH_TYPE_BASIC = "Basic";

type ApiType = "OnPrem" | "Cloud";
type AuthenticationType = "Basic" | "Oauth";

export type Settings = {
  apiType?: ApiType;
  apiBaseUrl?: string;
  apiTenant?: string;
  apiEnvironment?: string;
  apiCompanyId?: string;
  apiUsername?: string;
  apiPassword?: string;
  apiVersion?: string;
  authenticationType?: AuthenticationType;

  secretStorage: vscode.SecretStorage;
  snippets: ISnippets;
};

type SettingsChangeListener = () => void;
type GetSettingsAndListenResult = {
  settings: Settings;
  removeListener: () => void;
};

export class SettingsProvider {
  private static secretStorage: vscode.SecretStorage;
  private static settings?: Settings;

  static configure(secretStorage: vscode.SecretStorage): void {
    SettingsProvider.secretStorage = secretStorage;

    this.settings = this.parseConfig();
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

    this.settings = this.parseConfig();
    return this.settings;
  }

  static reset(): void {
    this.settings = undefined;
    this.settings = this.parseConfig();

    SettingsProvider.onReset();
  }

  private static onResetSubscriptions: Array<SettingsChangeListener> = [];

  static onReset(): void {
    for (const listener of SettingsProvider.onResetSubscriptions) {
      listener();
    }
  }

  static parseConfig(): Settings {
    const config = vscode.workspace.getConfiguration(CONFIG_KEY);

    const apiType = config.get<string>("apiType");
    const apiVersion = config.get<string>("apiVersion");
    const apiEnvironment = config.get<string>("environment");

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

    const apiBaseUrl = config.get<string>("baseUrlWithoutVersion");
    const apiCompanyId = config.get<string>("companyId");
    const apiTenant = config.get<string>("tenant");
    const apiUsername = config.get<string>("username");
    const apiPassword = config.get<string>("password");
    const authenticationType = config.get<string>("authenticationType");

    return {
      apiType: validateApiType(apiType),
      apiBaseUrl,
      apiTenant,
      apiVersion,
      apiEnvironment,
      apiCompanyId,
      apiUsername,
      apiPassword,
      authenticationType: validateAuthenticationType(authenticationType),
      secretStorage: SettingsProvider.secretStorage,
      snippets,
    };
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

function validateApiType(apiType: string | undefined): ApiType {
  if (apiType === "OnPrem" || apiType === "Cloud") {
    return apiType;
  }

  promptMissingSettings(
    `Api type ${apiType} is not a valid value, using "OnPrem" instead. Update your settings.`,
  );
  return "OnPrem";
}

function validateAuthenticationType(
  authenticationType: string | undefined,
): AuthenticationType {
  if (authenticationType === "Basic" || authenticationType === "Oauth") {
    return authenticationType;
  }

  promptMissingSettings(
    `Authentication type ${authenticationType} is not a valid value, using "Basic" instead. Update your settings.`,
  );
  return "Basic";
}
