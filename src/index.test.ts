import * as mod from ".";

describe("getTypeDefintionForValue", () => {
  type TypeDefintion = {
    type: "string" | "number" | "boolean" | "null";
  };
  type Value = string | number | boolean | null;
  const getTypeFromObject = (value: Value): TypeDefintion["type"] => {
    if (value === null) {
      return "null";
    }
  };

  const getType = (value: Value): TypeDefintion["type"] => {
    const type = typeof value;
    switch (type) {
      case "string":
      case "number":
      case "boolean":
        return type;
      case "object":
        return getTypeFromObject(value);
      default:
        throw new Error(`unhandled case "${type}"`);
    }
  };

  const getTypeDefintionForValue = (value: Value): TypeDefintion => {
    return {
      type: getType(value),
    };
  };

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
});
