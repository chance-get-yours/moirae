import { Test } from "@nestjs/testing";
import { TestStatuses } from "../classes/state-tracker.class.spec";
import { ObservableFactory } from "./observable.factory";

describe("ObservableFactory", () => {
  let factory: ObservableFactory;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [ObservableFactory],
    }).compile();

    factory = module.get(ObservableFactory);
  });

  it("will be defined", () => {
    expect(factory).toBeDefined();
  });

  describe("bus", () => {
    it("will create a single state tracker instance", () => {
      const tracker = factory.generateStateTracker<TestStatuses>(
        TestStatuses.hello,
      );

      const emitSpy = jest.spyOn(factory.emitter, "emit");
      tracker.set(TestStatuses.world);
      expect(emitSpy).toHaveBeenCalledWith(
        expect.any(String),
        TestStatuses.world,
      );
    });

    it("will share the bus for multiple trackers", () => {
      const a = factory.generateStateTracker<TestStatuses>(TestStatuses.hello);
      const b = factory.generateStateTracker<TestStatuses>(TestStatuses.world);

      const emitSpy = jest.spyOn(factory.emitter, "emit");
      a.set(TestStatuses.world);
      b.set(TestStatuses.hello);

      expect(emitSpy).toBeCalledTimes(2);
      expect(a.current).toEqual(TestStatuses.world);
      expect(b.current).toEqual(TestStatuses.hello);
    });
  });
});
