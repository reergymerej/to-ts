export const getOverlapAmount = (
  intersectionCount: number,
  unionSize: number
): number => intersectionCount / unionSize

const getIntersection = <T>(setA: Set<T>, setB: Set<T>): Set<T> => {
  const intersection = new Set<T>()
  for (const elem of Array.from(setB.values())) {
    if (setA.has(elem)) {
      intersection.add(elem)
    }
  }
  return intersection
}

const getUnion = <T>(setA: Set<T>, setB: Set<T>): Set<T> => {
  const union = new Set<T>(setA)
  for (const elem of Array.from(setB.values())) {
    union.add(elem)
  }
  return union
}

type WithKeys = { [key: string]: any };

export const objectsHaveSameFieldLabels = (
  a: WithKeys,
  b: WithKeys
): boolean => {
  const aFields = new Set(Object.keys(a))
  const bFields = new Set(Object.keys(b))
  const intersection = getIntersection<string>(aFields, bFields)
  const union = getUnion(aFields, bFields)
  const overlapAmount = getOverlapAmount(intersection.size, union.size)
  return overlapAmount === 1
}

type Predicate = (a: any, b: any) => boolean;

type ObjectsHaveSameFieldValues = (
  a: WithKeys,
  b: WithKeys,
  areValuesEqual?: Predicate
) => boolean;

export const objectsHaveSameFieldValues: ObjectsHaveSameFieldValues = (
  a,
  b,
  areValuesEqual = (a, b) => a === b
) => {
  if (!objectsHaveSameFieldLabels(a, b)) {
    return false
  }

  let result = true

  for (const [key, aValue] of Object.entries(a)) {
    const bValue = b[key]
    if (!areValuesEqual(aValue, bValue)) {
      result = false
      break
    }
  }

  return result
}
