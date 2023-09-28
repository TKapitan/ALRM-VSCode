import AssignableRange from "../../models/assignableRange";
import Extension from "../../models/extension";
import ExtensionObject from "../../models/extensionObject";
import ExtensionObjectLine from "../../models/extensionObjectLine";
import CreateBCExtensionObjectLineRequest from "./requests/createBcExtensionObjectLineRequest";
import CreateBCExtensionObjectRequest from "./requests/createBcExtensionObjectRequest";
import CreateBCExtensionRequest from "./requests/createBcExtensionRequest";

export interface IIntegrationApi {
  getApiVersionURLFormatted(): string;

  getBcExtension(id: string): Promise<Extension | null>;
  getBcExtensionObject(
    extensionID: string,
    objectType: string,
    objectID: number,
  ): Promise<ExtensionObject | null>;
  getBcExtensionObjectLine(
    extensionID: string,
    objectType: string,
    objectID: number,
    fieldID: number,
  ): Promise<ExtensionObjectLine | null>;
  createBcExtension(
    createBCExtensionRequest: CreateBCExtensionRequest,
  ): Promise<Extension>;
  createBcExtensionObject(
    createBCExtensionObjectRequest: CreateBCExtensionObjectRequest,
  ): Promise<number>;
  createBcExtensionObjectLine(
    createBCExtensionObjectLineRequest: CreateBCExtensionObjectLineRequest,
  ): Promise<number>;
  getAllAssignableRanges(): Promise<AssignableRange[]>;

  isDeprecated(): boolean;
}
