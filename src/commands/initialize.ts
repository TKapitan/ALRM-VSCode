import { QuickPickItem } from "vscode";

import {
  getUserSelection,
  showErrorMessage,
  showInformationMessage
} from "../helpers/userInteraction";
import ExtensionService from "../services/extensionService";
import { getCurrentWorkspaceUri, readAppJson } from "../services/fileService";

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

    // XXX add range min/max to API
    const assignableRanges = await service.getAllAssignableRanges();
    // XXX then edit app.json ranges

    if (assignableRanges.length === 0) {
      throw new Error(
        "No Assignable Ranges found. Please define at least one assignable range in the Business Central.",
      );
    }

    const assignableRangesPickItems: QuickPickItem[] = [];
    assignableRanges.forEach((assignableRange) => {
      let description = assignableRange.description;
      if (
        assignableRange.defaultObjectRangeFrom !== 0 &&
        assignableRange.defaultObjectRangeTo !== 0
      ) {
        if (description !== "") {
          description += ", ";
        }
        description +=
          "default object range from: " +
          assignableRange.defaultObjectRangeFrom +
          " to " +
          assignableRange.defaultObjectRangeTo;
      }

      assignableRangesPickItems.push({
        label: assignableRange.code,
        description: assignableRange.isDefault ? "(default)" : "",
        detail: description,
        picked: assignableRange.isDefault,
      });
    });
    assignableRangesPickItems.sort((a, b) =>
      a.picked === b.picked ? 0 : a.picked ? -1 : 1,
    );
    const selectedQuickPickItem = await getUserSelection(
      assignableRangesPickItems,
    );
    if (selectedQuickPickItem?.label === undefined) {
      return; // canceled
    }
    extension = await service.createExtension(
      workspaceUri,
      app,
      selectedQuickPickItem?.label,
    );

    showInformationMessage(
      `Successfully initialized extension ${extension.code}!`,
    );
  } catch (error) {
    showErrorMessage(error);
  }
}
