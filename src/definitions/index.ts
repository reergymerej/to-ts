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

const capitalizeFirst = (x: string): string => {
  return `${x.charAt(0).toUpperCase()}${x.slice(1)}`;
};

let definitions = 0;
type DefinitionMap = { [name: string]: number };
let definitionMap: DefinitionMap = {
  Root: 1,
};

const getNextDefinitionName = (capitalized: string): string => {
  let count = definitionMap[capitalized] || 0;
  count++;
  definitionMap[capitalized] = count;
  if (count === 1) {
    return capitalized;
  }
  return `${capitalized}${count}`;
};

type GetName = (fieldName?: string) => string;
const getName: GetName = (fieldName = "T") => {
  const capitalized = capitalizeFirst(fieldName);
  if (definitions === 0) {
    definitions++;
    return "Root";
  }
  return getNextDefinitionName(capitalized);
};

export const reset = (): void => {
  definitions = 0;
  definitionMap = { Root: 1 };
  return;
};

type GetTypeDefinitonForObject = (
  objectValue: ObjectValue,
  scopeName?: string
) => ObjectTypeDefinition;

export const getTypeDefinitonForObject: GetTypeDefinitonForObject = (
  objectValue,
  scopeName
) => {
  return {
    type: "object",
    name: getName(scopeName),
    members: Object.keys(objectValue).reduce((acc, key) => {
      const value = objectValue[key];
      const typeDefinition = getTypeDefinition(value, key);
      return {
        ...acc,
        [key]: typeDefinition,
      };
    }, {}),
  };
};

type GetTypeDefinition = (
  value: Value | ObjectValue | ArrayValue,
  scopeName?: string
) => Definition;
export const getTypeDefinition: GetTypeDefinition = (value, scopeName) => {
  const valueType = getValueType(value);
  switch (valueType) {
    case "plain":
      return getTypeDefintionForValue(value as Value);
    case "array":
      return getTypeDefinitionForArray(value as ArrayValue, scopeName);
    case "object":
      return getTypeDefinitonForObject(value as ObjectValue, scopeName);
    default:
      throw new Error(`unhandled case "${valueType}"`);
  }
};

type GetTypeDefinitionForArray = (
  arrayValue: ArrayValue,
  scopeName?: string
) => ArrayTypeDefinition;
export const getTypeDefinitionForArray: GetTypeDefinitionForArray = (
  arrayValue,
  scopeName
) => {
  return {
    type: "array",
    name: getName(scopeName),
    elements: (arrayValue as []).map((x) => getTypeDefinition(x)),
  };
};
