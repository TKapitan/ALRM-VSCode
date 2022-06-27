import { ObjectType } from "../../models/objectType";
import { ISnippets } from "./ISnippets";
import SnippetsDefault from "./SnippetsDefault";

export default class SnippetsWaldo implements ISnippets {
    protected static _instance: ISnippets;
    // Specify objects that extends another objects
    private _unsupportedObjectTypes: ObjectType[] = [
        ObjectType.Entitlement,
        ObjectType.PermissionSet,
        ObjectType.PermissionSetExtension,
        ObjectType.ReportExtension,
    ];

    public static get instance(): ISnippets {
        if (this._instance === undefined) {
            this._instance = new this();
        }
        return this._instance;
    }

    getSnippetFolder(objectType: ObjectType): string {
        if (this._unsupportedObjectTypes.findIndex(x => x === objectType) !== -1) {
            return SnippetsDefault.instance.getSnippetFolder(objectType);
        }
        return 'waldo.crs-al-language-extension';
    }

    getSnippetSubFolder(objectType: ObjectType): string {
        if (this._unsupportedObjectTypes.findIndex(x => x === objectType) !== -1) {
            return SnippetsDefault.instance.getSnippetSubFolder(objectType);
        }
        return 'fromAlExtension';
    }

    getSnippetFileName(objectType: ObjectType): string {
        if (this._unsupportedObjectTypes.findIndex(x => x === objectType) !== -1) {
            return SnippetsDefault.instance.getSnippetFileName(objectType);
        }
        switch (objectType) {
            case ObjectType.Codeunit:
                return 'codeunit.json';
            case ObjectType.ControlAddin:
                return 'controladdin.json';
            case ObjectType.DotNet:
                return 'dotnet.json';
            case ObjectType.Entitlement:
                return 'entitlement.json';
            case ObjectType.Enum:
                return 'enum.json';
            case ObjectType.EnumExtension:
                return 'enumextension.json';
            case ObjectType.Interface:
                return 'interface.json';
            case ObjectType.Page:
                return 'page.json';
            case ObjectType.PageCustomization:
                return 'pagecustomization.json';
            case ObjectType.PageExtension:
                return 'pageextension.json';
            case ObjectType.PermissionSet:
                return 'permissionset.json';
            case ObjectType.PermissionSetExtension:
                return 'permissionsetextension.json';
            case ObjectType.Profile:
                return 'profile.json';
            case ObjectType.Query:
                return 'query.json';
            case ObjectType.Report:
                return 'report.json';
            case ObjectType.ReportExtension:
                return 'reportextension.json';
            case ObjectType.Table:
                return 'table.json';
            case ObjectType.TableExtension:
                return 'tableextension.json';
            case ObjectType.XMLPort:
                return 'xmlport.json';
            default:
                throw new Error(`Unimplemented type ${objectType}!`);
        }
    }

    showALObjectSnippet(objectType: ObjectType, firstSnippetPrefix: string, currentSnippetPrefix: string): boolean {
        if (this._unsupportedObjectTypes.findIndex(x => x === objectType) !== -1) {
            return SnippetsDefault.instance.showALObjectSnippet(objectType, firstSnippetPrefix, currentSnippetPrefix);
        }
        // Skip this snippets that can not be excluded automatically
        if (currentSnippetPrefix.startsWith('tpagefield')) {
            return false;
        }
        return currentSnippetPrefix.startsWith(firstSnippetPrefix.substring(0, firstSnippetPrefix.indexOf('waldo')));
    }
}