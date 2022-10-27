/**
 * Metadata about the request to be stored and propagated with the commands/queries/events.
 * Optional to include.
 */
export interface IRequestMetadata extends Record<string, unknown> {
  /**
   * Field to link a specific initiating request to a client
   */
  requestorId?: string;
}
