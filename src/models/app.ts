export class App {
    id: string;
    name: string;
    description: string;

    constructor(
        id: string,
        name: string,
        description: string,
    ) {
        this.id = id;
        this.name = name;
        this.description = description;
    }

    public static fromJson(json: Object): App {
        return new App(
            'id' in json ? json['id'] : '',
            'name' in json ? json['name'] : '',
            'brief' in json ? json['brief'] : '',
        );
    }
}