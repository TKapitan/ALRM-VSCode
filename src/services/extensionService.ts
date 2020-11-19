import BcClient, { Resources } from "./bcClient";
import { readAppJson } from "./fileService";
import Extension from '../models/extension';
import AssignableRange from '../models/assignableRange';
import * as vscode from 'vscode';
import App from "../models/app";
import { ObjectType } from "../models/objectType";

export default class ExtensionService {
    private static cache: Record<string, Extension> = {};
    private client: BcClient;

    constructor(client?: BcClient) {
        this.client = client ?? new BcClient();
    }

    public async getExtension(workspace: vscode.Uri): Promise<Extension | null> {
        if (workspace.fsPath in ExtensionService.cache)
            return ExtensionService.cache[workspace.fsPath];

        let app = readAppJson(workspace);

        let extension = await this.getBcExtension(app.id);
        if (extension === null)
            return null;

        ExtensionService.cache[workspace.fsPath] = extension;
        return extension;
    }

    public async createExtension(workspace: vscode.Uri, app: App, rangeCode: string): Promise<Extension> {
        let extension = await this.createBcExtension({
            id: app.id,
            rangeCode: rangeCode,
            name: app.name.substring(0, 50),
            description: app.description.substr(0, 250),
        });
        ExtensionService.cache[workspace.fsPath] = extension;
        return extension;
    }

    public async createExtensionObject(extension: Extension, objectType: ObjectType, objectName: string): Promise<number> {
        let response = await this.client.callAction(Resources.Extension, extension.code, 'createObject', {
            objectType: objectType.toString(),
            objectName: objectName,
            createdBy: '', // TODO
        });

        let objectId = Number(response);
        if (isNaN(objectId))
            throw new Error(`Unexpected object id response: ${response}`);
        return objectId;
    }

    public async createExtensionObjectLine(extension: Extension, objectType: ObjectType, objectId: number): Promise<number> {
        let response = await this.client.callAction(Resources.Extension, extension.code, 'createObjectLine', {
            objectType: objectType.toString(),
            objectID: objectId.toString(),
        });

        let objectLineId = Number(response);
        if (isNaN(objectLineId))
            throw new Error(`Unexpected object id response: ${response}`);
        return objectLineId;
    }


    private async getBcExtension(id: string): Promise<Extension | null> {
        let extensions = await this.client.readMultiple(Resources.Extension, {
            top: 1,
            filter: `id eq ${id}`
        });

        if (extensions.length === 0)
            return null;

        return Extension.fromJson(extensions[0]);
    }

    private async createBcExtension(data: Object): Promise<Extension> {
        let extension = await this.client.create(Resources.Extension, data);

        return Extension.fromJson(extension);
    }

    public async getAllAssignableRanges(): Promise<AssignableRange[]> {
        let assignableRanges = await this.client.readAll(Resources.AssignableRange);

        return assignableRanges.map(e => AssignableRange.fromJson(e));
    }
}