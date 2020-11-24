import {
  objectsHaveSameFieldLabels,
  getOverlapAmount,
  objectsHaveSameFieldValues,
} from '.'

describe('getOverlapAmount', () => {
  test.each([
    [0, 100, 0],
    [2, 5, 0.4],
    [6, 6, 1],
  ])('should return 0', (intersectionCount, unionSize, expected) => {
    const actual = getOverlapAmount(intersectionCount, unionSize)
    expect(actual).toBe(expected)
  })
})

describe('objectsHaveSameFieldLabels', () => {
  describe('when the field labels are the same', () => {
    it('should return true', () => {
      const a = { name: '' }
      const b = { name: '' }
      expect(objectsHaveSameFieldLabels(a, b)).toBe(true)
    })

    describe('when values are different', () => {
      it('should return true', () => {
        const a = { name: '' }
        const b = { name: 'different' }
        expect(objectsHaveSameFieldLabels(a, b)).toBe(true)
      })
    })
  })

  describe('when the field labels are not the same', () => {
    const a = { name: '' }
    const b = { horse: '' }
    it('should return false', () => {
      expect(objectsHaveSameFieldLabels(a, b)).toBe(false)
    })
  })

  describe('when there are unmatched field labels', () => {
    it('should return false', () => {
      const a = { name: '' }
      const b = { name: '', banana: '' }
      expect(objectsHaveSameFieldLabels(a, b)).toBe(false)
    })
  })

  describe('objectsHaveSameFieldValues', () => {
    describe('when there are different field labels', () => {
      it('should be false', () => {
        const a = { name: '' }
        const b = { glame: '' }
        expect(objectsHaveSameFieldValues(a, b)).toBe(false)
      })
    })

    describe('when the labels match', () => {
      describe('and the values match', () => {
        it('should be true', () => {
          const a = { boop: 'a' }
          const b = { boop: 'a' }
          expect(objectsHaveSameFieldValues(a, b)).toBe(true)
        })
      })

      describe('and the values do not match', () => {
        it('should be false', () => {
          const a = { boop: 'a' }
          const b = { boop: 'b' }
          expect(objectsHaveSameFieldValues(a, b)).toBe(false)
        })
      })

      describe('and the values do not match', () => {
        it('should be false', () => {
          const a = { boop: 'a' }
          const b = { boop: 'b' }
          expect(objectsHaveSameFieldValues(a, b)).toBe(false)
        })
      })

      describe('and the values match by custom matcher', () => {
        it('should be true', () => {
          const a = { boop: { type: 'banana' } }
          const b = { boop: { type: 'banana' } }
          const predicate = (a, b) => a.type === b.type
          expect(objectsHaveSameFieldValues(a, b, predicate)).toBe(true)
        })
      })
    })
  })
})
