import * as vscode from 'vscode';
import { promptInitialization, showErrorMessage } from "../helpers/userInteraction";
import { ObjectType } from "../models/objectType";
import { ExtensionService } from "../services/extensionService";
import { getCurrentWorkspaceUri, readCurrentFile } from "../services/fileService";

interface FileInfo {
    objectType: ObjectType,
    objectId: number,
    objectStartIndex: number,
}

export async function NewObjectLineCommand() {
    let workspaceUri = getCurrentWorkspaceUri();

    let currentFileContent = readCurrentFile(); // XXX check if current file in workspaceUri
    if (!currentFileContent) {
        showErrorMessage('No file open!');
        return;
    }

    let fileInfo = checkFileType(currentFileContent);

    let service = new ExtensionService();
    let extension = await service.getExtension(workspaceUri);
    if (extension === null) {
        promptInitialization();
        return;
    }

    let newLineId = await service.createExtensionObjectLine(extension, {
        objectType: fileInfo.objectType.toString(),
        objectID: fileInfo.objectId,
    });

    await insertNewLine(fileInfo.objectType, newLineId);
}

function checkFileType(fileContent: string): FileInfo {
    let re = /(tableextension|enumextension) (\d+) ".*" extends/gm;
    let match = re.exec(fileContent);
    if (!match || match.length != 3)
        throw new Error('Unsupported file type!');

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

    let objectId = Number(match[2]);
    if (isNaN(objectId))
        throw new Error('Unsupported file type!');

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
        '; ${2:MyField}; ${3|Blob,BigInteger,Boolean,Code[50],Date,DateFormula,Decimal,Duration,Integer,Guid,Media,MediaSet,Option,RecordID,TableFilter,Text[50],Time|})\n' +
        '{\n' +
        '\tCaption = \'${2:MyField}\';' +
        '\tDataClassification = ${4|ToBeClassified,CustomerContent,EndUserIdentifiableInformation,AccountData,EndUserPseudonymousIdentifiers,OrganizationIdentifiableInformation,SystemMetadata|};\n' +
        '}\n'
    );
}

function buildEnumValueSnippet(valueId: number): vscode.SnippetString {
    return new vscode.SnippetString(
        `value(${valueId}\n` +
        '; ${0: MyValue})\n' +
        '{\n' +
        '}'
    );
}
