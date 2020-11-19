export class Extension {
    code: string;
    id: string;

    constructor(code: string, id: string) {
        this.code = code;
        this.id = id;
    }

    public static fromJson(json: Object): Extension {
        return new Extension(
            'code' in json ? json['code'] : '',
            'id' in json ? json['id'] : '',
        );
    }
}