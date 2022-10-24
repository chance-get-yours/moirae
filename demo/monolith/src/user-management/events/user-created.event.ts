import { Event, IEvent, RegisterType } from "@moirae/core";
import { IUser } from "../interfaces/user.interface";

@RegisterType()
export class UserCreatedEvent extends Event implements IEvent {
  public readonly $version = 1;

  constructor(
    public readonly $streamId: string,
    public readonly $data: Pick<IUser, "email">,
  ) {
    super();
  }
}
