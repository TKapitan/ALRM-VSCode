export enum ObjectType {
    Table,
    TableExtension,
    Page,
    PageExtension,
    Codeunit,
    Report,
    XMLPort,
    Query,
    Enum,
    EnumExtension,
}

export function getObjectTypeNumber(objectType: ObjectType): number {
    switch (objectType) {
        case ObjectType.Table:
            return 5;
        case ObjectType.TableExtension:
            return 6;
        case ObjectType.Page:
            return 10;
        case ObjectType.PageExtension:
            return 11;
        case ObjectType.Codeunit:
            return 15;
        case ObjectType.Report:
            return 20;
        case ObjectType.XMLPort:
            return 25;
        case ObjectType.Query:
            return 30;
        case ObjectType.Enum:
            return 35;
        case ObjectType.EnumExtension:
            return 36;
    }
}