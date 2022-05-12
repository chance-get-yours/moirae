import { faker } from "@faker-js/faker";
import { NotFoundException } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { AccountService } from "../account.service";
import { Account } from "../projections/account.entity";
import { FindAccountByIdQuery } from "../queries/find-account-by-id.query";
import { FindAccountByIdHandler } from "./find-account-by-id.handler";

describe("FindAccountByIdHandler", () => {
  let handler: FindAccountByIdHandler;
  let service: AccountService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        FindAccountByIdHandler,
        { provide: AccountService, useFactory: () => ({ findOne: jest.fn() }) },
      ],
    }).compile();

    handler = module.get(FindAccountByIdHandler);
    service = module.get(AccountService);
  });

  it("will be defined", () => {
    expect(handler).toBeDefined();
  });

  describe("execute", () => {
    it("will call service findOne", async () => {
      const account = new Account();
      account.id = faker.datatype.uuid();

      const findSpy = jest.spyOn(service, "findOne").mockResolvedValue(account);

      expect(
        await handler.execute(new FindAccountByIdQuery(account.id)),
      ).toEqual(account);
      expect(findSpy).toHaveBeenCalledWith(account.id);
    });

    it("will throw a NotFoundError if not found", async () => {
      const account = new Account();
      account.id = faker.datatype.uuid();

      const findSpy = jest
        .spyOn(service, "findOne")
        .mockResolvedValue(undefined);

      await expect(() =>
        handler.execute(new FindAccountByIdQuery(account.id)),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(findSpy).toHaveBeenCalledWith(account.id);
    });
  });
});
