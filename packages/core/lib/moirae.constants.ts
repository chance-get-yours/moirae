export const APPLY_METADATA = "__apply_event_metadata__";
export const CACHE_OPTIONS = "__cache-options__";
export const CACHE_PROVIDER = "__cache-provider__";
export const COMMAND_METADATA = "__command_handler__";
export const CORRELATION_PREFIX = "moirae__correlation";
export const EVENT_METADATA = "__event_handler__";
export const EVENT_PUBSUB_ENGINE = "__event-pubsub-engine__";
export const EVENT_SOURCE = "__event_source__";
export const EXCEPTION_METADATA = "__command_filter__";
export const MANAGER = "__manager__";
export const PROJECTION_METADATA = "__aggregate_projection__";
export const PUBLISHER = "__publisher__";
export const PUBLISHER_OPTIONS = "__publisher-options__";
export const QUERY_METADATA = "__query_handler__";
export const ROLLBACK_METADATA = "__rollback-event-metadata__";
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

/**
 * @internal
 */
export enum PublisherRole {
  COMMAND_BUS = "COMMAND_BUS",
  EVENT_STORE = "EVENT_STORE",
  QUERY_BUS = "QUERY_BUS",
}
