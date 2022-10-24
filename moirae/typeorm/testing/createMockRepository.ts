import { Repository } from "typeorm";

export type MockRepository<T> = { [K in keyof Repository<T>]: jest.Mock };

export const createMockRepository = () => ({
  count: jest.fn(),
  delete: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  remove: jest.fn(),
  save: jest.fn(),
});
