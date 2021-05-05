import axios, { Method, AxiosResponse } from 'axios';
import Settings, { AUTH_TYPE_BASIC } from './settings';

export class Resources {
    public static readonly extension = 'extensions';
    public static readonly assignableRange = 'assignableRanges';
}

interface QueryParameters {
    top?: number;
    skip?: number;
    filter?: string;
}

export default class BcClient {
    private baseUrl: string;
    private settings: Settings;

    constructor() {
        this.settings = Settings.instance;
        this.validateSettings(this.settings);

        this.baseUrl = this.settings.apiBaseUrl ?? '';
        switch (this.settings.authenticationType) {
            case AUTH_TYPE_BASIC: {
                const authorization: string = Buffer.from(`${this.settings.apiUsername}:${this.settings.apiPassword}`).toString('base64');
                axios.defaults.headers.common['Authorization'] = `Basic ${authorization}`;
                break;
            }
            default: {
                throw new Error('Unsupported authentification type: ' + this.settings.authenticationType);
            }
        }
        axios.defaults.validateStatus = (status: number) => status >= 200 && status < 500;
    }

    private validateSettings(settings: Settings) {
        if (!settings.validate()) {
            throw new Error('Provide api url, name and password in settings!');
        }
    }

    public get username(): string {
        return this.settings.apiUsername;
    }

    public async read(resource: string, id: string): Promise<Object> {
        const response = await this.sendRequest('GET', this.buildUrl(resource, id));

        if (response.data === null || typeof response.data !== 'object') {
            throw new Error(`Unexpected return type: ${typeof response.data}`);
        }
        return response.data;
    }

    public async readMultiple(resource: string, parameters?: QueryParameters): Promise<any[]> {
        const response = await this.sendRequest('GET', this.buildUrl(resource, undefined, undefined, parameters));

        if (response.data === null || typeof response.data !== 'object') {
            throw new Error(`Unexpected return type: ${typeof response.data}`);
        }
        if ('value' in response.data && Array.isArray(response.data['value'])) {
            return response.data['value'];
        }
        throw new Error(`Unexpected return type: ${typeof response.data['value']}`);
    }

    public async readAll(resource: string, filter?: string): Promise<Object[]> {
        const querySize = 50;
        let offset = 0;

        const result: Object[] = [];
        // eslint-disable-next-line no-constant-condition
        while (true) {
            const response = await this.readMultiple(
                resource, {
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
        const response = await this.sendRequest('POST', this.buildUrl(resource), data);

        if (response.data === null || typeof response.data !== 'object') {
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
        const response = await this.sendRequest('POST', this.buildUrl(resource, id, actionName), data);

        if (response.data === null || typeof response.data !== 'object') {
            if (typeof response.data === 'string' && response.data === '') {
                // Calling API that has no return value
                return '';
            }
            throw new Error(`Unexpected return type: ${typeof response.data}`);
        }
        if ('value' in response.data) {
            return response.data['value'];
        }
        throw new Error(`Unexpected response format:\n${response.data}`);
    }

    private async sendRequest(method: Method, url: string, data?: Object): Promise<AxiosResponse> {
        const response = await axios.request({
            url: url,
            method: method,
            headers: {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                'Content-Type': 'application/json',
            },
            data: data,
            validateStatus: (status: number) => status >= 200 && status < 500,
        });

        if (response.status >= 200 && response.status < 300) {
            return response;
        }

        if (response.data !== undefined && response.data.error !== undefined && response.data.error.message !== undefined) {
            throw new Error(response.data.error.message);
        } else if (response.status !== undefined) {
            throw new Error('Response error: Error ' + response.status + ', ' + response.statusText);
        } else {
            throw new Error('Empty response');
        }
    }

    private buildUrl(
        resource: string,
        id?: string,
        actionName?: string,
        queryParameters?: QueryParameters,
    ): string {
        let url: string = this.baseUrl;
        if (!url.endsWith('/')) {
            url += '/';
        }

        url += resource;
        if (id !== undefined) {
            url += `('${id}')`;
        }
        if (actionName !== undefined) {
            url += `/Microsoft.NAV.${actionName}`;
        }

        url += '?tenant=default';
        if (queryParameters !== undefined) {
            const parameters: string[] = [];
            if (queryParameters.top !== undefined) {
                parameters.push(`$top=${queryParameters.top}`);
            }
            if (queryParameters.skip !== undefined) {
                parameters.push(`$skip=${queryParameters.skip}`);
            }
            if (queryParameters.filter !== undefined) {
                parameters.push(`$filter=${queryParameters.filter}`);
            }

            if (parameters.length !== 0) {
                url += '&' + parameters.join('&');
            }
        }
        return url;
    }
}