export interface ICacheOptions<T> {
  transform?: (value: any) => T;
}

export interface ICache {
  // key/value
  /**
   * Drop a key-value pair
   */
  dropKey(key: string): Promise<void>;
  /**
   * Get a value given a key in a key-value pair
   */
  getKey<T>(key: string): Promise<T>;
  /**
   * Set a key-value pair
   */
  setKey<T>(key: string, value: T): Promise<boolean>;

  // set
  /**
   * Add a value to a set and create the set if it doesn't exist. Returns a
   * boolean where `true` means the value was inserted and `false` means the value
   * already exists in the set.
   */
  addToSet<T>(key: string, value: T): Promise<boolean>;
  /**
   * Drop set from the cache
   */
  dropSet(key: string): Promise<void>;
  /**
   * Get all values from a set
   */
  readFromSet<T>(key: string, options?: ICacheOptions<T>): Promise<T[]>;
  /**
   * Remove a value from the set if it exists. Returns a boolean where
   * `true` means the operation was successful and `false` means the value doesn't exist
   * in the set.
   */
  removeFromSet<T>(key: string, value: T): Promise<boolean>;
}
