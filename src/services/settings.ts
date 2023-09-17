import axios, { AxiosInstance } from "axios";
import { settings } from "cluster";
import * as vscode from "vscode";

import { showWarningMessage } from "../helpers/userInteraction";
import { IIntegrationApi } from "./api/IIntegrationApi";
import IntegrationApiv1n0 from "./api/IntegrationApiv1n0";
import IntegrationApiv1n1 from "./api/IntegrationApiv1n1";
import BcClient, { ClientBuilder } from "./bcClient";
import { getAccessToken } from "./oauthClient";
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

  // private parseConfig() {
  //   const config = vscode.workspace.getConfiguration(CONFIG_KEY);

  //   const selectedApiVersion = config.get("apiVersion");
  //   switch (selectedApiVersion) {
  //     case "1.1":
  //       this._integrationApi = IntegrationApiv1n1.instance;
  //       break;
  //     default:
  //       this._integrationApi = IntegrationApiv1n0.instance;
  //       break;
  //   }
  //   if (this._integrationApi.isDeprecated()) {
  //     showWarningMessage(
  //       "You are using deprecated API version " +
  //         selectedApiVersion +
  //         ". Please update your BC backend app & setting in the VS Code.",
  //     );
  //   }

  //   const selectedSnippets = config.get("snippets");
  //   switch (selectedSnippets) {
  //     case "Waldo's CRS AL Language Snippets":
  //       this._snippets = SnippetsWaldo.instance;
  //       break;
  //     default:
  //       this._snippets = SnippetsDefault.instance;
  //       break;
  //   }

  //   this._apiBaseUrl = config.get("baseUrlWithoutVersion");
  //   if (!this._apiBaseUrl?.endsWith("/")) {
  //     this._apiBaseUrl += "/";
  //   }
  //   this._apiBaseUrl += this._integrationApi.getApiVersionURLFormatted() + "/";

  //   const companyId = config.get("companyId");
  //   if (companyId !== "") {
  //     this._apiBaseUrl += "companies(" + companyId + ")/";
  //   }

  //   this._apiTenant = config.get("tenant");
  //   this._apiUsername = config.get("username");
  //   this._apiPassword = config.get("password");
  //   this._authenticationType = config.get("authenticationType");
  // }

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

// TODO subscribe to vscode.workspace.onDidChangeConfiguration to invalidate settings instance

export class SettingsProvider {
  private static secretStorage: vscode.SecretStorage | undefined;
  private static settings?: Settings;

  static configure(secretStorage: vscode.SecretStorage): void {
    SettingsProvider.secretStorage = secretStorage;
  }

  static getSettings(): Settings {
    if (this.settings) {
      return this.settings;
    }

    this.settings = this.parseConfig();
    return this.settings;
  }

  static parseConfig(): Settings {
    const config = vscode.workspace.getConfiguration(CONFIG_KEY);

    const apiType = config.get<string>("apiType");
    const version = config.get<string>("apiVersion");
    const environment = config.get<string>("environment"); // TODO not defined in package.json

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
}
