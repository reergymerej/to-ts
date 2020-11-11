import { getTypeDefintionForValue, TypeDefintion, getTypesForObject } from ".";

describe("getTypeDefintionForValue", () => {
  it("should return the type for `string`", () => {
    const value = "Prodigy";
    const actual = getTypeDefintionForValue(value);
    const expected: TypeDefintion = {
      type: "string",
    };
    expect(actual).toEqual(expected);
  });

  it("should return the type for `number`", () => {
    const value = 666;
    const actual = getTypeDefintionForValue(value);
    const expected: TypeDefintion = {
      type: "number",
    };
    expect(actual).toEqual(expected);
  });

  it("should return the type for `true`", () => {
    const value = true;
    const actual = getTypeDefintionForValue(value);
    const expected: TypeDefintion = {
      type: "boolean",
    };
    expect(actual).toEqual(expected);
  });

  it("should return the type for `false`", () => {
    const value = false;
    const actual = getTypeDefintionForValue(value);
    const expected: TypeDefintion = {
      type: "boolean",
    };
    expect(actual).toEqual(expected);
  });

  it("should return the type for `null`", () => {
    const value = null;
    const actual = getTypeDefintionForValue(value);
    const expected: TypeDefintion = {
      type: "null",
    };
    expect(actual).toEqual(expected);
  });

  describe("complex types", () => {
    it("should throw for arrays", () => {
      expect(() => {
        getTypeDefintionForValue([] as any);
      }).toThrow(/not a simple object/);
    });

    it("should throw for {}", () => {
      expect(() => {
        getTypeDefintionForValue({} as any);
      }).toThrow(/not a simple object/);
    });
  });
});

describe("getTypesForObject", () => {
  it("should handle flat objects", () => {
    const value = {
      a: "apple",
      b: false,
      c: true,
      d: 999,
      e: null,
    };
    const actual = getTypesForObject(value);
    const expected = {
      a: {
        type: "string",
      },
      b: {
        type: "boolean",
      },
      c: {
        type: "boolean",
      },
      d: {
        type: "number",
      },
      e: {
        type: "null",
      },
    };
    expect(actual).toEqual(expected);
  });
});
