export interface ICacheOptions<T> {
  transform?: (value: any) => T;
}

export interface ICache {
  // key/value
  /**
   * Get a value given a key in a key-value pair
   */
  getKey<T>(key: string): Promise<T>;
  /**
   * Set a key-value pair
   */
  setKey<T>(key: string, value: T): Promise<boolean>;
}
