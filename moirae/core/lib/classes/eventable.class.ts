import { randomUUID } from "crypto";

export abstract class Eventable {
  public readonly $name: string;
  public readonly $uuid: string;

  constructor(public $metadata = {}) {
    this.$name = this.constructor.name;
    this.$uuid = randomUUID();
  }
}
