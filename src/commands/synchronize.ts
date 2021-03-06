import { getCurrentWorkspaceUri } from "../services/fileService";
import ExtensionService from "../services/extensionService";
import { showErrorMessage, promptInitialization, showInformationMessage } from "../helpers/userInteraction";
import { extendsAnotherObject, hasObjectTypeIDs, ObjectType, shouldBeObjectTypeIgnored, translateObjectType } from "../models/objectType";
import Extension from "../models/extension";
import * as vscode from 'vscode';
import * as fs from "fs";
import CreateBCExtensionObjectRequest from "../services/api/requests/createBcExtensionObjectRequest";

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
            progress.report({ increment: 100 });
            if (!success) {
                console.log(errors);
                showErrorMessage(`Synchronization of ${extension?.code} has finished with errors:\n` + errors);
            } else {
                showInformationMessage(`Synchronization of ${extension?.code} successful!`);
            }
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
    let scanForObject;
    let scanForObjectFields: boolean, scanForObjectValues: boolean, ignoredObjectType: boolean;
    for (const fileOrDirName of files) {
        objectType = '';
        objectID = '';
        scanForObject = true;
        ignoredObjectType = false;
        scanForObjectValues = false;
        scanForObjectFields = false;
        scannedItemWithFullPath = workspaceFolderPath + '/' + fileOrDirName;
        if (fs.lstatSync(scannedItemWithFullPath).isDirectory()) {
            const [results, returnedErrors] = await scanDirectory(scannedItemWithFullPath);
            if (!results) {
                errorStrings += returnedErrors;
                success = false;
            }
        } else {
            const extPosition = scannedItemWithFullPath.lastIndexOf('.');
            if (extPosition >= 0 && scannedItemWithFullPath.substr(extPosition) === '.al') {
                const data = fs.readFileSync(scannedItemWithFullPath, 'utf8').toString();

                let inFieldsSection = false, inFieldOrValueSection = false;
                let noOfOpenBrackets = 0, counter = 0;
                fileLines = data.split('\n');
                // eslint-disable-next-line no-constant-condition
                while (true) {
                    try {
                        fileLine = fileLines[counter];

                        if (scanForObject) {
                            // Scan for objects
                            if (scanForObject) {
                                [objectType, objectID, ignoredObjectType] = await tryScanObject(fileOrDirName, fileLine);
                                if (ignoredObjectType) {
                                    break;
                                }

                                if ((objectType !== '' && (!hasObjectTypeIDs(translateObjectType(objectType)) || objectID !== ''))) {
                                    scanForObject = false;

                                    // If the file is not tableextension nor enumextension, do not parse the rest of file
                                    switch (translateObjectType(objectType)) {
                                        case ObjectType.TableExtension:
                                            scanForObjectFields = true;
                                            break;
                                        case ObjectType.EnumExtension:
                                            scanForObjectValues = true;
                                            break;
                                    }
                                    if (!scanForObjectFields && !scanForObjectValues) {
                                        break;
                                    }
                                }
                            }
                        } else if (scanForObjectFields) {
                            // Scan for fields of table extension
                            [inFieldsSection, inFieldOrValueSection, noOfOpenBrackets] = await scanObjectFields(fileLine, objectType, objectID, inFieldsSection, inFieldOrValueSection, noOfOpenBrackets);
                        } else if (scanForObjectValues) {
                            // Scan for values of enum extension
                            [inFieldOrValueSection, noOfOpenBrackets] = await scanObjectValues(fileLine, objectType, objectID, inFieldOrValueSection, noOfOpenBrackets);
                        }

                        counter++;
                        if (counter >= fileLines.length) {
                            if (scanForObject) {
                                throw new Error('Could not determine file type, name or ID in file ' + scannedItemWithFullPath);
                            }
                            if (scanForObjectFields && (inFieldsSection || inFieldOrValueSection || noOfOpenBrackets > 0)) {
                                throw new Error('File ' + scannedItemWithFullPath + ' is not valid AL file or this file is not well-formated.');
                            }
                            if (scanForObjectValues && (inFieldOrValueSection || noOfOpenBrackets > 0)) {
                                throw new Error('File ' + scannedItemWithFullPath + ' is not valid AL file or this file is not well-formated.');
                            }
                            break;
                        }
                    } catch (error) {
                        success = false;
                        errorStrings += ';\n' + error;
                        break;
                    }
                }
            }
        }
    }
    return [success, errorStrings];
}

async function tryScanObject(
    fileName: string,
    fileLine: String,
): Promise<[string, string, boolean]> {
    let objectID = '', objectName = '', extendsObjectName = '', tempString = '';
    const fileLineBySpace: string[] = fileLine.split(' ');
    const fileLineByQuotationMark: string[] = fileLine.split('"');
    const objectTypeString: string = fileLineBySpace[0];
    const objectType: ObjectType = translateObjectType(objectTypeString);
    if (objectType !== ObjectType.UnKnownObjectType) {
        if (shouldBeObjectTypeIgnored(objectType)) {
            return ['', '', true];
        }
        // Parse object ID & name
        if (hasObjectTypeIDs(objectType)) {
            objectID = fileLineBySpace[1];
            objectName = fileLineBySpace[2];
        } else {
            objectName = fileLineBySpace[1];
        }

        // Object name could have spaces in name, than it is marked with "
        const extendsObject = extendsAnotherObject(objectType);
        if (objectName.charAt(0) === '"') {
            objectName = fileLineByQuotationMark[1];
            if (extendsObject) {
                for (let counter = 2; counter < fileLineByQuotationMark.length; counter++) {
                    tempString += fileLineByQuotationMark[counter];
                    if (fileLineByQuotationMark.length - 1 !== 2) {
                        tempString += '"';
                    }
                }
                tempString = tempString.trim();
                extendsObjectName = tempString.split(' ')[1];
            }
        } else if (extendsObject) {
            for (let counter = 4; counter < fileLineBySpace.length; counter++) {
                tempString += fileLineBySpace[counter];
            }
            tempString = tempString.trim();
            extendsObjectName = fileLineBySpace[4];
        }
        if (extendsObject) {
            // Extended object name could have spaces in name, than it is marked with "
            if (extendsObjectName.charAt(0) === '"') {
                extendsObjectName = tempString.split('"')[1];
            }
        }

        if (objectName === '' || (objectID === '' && hasObjectTypeIDs(objectType)) || (extendsObjectName === '' && extendsObject)) {
            throw new Error('File ' + fileName + ' is not well-formated.');
        }

        // Register object
        const service = new ExtensionService();
        if (extension === null) {
            throw new Error('Can not create extension object for unknown extension.');
        }
        const createBCExtensionObjectRequest = new CreateBCExtensionObjectRequest(
            extension,
            translateObjectType(objectTypeString).toString(),
            +objectID,
            objectName,
            extendsObjectName,
        );
        console.log('Registering Object type: ' + createBCExtensionObjectRequest.objectType + ', object ID: ' + createBCExtensionObjectRequest.objectID + ', object name: ' + createBCExtensionObjectRequest.objectName);
        await service.createExtensionObject(createBCExtensionObjectRequest);
        return [objectTypeString, objectID, false];
    }
    return ['', '', false];
}

async function scanObjectFields(
    fileLine: String,
    objectType: string,
    objectID: string,
    inFieldsSection: boolean,
    inFieldSection: boolean,
    noOfOpenBrackets: number,
): Promise<[boolean, boolean, number]> {
    if (fileLine.toLowerCase().trimStart().startsWith('fields')) {
        inFieldsSection = true;
    }
    if (inFieldsSection) {
        if (fileLine.trimStart().startsWith('{')) {
            noOfOpenBrackets += 1;
        }
        if (inFieldSection || (noOfOpenBrackets === 1 && fileLine.toLowerCase().trimStart().startsWith('field'))) {
            if (!inFieldSection && fileLine.toLowerCase().trimStart().startsWith('field')) {
                const fieldID = fileLine.split(';')[0];
                await registerALFieldOrValueID(
                    objectType,
                    objectID,
                    fieldID.substr(fieldID.indexOf('(') + 1)
                );
            }

            inFieldSection = true;
            if (fileLine.trimStart().startsWith('}')) {
                inFieldSection = false;
            }
        }
        if (fileLine.trimStart().startsWith('}')) {
            noOfOpenBrackets -= 1;
            if (!inFieldSection && noOfOpenBrackets <= 0) {
                inFieldsSection = false;
            }
        }
    }
    return [inFieldsSection, inFieldSection, noOfOpenBrackets];
}

async function scanObjectValues(
    fileLine: String,
    objectType: string,
    objectID: string,
    inValueSection: boolean,
    noOfOpenBrackets: number,
): Promise<[boolean, number]> {
    if (fileLine.trimStart().startsWith('{')) {
        noOfOpenBrackets += 1;
    }
    if (inValueSection || (noOfOpenBrackets === 1 && fileLine.toLowerCase().trimStart().startsWith('value'))) {
        if (!inValueSection && fileLine.toLowerCase().trimStart().startsWith('value')) {
            const valueID = fileLine.split(';')[0];
            await registerALFieldOrValueID(
                objectType,
                objectID,
                valueID.substr(valueID.indexOf('(') + 1)
            );
        }

        inValueSection = true;
        if (fileLine.trimStart().startsWith('}')) {
            inValueSection = false;
        }
    }
    if (fileLine.trimStart().startsWith('}')) {
        noOfOpenBrackets -= 1;
    }
    return [inValueSection, noOfOpenBrackets];
}

async function registerALFieldOrValueID(objectType: string, objectId: string, fieldOrValueID: string): Promise<void> {
    const service = new ExtensionService();
    console.log(' Field ID: ' + fieldOrValueID);
    await service.createExtensionObjectLine(
        extension,
        translateObjectType(objectType),
        +objectId,
        +fieldOrValueID
    );
}
