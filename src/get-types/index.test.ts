import { getTypesFromDefinition } from ".";
import { Definition } from "../definitions";

const definition: Definition = {
  type: "object",
  name: "T0",
  members: {
    foo: { type: "string" },
    baz: {
      type: "array",
      name: "T1",
      elements: [
        { type: "number" },
        { type: "number" },
        { type: "number" },
        {
          type: "object",
          name: "T2",
          members: {
            "1": {
              type: "object",
              name: "T3",
              members: {
                false: { type: "array", name: "T4", elements: [] },
              },
            },
            quux: { type: "null" },
            true: { type: "boolean" },
          },
        },
      ],
    },
  },
};

const typesString = `type T0 = {
  foo: string;
  baz: T1;
};

type T1 = [number, number, number, T2];

type T2 = {
  1: T3;
  quux: null;
  true: boolean;
};

type T3 = {
  false: T4;
};

type T4 = [];
`;

describe("getTypesFromDefinition", () => {
  it("should return the types as a string", () => {
    const actual = getTypesFromDefinition(definition);
    const expected = typesString;
    expect(actual).toBe(expected);
  });
});
