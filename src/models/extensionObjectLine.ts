export default class ExtensionObjectLine {
    fieldID: number;
    alternateFieldID: number;

    constructor(fieldID: number, alternateFieldID: number) {
        this.fieldID = fieldID;
        this.alternateFieldID = alternateFieldID;
    }

    public static fromJson(json: Object): ExtensionObjectLine {
        return new ExtensionObjectLine(
            'fieldID' in json ? json['fieldID'] : 0,
            'alternateFieldID' in json ? json['alternateFieldID'] : 0,
        );
    }
}