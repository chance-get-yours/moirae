import { Queue } from "./queue.class";

describe("Queue", () => {
  let queue: Queue;

  beforeEach(() => {
    queue = new Queue();
  });

  it("will add items to the queue in order", () => {
    expect(queue.size).toEqual(0);

    queue.enqueue("hello world");

    expect(queue.size).toEqual(1);
  });

  it("will remove items from the queue in order", () => {
    expect(queue.size).toEqual(0);

    const values = [1, 2, 3, 4, 5, 6, 7];

    values.forEach((v) => queue.enqueue(v));

    values.forEach((v) => {
      expect(queue.dequeue()).toEqual(v);
    });

    expect(queue.size).toEqual(0);
  });

  it("will clear the queue", () => {
    const values = [1, 2, 3, 4, 5, 6, 7];

    values.forEach((v) => queue.enqueue(v));

    queue.clear();

    expect(queue.size).toEqual(0);
  });
});
