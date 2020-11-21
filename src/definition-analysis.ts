import { SimpleDefinition, SimpleObject, SimpleArray } from "./get-types";
import { objectsHaveSameFieldValues } from "./overlap";

export const isSimpleObject = (def: SimpleDefinition): def is SimpleObject =>
  (def as SimpleObject).members !== undefined;

export const isSimpleArray = (def: SimpleDefinition): def is SimpleArray =>
  (def as SimpleArray).elements !== undefined;

const memberTypePredicate = (
  a: SimpleObject["members"],
  b: SimpleObject["members"]
): boolean => {
  return a.type === b.type;
};

const areSimilarObjects = (a: SimpleObject, b: SimpleObject): boolean => {
  const haveSameMembers = objectsHaveSameFieldValues(
    a.members,
    b.members,
    memberTypePredicate
  );
  return haveSameMembers;
};

export const areSimilarDefinition = (
  a: SimpleDefinition,
  b: SimpleDefinition
): boolean => {
  if (isSimpleObject(a) && isSimpleObject(b)) {
    return areSimilarObjects(a, b);
  }
  return false;
};
