import { getCurrentWorkspaceUri } from "../services/fileService";
import ExtensionService from "../services/extensionService";
import { showInformationMessage, showErrorMessage, promptInitialization } from "../helpers/userInteraction";
import { hasObjectTypeIDs, ObjectType, translateObjectType } from "../models/objectType";
import Extension from "../models/extension";
import * as vscode from 'vscode';

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

        const fs = require("fs");
        if (!fs.existsSync(workspaceFolderPath)) {
            throw new Error('AL Project does not have src directory!');
        }

        return await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: 'Synchronizing...',
            cancellable: false
        }, (progress) => {
            const scanResult = scanDirectory(workspaceFolderPath);
            return new Promise(resolve => {
                resolve();
                if (scanResult) {
                    progress.report({
                        increment: 100,
                        message: `Synchronization of ${extension?.code} successful!`,
                    });
                } else {
                    progress.report({
                        increment: 100,
                        message: `Synchronization of ${extension?.code} has finished but some errors were found.!`,
                    });
                    resolve();
                }
            });
        });
    } catch (error) {
        showErrorMessage(error);
    }
}

function scanDirectory(workspaceFolderPath: string): boolean {
    let success = true;
    const fs = require("fs");
    fs.readdir(workspaceFolderPath, function (err: string, files: string[]) {
        if (err) {
            throw err;
        }

        console.log('Scanning...');
        let counter: number;
        let scannedItemWithFullPath: string;
        let line: string;
        let objectType: string;
        let objectID: string;
        let objectName: string;
        files.forEach(function (scannedItem) {
            scannedItemWithFullPath = workspaceFolderPath + '/' + scannedItem;
            if (fs.lstatSync(scannedItemWithFullPath).isDirectory()) {
                if (!scanDirectory(scannedItemWithFullPath)) {
                    success = false;
                }
            } else {
                fs.readFile(scannedItemWithFullPath, 'utf8', function (err: string, data: string) {
                    if (err) {
                        throw err;
                    }

                    counter = 0;
                    // eslint-disable-next-line no-constant-condition
                    while (true) {
                        line = data.split('\n')[counter]; // TODO Add support for \r
                        if (line !== undefined) {
                            if (translateObjectType(line.split(' ')[0]) !== ObjectType.UnKnownObjectType) {
                                break;
                            }
                        }

                        counter++;
                        if (counter >= data.split('\n').length) { // TODO Add support for \r
                            throw new Error('File ' + scannedItemWithFullPath + ' is not valid AL file or this file is not well-formated.');
                        }
                    }

                    console.log(line);

                    objectType = line.split(' ')[0];
                    objectID = '';
                    if (hasObjectTypeIDs(objectType)) {
                        objectID = line.split(' ')[1];
                        objectName = line.split(' ')[2];
                    } else {
                        objectName = line.split(' ')[1];
                    }

                    if (objectName.charAt(0) === '"') {
                        objectName = line.split('"')[1];
                    }
                    registerALObject(
                        objectType,
                        objectID,
                        objectName
                    ).catch(
                        function (error) {
                            showErrorMessage(error);
                            success = false;
                        }
                    );
                });
            }
        });
    });
    return success;
}

async function registerALObject(type: string, id: string, name: string) {
    // TODO for table extension and enum extension register also all added fields
    const service = new ExtensionService();
    if (id === '') {
        console.log('Object type: ' + translateObjectType(type).toString() + ', object name: ' + name);
        await service.createExtensionObject(
            extension,
            translateObjectType(type),
            name
        ).catch(
            error => { throw new Error(error); }
        );
    } else {
        console.log('Object type: ' + translateObjectType(type).toString() + ', object ID: ' + id + ', object name: ' + name);
        await service.createExtensionObject(
            extension,
            translateObjectType(type),
            name,
            id
        ).catch(
            error => { throw new Error(error); }
        );
    }
}

