import { readAppJson, getCurrentWorkspaceUri } from "../services/fileService";
import ExtensionService from "../services/extensionService";
import { showInformationMessage, showErrorMessage, getUserSelection } from "../helpers/userInteraction";
import Settings from "../services/settings";
import { hasObjectTypeIDs, ObjectType, translateObjectType } from "../models/objectType";
import Extension from "../models/extension";

let extension: Extension | null;
export default async function initiliazeFromExistingCommand(): Promise<void> {
    try {
        const workspaceUri = getCurrentWorkspaceUri();
        const app = readAppJson(workspaceUri);
        if (app === null || app.id === '') {
            throw new Error('Valid app.json not found!');
        }

        const service = new ExtensionService();
        extension = await service.getExtension(workspaceUri);
        if (extension !== null) {
            showInformationMessage(`Existing extension ${extension.code} found!`);
            // XXX at this point we could ask the user if they want to synchronize?
            return;
        }

        if (Settings.instance.useAssignableRange) {
            // XXX add range min/max to API
            const assignableRanges = await service.getAllAssignableRanges();
            // XXX then edit app.json ranges

            const range = await getUserSelection(assignableRanges.map(e => e.code));
            if (range === undefined) {
                return; // canceled
            }
            extension = await service.createExtension(workspaceUri, app, range);
        } else {
            extension = await service.createExtension(workspaceUri, app);
        }

        const workspaceFolderPath = workspaceUri.fsPath + '/src';
        console.log(workspaceFolderPath);

        const fs = require("fs");
        if (!fs.existsSync(workspaceFolderPath)) {
            throw new Error('AL Project does not have src directory!');
        }
        scanDirectory(workspaceFolderPath);

        showInformationMessage(`Successfully initialized extension ${extension.code}!`);

    } catch (error) {
        showErrorMessage(error);
    }
}

function scanDirectory(workspaceFolderPath: string) {
    // TODO Create similar command for rescan of existing project
    const fs = require("fs");
    fs.readdir(workspaceFolderPath, function (err: string, files: string[]) {
        if (err) {
            return console.log('Unable to scan directory: ' + err);
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
                scanDirectory(scannedItemWithFullPath);
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
                            throw new Error('File ' + scannedItemWithFullPath + ' is not valid AL file.');
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
                    registerALObject(objectType, objectID, objectName);
                });
            }
        });
    });
}

async function registerALObject(type: string, id: string, name: string) {
    // TODO for table extension and enum extension register also all added fields
    const service = new ExtensionService();
    if (id === '') {
        console.log('Object type: ' + translateObjectType(type).toString() + ', object name: ' + name);
        await service.createExtensionObject(extension, translateObjectType(type), name);
    } else {
        console.log('Object type: ' + translateObjectType(type).toString() + ', object ID: ' + id + ', object name: ' + name);
        await service.createExtensionObject(extension, translateObjectType(type), name, id);
    }
}

