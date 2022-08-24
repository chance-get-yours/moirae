export const describeIf = (test: () => boolean) =>
  test() ? describe : describe.skip;
