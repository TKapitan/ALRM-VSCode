import * as vscode from 'vscode';
import { getUserInput, getUserSelection, promptInitialization, showErrorMessage } from '../helpers/userInteraction';
import { ObjectType, originalObjects, runtime04Objects, runtime05Objects, runtime06Objects, runtime07Objects, substituteObjectInfo } from '../models/objectType';
import ExtensionService from '../services/extensionService';
import { getCurrentWorkspaceUri, readAppJson, readSnippetFile } from '../services/fileService';

export default async function newObjectCommand(): Promise<void> {
    try {
        const workspaceUri = getCurrentWorkspaceUri();
        const service = new ExtensionService();

        const extension = await service.getExtension(workspaceUri);
        if (extension === null) {
            promptInitialization();
            return;
        }

        const objectType = await promptObjectSelection();
        if (objectType === undefined) {
            return; // canceled
        }

        const snippetFileContent = readSnippetFile(objectType);

        let objectName;
        // eslint-disable-next-line no-constant-condition
        while (true) {
            objectName = await getUserInput(`Enter ${ObjectType[objectType]} name`);
            if (objectName === undefined) {
                return; // canceled
            }
            if (objectName?.length <= 30) {
                break;
            }
            showErrorMessage('Maximal lenght of AL Object name has to be 30 chars.');
        }

        const newObjectId = await service.createExtensionObject(extension, objectType, objectName);
        if (newObjectId === null) {
            showErrorMessage('New object could not be created!');
            return;
        }

        await createObjectFile(snippetFileContent, objectType, objectName, newObjectId);
    } catch (error) {
        showErrorMessage(error);
    }
}

async function promptObjectSelection(): Promise<ObjectType | undefined> {
    const items: string[] = [];

    const workspaceUri = getCurrentWorkspaceUri();
    const app = readAppJson(workspaceUri);
    let objectTypesArray = originalObjects;
    if (app.runtime >= '4.0') {
        objectTypesArray = objectTypesArray.concat(runtime04Objects);
    }
    if (app.runtime >= '5.0') {
        objectTypesArray = objectTypesArray.concat(runtime05Objects);
    }
    if (app.runtime >= '6.0') {
        objectTypesArray = objectTypesArray.concat(runtime06Objects);
    }
    if (app.runtime >= '7.0') {
        objectTypesArray = objectTypesArray.concat(runtime07Objects);
    }
    for (const objectTypeID of objectTypesArray) {
        items.push(ObjectType[objectTypeID]);
    }
    const selection = await getUserSelection(items);
    if (selection === undefined) {
        return undefined;
    }

    return ObjectType[selection as keyof typeof ObjectType];
}

async function createObjectFile(
    snippetFileContent: Buffer,
    objectType: ObjectType,
    objectName: string,
    objectId: number,
) {
    const textDocument = await vscode.workspace.openTextDocument({
        language: 'al',
    });

    const snippet = buildObjectSnippet(snippetFileContent, objectType, objectName, objectId);

    const textEditor = await vscode.window.showTextDocument(textDocument);
    textEditor.insertSnippet(snippet);
}

function buildObjectSnippet(
    snippetFileContent: Buffer,
    objectType: ObjectType,
    objectName: string,
    objectId: number,
): vscode.SnippetString {
    let snippetObject = JSON.parse(snippetFileContent.toString());
    if (typeof snippetObject !== 'object') {
        throw new Error('Incorrect snippet file format!');
    }

    if (Object.keys(snippetObject).length === 0) {
        throw new Error('Incorrect snippet file format!');
    }

    snippetObject = snippetObject[Object.keys(snippetObject)[0]];
    if (!('body' in snippetObject) || !Array.isArray(snippetObject['body'])) {
        throw new Error('Incorrect snippet file format!');
    }

    const snippetLines = snippetObject['body'];

    snippetLines[0] = substituteObjectInfo(snippetLines[0], objectType, objectName, objectId.toString());
    const snippetString = new vscode.SnippetString(snippetLines.join('\n'));

    return snippetString;
}
