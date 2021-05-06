import Extension from "../../../models/extension";

export default class CreateBCExtensionObjectRequest {
    objectType: string;
    objectID: number;
    objectName: string;
    extension: Extension;

    constructor(extension: Extension, objectType: string, objectID: number, objectName: string) {
        this.extension = extension;
        this.objectType = objectType;
        this.objectID = objectID;
        this.objectName = objectName;
    }
}
