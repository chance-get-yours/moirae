/**
 * The manager defines metadata management in Moirae, including
 * but not limited to Unique Indexing and Transactions
 */
export interface IManager {
  /**
   * Release a previously reserved value if it exists
   */
  releaseValue(key: string, value: unknown): Promise<boolean>;
  /**
   * Reserve a value to enforce uniqueness
   */
  reserveValue(key: string, value: unknown): Promise<boolean>;
}
