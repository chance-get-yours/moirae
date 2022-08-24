import { Command, ICommand } from "@moirae/core";

export class TestCommand extends Command implements ICommand {
  STREAM_ID: string;
  $version = 1;
  public readonly input: string;

  constructor() {
    super();
    this.input = "Hello World";
  }
}
