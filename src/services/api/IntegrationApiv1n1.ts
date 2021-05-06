import { IIntegrationApi } from "./IIntegrationApi";
import IntegrationApiv1n0 from "./IntegrationApiv1n0";

export default class IntegrationApiv1n1 extends IntegrationApiv1n0 implements IIntegrationApi {
    public static get instance(): IIntegrationApi {
        return this._instance || (this._instance = new this());
    }

    // TODO Add new implementation
}