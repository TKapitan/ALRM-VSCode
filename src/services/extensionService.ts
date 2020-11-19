import { BcClient, Resources } from "./bcClient";
import { readAppJson } from "./fileService";
import { Extension } from '../models/extension';
import { AssignableRange } from '../models/assignableRange';
import * as vscode from 'vscode';

export class ExtensionService {
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

    public async createExtension(workspace: vscode.Uri, id: string, data: Object): Promise<Extension> {
        let extension = await this.createBcExtension(data);
        ExtensionService.cache[workspace.fsPath] = extension;
        return extension;
    }

    public async createExtensionObject(extension: Extension, data: Object): Promise<number> {
        let response = await this.client.callAction(Resources.Extension, extension.code, 'createObject', data);

        let objectId = Number(response);
        if (isNaN(objectId))
            throw new Error(`Unexpected object id response: ${response}`);
        return objectId;
    }

    public async createExtensionObjectLine(extension: Extension, data: Object): Promise<number> {
        let response = await this.client.callAction(Resources.Extension, extension.code, 'createObjectLine', data);

        let objectId = Number(response);
        if (isNaN(objectId))
            throw new Error(`Unexpected object id response: ${response}`);
        return objectId;
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