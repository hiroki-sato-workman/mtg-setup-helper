import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { formatDate, formatDateShort, getTodayDate, formatIcsDate } from '../dateUtils'

describe('dateUtils', () => {
  describe('formatDate', () => {
    it('should format date string to Japanese locale format', () => {
      const result = formatDate('2024-01-15')
      expect(result).toMatch(/2024.*1.*15.*月/)
    })

    it('should return empty string for empty input', () => {
      expect(formatDate('')).toBe('')
    })

    it('should handle different date formats', () => {
      const result = formatDate('2024-12-25')
      expect(result).toMatch(/2024.*12.*25/)
    })
  })

  describe('formatDateShort', () => {
    it('should format date string to short Japanese locale format', () => {
      const result = formatDateShort('2024-01-15')
      expect(result).toMatch(/1.*15.*月/)
      expect(result).not.toMatch(/2024/)
    })

    it('should return empty string for empty input', () => {
      expect(formatDateShort('')).toBe('')
    })

    it('should handle different months', () => {
      const result = formatDateShort('2024-12-31')
      expect(result).toMatch(/12.*31/)
    })
  })

  describe('getTodayDate', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should return today date in YYYY-MM-DD format', () => {
      const mockDate = new Date('2024-01-15T10:30:00Z')
      vi.setSystemTime(mockDate)

      const result = getTodayDate()
      expect(result).toBe('2024-01-15')
    })

    it('should handle different dates', () => {
      const mockDate = new Date('2024-12-31T23:59:59Z')
      vi.setSystemTime(mockDate)

      const result = getTodayDate()
      expect(result).toBe('2024-12-31')
    })
  })

  describe('formatIcsDate', () => {
    it('should format Date object to ICS format', () => {
      const date = new Date('2024-01-15T10:30:00Z')
      const result = formatIcsDate(date)
      expect(result).toBe('20240115T103000Z')
    })

    it('should handle different times', () => {
      const date = new Date('2024-12-31T23:59:59Z')
      const result = formatIcsDate(date)
      expect(result).toBe('20241231T235959Z')
    })

    it('should handle midnight', () => {
      const date = new Date('2024-01-01T00:00:00Z')
      const result = formatIcsDate(date)
      expect(result).toBe('20240101T000000Z')
    })
  })
})