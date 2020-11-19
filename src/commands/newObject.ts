import * as vscode from 'vscode';
import { getUserInput, getUserSelection, promptInitialization, showErrorMessage } from '../helpers/userInteraction';
import { getObjectTypeNumber, ObjectType } from '../models/objectType';
import { ExtensionService } from '../services/extensionService';
import { getCurrentWorkspaceUri, readSnippetFile } from '../services/fileService';

export async function NewObjectCommand() {
    try {
        let workspaceUri = getCurrentWorkspaceUri();
        let service = new ExtensionService();

        let extension = await service.getExtension(workspaceUri);
        if (extension === null) {
            promptInitialization();
            return;
        }

        let objectType = await promptObjectSelection();
        if (objectType === undefined)
            return; // canceled

        let snippetFileContent = readSnippetFile(objectType);

        // XXX add max 30 char validation to input
        let objectName = await getUserInput(`Enter ${ObjectType[objectType]} name`);
        if (objectName === undefined)
            return; // canceled

        let newObjectId = await service.createExtensionObject(extension, {
            objectType: getObjectTypeNumber(objectType).toString(),
            objectName: objectName,
            createdBy: '',
        });
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
    let items: string[] = [];

    for (const value of Object.values(ObjectType)) {
        if (typeof value === 'string')
            items.push(value);
    }
    let selection = await getUserSelection(items);
    if (selection === undefined)
        return undefined;

    return ObjectType[selection as keyof typeof ObjectType];
}

async function createObjectFile(
    snippetFileContent: Buffer,
    objectType: ObjectType,
    objectName: string,
    objectId: number,
) {
    let textDocument = await vscode.workspace.openTextDocument({
        language: 'al',
    });

    let snippet = buildObjectSnippet(snippetFileContent, objectType, objectName, objectId);

    let textEditor = await vscode.window.showTextDocument(textDocument);
    textEditor.insertSnippet(snippet);
}

function buildObjectSnippet(
    snippetFileContent: Buffer,
    objectType: ObjectType,
    objectName: string,
    objectId: number,
): vscode.SnippetString {
    let snippetObject = JSON.parse(snippetFileContent.toString());
    if (typeof snippetObject !== 'object')
        throw new Error('Incorrect snippet file format!');

    if (Object.keys(snippetObject).length === 0)
        throw new Error('Incorrect snippet file format!');

    snippetObject = snippetObject[Object.keys(snippetObject)[0]];
    if (!('body' in snippetObject) || !Array.isArray(snippetObject['body']))
        throw new Error('Incorrect snippet file format!');

    let snippetLines = snippetObject['body'];

    snippetLines[0] = substituteObjectInfo(snippetLines[0], objectType, objectName, objectId.toString());
    let snippetString = new vscode.SnippetString(snippetLines.join('\n'));

    return snippetString;

}

function substituteObjectInfo(
    snippetHeader: string,
    objectType: ObjectType,
    objectName: string,
    objectId: string,
): string {
    switch (objectType) {
        case ObjectType.Codeunit:
            return snippetHeader
                .replace('${1:Id}', objectId)
                .replace('${2:MyCodeunit}', `"${objectName}"`);
        case ObjectType.Enum:
            return snippetHeader
                .replace('${1:id}', objectId)
                .replace('${2:MyEnum}', `"${objectName}"`);
        // XXX default enum extension snippet contains value snippet
        case ObjectType.EnumExtension:
            return snippetHeader
                .replace('${1:Id}', objectId)
                .replace('${2:MyEnumExtension}', `"${objectName}"`);
        case ObjectType.Page:
            return snippetHeader
                .replace('${1:Id}', objectId)
                .replace('${2:MyPage}', `"${objectName}"`);
        case ObjectType.PageExtension:
            return snippetHeader
                .replace('${1:Id}', objectId)
                .replace('${2:MyExtension}', `"${objectName}"`);
        case ObjectType.Query:
            return snippetHeader
                .replace('${1:Id}', objectId)
                .replace('${2:MyQuery}', `"${objectName}"`);
        case ObjectType.Report:
            return snippetHeader
                .replace('${1:Id}', objectId)
                .replace('${2:MyReport}', `"${objectName}"`);
        case ObjectType.Table:
            return snippetHeader
                .replace('${1:id}', objectId)
                .replace('${2:MyTable}', `"${objectName}"`);
        case ObjectType.TableExtension:
            return snippetHeader
                .replace('${1:Id}', objectId)
                .replace('${2:MyExtension}', `"${objectName}"`);
        case ObjectType.XMLPort:
            return snippetHeader
                .replace('${1:Id}', objectId)
                .replace('${2:MyXmlport}', `"${objectName}"`);
    }
}
