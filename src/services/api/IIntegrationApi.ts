import axios, { AxiosInstance } from "axios";

import AssignableRange from "../../models/assignableRange";
import Extension from "../../models/extension";
import ExtensionObject from "../../models/extensionObject";
import ExtensionObjectLine from "../../models/extensionObjectLine";
import BcClient, { ClientBuilder } from "../bcClient";
import { getAccessToken } from "../oauthClient";
import Settings, { SettingsProvider } from "../settings";
import IntegrationApiv1n0 from "./IntegrationApiv1n0";
import IntegrationApiv1n1 from "./IntegrationApiv1n1";

export type CreateBCExtensionRequest = {
  id: string;
  rangeCode: string;
  name: string;
  description: string;
};

export type CreateBCExtensionObjectRequest = {
  objectType: string;
  objectID: number;
  objectName: string;
  extendsObjectName: string;
  extension: Extension;
};

export type CreateBCExtensionObjectLineRequest = {
  objectType: string;
  objectID: number;
  fieldOrValueID: number;
  extension: Extension;
};

export interface IIntegrationApi {
  bcClient: BcClient;

  getApiVersionURLFormatted(): string;

  getBcExtension(id: string): Promise<Extension | null>;
  getBcExtensionObject(
    extensionID: string,
    objectType: string,
    objectID: number,
  ): Promise<ExtensionObject | null>;
  getBcExtensionObjectLine(
    extensionID: string,
    objectType: string,
    objectID: number,
    fieldID: number,
  ): Promise<ExtensionObjectLine | null>;

  createBcExtension(
    createBCExtensionRequest: CreateBCExtensionRequest,
  ): Promise<Extension>;
  createBcExtensionObject(
    createBCExtensionObjectRequest: CreateBCExtensionObjectRequest,
  ): Promise<number>;
  createBcExtensionObjectLine(
    createBCExtensionObjectLineRequest: CreateBCExtensionObjectLineRequest,
  ): Promise<number>;
  getAllAssignableRanges(): Promise<AssignableRange[]>;

  isDeprecated(): boolean;
}

export class IntegrationApiProvider {
  private static instance: IIntegrationApi | undefined;

  static get api(): IIntegrationApi {
    if (this.instance) {
      return this.instance;
    }

    const settings = SettingsProvider.getSettings();
    this.instance = IntegrationApiProvider.buildIntegrationApi(settings);

    return this.instance;
  }

  private static buildIntegrationApi(settings: Settings): IIntegrationApi {
    const bcClient = new BcClient(
      IntegrationApiProvider.buildBaseUrl(settings),
      IntegrationApiProvider.buildClientBuilder(settings),
    );

    switch (settings.apiVersion) {
      case "1.1":
        return new IntegrationApiv1n1(bcClient);
      case "1.0":
        return new IntegrationApiv1n0(bcClient);
      default:
        throw new Error(
          `Invalid version ${settings.apiVersion}, supported values are: ['1.1', '1.0'].`,
        );
    }
  }

  private static buildBaseUrl(settings: Settings): string {
    switch (settings.apiType) {
      case "Cloud":
        return cloudUrl(settings);
      case "OnPrem":
        return userUrl(settings);
      default:
        throw new Error(
          // TODO repeated
          `Invalid apiType ${settings.apiType}, supported values are: ['OnPrem', 'Cloud'].`,
        );
    }
  }

  private static buildClientBuilder(settings: Settings): ClientBuilder {
    switch (settings.authenticationType) {
      case "Basic":
        return () => basicClientBuilder(settings);
      case "Oauth":
        return async () => oauthClientBuilder(settings);
      default:
        throw new Error(
          `Unimplemented authentication type: ${settings.authenticationType}`,
        );
    }
  }
}

function userUrl(settings: Settings): string {
  if (!settings.apiBaseUrl) {
    throw new Error(`Invalid settings: Missing apiBaseUrl.`);
  }
  if (!settings.apiVersion) {
    throw new Error(`Invalid settings: Missing apiVersion.`);
  }

  let baseUrl = settings.apiBaseUrl;
  if (!baseUrl.endsWith("/")) {
    baseUrl += "/";
  }
  baseUrl += `v${settings.apiVersion}/`;

  if (settings.apiCompanyId) {
    baseUrl += "companies(" + settings.apiCompanyId + ")/";
  }

  // FIXME tenant is now not used?

  return baseUrl;
}

function cloudUrl(settings: Settings) {
  if (!settings.apiTenant) {
    throw new Error(`Invalid settings: Missing apiTenant.`);
  }
  if (!settings.apiEnvironment) {
    throw new Error(`Invalid settings: Missing apiEnvironment.`);
  }
  if (!settings.apiVersion) {
    throw new Error(`Invalid settings: Missing apiVersion.`);
  }

  const tenant = settings.apiTenant;
  const environment = settings.apiEnvironment;
  const version = `v${settings.apiVersion}`;
  const companyId = settings.apiCompanyId;

  const url = `https://api.businesscentral.dynamics.com/v2.0/${tenant}/${environment}/api/teamARTAAAE/extension/${version}`;
  if (companyId) {
    return `${url}/companies(${companyId})`;
  }
  return url;
}

function basicClientBuilder(settings: Settings): AxiosInstance {
  const authorization: string = Buffer.from(
    `${settings.apiUsername}:${settings.apiPassword}`,
  ).toString("base64");

  return axios.create({
    headers: {
      authorization: `Basic ${authorization}`,
    },
  });
}

async function oauthClientBuilder(settings: Settings): Promise<AxiosInstance> {
  // TODO since accessToken is fetched only once, the client returned by this function cannot be reliably reused
  const accessToken = await getAccessToken(settings.secretStorage);

  return axios.create({
    headers: {
      authorization: `Bearer ${accessToken}`,
    },
  });
}
