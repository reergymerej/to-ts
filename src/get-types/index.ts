import {
  Definition,
  ArrayTypeDefinition,
  ObjectTypeDefinition,
} from '../definitions'

type Members = {
  [key: string]: Atom;
};

type Atom = {
  type: string;
};

export type SimpleArray = {
  type: string;
  elements: Atom[];
};

export type SimpleObject = {
  type: string;
  members: Members;
};

export type SimpleDefinition = SimpleArray | SimpleObject;

const treeNodeToListItem = (
  definition: ArrayTypeDefinition | ObjectTypeDefinition
): SimpleDefinition => {
  if ('elements' in definition) {
    // Array
    return {
      type: definition.name,
      elements: definition.elements.map((x) => {
        if (x.type === 'object') {
          return {
            type: x.name,
          }
        }
        if ('name' in x) {
          return {
            type: x.name,
          }
        }
        return {
          type: x.type,
        }
      }),
    }
  } else if ('members' in definition) {
    const members = Object.keys(definition.members).reduce((acc, key) => {
      const value = definition.members[key]
      const listItem =
        value.type === 'object' || value.type === 'array'
          ? treeNodeToListItem(value)
          : { type: value.type }
      return {
        ...acc,
        [key]: listItem,
      }
    }, {})
    return {
      type: definition.name,
      members,
    }
  }

  throw new Error('This should only get objects or arrays.')
}

const search = (nextNode: any) => (root: any, visit: (arg0: any) => void) => {
  let list = [root]
  while (list.length) {
    const node = nextNode(list)
    visit(node)
    if (node.elements) {
      list = list.concat(node.elements)
    } else if (node.members) {
      list = list.concat(
        Object.keys(node.members).map((key) => {
          return node.members[key]
        })
      )
    }
  }
}

const dfs = search((list: []) => list.pop())

export const treeToList = (definition: Definition): SimpleDefinition[] => {
  // For each type: object|array, convert and add to list
  // dfs
  const listItems: SimpleDefinition[] = []
  const visit = (node: Definition) => {
    if (node.type === 'object' || node.type === 'array') {
      const x = treeNodeToListItem(node)
      listItems.push(x)
    }
  }
  dfs(definition, visit)
  return listItems
}

const toStringObject = (simpleObject: SimpleObject): string => {
  const typeName = simpleObject.type
  const members = Object.keys(simpleObject.members).map((name) => {
    const value = simpleObject.members[name]
    return `${name}: ${value.type};`
  })
  const delimiter = '\n  '
  const membersString = `{${delimiter}${members.join(delimiter)}\n};`
  const template = `type ${typeName} = ${membersString}`
  return template
}

const getUnionString = (elements: string[]): string => {
  if (elements.length) {
    const unique = elements.filter((x, i, all) => all.indexOf(x) === i)
    return `(${unique.join(' | ')})`
  }
  return ''
}

const toStringArray = (
  simpleArray: SimpleArray,
  parentTypeName: string
): string => {
  const typeName = simpleArray.type
  const elements = simpleArray.elements.map((element) => {
    if (element.type === 'array') {
      return parentTypeName
    }
    return element.type
  })
  const unionString = getUnionString(elements)
  const elementsString = `${unionString}[];`
  const template = `type ${typeName} = ${elementsString}`
  return template
}

const toString = (simpleDefinition: SimpleDefinition): string => {
  const isObject = 'members' in simpleDefinition
  let defString = ''
  if (isObject) {
    defString = toStringObject(simpleDefinition as SimpleObject)
  } else {
    defString = toStringArray(
      simpleDefinition as SimpleArray,
      simpleDefinition.type
    )
  }
  return defString
}

export const getTypesFromDefinition = (definition: Definition): string => {
  const list = treeToList(definition)
  const definitions = list.map(toString)
  const prefix = 'export '
  return `${prefix}${definitions.join('\n\n')}\n`
}
