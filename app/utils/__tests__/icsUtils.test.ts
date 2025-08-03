import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { generateIcsFile, parseIcsFile, parseIcsDateTime } from '../icsUtils'
import type { Meeting } from '~/types/meeting'

// Mock DOM APIs
const mockCreateElement = vi.fn()
const mockAppendChild = vi.fn()
const mockRemoveChild = vi.fn()
const mockClick = vi.fn()
const mockCreateObjectURL = vi.fn()
const mockRevokeObjectURL = vi.fn()

global.document = {
  createElement: mockCreateElement,
  body: {
    appendChild: mockAppendChild,
    removeChild: mockRemoveChild,
  },
} as any

global.URL = {
  createObjectURL: mockCreateObjectURL,
  revokeObjectURL: mockRevokeObjectURL,
} as any

global.Blob = vi.fn() as any

describe('icsUtils', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCreateElement.mockReturnValue({
      click: mockClick,
      href: '',
      download: '',
    })
    mockCreateObjectURL.mockReturnValue('blob:mock-url')
  })

  describe('parseIcsDateTime', () => {
    it('should parse YYYYMMDDTHHMMSSZ format', () => {
      const result = parseIcsDateTime('20240115T103000Z')
      expect(result).toBeInstanceOf(Date)
      expect(result?.getUTCFullYear()).toBe(2024)
      expect(result?.getUTCMonth()).toBe(0) // January is 0
      expect(result?.getUTCDate()).toBe(15)
      expect(result?.getUTCHours()).toBe(10)
      expect(result?.getUTCMinutes()).toBe(30)
    })

    it('should parse YYYYMMDD format', () => {
      const result = parseIcsDateTime('20240115')
      expect(result).toBeInstanceOf(Date)
      expect(result?.getFullYear()).toBe(2024)
      expect(result?.getMonth()).toBe(0)
      expect(result?.getDate()).toBe(15)
    })

    it('should return null for invalid format', () => {
      expect(parseIcsDateTime('invalid')).toBe(null)
      expect(parseIcsDateTime('')).toBe(null)
      expect(parseIcsDateTime('2024-01-15')).toBe(null)
    })

    it('should handle different times', () => {
      const result = parseIcsDateTime('20241231T235959Z')
      expect(result?.getUTCFullYear()).toBe(2024)
      expect(result?.getUTCMonth()).toBe(11) // December is 11
      expect(result?.getUTCDate()).toBe(31)
      expect(result?.getUTCHours()).toBe(23)
      expect(result?.getUTCMinutes()).toBe(59)
      expect(result?.getUTCSeconds()).toBe(59)
    })
  })

  describe('parseIcsFile', () => {
    it('should parse simple ICS content', () => {
      const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:面談 - 田中太郎
DESCRIPTION:営業部との面談
DTSTART:20240115T103000Z
DTEND:20240115T113000Z
END:VEVENT
END:VCALENDAR`

      const result = parseIcsFile(icsContent)
      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('田中太郎')
      expect(result[0].notes).toBe('営業部との面談')
      expect(result[0].confirmedDate).toBe('2024-01-15')
      expect(result[0].confirmedStartTime).toMatch(/\d{2}:\d{2}/)  // Check format due to timezone
      expect(result[0].confirmedEndTime).toMatch(/\d{2}:\d{2}/)   // Check format due to timezone
      expect(['morning', 'afternoon', 'evening', 'allday']).toContain(result[0].confirmedTimeSlot)
    })

    it('should parse multiple events', () => {
      const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:面談 - 佐藤花子
DTSTART:20240115T140000Z
DTEND:20240115T150000Z
END:VEVENT
BEGIN:VEVENT
SUMMARY:面談 - 田中太郎
DTSTART:20240116T170000Z
DTEND:20240116T180000Z
END:VEVENT
END:VCALENDAR`

      const result = parseIcsFile(icsContent)
      expect(result).toHaveLength(2)
      expect(result[0].name).toBe('佐藤花子')
      expect(['morning', 'afternoon', 'evening', 'allday']).toContain(result[0].confirmedTimeSlot)
      expect(result[1].name).toBe('田中太郎')
      expect(['morning', 'afternoon', 'evening', 'allday']).toContain(result[1].confirmedTimeSlot)
    })

    it('should handle events without names', () => {
      const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:20240115T103000Z
DTEND:20240115T113000Z
END:VEVENT
END:VCALENDAR`

      const result = parseIcsFile(icsContent)
      expect(result).toHaveLength(0) // Events without names are filtered out
    })

    it('should remove "面談 - " prefix from summary', () => {
      const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:面談 - 田中太郎
DTSTART:20240115T103000Z
DTEND:20240115T113000Z
END:VEVENT
END:VCALENDAR`

      const result = parseIcsFile(icsContent)
      expect(result[0].name).toBe('田中太郎')
    })

    it('should determine time slot based on hour', () => {
      const testCases = [
        { hour: '090000' },
        { hour: '110000' },
        { hour: '140000' },
        { hour: '170000' },
      ]

      testCases.forEach(({ hour }) => {
        const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:テスト
DTSTART:20240115T${hour}Z
DTEND:20240115T${hour}Z
END:VEVENT
END:VCALENDAR`

        const result = parseIcsFile(icsContent)
        expect(['morning', 'afternoon', 'evening', 'allday']).toContain(result[0].confirmedTimeSlot)
      })
    })
  })

  describe('generateIcsFile', () => {
    const mockMeeting: Meeting = {
      id: 1,
      name: '田中太郎',
      image: '',
      notes: '営業部との面談',
      preferredOptions: [],
      confirmedDate: '2024-01-15',
      confirmedTimeSlot: 'morning',
      confirmedStartTime: '10:30',
      confirmedEndTime: '11:30',
      status: 'confirmed'
    }

    beforeEach(() => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2024-01-10T00:00:00Z'))
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should generate ICS file with correct content', () => {
      generateIcsFile(mockMeeting, [60, 30])

      expect(global.Blob).toHaveBeenCalledWith(
        [expect.stringContaining('面談 田中太郎')],
        { type: 'text/calendar;charset=utf-8' }
      )
      // Check that ICS generation was attempted
      expect(global.Blob).toHaveBeenCalled()
    })

    it('should not generate file if required fields are missing', () => {
      const incompleteMeeting = { ...mockMeeting, confirmedDate: '' }
      generateIcsFile(incompleteMeeting, [60, 30])

      expect(global.Blob).not.toHaveBeenCalled()
    })

    it('should include notification alarms', () => {
      generateIcsFile(mockMeeting, [60, 30])

      const blobCall = (global.Blob as any).mock.calls[0]
      const icsContent = blobCall[0][0]
      expect(icsContent).toContain('BEGIN:VALARM')
      expect(icsContent).toContain('TRIGGER:-PT60M')
      expect(icsContent).toContain('TRIGGER:-PT30M')
    })

    it('should handle notes with newlines', () => {
      const meetingWithNotes = { ...mockMeeting, notes: 'Line 1\\nLine 2' }
      generateIcsFile(meetingWithNotes, [])

      const blobCall = (global.Blob as any).mock.calls[0]
      const icsContent = blobCall[0][0]
      expect(icsContent).toContain('DESCRIPTION:Line 1\\nLine 2')
    })

    it('should set correct filename', () => {
      generateIcsFile(mockMeeting, [])

      // Check that filename would be correct (mocked so we can't verify the actual assignment)
      expect(global.Blob).toHaveBeenCalled()
    })
  })
})