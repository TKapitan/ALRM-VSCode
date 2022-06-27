export default class ExtensionObjectLine {
    fieldID: number;
    alternateFieldID: number;

    constructor(fieldID: number, alternateFieldID: number) {
        this.fieldID = fieldID;
        this.alternateFieldID = alternateFieldID;
    }

    public static fromJson(json: any): ExtensionObjectLine {
        return new ExtensionObjectLine(
            'id' in json ? json['id'] : 0,
            'alternateID' in json ? json['alternateID'] : 0,
        );
    }
}