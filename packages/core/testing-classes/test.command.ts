import { Command } from "../lib/classes/command.class";
import { RegisterType } from "../lib/decorators/register-type.decorator";
import { ICommand } from "../lib/interfaces/command.interface";

@RegisterType()
export class TestCommand extends Command implements ICommand {
  public $version = 1;
  $responseKey = "hello";
  $routingKey = "world";

  public get STREAM_ID(): string {
    return "streamID";
  }
}
