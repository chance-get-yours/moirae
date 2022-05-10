import { RegisterType } from "../decorators/register-type.decorator";
import { ResponseWrapper } from "./response.class";

@RegisterType()
class TestClass {
  public readonly hello: string;

  constructor() {
    this.hello = "world";
  }
}

@RegisterType()
class TestError extends Error {
  constructor() {
    super("Hello Error");
    this.name = this.constructor.name;
  }
}

function jsonify<T = unknown>(payload: T): T {
  return JSON.parse(JSON.stringify(payload));
}

describe("ResponseWrapper", () => {
  const primitives = [23, false, "hello"];

  describe("toPlain", () => {
    it.each(primitives)(
      "will function with a primitive payload (%s)",
      (payload) => {
        const responseClass = new ResponseWrapper(payload);
        expect(responseClass.payload).toEqual(payload);

        const output = responseClass.toPlain();

        expect(output).not.toBeInstanceOf(ResponseWrapper);
        expect(typeof output.payload).toEqual(typeof payload);
      },
    );

    it("will function with a primitive array payload", () => {
      const payload = [1, 2, 3, 4, 5, 6];
      const pubResponse = new ResponseWrapper(payload);

      expect(pubResponse.payload).toEqual(payload);

      const output = pubResponse.toPlain();

      expect(output).not.toBeInstanceOf(ResponseWrapper);
      expect(typeof output.payload).toEqual(typeof payload);
      payload.forEach((v, i) => {
        expect(v).toEqual(output.payload[i]);
      });
    });

    it("will function with a class payload", () => {
      const payload = new TestClass();
      const pubResponse = new ResponseWrapper(payload);

      expect(pubResponse.payload).toEqual(payload);

      const output = pubResponse.toPlain();

      expect(output).not.toBeInstanceOf(ResponseWrapper);
      expect(output.payload).toMatchObject(payload);
      expect(output.payload.constructor.name).not.toEqual(
        payload.constructor.name,
      );
    });

    it("will function with a class array payload", () => {
      const payload = [new TestClass()];
      const pubResponse = new ResponseWrapper(payload);

      expect(pubResponse.payload).toEqual(payload);

      const output = pubResponse.toPlain();

      expect(output).not.toBeInstanceOf(ResponseWrapper);
      expect(output.payload).toMatchObject(payload);
      payload.forEach((v, i) => {
        expect(output.payload[i].constructor.name).not.toEqual(
          v.constructor.name,
        );
      });
    });

    it("will function with an error payload", () => {
      const payload = new TestError();
      const pubResponse = new ResponseWrapper(payload);

      expect(pubResponse.payload).toEqual(payload);

      const output = pubResponse.toPlain();

      expect(output).not.toBeInstanceOf(ResponseWrapper);
      expect(output.payload).not.toMatchObject(payload);
      expect(output.payload.constructor.name).not.toEqual(
        payload.constructor.name,
      );
    });
  });

  describe("fromPlain", () => {
    it.each(primitives)(
      "will function with a primitive payload (%s)",
      (payload) => {
        const plain = new ResponseWrapper(payload).toPlain();
        const deserialized = jsonify(plain);

        const output = ResponseWrapper.fromPlain<typeof payload>(deserialized);

        expect(output).toBeInstanceOf(ResponseWrapper);
        expect(output.payload).toEqual(payload);
      },
    );

    it("will function with an array payload", () => {
      const payload = [1, 2, 3, 4, 5, 6, 7];
      const plain = new ResponseWrapper(payload).toPlain();
      const deserialized = jsonify(plain);

      const output = ResponseWrapper.fromPlain<typeof payload>(deserialized);

      expect(output).toBeInstanceOf(ResponseWrapper);
      expect(output.payload).toEqual(payload);
    });

    it("will function with a class payload", () => {
      const payload = new TestClass();

      const plain = new ResponseWrapper(payload).toPlain();
      const deserialized = jsonify(plain);

      const output = ResponseWrapper.fromPlain<typeof payload>(deserialized);

      expect(output).toBeInstanceOf(ResponseWrapper);
      expect(output.payload).toEqual(payload);
      expect(output.payload).toBeInstanceOf(TestClass);
    });

    it("will function with a class array payload", () => {
      const payload = [new TestClass()];

      const plain = new ResponseWrapper(payload).toPlain();
      const deserialized = jsonify(plain);

      const output = ResponseWrapper.fromPlain<typeof payload>(deserialized);

      expect(output).toBeInstanceOf(ResponseWrapper);
      expect(output.payload).toEqual(payload);
      expect(output.payload).toBeInstanceOf(Array);
      expect(output.payload[0]).toBeInstanceOf(TestClass);
    });

    it("will function with an error payload", () => {
      const payload = new TestError();

      const plain = new ResponseWrapper(payload).toPlain();
      const deserialized = jsonify(plain);

      const output = ResponseWrapper.fromPlain<typeof payload>(deserialized);

      expect(output).toBeInstanceOf(ResponseWrapper);
      expect(output.payload).toEqual(payload);
      expect(output.payload).toBeInstanceOf(TestError);
    });
  });
});
