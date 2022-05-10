export const APPLY_METADATA = "__apply_event_metadata__";
export const EVENT_SOURCE = "__event_source__";
export const PUBLISHER = "__publisher__";

export enum ESState {
  NOT_READY = -2,
  PREPARING,
  IDLE,
  ACTIVE,
  SHUTTING_DOWN,
}
