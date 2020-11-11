import { Definition } from "../definitions";

type Members = {
  [key: string]: Atom;
};

type Atom = {
  type: string;
};

type SimpleArray = {
  type: string;
  elements: Atom[];
};

type SimpleObject = {
  type: string;
  members: Members;
};

type SimpleDefinition = SimpleArray | SimpleObject;

const treeToList = (definition: Definition): SimpleDefinition[] => {
  return [
    {
      type: "T0",
      members: {
        foo: { type: "string" },
        baz: { type: "T1" },
      },
    },
    {
      type: "T1",
      elements: [
        { type: "number" },
        { type: "number" },
        { type: "number" },
        { type: "T2" },
      ],
    },
    {
      type: "T2",
      members: {
        1: { type: "T3" },
        quux: { type: "null" },
        true: { type: "boolean" },
      },
    },
    {
      type: "T3",
      members: {
        false: { type: "T4" },
      },
    },
    {
      type: "T4",
      elements: [],
    },
  ];
};

const toStringObject = (simpleObject: SimpleObject): string => {
  const typeName = simpleObject.type;
  const members = Object.keys(simpleObject.members).map((name) => {
    const value = simpleObject.members[name];
    return `${name}: ${value.type};`;
  });
  const delimiter = "\n  ";
  const membersString = `{${delimiter}${members.join(delimiter)}\n};`;
  const template = `type ${typeName} = ${membersString}`;
  return template;
};

const toStringArray = (simpleArray: SimpleArray): string => {
  const typeName = simpleArray.type;
  const elements = simpleArray.elements.map((x) => {
    return x.type;
  });
  const elementsString = `[${elements.join(", ")}];`;
  const template = `type ${typeName} = ${elementsString}`;
  return template;
};

const toString = (simpleDefinition: SimpleDefinition): string => {
  const isObject = "members" in simpleDefinition;
  let defString = "";
  if (isObject) {
    defString = toStringObject(simpleDefinition as SimpleObject);
  } else {
    defString = toStringArray(simpleDefinition as SimpleArray);
  }
  return defString;
};

export const getTypesFromDefinition = (definition: Definition): string => {
  const list = treeToList(definition);
  const definitions = list.map(toString);
  return definitions.join("\n\n") + "\n";
};
