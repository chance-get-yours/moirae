/**
 * Configuration for Command/Query bus execute method
 */
export interface ExecuteOptions {
  /**
   * Throw an error if response is an instanceof Error
   *
   * @default false
   */
  throwError?: boolean;
}
