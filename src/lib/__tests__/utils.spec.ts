import { describe, it, expect } from 'vitest'
import { formatDate } from '../utils'

describe('formatDate', () => {
  it('formats an ISO date string as a localized date', () => {
    expect(formatDate('2026-07-26T10:00:00.000Z')).toBe(
      new Date('2026-07-26T10:00:00.000Z').toLocaleDateString(),
    )
  })

  it('returns a placeholder when the date is missing', () => {
    expect(formatDate(undefined)).toBe('—')
  })
})
