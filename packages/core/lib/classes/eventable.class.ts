export abstract class Eventable {
  public readonly name: string;

  constructor() {
    this.name = this.constructor.name;
  }
}
