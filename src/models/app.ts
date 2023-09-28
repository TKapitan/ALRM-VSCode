export default class App {
  id: string;
  name: string;
  description: string;
  runtime: number;
  platform: string;
  application: string;

  constructor(
    id: string,
    name: string,
    description: string,
    runtime: number,
    platform: string,
    application: string,
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.runtime = runtime;
    this.platform = platform;
    this.application = application;
  }

  public static fromJson(json: any): App {
    return new App(
      "id" in json ? json["id"] : "",
      "name" in json ? json["name"] : "",
      "brief" in json ? json["brief"] : "",
      "runtime" in json ? json["runtime"] : "",
      "platform" in json ? json["platform"] : "",
      "application" in json ? json["application"] : "",
    );
  }
}
