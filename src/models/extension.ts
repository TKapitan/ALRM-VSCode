export default class Extension {
  code: string;
  id: string;
  alternateRangeCode: string;

  constructor(code: string, id: string, alternateRangeCode = "") {
    this.code = code;
    this.id = id;
    this.alternateRangeCode = alternateRangeCode;
  }

  public static fromJson(json: any): Extension {
    return new Extension(
      "code" in json ? json["code"] : "",
      "id" in json ? json["id"] : "",
      "alternateRangeCode" in json ? json["alternateRangeCode"] : "",
    );
  }
}
