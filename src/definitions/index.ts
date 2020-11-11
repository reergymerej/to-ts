type ValueType = "plain" | "object" | "array";
type Element = TypeDefintion | ArrayTypeDefinition | ObjectTypeDefinition;
type Value = string | number | boolean | null;
type ObjectValue = {
  [key: string]: ArrayValue | ObjectValue | Value | ArrayValue;
};

export type ArrayValue = unknown[] | ArrayValue[] | Value[] | ObjectValue[];

export type TypeDefintion = {
  type: "string" | "number" | "boolean" | "null";
};
export type Definition =
  | TypeDefintion
  | ArrayTypeDefinition
  | ObjectTypeDefinition;
export type ArrayTypeDefinition = {
  type: "array";
  name: string;
  elements: Element[];
};

export type ObjectTypeDefinition = {
  type: "object";
  name: string;
  members: {
    [key: string]: Element;
  };
};

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

let definitions = 0;
const getName = (): string => {
  return `T${definitions++}`;
};

export const reset = (): void => {
  definitions = 0;
  return;
};

export const getTypeDefinitonForObject = (
  objectValue: ObjectValue
): ObjectTypeDefinition => {
  return {
    type: "object",
    name: getName(),
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

export const getTypeDefinition = (
  value: Value | ObjectValue | ArrayValue
): Definition => {
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
    name: getName(),
    elements: (arrayValue as []).map(getTypeDefinition),
  };
};
