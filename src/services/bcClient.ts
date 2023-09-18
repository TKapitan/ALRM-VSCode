import { AxiosInstance, AxiosResponse, Method } from "axios";

export class Resources {
  public static readonly extension = "extensions";
  public static readonly extensionObject = "extensionObjects";
  public static readonly extensionObjectLine = "extensionObjectLines";
  public static readonly assignableRange = "assignableRanges";
}

type UrlParameters = {
  resource: string;
  id?: string;
  actionName?: string;
  queryParameters?: QueryParameters;
};

interface QueryParameters {
  top?: number;
  skip?: number;
  filter?: string;
}

export type ClientBuilder = () => Promise<AxiosInstance> | AxiosInstance;

export default class BcClient {
  private baseUrl: string;
  private clientBuilder: ClientBuilder;

  constructor(baseUrl: string, clientBuilder: ClientBuilder) {
    // TODO this.validateSettings(this.settings);
    this.clientBuilder = clientBuilder;

    this.baseUrl = baseUrl;
  }

  // TODO move elsewhere
  // private validateSettings(settings: Settings) {
  //   // TODO move elsewhere
  //   if (!settings.validate()) {
  //     throw new Error("Provide api url, name and password in settings!");
  //   }
  // }

  // // TODO move elsewhere
  get username(): string {
    return "FIXME"; // FIXME
  }
  // public get username(): string {
  //   return this.settings.apiUsername;
  // }

  public async read(resource: string, id: string): Promise<Object> {
    const response = await this.sendRequest("GET", { resource, id });

    if (response.data === null || typeof response.data !== "object") {
      throw new Error(`Unexpected return type: ${typeof response.data}`);
    }
    return response.data;
  }

  public async readMultiple(
    resource: string,
    parameters?: QueryParameters,
  ): Promise<any[]> {
    const response = await this.sendRequest("GET", {
      resource,
      queryParameters: parameters,
    });

    if (response.data === null || typeof response.data !== "object") {
      throw new Error(`Unexpected return type: ${typeof response.data}`);
    }
    if ("value" in response.data && Array.isArray(response.data["value"])) {
      return response.data["value"];
    }
    throw new Error(`Unexpected return type: ${typeof response.data["value"]}`);
  }

  public async readAll(resource: string, filter?: string): Promise<Object[]> {
    const querySize = 50;
    let offset = 0;

    const result: Object[] = [];
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const response = await this.readMultiple(resource, {
        top: querySize,
        skip: offset,
        filter: filter,
      });

      result.push(...response);
      if (response.length < querySize) {
        break;
      }
      offset += querySize;
    }
    return result;
  }

  public async create(resource: string, data: Object): Promise<Object> {
    const response = await this.sendRequest("POST", { resource }, data);

    if (response.data === null || typeof response.data !== "object") {
      throw new Error(`Unexpected return type: ${typeof response.data}`);
    }
    return response.data;
  }

  public async callAction(
    resource: string,
    id: string,
    actionName: string,
    data: Object,
  ): Promise<Object> {
    const response = await this.sendRequest(
      "POST",
      { resource, id, actionName },
      data,
    );

    if (response.data === null || typeof response.data !== "object") {
      if (typeof response.data === "string" && response.data === "") {
        // Calling API that has no return value
        return "";
      }
      throw new Error(`Unexpected return type: ${typeof response.data}`);
    }
    if ("value" in response.data) {
      return response.data["value"];
    }
    throw new Error(`Unexpected response format:\n${response.data}`);
  }

  private async sendRequest(
    method: Method,
    urlParameters: UrlParameters,
    data?: Object,
  ): Promise<AxiosResponse> {
    const url = this.buildUrl(urlParameters);

    const axios = await this.clientBuilder();

    const response = await axios.request({
      url: url,
      method: method,
      headers: {
        "content-type": "application/json",
      },
      data: data,
      validateStatus: (status: number) => status >= 200 && status < 500,
    });

    if (response.status >= 200 && response.status < 300) {
      return response;
    }

    if (
      response.data !== undefined &&
      response.data.error !== undefined &&
      response.data.error.message !== undefined
    ) {
      throw new Error(response.data.error.message);
    } else if (response.status !== undefined) {
      throw new Error(
        "Response error: Error " + response.status + ", " + response.statusText,
      );
    } else {
      throw new Error("Empty response");
    }
  }

  private buildUrl({
    resource,
    id,
    actionName,
    queryParameters,
  }: UrlParameters): string {
    let url: string = this.baseUrl;
    if (!url.endsWith("/")) {
      url += "/";
    }

    url += resource;
    if (id !== undefined) {
      url += `('${id}')`;
    }
    if (actionName !== undefined) {
      url += `/Microsoft.NAV.${actionName}`;
    }

    const urlSearchParams = new URLSearchParams();

    const tenant = ""; // FIXME this.settings.apiTenant; // TODO must be kept for backwards compatibility
    if (tenant !== "") {
      urlSearchParams.append("tenant", tenant);
    }

    if (queryParameters !== undefined) {
      if (queryParameters.top !== undefined) {
        urlSearchParams.append("$top", queryParameters.top.toString());
      }
      if (queryParameters.skip !== undefined) {
        urlSearchParams.append("$skip", queryParameters.skip.toString());
      }
      if (queryParameters.filter !== undefined) {
        urlSearchParams.append("$filter", queryParameters.filter);
      }
    }

    return `${url}?${urlSearchParams.toString()}`;
  }
}
