import { readAppJson, getCurrentWorkspaceUri } from "../services/fileService";
import ExtensionService from "../services/extensionService";
import { showInformationMessage, showErrorMessage, getUserSelection } from "../helpers/userInteraction";

export default async function initiliazeCommand() : Promise<void>{
    try {
        const workspaceUri = getCurrentWorkspaceUri();
        const app = readAppJson(workspaceUri);
        if (app === null || app.id === ''){
            throw new Error('Valid app.json not found!');
        }
        const service = new ExtensionService();
        let extension = await service.getExtension(workspaceUri);
        if (extension !== null) {
            showInformationMessage(`Existing extension ${extension.code} found!`);
            // XXX at this point we could ask the user if they want to synchronize?
            return;
        }

        // XXX add range min/max to API
        const assignableRanges = await service.getAllAssignableRanges();
        // XXX then edit app.json ranges

        const range = await getUserSelection(assignableRanges.map(e => e.code));
        if (range === undefined){
            return; // canceled
        }

        extension = await service.createExtension(workspaceUri, app, range);

        showInformationMessage(`Successfully initialized extension ${extension.code}!`);
    } catch (error) {
        showErrorMessage(error);
    }
}
