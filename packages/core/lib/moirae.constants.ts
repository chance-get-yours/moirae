export const APPLY_METADATA = "__apply_event_metadata__";
export const COMMAND_METADATA = "__command_handler__";
export const EVENT_METADATA = "__event_handler__";
export const EVENT_SOURCE = "__event_source__";
export const PROJECTION_METADATA = "__aggregate_projection__";
export const PUBLISHER = "__publisher__";
export const PUBLISHER_OPTIONS = "__publisher-options__";
export const QUERY_METADATA = "__query_handler__";
export const SAGA_METADATA = "__saga_handler__";

/**
 * @internal
 * State tracker enum for publishers and busses
 */
export enum ESState {
  NOT_READY = -2,
  PREPARING,
  IDLE,
  ACTIVE,
  SHUTTING_DOWN,
}
