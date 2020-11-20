import {
  getTypeDefintionForValue,
  TypeDefintion,
  getTypeDefinitonForObject,
  getTypeDefinitionForArray,
  ArrayValue,
  ObjectTypeDefinition,
  ArrayTypeDefinition,
  reset,
  getTypeDefinition,
} from ".";
import namesFixture from "../../fixtures/names.json";

beforeEach(() => {
  reset();
});

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

describe("getTypeDefinitonForObject", () => {
  it("should handle flat objects", () => {
    const value = {
      a: "apple",
      b: false,
      c: true,
      d: 999,
      e: null,
    };
    const actual = getTypeDefinitonForObject(value);
    const expected: ObjectTypeDefinition = {
      type: "object",
      name: "Root",
      members: {
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
      },
    };
    expect(actual).toEqual(expected);
  });

  it("should handle deep objects", () => {
    const value = {
      a: {
        b: "castle",
        c: [1],
      },
    };
    const actual = getTypeDefinitonForObject(value);
    const expected: ObjectTypeDefinition = {
      type: "object",
      name: "Root",
      members: {
        a: {
          type: "object",
          name: "A1",
          members: {
            b: {
              type: "string",
            },
            c: {
              type: "array",
              name: "T2",
              elements: [
                {
                  type: "number",
                },
              ],
            },
          },
        },
      },
    };
    expect(actual).toEqual(expected);
  });
});

describe("getTypeDefinitionForArray", () => {
  it("should handle simple values", () => {
    const value = [1, "two"];
    const actual = getTypeDefinitionForArray(value);
    const expected: ArrayTypeDefinition = {
      type: "array",
      name: "Root",
      elements: [
        {
          type: "number",
        },
        {
          type: "string",
        },
      ],
    };
    expect(actual).toEqual(expected);
  });

  it("should handle empty lists", () => {
    const value = [];
    const actual = getTypeDefinitionForArray(value);
    const expected: ArrayTypeDefinition = {
      type: "array",
      name: "Root",
      elements: [],
    };
    expect(actual).toEqual(expected);
  });

  it("should handle nested values", () => {
    const value = [1, ["two"], { x: false }] as ArrayValue;
    const actual = getTypeDefinitionForArray(value);
    const expected: ArrayTypeDefinition = {
      type: "array",
      name: "Root",
      elements: [
        {
          type: "number",
        },
        {
          type: "array",
          name: "T1",
          elements: [
            {
              type: "string",
            },
          ],
        },
        {
          type: "object",
          name: "T2",
          members: {
            x: {
              type: "boolean",
            },
          },
        },
      ],
    };
    expect(actual).toEqual(expected);
  });
});

describe("type names", () => {
  describe("root type", () => {
    it("should be Root", () => {
      const result = getTypeDefinition(namesFixture) as ObjectTypeDefinition;
      expect(result.name).toBe("Root");
    });
  });

  describe("members", () => {
    it("should attempt to match the name of the filed", () => {
      const result = getTypeDefinition(namesFixture) as ObjectTypeDefinition;
      const personMember = result.members.person as ObjectTypeDefinition;
      expect(personMember.name).toBe("Person1");
    });
  });
});
