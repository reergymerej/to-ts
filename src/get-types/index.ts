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

export type SimpleDefinition = SimpleArray | SimpleObject;

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

const search = (nextNode: any) => (root: any, visit: (arg0: any) => void) => {
  let nodesToVisit = [root];
  while (nodesToVisit.length) {
    const node = nextNode(nodesToVisit);
    visit(node);
    if (node.elements) {
      nodesToVisit = nodesToVisit.concat(node.elements);
    } else if (node.members) {
      nodesToVisit = nodesToVisit.concat(
        Object.keys(node.members).map((key) => {
          return node.members[key];
        })
      );
    }
  }
};

const dfs = search((list: []) => list.pop());

export const treeToList = (definition: Definition): SimpleDefinition[] => {
  // For each type: object|array, convert and add to list
  const listItems: SimpleDefinition[] = [];
  const visit = (node: Definition) => {
    if (node.type === "object" || node.type === "array") {
      const listItem = treeNodeToListItem(node)
      listItems.push(listItem);
    }
  };
  dfs(definition, visit);
  return listItems;
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

const getUnionString = (elements: string[]): string => {
  if (elements.length) {
    const unique = elements.filter((x, i, all) => all.indexOf(x) === i)
    return `(${unique.join(" | ")})`
  }
  return ''
}

const toStringArray = (simpleArray: SimpleArray, parentTypeName: string): string => {
  const typeName = simpleArray.type;
  const elements = simpleArray.elements.map((element) => {
    if (element.type === 'array') {
      return parentTypeName
    }
    return element.type;
  });
  const unionString = getUnionString(elements)
  const elementsString = `${unionString}[];`;
  const template = `type ${typeName} = ${elementsString}`;
  return template;
};

const toString = (simpleDefinition: SimpleDefinition): string => {
  const isObject = "members" in simpleDefinition;
  let defString = "";
  if (isObject) {
    defString = toStringObject(simpleDefinition as SimpleObject);
  } else {
    defString = toStringArray(simpleDefinition as SimpleArray, simpleDefinition.type);
  }
  return defString;
};

const hashSimpleDef = (def: SimpleDefinition): string => {
  if ('members' in def) {
    return `{members:${JSON.stringify(def.members)}}`
  }
  return `{elements:${JSON.stringify(def.elements)}}`
}

const areEqual = (a: SimpleDefinition, b: SimpleDefinition): boolean => {
  return hashSimpleDef(a) === hashSimpleDef(b)
}

export type ReplacementMap = {
  [oldType: string]: string // new type
}

export const dedupe = (definitions: SimpleDefinition[]): {
  deduped: SimpleDefinition[],
  replacementMap: ReplacementMap,
} => {
  // Use queues so we can remove the items during the loop without goofing up
  // indices.
  const queue = [...definitions]
  let a = queue.shift()
  const dedupedList: SimpleDefinition[] = []
  const replacementMap: ReplacementMap = {}

  while (a) {
    const [...remainder] = queue
    const dupes: SimpleDefinition[] = []

    let b = remainder.shift()
    while (b) {
      if (areEqual(a, b)) {
        dupes.push(b)
      }
      b = remainder.shift()
    }

    dedupedList.push(a)
    dupes.forEach(dupe => {
      const index = queue.indexOf(dupe)
      if (a) {
        replacementMap[dupe.type] = a.type
      }
      queue.splice(index, 1)
    })

    a = queue.shift()
  }

  return {
    deduped: dedupedList,
    replacementMap,
  }
}

const isObjectType = (def: SimpleDefinition): def is SimpleObject => {
  return (def as SimpleObject).members !== undefined
}

const isArrayType = (def: SimpleDefinition): def is SimpleArray => {
  return (def as SimpleArray).elements !== undefined
}

type ObjectIterator = (key: string, member: Atom) => void

const iterateObject = (simpleObject: SimpleObject, fn: ObjectIterator): void => {
  Object.keys((simpleObject as SimpleObject).members).forEach(key => {
    const value = simpleObject.members[key]
    fn(key, value)
  })
}

const replaceTypes = (replacementMap: ReplacementMap) =>
(def: SimpleDefinition): SimpleDefinition => {
  if (isObjectType(def)) {
    iterateObject(def, (key, member) => {
      replaceTypes(member)
    })

  } else if (isArrayType(def)) {
    // return def
    throw new Error('handle array')
  }

  def.type = replacementMap[def.type] || def.type
  return def
}

export const updateReplacments = (
  definitions: SimpleDefinition[],
  replacementMap: ReplacementMap
): SimpleDefinition[] => {
  console.log(replacementMap)
  return definitions.map(replaceTypes(replacementMap))
}

export const getTypesFromDefinition = (definition: Definition): string => {
  const list = treeToList(definition);
  const { replacementMap, deduped } = dedupe(list)
  const withReplacedTypes: SimpleDefinition[] = updateReplacments(deduped, replacementMap)
  const definitions = withReplacedTypes.map(toString);
  const prefix = 'export '
  return `${prefix}${definitions.join("\n\n")}\n`;
};
