export default class CreateBCExtensionRequest {
  id: string;
  rangeCode: string;
  name: string;
  description: string;

  constructor(
    id: string,
    rangeCode: string,
    name: string,
    description: string,
  ) {
    this.id = id;
    this.rangeCode = rangeCode;
    this.name = name;
    this.description = description;
  }
}
