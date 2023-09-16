import { ObjectType } from "../../models/objectType";

export interface ISnippets {
  getSnippetFolder(objectType: ObjectType): string;
  getSnippetSubFolder(objectType: ObjectType): string;
  getSnippetFileName(objectType: ObjectType): string;

  showALObjectSnippet(
    objectType: ObjectType,
    firstSnippetPrefix: string,
    currentSnippetPrefix: string,
  ): boolean;
}
