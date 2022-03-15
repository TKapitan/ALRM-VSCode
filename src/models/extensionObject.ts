export default class ExtensionObject {
    rangeCode: string;
    alternateRangeCode: string;
    objectID: number;
    alternateObjectID: number;

    constructor(rangeCode: string, alternateRangeCode: string, objectID: number, alternateObjectID: number) {
        this.rangeCode = rangeCode;
        this.alternateRangeCode = alternateRangeCode;
        this.objectID = objectID;
        this.alternateObjectID = alternateObjectID;
    }

    public static fromJson(json: Object): ExtensionObject {
        return new ExtensionObject(
            'rangeCode' in json ? json['rangeCode'] : '',
            'alternateRangeCode' in json ? json['alternateRangeCode'] : '',
            'objectID' in json ? json['objectID'] : 0,
            'alternateObjectID' in json ? json['alternateObjectID'] : 0,
        );
    }
}