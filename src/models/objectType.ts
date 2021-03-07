/* eslint-disable @typescript-eslint/naming-convention */
export enum ObjectType {
    UnKnownObjectType = -1,
    Table = 5,
    TableExtension = 6,
    Page = 10,
    PageExtension = 11,
    PageCustomization = 12,
    Codeunit = 15,
    Report = 20,
    XMLPort = 25,
    Query = 30,
    Enum = 35,
    EnumExtension = 36,
    Profile = 85,
    Interface = 90,
}
// Specifies original version of AL project runtime for which the object types should be available
export const originalObjects: ObjectType[] = [
    ObjectType.Table,
    ObjectType.TableExtension,
    ObjectType.Page,
    ObjectType.PageExtension,
    ObjectType.PageCustomization,
    ObjectType.Codeunit,
    ObjectType.Report,
    ObjectType.XMLPort,
    ObjectType.Query,
    ObjectType.Profile
];
export const runtime04Objects: ObjectType[] = [
    ObjectType.Enum,
    ObjectType.EnumExtension
];
export const runtime05Objects: ObjectType[] = [
    ObjectType.Interface
];
export const runtime06Objects: ObjectType[] = [

];

// Specify objects that have no ID in their definition
const objectsWithoutID: ObjectType[] = [
    ObjectType.PageCustomization,
    ObjectType.Interface,
    ObjectType.Profile,
];
export function hasObjectTypeIDs(objectType: ObjectType): boolean {
    return objectsWithoutID.findIndex(x => x === objectType) === -1;
}

// Translates object from string value to ObjectType object
export function translateObjectType(fromString: string): ObjectType {
    switch (fromString) {
        case 'codeunit':
            return ObjectType.Codeunit;
        case 'enum':
            return ObjectType.Enum;
        case 'enumextension':
            return ObjectType.EnumExtension;
        case 'page':
            return ObjectType.Page;
        case 'pageextension':
            return ObjectType.PageExtension;
        case 'pagecustomization':
            return ObjectType.PageCustomization;
        case 'table':
            return ObjectType.Table;
        case 'tableextension':
            return ObjectType.TableExtension;
        case 'query':
            return ObjectType.Query;
        case 'report':
            return ObjectType.Report;
        case 'xmlport':
            return ObjectType.XMLPort;
        case 'interface':
            return ObjectType.Interface;
        case 'profile':
            return ObjectType.Profile;
    }
    return ObjectType.UnKnownObjectType;
}

// Specify snippets for object types
export function objectTypeSnippetFileName(objectType: ObjectType): string {
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
        case ObjectType.XMLPort:
            return 'xmlport.json';
        case ObjectType.Query:
            return 'query.json';
        case ObjectType.Enum:
            return 'enum.json';
        case ObjectType.EnumExtension:
            return 'enumextension.json';
        case ObjectType.Interface:
            return 'interface.json';
        case ObjectType.Profile:
            return 'profile.json';
        default:
            throw new Error(`Unimplemented type ${objectType}!`);
    }
}

// Substitute auto-generated information in AL snippets with provided names/ids
export function substituteObjectInfo(
    snippetHeader: string,
    objectType: ObjectType,
    objectName: string,
    objectId: string,
): string {
    switch (objectType) {
        case ObjectType.Codeunit:
            return snippetHeader
                .replace('${1:Id}', objectId)
                .replace('${2:MyCodeunit}', `"${objectName}"`);
        case ObjectType.Enum:
            return snippetHeader
                .replace('${1:id}', objectId)
                .replace('${2:MyEnum}', `"${objectName}"`);
        // XXX default enum extension snippet contains value snippet
        case ObjectType.EnumExtension:
            return snippetHeader
                .replace('${1:Id}', objectId)
                .replace('${2:MyEnumExtension}', `"${objectName}"`);
        case ObjectType.Page:
            return snippetHeader
                .replace('${1:Id}', objectId)
                .replace('${2:MyPage}', `"${objectName}"`);
        case ObjectType.PageExtension:
            return snippetHeader
                .replace('${1:Id}', objectId)
                .replace('${2:MyExtension}', `"${objectName}"`);
        case ObjectType.PageCustomization:
            return snippetHeader
                .replace('${1:MyCustomization}', `"${objectName}"`);
        case ObjectType.Query:
            return snippetHeader
                .replace('${1:Id}', objectId)
                .replace('${2:MyQuery}', `"${objectName}"`);
        case ObjectType.Report:
            return snippetHeader
                .replace('${1:Id}', objectId)
                .replace('${2:MyReport}', `"${objectName}"`);
        case ObjectType.Table:
            return snippetHeader
                .replace('${1:id}', objectId)
                .replace('${2:MyTable}', `"${objectName}"`);
        case ObjectType.TableExtension:
            return snippetHeader
                .replace('${1:Id}', objectId)
                .replace('${2:MyExtension}', `"${objectName}"`);
        case ObjectType.XMLPort:
            return snippetHeader
                .replace('${1:Id}', objectId)
                .replace('${2:MyXmlport}', `"${objectName}"`);
        case ObjectType.Interface:
            return snippetHeader
                .replace('${1:MyInterface}', `"${objectName}"`);
        // TODO There are two snippets for profile in the file
        case ObjectType.Profile:
            return snippetHeader
                .replace('${1:MyProfile}', `"${objectName}"`);
    }
    throw new Error('Unknown object type: ' + objectType.toString());
}
