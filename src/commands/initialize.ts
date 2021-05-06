import { readAppJson, getCurrentWorkspaceUri } from "../services/fileService";
import ExtensionService from "../services/extensionService";
import { showInformationMessage, showErrorMessage, getUserSelection } from "../helpers/userInteraction";
import Settings from "../services/settings";
import { QuickPickItem } from 'vscode';


export default async function initiliazeCommand(): Promise<void> {
    try {
        const workspaceUri = getCurrentWorkspaceUri();
        const app = readAppJson(workspaceUri);
        const service = new ExtensionService();
        let extension = await service.getExtension(workspaceUri);
        if (extension !== null) {
            showInformationMessage(`Existing extension ${extension.code} found!`);
            // XXX at this point we could ask the user if they want to synchronize?
            return;
        }

        if (Settings.instance.useAssignableRange) {
            // XXX add range min/max to API
            const assignableRanges = await service.getAllAssignableRanges();
            // XXX then edit app.json ranges

            const assignableRangesPickItems: QuickPickItem[] = [];
            assignableRanges.forEach(assignableRange => {
                let description = assignableRange.description;
                if (assignableRange.defaultObjectRangeFrom !== 0 && assignableRange.defaultObjectRangeTo !== 0) {
                    if(description !== ''){
                        description += ', ';
                    }
                    description += 'default object range from: ' + assignableRange.defaultObjectRangeFrom + ' to ' + assignableRange.defaultObjectRangeTo;
                }

                assignableRangesPickItems.push({
                    'label': assignableRange.code,
                    'description': ((assignableRange.isDefault) ? '(default)' : ''),
                    'detail': description,
                    'picked': assignableRange.isDefault,
                });
            });
            assignableRangesPickItems.sort((a, b) => (a.picked === b.picked) ? 0 : ((a.picked) ? -1 : 1));
            const selectedQuickPickItem = await getUserSelection(assignableRangesPickItems);
            if (selectedQuickPickItem?.label === undefined) {
                return; // canceled
            }
            extension = await service.createExtension(workspaceUri, app, selectedQuickPickItem?.label);
        } else {
            extension = await service.createExtension(workspaceUri, app);
        }

        showInformationMessage(`Successfully initialized extension ${extension.code}!`);
    } catch (error) {
        showErrorMessage(error);
    }
}
