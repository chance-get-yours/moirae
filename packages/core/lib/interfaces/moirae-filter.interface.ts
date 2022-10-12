export interface IMoiraeFilter<T extends Error> {
  catch(error: T): void | Promise<void>;
}
