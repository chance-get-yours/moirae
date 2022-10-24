import { Command, IRollbackCommand, RegisterType } from "@moirae/core";

@RegisterType()
export class RollbackAccountCommand
  extends Command
  implements IRollbackCommand
{
  public readonly $data: { streamId: string; correlationId: string };
  public readonly $version = 1;

  public get STREAM_ID(): string {
    return this.$data.streamId;
  }

  constructor(streamId: string, correlationId: string) {
    super();
    this.$data = { streamId, correlationId };
  }
}
