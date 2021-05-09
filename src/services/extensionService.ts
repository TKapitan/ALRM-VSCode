import { readAppJson } from "./fileService";
import Extension from '../models/extension';
import * as vscode from 'vscode';
import App from "../models/app";
import { ObjectType } from "../models/objectType";
import { IIntegrationApi } from "./api/IIntegrationApi";
import Settings from "./settings";
import CreateBCExtensionRequest from "./api/requests/createBcExtensionRequest";
import CreateBCExtensionObjectRequest from "./api/requests/createBcExtensionObjectRequest";
import CreateBCExtensionObjectLineRequest from "./api/requests/createBcExtensionObjectLineRequest";
import AssignableRange from "../models/assignableRange";

export default class ExtensionService {
    private static cache: Record<string, Extension> = {};
    private iIntegrationApi: IIntegrationApi;

    constructor() {
            this.iIntegrationApi = Settings.instance.integrationApi;
    }

    public async getExtension(workspace: vscode.Uri): Promise<Extension | null> {
        if (workspace.fsPath in ExtensionService.cache) {
            return ExtensionService.cache[workspace.fsPath];
        }
        const app = readAppJson(workspace);

        const extension = await this.iIntegrationApi.getBcExtension(app.id);
        if (extension === null) {
            return null;
        }
        ExtensionService.cache[workspace.fsPath] = extension;
        return extension;
    }

    public async createExtension(workspace: vscode.Uri, app: App, rangeCode?: string): Promise<Extension> {
        const createBCExtensionRequest = new CreateBCExtensionRequest(
            app.id,
            rangeCode ?? '',
            app.name.substring(0, 50),
            app.description.substr(0, 250)
        );
        const extension = await this.iIntegrationApi.createBcExtension(createBCExtensionRequest);
        ExtensionService.cache[workspace.fsPath] = extension;
        return extension;
    }

    public async createExtensionObject(createBCExtensionObjectRequest: CreateBCExtensionObjectRequest): Promise<number> {
        return await this.iIntegrationApi.createBcExtensionObject(createBCExtensionObjectRequest);
    }

    public async createExtensionObjectLine(extension: Extension | null, objectType: ObjectType, objectId: number, existingFieldOrValueId = 0): Promise<number | null> {
        if (extension === null) {
            throw new Error('Can not create extension object line for unknown extension.');
        }
        const createBCExtensionObjectLineRequest = new CreateBCExtensionObjectLineRequest(
            extension,
            objectType.toString(),
            objectId,
            existingFieldOrValueId,
        );
        return await this.iIntegrationApi.createBcExtensionObjectLine(createBCExtensionObjectLineRequest);
    }

    public async getAllAssignableRanges(): Promise<AssignableRange[]> {
        return await this.iIntegrationApi.getAllAssignableRanges();
    }
}