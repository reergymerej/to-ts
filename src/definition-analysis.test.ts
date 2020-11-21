import { SimpleDefinition, SimpleObject, SimpleArray } from "./get-types";
import {
  areSimilarDefinition,
  isSimpleObject,
  isSimpleArray,
} from "./definition-analysis";

describe("areSameType", () => {
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

  describe("when the sub-types don't match", () => {
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

describe("areSimilarDefinition", () => {
  describe("for SimpleObject", () => {
    describe("when all member types match", () => {
      it("should return true", () => {
        const a: SimpleDefinition = {
          type: "Jemma",
          members: { eyes: { type: "string" }, age: { type: "number" } },
        };
        const b: SimpleDefinition = {
          type: "Sammy",
          members: { eyes: { type: "string" }, age: { type: "number" } },
        };
        const actual = areSimilarDefinition(a, b);
        expect(actual).toBe(true);
      });
    });

    describe("when half member types match", () => {
      it("should return false", () => {
        const a: SimpleDefinition = {
          type: "Jemma",
          members: { eyes: { type: "string" }, age: { type: "number" } },
        };
        const b: SimpleDefinition = {
          type: "Sammy",
          members: { eyes: { type: "string" }, age: { type: "string" } },
        };
        const actual = areSimilarDefinition(a, b);
        expect(actual).toBe(false);
      });
    });

    fdescribe("when there are extra members", () => {
      it("should return false", () => {
        // Later, we can deal with supersets and revisit this.  For now, just
        // deal with exact matches.
        const a: SimpleDefinition = {
          type: "Jemma",
          members: { eyes: { type: "string" }, age: { type: "number" } },
        };
        const b: SimpleDefinition = {
          type: "Sammy",
          members: {
            eyes: { type: "string" },
            age: { type: "number" },
            hair: { type: "string" },
          },
        };
        const actual = areSimilarDefinition(a, b);
        expect(actual).toBe(false);
      });
    });
  });
});
