/* eslint-disable @typescript-eslint/naming-convention */
export enum ObjectType {
  DotNet = -2,
  UnKnownObjectType = -1,
  Table = 5,
  TableExtension = 6,
  Page = 10,
  PageExtension = 11,
  PageCustomization = 12,
  Codeunit = 15,
  Report = 20,
  ReportExtension = 21,
  XMLPort = 25,
  Query = 30,
  Enum = 35,
  EnumExtension = 36,
  PermissionSet = 40,
  PermissionSetExtension = 41,
  Entitlement = 45,
  Profile = 85,
  Interface = 90,
  ControlAddin = 95,
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
  ObjectType.Profile,
  ObjectType.ControlAddin,
];
export const runtime04Objects: ObjectType[] = [
  ObjectType.Enum,
  ObjectType.EnumExtension,
];
export const runtime05Objects: ObjectType[] = [ObjectType.Interface];
export const runtime06Objects: ObjectType[] = [];
export const runtime07Objects: ObjectType[] = [
  ObjectType.ReportExtension,
  ObjectType.PermissionSet,
  ObjectType.PermissionSetExtension,
  ObjectType.Entitlement,
];

// Specify objects that have no ID in their definition
const objectsWithoutID: ObjectType[] = [
  ObjectType.PageCustomization,
  ObjectType.Interface,
  ObjectType.Profile,
  ObjectType.Entitlement,
  ObjectType.ControlAddin,
];
export function hasObjectTypeIDs(objectType: ObjectType): boolean {
  return objectsWithoutID.findIndex((x) => x === objectType) === -1;
}

// Specify objects that should not be synchronized
const ignoredObjectTypes: ObjectType[] = [ObjectType.DotNet];
export function shouldBeObjectTypeIgnored(objectType: ObjectType): boolean {
  return ignoredObjectTypes.findIndex((x) => x === objectType) !== -1;
}

// Specify objects that extends another objects
const extensionObjectTypes: ObjectType[] = [
  ObjectType.TableExtension,
  ObjectType.PageExtension,
  ObjectType.ReportExtension,
  ObjectType.EnumExtension,
  ObjectType.PermissionSetExtension,
];
export function extendsAnotherObject(objectType: ObjectType): boolean {
  return extensionObjectTypes.findIndex((x) => x === objectType) !== -1;
}

// Translates object from ObjectType object to string value
export function translateObjectTypeFromObjectType(
  fromObjectType: ObjectType,
): string {
  switch (fromObjectType) {
    case ObjectType.Codeunit:
      return "Codeunit";
    case ObjectType.Entitlement:
      return "Entitlement";
    case ObjectType.Enum:
      return "Enum";
    case ObjectType.EnumExtension:
      return "Enum Extension";
    case ObjectType.Interface:
      return "Interface";
    case ObjectType.Page:
      return "Page";
    case ObjectType.PageCustomization:
      return "Page Customization";
    case ObjectType.PageExtension:
      return "Page Extension";
    case ObjectType.PermissionSet:
      return "Permission Set";
    case ObjectType.PermissionSetExtension:
      return "Permission Set Extension";
    case ObjectType.Profile:
      return "Profile";
    case ObjectType.Query:
      return "Query";
    case ObjectType.Report:
      return "Report";
    case ObjectType.ReportExtension:
      return "Report Extension";
    case ObjectType.Table:
      return "Table";
    case ObjectType.TableExtension:
      return "Table Extension";
    case ObjectType.XMLPort:
      return "XML Port";
  }
  return "UNKNOWN";
}

// Translates object from string value to ObjectType object
export function translateObjectType(fromString: string): ObjectType {
  switch (fromString.toLowerCase().trim()) {
    case "codeunit":
      return ObjectType.Codeunit;
    case "page":
      return ObjectType.Page;
    case "pageextension":
      return ObjectType.PageExtension;
    case "pagecustomization":
      return ObjectType.PageCustomization;
    case "table":
      return ObjectType.Table;
    case "tableextension":
      return ObjectType.TableExtension;
    case "query":
      return ObjectType.Query;
    case "report":
      return ObjectType.Report;
    case "reportextension":
      return ObjectType.ReportExtension;
    case "xmlport":
      return ObjectType.XMLPort;
    case "enum":
      return ObjectType.Enum;
    case "enumextension":
      return ObjectType.EnumExtension;
    case "permissionset":
      return ObjectType.PermissionSet;
    case "permissionsetextension":
      return ObjectType.PermissionSetExtension;
    case "profile":
      return ObjectType.Profile;
    case "interface":
      return ObjectType.Interface;
    case "dotnet":
      return ObjectType.DotNet;
    case "controladdin":
      return ObjectType.ControlAddin;
  }
  return ObjectType.UnKnownObjectType;
}

// Substitute auto-generated information in AL snippets with provided names/ids
export function substituteObjectInfo(
  snippetHeader: string,
  objectType: ObjectType,
  objectName: string,
  objectId: string,
): string {
  objectId = objectId.trim();
  objectName = objectName.trim();
  switch (objectType) {
    case ObjectType.Codeunit:
    case ObjectType.Page:
    case ObjectType.PageExtension:
    case ObjectType.Query:
    case ObjectType.Report:
    case ObjectType.ReportExtension:
    case ObjectType.Table:
    case ObjectType.TableExtension:
    case ObjectType.XMLPort:
    case ObjectType.Enum:
    case ObjectType.EnumExtension:
    case ObjectType.PermissionSet:
    case ObjectType.PermissionSetExtension:
      return replaceSnippetVariable(
        replaceSnippetVariable(snippetHeader, 1, objectId),
        2,
        `"${objectName}"`,
      );
    case ObjectType.PageCustomization:
    case ObjectType.Profile:
    case ObjectType.Interface:
    case ObjectType.ControlAddin:
    case ObjectType.Entitlement:
      return replaceSnippetVariable(snippetHeader, 1, `"${objectName}"`);
    case ObjectType.DotNet:
      return snippetHeader;
  }
  throw new Error("Unknown object type: " + objectType.toString());
}

export function replaceSnippetVariable(
  where: string,
  variableNumber: number,
  by: string,
): string {
  let variableEndPosition, endCharacter;
  let variableStartPosition = where
    .toLowerCase()
    .indexOf('"${' + variableNumber.toString() + ":");
  if (variableStartPosition !== -1) {
    endCharacter = '}"';
    variableEndPosition = where
      .toLowerCase()
      .indexOf(endCharacter, variableStartPosition);
  } else {
    endCharacter = "}";
    variableStartPosition = where
      .toLowerCase()
      .indexOf("${" + variableNumber.toString() + ":");
    variableEndPosition = where
      .toLowerCase()
      .indexOf(endCharacter, variableStartPosition);
  }

  const strTemp = where.substring(0, variableStartPosition);
  return strTemp.concat(
    by,
    where.substring(variableEndPosition + endCharacter.length),
  );
}
