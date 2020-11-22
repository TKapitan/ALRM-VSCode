import * as vscode from 'vscode';
import { promptInitialization, showErrorMessage } from "../helpers/userInteraction";
import { ObjectType } from "../models/objectType";
import ExtensionService from "../services/extensionService";
import { getCurrentWorkspaceUri, readCurrentFile } from "../services/fileService";

interface FileInfo {
    objectType: ObjectType,
    objectId: number,
    objectStartIndex: number,
}

export default async function newObjectLineCommand(): Promise<void> {
    try {
        const workspaceUri = getCurrentWorkspaceUri();

        const currentFileContent = readCurrentFile(); // XXX check if current file in workspaceUri
        if (!currentFileContent) {
            showErrorMessage('No file open!');
            return;
        }

        const fileInfo = checkFileType(currentFileContent);

        const service = new ExtensionService();
        const extension = await service.getExtension(workspaceUri);
        if (extension === null) {
            promptInitialization();
            return;
        }

        const newLineId = await service.createExtensionObjectLine(extension, fileInfo.objectType, fileInfo.objectId);
        await insertNewLine(fileInfo.objectType, newLineId);
    } catch (error) {
        showErrorMessage(error);
    }
}

function checkFileType(fileContent: string): FileInfo {
    const re = /(tableextension|enumextension) (\d+) ".*" extends/gm;
    const match = re.exec(fileContent);
    if (!match || match.length !== 3){
        throw new Error('Unsupported file type!');
    }

    let objectType: ObjectType;
    switch (match[1]) {
        case 'tableextension':
            objectType = ObjectType.TableExtension;
            break;
        case 'enumextension':
            objectType = ObjectType.EnumExtension;
            break;
        default:
            throw new Error('Unsupported file type!');
    }

    const objectId = Number(match[2]);
    if (isNaN(objectId)){
        throw new Error('Unsupported file type!');
    }
    return {
        objectType: objectType,
        objectId: objectId,
        objectStartIndex: match.index,
    };
}

async function insertNewLine(
    objectType: ObjectType,
    lineId: number,
) {
    let snippet: vscode.SnippetString;
    switch (objectType) {
        case ObjectType.TableExtension:
            snippet = buildTableFieldSnippet(lineId);
            break;
        case ObjectType.EnumExtension:
            snippet = buildEnumValueSnippet(lineId);
            break;
        default:
            return;
    }
    await vscode.window.activeTextEditor?.insertSnippet(snippet);
}

function buildTableFieldSnippet(fieldId: number): vscode.SnippetString {
    return new vscode.SnippetString(
        `field(${fieldId}` +
        '; "${2:MyField}"; ${3|Blob,BigInteger,Boolean,Code[50],Date,DateFormula,Decimal,Duration,Integer,Guid,Media,MediaSet,Option,RecordID,TableFilter,Text[50],Time|})\n' +
        '{\n' +
        '\tCaption = \'${2:MyField}\';\n' +
        '\tDataClassification = ${4|ToBeClassified,CustomerContent,EndUserIdentifiableInformation,AccountData,EndUserPseudonymousIdentifiers,OrganizationIdentifiableInformation,SystemMetadata|};\n' +
        '}\n'
    );
}

function buildEnumValueSnippet(valueId: number): vscode.SnippetString {
    return new vscode.SnippetString(
        `value(${valueId}` +
        '; ${0: MyValue})\n' +
        '{\n' +
        '}'
    );
}
