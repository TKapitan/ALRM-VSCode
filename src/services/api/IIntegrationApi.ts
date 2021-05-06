import AssignableRange from "../../models/assignableRange";
import Extension from "../../models/extension";
import CreateBCExtensionObjectLineRequest from "./requests/createBcExtensionObjectLineRequest";
import CreateBCExtensionObjectRequest from "./requests/createBcExtensionObjectRequest";
import CreateBCExtensionRequest from "./requests/createBcExtensionRequest";

export interface IIntegrationApi {
    getBcExtension(id: string): Promise<Extension | null>;
    createBcExtension(createBCExtensionRequest: CreateBCExtensionRequest): Promise<Extension>;
    createBcExtensionObject(createBCExtensionObjectRequest: CreateBCExtensionObjectRequest): Promise<number>;
    createBcExtensionObjectLine(createBCExtensionObjectLineRequest: CreateBCExtensionObjectLineRequest): Promise<number>
    getAllAssignableRanges(): Promise<AssignableRange[]>;
}
