import { getCurrentWorkspaceUri } from "../services/fileService";
import ExtensionService from "../services/extensionService";
import { showErrorMessage, promptInitialization, showInformationMessage } from "../helpers/userInteraction";
import { hasObjectTypeIDs, ObjectType, translateObjectType } from "../models/objectType";
import Extension from "../models/extension";
import * as vscode from 'vscode';
import * as fs from "fs";

let extension: Extension | null;
export default async function synchronizeCommand(): Promise<void> {
    try {
        const workspaceUri = getCurrentWorkspaceUri();
        const service = new ExtensionService();

        extension = await service.getExtension(workspaceUri);
        if (extension === null) {
            promptInitialization();
            return;
        }

        const workspaceFolderPath = workspaceUri.fsPath + '/src';
        console.log(workspaceFolderPath);

        if (!fs.existsSync(workspaceFolderPath)) {
            throw new Error('AL Project does not have src directory!');
        }

        return await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: 'Synchronizing...',
            cancellable: false
        }, async (progress) => {
            const [success, errors] = await scanDirectory(workspaceFolderPath);
            if (!success) {
                console.log(errors);
                progress.report({ increment: 100 });
                showErrorMessage(`Synchronization of ${extension?.code} has finished with errors:\n` + errors);
            }
            progress.report({ increment: 100 });
            showInformationMessage(`Synchronization of ${extension?.code} successful!`);
        });
    } catch (error) {
        showErrorMessage(error);
    }
    return;
}

async function scanDirectory(workspaceFolderPath: string): Promise<[boolean, string]> {
    let success = true;
    let errorStrings = '';
    const fs = require("fs");
    const files = fs.readdirSync(workspaceFolderPath);

    console.log('Scanning directory: ' + workspaceFolderPath);
    let scannedItemWithFullPath: string;
    let fileLines: string[], fileLine: string;
    let objectType: string, objectID: string;
    let scanForObjectFields = false;
    for (const fileOrDirName of files) {
        objectType = '';
        objectID = '';
        scanForObjectFields = false;
        scannedItemWithFullPath = workspaceFolderPath + '/' + fileOrDirName;
        if (fs.lstatSync(scannedItemWithFullPath).isDirectory()) {
            const [results, returnedErrors] = await scanDirectory(scannedItemWithFullPath);
            if (!results) {
                errorStrings += returnedErrors;
                success = false;
            }
        } else {
            const data = fs.readFileSync(scannedItemWithFullPath, 'utf8').toString();

            let inFieldsSection = false, inFieldSection = false;
            let noOfOpenBrackets = 0, counter = 0;
            fileLines = data.split('\n');
            // eslint-disable-next-line no-constant-condition
            while (true) {
                try {
                    fileLine = fileLines[counter];

                    if (!scanForObjectFields) {
                        // Scan for objects
                        [scanForObjectFields, objectType, objectID] = await tryScanObject(fileOrDirName, fileLine);
                    } else {
                        // Scan for fields or values in extension objects
                        [inFieldsSection, inFieldSection, noOfOpenBrackets] = await scanObjectFieldsValues(fileLine, objectType, objectID, inFieldsSection, inFieldSection, noOfOpenBrackets);
                    }

                    counter++;
                    if (counter > fileLines.length) {
                        if ((objectType === '' || objectID === '') || (inFieldsSection || inFieldSection || noOfOpenBrackets > 0)) {
                            throw new Error('File ' + scannedItemWithFullPath + ' is not valid AL file or this file is not well-formated.');
                        }
                        break;
                    }
                } catch (error) {
                    success = false;
                    errorStrings += '\n' + error;
                    break;
                }
            }
        }
    }
    return [success, errorStrings];
}

async function tryScanObject(
    fileName: string,
    fileLine: String,
): Promise<[boolean, string, string]> {
    let objectID = '', objectName = '';
    const objectTypeString: string = fileLine.split(' ')[0];
    const objectType: ObjectType = translateObjectType(objectTypeString);
    if (objectType !== ObjectType.UnKnownObjectType) {
        // Parse object ID & name
        if (hasObjectTypeIDs(objectType)) {
            objectID = fileLine.split(' ')[1];
            objectName = fileLine.split(' ')[2];
        } else {
            objectName = fileLine.split(' ')[1];
        }

        if (objectName.charAt(0) === '"') {
            objectName = fileLine.split('"')[1];
        }

        if (objectName === '' || (objectID === '' && hasObjectTypeIDs(objectType))) {
            throw new Error('File ' + fileName + ' is not well-formated.');
        }

        // Register object
        await registerALObject(
            objectTypeString,
            objectID,
            objectName
        );

        // If the file is not tableextension nor enumextension, do not parse the rest of file
        if (objectType !== ObjectType.TableExtension) {
            return [false, objectTypeString, objectID];
        }
        return [true, objectTypeString, objectID];
    }
    return [false, '', ''];
}

async function scanObjectFieldsValues(
    fileLine: String,
    objectType: string,
    objectID: string,
    inFieldsSection: boolean,
    inFieldSection: boolean,
    noOfOpenBrackets: number,
): Promise<[boolean, boolean, number]> {
    if (fileLine.includes('fields')) {
        inFieldsSection = true;
    }
    if (inFieldsSection) {
        if (fileLine.includes('{')) {
            noOfOpenBrackets += 1;
        }
        if (inFieldSection || (noOfOpenBrackets === 1 && fileLine.includes('field'))) {
            if (!inFieldSection && fileLine.includes('field')) {
                const fieldOrValueID = fileLine.split(';')[0];
                await registerALFieldOrValueID(
                    objectType,
                    objectID,
                    fieldOrValueID.substr(fieldOrValueID.indexOf('(') + 1)
                );
            }

            inFieldSection = true;
            if (fileLine.includes('}')) {
                inFieldSection = false;
            }
        }
        if (fileLine.includes('}')) {
            noOfOpenBrackets -= 1;
            if (!inFieldSection && noOfOpenBrackets <= 0) {
                inFieldsSection = false;
            }
        }
    }
    return [inFieldsSection, inFieldSection, noOfOpenBrackets];
}

async function registerALFieldOrValueID(objectType: string, objectId: string, fieldOrValueID: string): Promise<void> {
    const service = new ExtensionService();
    console.log(' Field ID: ' + fieldOrValueID);
    await service.createExtensionObjectLine(
        extension,
        translateObjectType(objectType),
        +objectId,
        fieldOrValueID
    );
}

async function registerALObject(type: string, id: string, name: string): Promise<void> {
    const service = new ExtensionService();
    if (id === '') {
        console.log('Object type: ' + translateObjectType(type).toString() + ', object name: ' + name);
        await service.createExtensionObject(
            extension,
            translateObjectType(type),
            name
        );
    } else {
        console.log('Object type: ' + translateObjectType(type).toString() + ', object ID: ' + id + ', object name: ' + name);
        await service.createExtensionObject(
            extension,
            translateObjectType(type),
            name,
            id
        );
    }
}

