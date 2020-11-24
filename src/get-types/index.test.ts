import { getTypesFromDefinition } from '.'
import { Definition, getTypeDefinition } from '../definitions'

const definition: Definition = {
  type: 'object',
  name: 'Root',
  members: {
    foo: { type: 'string' },
    baz: {
      type: 'array',
      name: 'T1',
      elements: [
        { type: 'number' },
        { type: 'number' },
        { type: 'number' },
        {
          type: 'object',
          name: 'T2',
          members: {
            '1': {
              type: 'object',
              name: 'T3',
              members: {
                false: { type: 'array', name: 'T4', elements: [] },
              },
            },
            quux: { type: 'null' },
            true: { type: 'boolean' },
          },
        },
      ],
    },
  },
}

const typesString = `export type Root = {
  foo: string;
  baz: T1;
};

type T1 = (number | T2)[];

type T2 = {
  1: T3;
  quux: null;
  true: boolean;
};

type T3 = {
  false: T4;
};

type T4 = [];
`

describe('getTypesFromDefinition', () => {
  it('should return the types as a string', () => {
    const actual = getTypesFromDefinition(definition)
    const expected = typesString
    expect(actual).toBe(expected)
  })
})

describe('arrays', () => {
  describe('arrays instead of tuples', () => {
    it('should return an untyped array for empties', () => {
      const definition: Definition = {
        type: 'array',
        name: 'Root',
        elements: [],
      }
      const expected = 'export type Root = [];\n'
      const actual = getTypesFromDefinition(definition)
      expect(actual).toEqual(expected)
    })

    it('should work for simple arrays', () => {
      const definition: Definition = {
        type: 'array',
        name: 'Root',
        elements: [{ type: 'number' }],
      }
      const expected = 'export type Root = (number)[];\n'
      const actual = getTypesFromDefinition(definition)
      expect(actual).toEqual(expected)
    })

    it('should work de-dupe entries in the union', () => {
      const definition: Definition = {
        type: 'array',
        name: 'Root',
        elements: [
          { type: 'number' },
          { type: 'number' },
          { type: 'number' },
          { type: 'number' },
        ],
      }
      const expected = 'export type Root = (number)[];\n'
      const actual = getTypesFromDefinition(definition)
      expect(actual).toEqual(expected)
    })

    it('should work for arrays with types', () => {
      const definition: Definition = {
        type: 'array',
        name: 'Root',
        elements: [
          { type: 'number' },
          {
            type: 'object',
            name: 'T1',
            members: {
              fish: { type: 'boolean' },
            },
          },
        ],
      }
      const expected = `export type Root = (number | T1)[];

type T1 = {
  fish: boolean;
};\n`

      const actual = getTypesFromDefinition(definition)
      expect(actual).toEqual(expected)
    })
  })
})

describe('tuples', () => {
  it('should come out with the correct types', () => {
    const definition: Definition = getTypeDefinition({
      tuple: [
        1,
        [true, false],
        {
          color: 'green',
        },
      ],
    })

    const actual = getTypesFromDefinition(definition)
    const expected = `export type Root = {
  tuple: Tuple;
};

type Tuple = (number | T | T2)[];

type T2 = {
  color: string;
};

type T = (boolean)[];
`
    expect(actual).toBe(expected)
  })
})
