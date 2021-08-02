import { ObjectType } from "../../models/objectType";
import { ISnippets } from "./ISnippets";

export default class SnippetsDefault implements ISnippets {
    protected static _instance: ISnippets;

    public static get instance(): ISnippets {
        if (this._instance === undefined) {
            this._instance = new this();
        }
        return this._instance;
    }

    getSnippetFolder(): string {
        return 'ms-dynamics-smb.al';
    }

    getSnippetSubFolder(): string {
        return '';
    }

    getSnippetFileName(objectType: ObjectType): string {
        switch (objectType) {
            case ObjectType.Table:
                return 'table.json';
            case ObjectType.TableExtension:
                return 'tableextension.json';
            case ObjectType.Page:
                return 'page.json';
            case ObjectType.PageExtension:
                return 'pageextension.json';
            case ObjectType.PageCustomization:
                return 'pagecustomization.json';
            case ObjectType.Codeunit:
                return 'codeunit.json';
            case ObjectType.Report:
                return 'report.json';
            case ObjectType.ReportExtension:
                return 'reportextension.json';
            case ObjectType.XMLPort:
                return 'xmlport.json';
            case ObjectType.Query:
                return 'query.json';
            case ObjectType.Enum:
                return 'enum.json';
            case ObjectType.EnumExtension:
                return 'enumextension.json';
            case ObjectType.PermissionSet:
                return 'permissionset.json';
            case ObjectType.PermissionSetExtension:
                return 'permissionsetextension.json';
            case ObjectType.Profile:
                return 'profile.json';
            case ObjectType.Interface:
                return 'interface.json';
            case ObjectType.ControlAddin:
                return 'controladdin.json';
            case ObjectType.DotNet:
                return 'dotnet.json';
            case ObjectType.Entitlement:
                return 'entitlement.json';
            default:
                throw new Error(`Unimplemented type ${objectType}!`);
        }
    }

    showALObjectSnippet(objectType: ObjectType, firstSnippetPrefix: string, currentSnippetPrefix: string): boolean {
        return firstSnippetPrefix === currentSnippetPrefix;
    }
}