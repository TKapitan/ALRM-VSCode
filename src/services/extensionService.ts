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
        if (workspace.fsPath in ExtensionService.cache){
            return ExtensionService.cache[workspace.fsPath];
        }
        const app = readAppJson(workspace);

        const extension = await this.getBcExtension(app.id);
        if (extension === null){
            return null;
        }
        ExtensionService.cache[workspace.fsPath] = extension;
        return extension;
    }

    public async createExtension(workspace: vscode.Uri, app: App, rangeCode: string): Promise<Extension> {
        const extension = await this.createBcExtension({
            id: app.id,
            rangeCode: rangeCode,
            name: app.name.substring(0, 50),
            description: app.description.substr(0, 250),
        });
        ExtensionService.cache[workspace.fsPath] = extension;
        return extension;
    }

    public async createExtensionObject(extension: Extension, objectType: ObjectType, objectName: string): Promise<number> {
        const response = await this.client.callAction(Resources.extension, extension.code, 'createObject', {
            objectType: objectType.toString(),
            objectName: objectName,
            createdBy: this.client.username?.substr(0, 50) ?? '',
        });

        const objectId = Number(response);
        if (isNaN(objectId)){
            throw new Error(`Unexpected object id response: ${response}`);
        }
        return objectId;
    }

    public async createExtensionObjectLine(extension: Extension, objectType: ObjectType, objectId: number): Promise<number> {
        const response = await this.client.callAction(Resources.extension, extension.code, 'createObjectLine', {
            objectType: objectType.toString(),
            objectID: objectId.toString(),
        });

        const objectLineId = Number(response);
        if (isNaN(objectLineId)){
            throw new Error(`Unexpected object id response: ${response}`);
        }
        return objectLineId;
    }

    private async getBcExtension(id: string): Promise<Extension | null> {
        const extensions = await this.client.readMultiple(Resources.extension, {
            top: 1,
            filter: `id eq ${id}`
        });

        if (extensions.length === 0){
            return null;
        }

        return Extension.fromJson(extensions[0]);
    }

    private async createBcExtension(data: Object): Promise<Extension> {
        const extension = await this.client.create(Resources.extension, data);

        return Extension.fromJson(extension);
    }

    public async getAllAssignableRanges(): Promise<AssignableRange[]> {
        const assignableRanges = await this.client.readAll(Resources.assignableRange);

        return assignableRanges.map(e => AssignableRange.fromJson(e));
    }
}