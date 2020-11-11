import {
  Definition,
  ArrayTypeDefinition,
  ObjectTypeDefinition,
} from "../definitions";

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

const treeNodeToListItem = (
  definition: ArrayTypeDefinition | ObjectTypeDefinition
): SimpleDefinition => {
  if ("elements" in definition) {
    return {
      type: definition.name,
      elements: definition.elements.map((x) => {
        if (x.type === "object") {
          return {
            type: x.name,
          };
        }
        return {
          type: x.type,
        };
      }),
    };
  } else if ("members" in definition) {
    const members = Object.keys(definition.members).reduce((acc, key) => {
      const value = definition.members[key];
      const listItem =
        value.type === "object" || value.type === "array"
          ? treeNodeToListItem(value)
          : { type: value.type };
      return {
        ...acc,
        [key]: listItem,
      };
    }, {});
    return {
      type: definition.name,
      members,
    };
  }

  throw new Error("This should only get objects or arrays.");
};

const treeToList = (definition: Definition): SimpleDefinition[] => {
  return [
    {
      type: "T0",
      members: {
        foo: { type: "string" },
        baz: { type: "T1" },
      },
    },
    treeNodeToListItem({
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
    }),
    treeNodeToListItem({
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
    }),
    treeNodeToListItem({
      type: "object",
      name: "T3",
      members: {
        false: {
          type: "array",
          name: "T4",
          elements: [],
        },
      },
    }),
    treeNodeToListItem({
      type: "array",
      name: "T4",
      elements: [],
    }),
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
