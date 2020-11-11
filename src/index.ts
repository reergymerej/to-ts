type ValueType = "plain" | "object" | "array";

const getValueType = (value: Value | ObjectValue | ArrayValue): ValueType => {
  const type = typeof value;
  switch (type) {
    case "string":
    case "number":
    case "boolean":
      return "plain";
  }
  if (value === null) {
    return "plain";
  }
  if (Array.isArray(value)) {
    return "array";
  }
  return "object";
};

export type TypeDefintion = {
  type: "string" | "number" | "boolean" | "null";
};

type Value = string | number | boolean | null;

const getType = (value: Value): TypeDefintion["type"] => {
  const type = typeof value;
  switch (type) {
    case "string":
    case "number":
    case "boolean":
      return type;
    case "object":
      if (value === null) {
        return "null";
      }
      throw new Error("this is not a simple object");
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
  [key: string]: ObjectValue | Value;
};

export type ObjectTypes = {
  [key: string]: TypeDefintion;
};

export const getTypeDefinitonForObject = (
  objectValue: ObjectValue
): ObjectTypes => {
  return Object.keys(objectValue).reduce((acc, key) => {
    const value = objectValue[key];
    try {
      const typeDefinition = getTypeDefintionForValue(value as Value);
      return {
        ...acc,
        [key]: typeDefinition,
      };
    } catch {
      const typeDefinition = getTypeDefinitonForObject(
        (value as unknown) as ObjectValue
      );
      return {
        ...acc,
        [key]: {
          type: "TODO-find-a-name",
          members: typeDefinition,
        },
      };
    }
  }, {});
};

export type ArrayValue = Value[] | ObjectValue[];

export type ArrayType = {
  type: "array";
  elements: ObjectValue | Value;
};

const getTypeDefinition = (value: Value | ObjectValue | ArrayValue): any => {
  const valueType = getValueType(value);
  switch (valueType) {
    case "plain":
      return getTypeDefintionForValue(value as Value);
    case "array":
      return getTypeDefinitionForArray(value as ArrayValue);
    case "object":
      return getTypeDefinitonForObject(value as ObjectValue);
    default:
      throw new Error(`unhandled case "${valueType}"`);
  }
};

export const getTypeDefinitionForArray = (arrayValue: ArrayValue): any => {
  return {
    type: "array",
    elements: (arrayValue as []).map(getTypeDefinition),
  };
};
