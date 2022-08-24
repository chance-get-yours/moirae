import { ICommand, SagaManager } from "@moirae/core";

/**
 * Mock the Moirae saga manager so that it can be used independently
 */
export class SagaManagerMock implements Omit<SagaManager, "_sagas"> {
  public addSaga(): void {
    // pass
  }
  public applyEventToSagas(): Promise<ICommand[]> {
    return Promise.resolve([]);
  }
  public onApplicationBootstrap(): void {
    // pass
  }
  public rollbackSagas(): Promise<ICommand[]> {
    return Promise.resolve([]);
  }
}
