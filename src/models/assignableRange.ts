export default class AssignableRange {
    code: string;
    description: string;
    defaultObjectRangeFrom: number;
    defaultObjectRangeTo: number;
    isDefault: boolean;

    constructor(code: string, description: string, defaultObjectRangeFrom: number, defaultObjectRangeTo: number, isDefault: boolean) {
        this.code = code;
        this.description = description;
        this.defaultObjectRangeFrom = defaultObjectRangeFrom;
        this.defaultObjectRangeTo = defaultObjectRangeTo;
        this.isDefault = isDefault;
    }

    public static fromJson(json: Object): AssignableRange {
        return new AssignableRange(
            'code' in json ? json['code'] : '',
            'description' in json ? json['description'] : '',
            'defaultObjectRangeFrom' in json ? json['defaultObjectRangeFrom'] : 0,
            'defaultObjectRangeTo' in json ? json['defaultObjectRangeTo'] : 0,
            'default' in json ? json['default'] : false,
        );
    }
}