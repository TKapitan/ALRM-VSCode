import { Resources } from "../bcClient";
import {
  CreateBCExtensionObjectRequest,
  IIntegrationApi
} from "./IIntegrationApi";
import IntegrationApiv1n0 from "./IntegrationApiv1n0";

export default class IntegrationApiv1n1
  extends IntegrationApiv1n0
  implements IIntegrationApi
{
  public getApiVersionURLFormatted(): string {
    return "v1.1";
  }

  async createBcExtensionObject(
    createBCExtensionObjectRequest: CreateBCExtensionObjectRequest,
  ): Promise<number> {
    if (createBCExtensionObjectRequest.objectID !== 0) {
      await this.bcClient.callAction(
        Resources.extension,
        createBCExtensionObjectRequest.extension.code,
        "createObjectWithOwnID",
        {
          objectType: createBCExtensionObjectRequest.objectType,
          objectID: createBCExtensionObjectRequest.objectID,
          objectName: createBCExtensionObjectRequest.objectName,
          extendsObjectName: createBCExtensionObjectRequest.extendsObjectName,
          createdBy: this.bcClient.username?.substring(0, 50) ?? "", // FIXME use createdby in BC?
        },
      );
      return createBCExtensionObjectRequest.objectID;
    }
    const response = await this.bcClient.callAction(
      Resources.extension,
      createBCExtensionObjectRequest.extension.code,
      "createObject",
      {
        objectType: createBCExtensionObjectRequest.objectType,
        objectName: createBCExtensionObjectRequest.objectName,
        extendsObjectName: createBCExtensionObjectRequest.extendsObjectName,
        createdBy: this.bcClient.username?.substring(0, 50) ?? "",
      },
    );
    const objectId = Number(response);
    if (isNaN(objectId)) {
      throw new Error(`Unexpected object id response: ${response}`);
    }
    return objectId;
  }

  public isDeprecated(): boolean {
    return false;
  }
}
