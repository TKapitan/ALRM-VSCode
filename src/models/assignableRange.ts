export default class AssignableRange {
    code: string;

    constructor(code: string) {
        this.code = code;
    }

    public static fromJson(json: Object): AssignableRange {
        return new AssignableRange(
            'code' in json ? json['code'] : '',
        );
    }
}