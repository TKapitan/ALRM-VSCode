import Extension from "../../../models/extension";

export default class CreateBCExtensionObjectLineRequest {
  objectType: string;
  objectID: number;
  fieldOrValueID: number;
  extension: Extension;

  constructor(
    extension: Extension,
    objectType: string,
    objectID: number,
    fieldOrValueID: number,
  ) {
    this.extension = extension;
    this.objectType = objectType;
    this.objectID = objectID;
    this.fieldOrValueID = fieldOrValueID;
  }
}
