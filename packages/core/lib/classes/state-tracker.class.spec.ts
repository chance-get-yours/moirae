import { StateTracker } from "./state-tracker.class";

enum TestStatuses {
  hello,
  world,
}

describe("StateTracker", () => {
  let tracker: StateTracker<TestStatuses>;

  beforeEach(() => {
    tracker = new StateTracker(TestStatuses.hello);
  });

  it("will present the initial status", () => {
    expect(tracker.current).toEqual(TestStatuses.hello);
  });

  it("will update the status", () => {
    tracker.set(TestStatuses.world);
    expect(tracker.current).toEqual(TestStatuses.world);
  });

  it("will allow one to subscribe to status updates", () => {
    const subFn = jest.fn();

    tracker.subscribe(subFn);
    tracker.set(TestStatuses.world);

    expect(subFn).toHaveBeenCalledWith(TestStatuses.world);
    expect(subFn).toHaveBeenCalledTimes(1);
  });

  it("will allow one to unsubscribe from status updates", () => {
    const subFn = jest.fn();

    const id = tracker.subscribe(subFn);
    tracker.set(TestStatuses.world);

    tracker.unsubscribe(id);
    tracker.set(TestStatuses.hello);

    expect(subFn).toHaveBeenCalledTimes(1);
    expect(subFn).toBeCalledWith(TestStatuses.world);
  });

  it("will allow one to await a specific status", async () => {
    const startTime = Date.now();
    setTimeout(() => {
      tracker.set(TestStatuses.world);
    }, 500);

    await tracker.await(TestStatuses.world);

    expect(Date.now()).toBeGreaterThanOrEqual(startTime + 500);
  });

  it("will throw a timeout error if waiting too long", async () => {
    await expect(() =>
      tracker.await(TestStatuses.world),
    ).rejects.toBeInstanceOf(Error);
  });
});
