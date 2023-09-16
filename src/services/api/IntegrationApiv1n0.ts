import AssignableRange from "../../models/assignableRange";
import Extension from "../../models/extension";
import ExtensionObject from "../../models/extensionObject";
import ExtensionObjectLine from "../../models/extensionObjectLine";
import BcClient, { Resources } from "../bcClient";
import { IIntegrationApi } from "./IIntegrationApi";
import CreateBCExtensionObjectLineRequest from "./requests/createBcExtensionObjectLineRequest";
import CreateBCExtensionObjectRequest from "./requests/createBcExtensionObjectRequest";
import CreateBCExtensionRequest from "./requests/createBcExtensionRequest";

export default class IntegrationApiv1n0 implements IIntegrationApi {
  protected static _instance: IIntegrationApi;

  public static get instance(): IIntegrationApi {
    if (this._instance === undefined) {
      this._instance = new this();
    }
    return this._instance;
  }

  public getApiVersionURLFormatted(): string {
    return "v1.0";
  }

  protected bcClient(): BcClient {
    return new BcClient();
  }

  async getBcExtension(id: string): Promise<Extension | null> {
    const extensions = await this.bcClient().readMultiple(Resources.extension, {
      top: 1,
      filter: `id eq ${id}`,
    });
    if (extensions.length === 0) {
      return null;
    }
    return Extension.fromJson(extensions[0]);
  }
  async getBcExtensionObject(
    extensionID: string,
    objectType: string,
    objectID: number,
  ): Promise<ExtensionObject | null> {
    let extensionObjects = await this.bcClient().readMultiple(
      Resources.extensionObject,
      {
        top: 1,
        filter: `extensionID eq ${extensionID} and objectType eq '${objectType}' and objectID eq ${objectID}`,
      },
    );
    if (extensionObjects.length === 0) {
      extensionObjects = await this.bcClient().readMultiple(
        Resources.extensionObject,
        {
          top: 1,
          filter: `extensionID eq ${extensionID} and objectType eq '${objectType}' and alternateObjectID eq ${objectID}`,
        },
      );
      if (extensionObjects.length === 0) {
        return null;
      }
    }
    return ExtensionObject.fromJson(extensionObjects[0]);
  }
  async getBcExtensionObjectLine(
    extensionID: string,
    objectType: string,
    objectID: number,
    fieldID: number,
  ): Promise<ExtensionObjectLine | null> {
    let extensionObjectLines = await this.bcClient().readMultiple(
      Resources.extensionObjectLine,
      {
        top: 1,
        filter: `extensionID eq ${extensionID} and objectType eq '${objectType}' and objectID eq ${objectID} and id eq ${fieldID}`,
      },
    );
    if (extensionObjectLines.length === 0) {
      extensionObjectLines = await this.bcClient().readMultiple(
        Resources.extensionObjectLine,
        {
          top: 1,
          filter: `extensionID eq ${extensionID} and objectType eq '${objectType}' and alternateObjectID eq ${objectID} and alternateID eq ${fieldID}`,
        },
      );
      if (extensionObjectLines.length === 0) {
        return null;
      }
    }
    return ExtensionObjectLine.fromJson(extensionObjectLines[0]);
  }

  async createBcExtension(
    createBCExtensionRequest: CreateBCExtensionRequest,
  ): Promise<Extension> {
    const extension = await this.bcClient().create(Resources.extension, {
      id: createBCExtensionRequest.id,
      rangeCode: createBCExtensionRequest.rangeCode,
      name: createBCExtensionRequest.name,
      description: createBCExtensionRequest.description,
    });
    return Extension.fromJson(extension);
  }
  async createBcExtensionObject(
    createBCExtensionObjectRequest: CreateBCExtensionObjectRequest,
  ): Promise<number> {
    if (createBCExtensionObjectRequest.objectID !== 0) {
      await this.bcClient().callAction(
        Resources.extension,
        createBCExtensionObjectRequest.extension.code,
        "createObjectWithOwnID",
        {
          objectType: createBCExtensionObjectRequest.objectType,
          objectID: createBCExtensionObjectRequest.objectID,
          objectName: createBCExtensionObjectRequest.objectName,
          createdBy: this.bcClient().username?.substr(0, 50) ?? "",
        },
      );
      return createBCExtensionObjectRequest.objectID;
    }
    const response = await this.bcClient().callAction(
      Resources.extension,
      createBCExtensionObjectRequest.extension.code,
      "createObject",
      {
        objectType: createBCExtensionObjectRequest.objectType,
        objectName: createBCExtensionObjectRequest.objectName,
        createdBy: this.bcClient().username?.substr(0, 50) ?? "",
      },
    );
    const objectId = Number(response);
    if (isNaN(objectId)) {
      throw new Error(`Unexpected object id response: ${response}`);
    }
    return objectId;
  }
  async createBcExtensionObjectLine(
    createBCExtensionObjectLineRequest: CreateBCExtensionObjectLineRequest,
  ): Promise<number> {
    if (createBCExtensionObjectLineRequest.fieldOrValueID !== 0) {
      await this.bcClient().callAction(
        Resources.extension,
        createBCExtensionObjectLineRequest.extension.code,
        "createObjectFieldOrValueWithOwnID",
        {
          objectType: createBCExtensionObjectLineRequest.objectType,
          objectID: createBCExtensionObjectLineRequest.objectID,
          fieldOrValueID: createBCExtensionObjectLineRequest.fieldOrValueID,
          createdBy: this.bcClient().username?.substr(0, 50) ?? "",
        },
      );
      return createBCExtensionObjectLineRequest.fieldOrValueID;
    }
    const response = await this.bcClient().callAction(
      Resources.extension,
      createBCExtensionObjectLineRequest.extension.code,
      "createObjectFieldOrValue",
      {
        objectType: createBCExtensionObjectLineRequest.objectType,
        objectID: createBCExtensionObjectLineRequest.objectID,
        createdBy: this.bcClient().username?.substr(0, 50) ?? "",
      },
    );
    const objectLineId = Number(response);
    if (isNaN(objectLineId)) {
      throw new Error(`Unexpected object id response: ${response}`);
    }
    return objectLineId;
  }
  async getAllAssignableRanges(): Promise<AssignableRange[]> {
    const assignableRanges = await this.bcClient().readAll(
      Resources.assignableRange,
    );
    return assignableRanges.map((e) => AssignableRange.fromJson(e));
  }

  public isDeprecated(): boolean {
    return true;
  }
}
