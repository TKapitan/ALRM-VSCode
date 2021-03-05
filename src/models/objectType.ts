/* eslint-disable @typescript-eslint/naming-convention */
export enum ObjectType {
    UnKnownObjectType = -1,
    Table = 5,
    TableExtension = 6,
    Page = 10,
    PageExtension = 11,
    Codeunit = 15,
    Report = 20,
    XMLPort = 25,
    Query = 30,
    Enum = 35,
    EnumExtension = 36,
    Interface = 90,
}
const objectsWithoutID: ObjectType[] = [ObjectType.Interface];

export function hasObjectTypeIDs(objectType: ObjectType): boolean{
    return objectsWithoutID.findIndex(x => x === objectType) === -1;
}

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
    }
    return ObjectType.UnKnownObjectType;
}