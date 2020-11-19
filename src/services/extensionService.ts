import { BcClient } from "./bcClient";
import { readAppJson } from "./fileService";
import { Extension } from '../models/extension';
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

        let extension = await this.client.getExtension(app.id);
        if (extension === null)
            return null;

        ExtensionService.cache[workspace.fsPath] = extension;
        return extension;
    }

    public async createExtension(workspace: vscode.Uri, id: string, data: Object): Promise<Extension> {
        let extension = await this.client.createExtension(data);
        ExtensionService.cache[workspace.fsPath] = extension;
        return extension;
    }

    public async createExtensionObject(extension: Extension, data: Object): Promise<number | null> {
        return await this.client.createExtensionObject(extension, data);
    }
}