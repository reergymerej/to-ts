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

type Element = TypeDefintion | ArrayTypeDefinition | ObjectTypeDefinition;

export type TypeDefintion = {
  type: "string" | "number" | "boolean" | "null";
};

export type ArrayTypeDefinition = {
  type: "array";
  elements: Element[];
};

export type ObjectTypeDefinition = {
  type: "TODO-find-a-name";
  members: {
    [key: string]: Element;
  };
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
  [key: string]: ArrayValue | ObjectValue | Value;
};

export const getTypeDefinitonForObject = (
  objectValue: ObjectValue
): ObjectTypeDefinition => {
  return {
    type: "TODO-find-a-name",
    members: Object.keys(objectValue).reduce((acc, key) => {
      const value = objectValue[key];
      const typeDefinition = getTypeDefinition(value);
      return {
        ...acc,
        [key]: typeDefinition,
      };
    }, {}),
  };
};

export type ArrayValue = Value[] | ObjectValue[];

const getTypeDefinition = (
  value: Value | ObjectValue | ArrayValue
): TypeDefintion | ArrayTypeDefinition | ObjectTypeDefinition => {
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

export const getTypeDefinitionForArray = (
  arrayValue: ArrayValue
): ArrayTypeDefinition => {
  return {
    type: "array",
    elements: (arrayValue as []).map(getTypeDefinition),
  };
};
