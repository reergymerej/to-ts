import {
  getTypesFromDefinition,
  SimpleDefinition,
  SimpleObject,
  treeToList,
  SimpleArray,
} from ".";
import { Definition, getTypeDefinition } from "../definitions";

const definition: Definition = {
  type: "object",
  name: "Root",
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

const typesString = `export type Root = {
  foo: string;
  baz: T1;
};

type T1 = (number | T2)[];

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

describe("arrays", () => {
  describe("arrays instead of tuples", () => {
    it("should return an untyped array for empties", () => {
      const definition: Definition = {
        type: "array",
        name: "Root",
        elements: [],
      };
      const expected = `export type Root = [];\n`;
      const actual = getTypesFromDefinition(definition);
      expect(actual).toEqual(expected);
    });

    it("should work for simple arrays", () => {
      const definition: Definition = {
        type: "array",
        name: "Root",
        elements: [{ type: "number" }],
      };
      const expected = `export type Root = (number)[];\n`;
      const actual = getTypesFromDefinition(definition);
      expect(actual).toEqual(expected);
    });

    it("should work de-dupe entries in the union", () => {
      const definition: Definition = {
        type: "array",
        name: "Root",
        elements: [
          { type: "number" },
          { type: "number" },
          { type: "number" },
          { type: "number" },
        ],
      };
      const expected = `export type Root = (number)[];\n`;
      const actual = getTypesFromDefinition(definition);
      expect(actual).toEqual(expected);
    });

    it("should work for arrays with types", () => {
      const definition: Definition = {
        type: "array",
        name: "Root",
        elements: [
          { type: "number" },
          {
            type: "object",
            name: "T1",
            members: {
              fish: { type: "boolean" },
            },
          },
        ],
      };
      const expected = `export type Root = (number | T1)[];

type T1 = {
  fish: boolean;
};\n`;

      const actual = getTypesFromDefinition(definition);
      expect(actual).toEqual(expected);
    });
  });
});

describe("tuples", () => {
  it("should come out with the correct types", () => {
    const definition: Definition = getTypeDefinition({
      tuple: [
        1,
        [true, false],
        {
          color: "green",
        },
      ],
    });

    const actual = getTypesFromDefinition(definition);
    const expected = `export type Root = {
  tuple: Tuple;
};

type Tuple = (number | T | T2)[];

type T2 = {
  color: string;
};

type T = (boolean)[];
`;
    expect(actual).toBe(expected);
  });
});

fdescribe("areSameType", () => {
  const isSimpleObject = (def: SimpleDefinition): def is SimpleObject =>
    (def as SimpleObject).members !== undefined;

  const isSimpleArray = (def: SimpleDefinition): def is SimpleArray =>
    (def as SimpleArray).elements !== undefined;

  type MemberMap = { [memberName: string]: string };
  const getMemberMap = (def: SimpleObject): MemberMap => {
    return Object.keys(def.members).reduce((acc, memberName) => {
      const member = def.members[memberName];
      return {
        ...acc,
        [memberName]: member.type,
      };
    }, {});
  };

  const sameMembers = (a: MemberMap, b: MemberMap): boolean => {
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    if (aKeys.length !== bKeys.length) {
      return false;
    }
    let result = true;
    let aKey = aKeys.pop();
    while (aKey) {
      const index = bKeys.indexOf(aKey);
      if (index === -1) {
        result = false;
        break;
      }
      bKeys.splice(index, 1);
      aKey = aKeys.pop();
    }
    console.log(aKeys, bKeys);

    return result;
  };

  const areSameTypeOfObject = (a: SimpleObject, b: SimpleObject): boolean => {
    const aMembers = getMemberMap(a);
    const bMembers = getMemberMap(b);
    return sameMembers(aMembers, bMembers);
  };

  const areSameTypeOfArray = (a: SimpleArray, b: SimpleArray): boolean => {
    return false;
  };

  const areSameType = (a: SimpleDefinition, b: SimpleDefinition): boolean => {
    // a and b ar the same base type (SimpleArray/SimpleObject)
    if (isSimpleObject(a) && isSimpleObject(b)) {
      return areSameTypeOfObject(a, b);
    } else if (isSimpleArray(a) && isSimpleArray(b)) {
      return areSameTypeOfArray(a, b);
    }
    return false;
  };

  describe("when the basic types are different", () => {
    it("should not identify them as the same type", () => {
      const a = {
        type: "Numbers",
        elements: [{ type: "number" }, { type: "number" }, { type: "number" }],
      };
      const b = {
        type: "Sammy",
        members: { eyes: { type: "string" }, age: { type: "number" } },
      };
      expect(areSameType(a, b)).toBe(false);
    });
  });

  describe("when types have the same members", () => {
    it("should identify them as the same type", () => {
      // const def: Definition = getTypeDefinition({
      //   sammy: {
      //     eyes: "blue",
      //     age: 7,
      //   },
      //   jemma: {
      //     eyes: "brown",
      //     age: 5,
      //   },
      // });
      // const list: SimpleDefinition[] = treeToList(def);
      const a = {
        type: "Jemma",
        members: { eyes: { type: "string" }, age: { type: "number" } },
      };
      const b = {
        type: "Sammy",
        members: { eyes: { type: "string" }, age: { type: "number" } },
      };
      expect(areSameType(a, b)).toBe(true);
    });
  });

  describe("when one has more members", () => {
    it("should not identify them as the same type", () => {
      const a = {
        type: "Jemma",
        members: { eyes: { type: "string" }, age: { type: "number" } },
      };
      const b = {
        type: "Fynn",
        members: {
          eyes: { type: "string" },
          age: { type: "number" },
          smell: { type: "string" },
        },
      };
      expect(areSameType(a, b)).toBe(false);
    });
  });

  fdescribe("when the sub-types don't match", () => {
    it("should not identify them as the same type", () => {
      const a = {
        type: "Jemma",
        members: { eyes: { type: "string" }, age: { type: "number" } },
      };
      const b = {
        type: "Fynn",
        members: {
          eyes: { type: "string" },
          age: { type: "string" },
        },
      };
      expect(areSameType(a, b)).toBe(false);
    });
  });

  describe("when types different members", () => {
    it("should not identify them as the same type", () => {
      const a = {
        type: "Jemma",
        members: { eyes: { type: "string" }, age: { type: "number" } },
      };
      const b = {
        type: "Fynn",
        members: { eyes: { type: "string" }, smell: { type: "string" } },
      };
      expect(areSameType(a, b)).toBe(false);
    });
  });
});
