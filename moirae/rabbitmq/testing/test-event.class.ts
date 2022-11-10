import { Event, IEvent } from "@moirae/core";

export class TestEvent extends Event implements IEvent {
  $data = {};
  $streamId = "q12345f";
  $version = 1;
}
