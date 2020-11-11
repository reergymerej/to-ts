export type TypeDefintion = {
  type: "string" | "number" | "boolean" | "null";
};

type Value = string | number | boolean | null;

const getTypeFromObject = (value: Value): TypeDefintion["type"] => {
  if (value === null) {
    return "null";
  }
  throw new Error("this is not a simple object");
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

export const getTypeDefintionForValue = (value: Value): TypeDefintion => {
  return {
    type: getType(value),
  };
};

type ObjectValue = {
  [key: string]: Value;
};

export type ObjectTypes = {
  [key: string]: TypeDefintion;
};

export const getTypesForObject = (objectValue: ObjectValue): ObjectTypes => {
  return Object.keys(objectValue).reduce((acc, key) => {
    return {
      ...acc,
      [key]: getTypeDefintionForValue(objectValue[key]),
    };
  }, {});
};
