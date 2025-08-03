import { describe, it, expect } from 'vitest'
import {
  timeSlots,
  getTimeSlotLabel,
  generateScheduleSummary,
  isSlotOccupied,
  validateForm,
  isRequired,
  createEmptyFormData
} from '../scheduleUtils'
import type { Meeting, FormData } from '~/types/meeting'

describe('scheduleUtils', () => {
  describe('timeSlots', () => {
    it('should contain all required time slots', () => {
      expect(timeSlots).toHaveLength(4)
      expect(timeSlots.map(slot => slot.value)).toEqual(['allday', 'morning', 'afternoon', 'evening'])
    })

    it('should have correct labels', () => {
      expect(timeSlots.find(slot => slot.value === 'allday')?.label).toBe('終日')
      expect(timeSlots.find(slot => slot.value === 'morning')?.label).toBe('10:00 ~ 12:00')
      expect(timeSlots.find(slot => slot.value === 'afternoon')?.label).toBe('13:00 ~ 16:00')
      expect(timeSlots.find(slot => slot.value === 'evening')?.label).toBe('17:00以降')
    })
  })

  describe('getTimeSlotLabel', () => {
    it('should return correct label for valid time slot', () => {
      expect(getTimeSlotLabel('morning')).toBe('10:00 ~ 12:00')
      expect(getTimeSlotLabel('afternoon')).toBe('13:00 ~ 16:00')
      expect(getTimeSlotLabel('evening')).toBe('17:00以降')
      expect(getTimeSlotLabel('allday')).toBe('終日')
    })

    it('should return original value for unknown time slot', () => {
      expect(getTimeSlotLabel('unknown')).toBe('unknown')
      expect(getTimeSlotLabel('')).toBe('')
    })
  })

  describe('generateScheduleSummary', () => {
    const mockMeetings: Meeting[] = [
      {
        id: 1,
        name: '田中太郎',
        image: '',
        notes: 'テスト面談',
        preferredOptions: [
          { date: '2024-01-15', timeSlot: 'morning' },
          { date: '2024-01-16', timeSlot: 'afternoon' }
        ],
        confirmedDate: '',
        confirmedTimeSlot: '',
        confirmedStartTime: '',
        confirmedEndTime: '',
        status: 'pending'
      },
      {
        id: 2,
        name: '佐藤花子',
        image: 'image.jpg',
        notes: '',
        preferredOptions: [
          { date: '2024-01-15', timeSlot: 'morning' },
          { date: '2024-01-17', timeSlot: 'evening' }
        ],
        confirmedDate: '',
        confirmedTimeSlot: '',
        confirmedStartTime: '',
        confirmedEndTime: '',
        status: 'pending'
      }
    ]

    it('should generate schedule summary grouped by date', () => {
      const result = generateScheduleSummary(mockMeetings)
      
      expect(Object.keys(result)).toEqual(['2024-01-15', '2024-01-16', '2024-01-17'])
      expect(result['2024-01-15']).toHaveLength(2) // 2 meetings on same date
      expect(result['2024-01-16']).toHaveLength(1)
      expect(result['2024-01-17']).toHaveLength(1)
    })

    it('should include correct meeting information', () => {
      const result = generateScheduleSummary(mockMeetings)
      const jan15Schedules = result['2024-01-15']
      
      expect(jan15Schedules[0]).toEqual({
        date: '2024-01-15',
        timeSlot: 'morning',
        meetingName: '田中太郎',
        meetingImage: '',
        priority: 1,
        notes: 'テスト面談'
      })
      
      expect(jan15Schedules[1]).toEqual({
        date: '2024-01-15',
        timeSlot: 'morning',
        meetingName: '佐藤花子',
        meetingImage: 'image.jpg',
        priority: 1,
        notes: ''
      })
    })

    it('should handle empty meetings array', () => {
      const result = generateScheduleSummary([])
      expect(result).toEqual({})
    })

    it('should filter out incomplete preferred options', () => {
      const meetingsWithIncomplete: Meeting[] = [
        {
          id: 1,
          name: '田中太郎',
          image: '',
          notes: '',
          preferredOptions: [
            { date: '2024-01-15', timeSlot: 'morning' },
            { date: '', timeSlot: 'afternoon' }, // incomplete
            { date: '2024-01-16', timeSlot: '' } // incomplete
          ],
          confirmedDate: '',
          confirmedTimeSlot: '',
          confirmedStartTime: '',
          confirmedEndTime: '',
          status: 'pending'
        }
      ]
      
      const result = generateScheduleSummary(meetingsWithIncomplete)
      expect(Object.keys(result)).toEqual(['2024-01-15'])
      expect(result['2024-01-15']).toHaveLength(1)
    })
  })

  describe('isSlotOccupied', () => {
    const mockMeetings: Meeting[] = [
      {
        id: 1,
        name: '田中太郎',
        image: '',
        notes: '',
        preferredOptions: [
          { date: '2024-01-15', timeSlot: 'morning' }
        ],
        confirmedDate: '',
        confirmedTimeSlot: '',
        confirmedStartTime: '',
        confirmedEndTime: '',
        status: 'pending'
      }
    ]

    const mockFormData: FormData = {
      name: 'テスト',
      image: '',
      notes: '',
      preferredOptions: [
        { date: '2024-01-15', timeSlot: 'afternoon' },
        { date: '2024-01-16', timeSlot: 'morning' },
        { date: '', timeSlot: '' },
        { date: '', timeSlot: '' },
        { date: '', timeSlot: '' }
      ]
    }

    it('should return true for occupied slot', () => {
      const result = isSlotOccupied('2024-01-15', 'morning', mockMeetings, null, mockFormData, -1)
      expect(result).toBe(true)
    })

    it('should return false for unoccupied slot', () => {
      const result = isSlotOccupied('2024-01-17', 'morning', mockMeetings, null, mockFormData, -1)
      expect(result).toBe(false)
    })

    it('should handle allday slots', () => {
      const result1 = isSlotOccupied('2024-01-15', 'allday', mockMeetings, null, mockFormData, -1)
      expect(result1).toBe(true) // conflicts with morning slot
      
      const result2 = isSlotOccupied('2024-01-17', 'allday', mockMeetings, null, mockFormData, -1)
      expect(result2).toBe(false)
    })

    it('should exclude editing meeting from check', () => {
      const editingMeeting = mockMeetings[0]
      const result = isSlotOccupied('2024-01-15', 'morning', mockMeetings, editingMeeting, mockFormData, -1)
      expect(result).toBe(false) // editing meeting is excluded
    })

    it('should check form data conflicts', () => {
      const result = isSlotOccupied('2024-01-15', 'afternoon', mockMeetings, null, mockFormData, 1)
      expect(result).toBe(true) // conflicts with form data at index 0
    })

    it('should exclude same option index from form check', () => {
      const result = isSlotOccupied('2024-01-15', 'afternoon', mockMeetings, null, mockFormData, 0)
      expect(result).toBe(false) // same index is excluded
    })

    it('should return false for empty date or timeSlot', () => {
      expect(isSlotOccupied('', 'morning', mockMeetings, null, mockFormData, -1)).toBe(false)
      expect(isSlotOccupied('2024-01-15', '', mockMeetings, null, mockFormData, -1)).toBe(false)
    })
  })

  describe('validateForm', () => {
    it('should validate required name field', () => {
      const formData: FormData = {
        name: '',
        image: '',
        notes: '',
        preferredOptions: [
          { date: '2024-01-15', timeSlot: 'morning' },
          { date: '', timeSlot: '' },
          { date: '', timeSlot: '' },
          { date: '', timeSlot: '' },
          { date: '', timeSlot: '' }
        ]
      }
      
      const errors = validateForm(formData)
      expect(errors.name).toBe('名前は必須です')
    })

    it('should validate first preferred option date', () => {
      const formData: FormData = {
        name: '田中太郎',
        image: '',
        notes: '',
        preferredOptions: [
          { date: '', timeSlot: 'morning' },
          { date: '', timeSlot: '' },
          { date: '', timeSlot: '' },
          { date: '', timeSlot: '' },
          { date: '', timeSlot: '' }
        ]
      }
      
      const errors = validateForm(formData)
      expect(errors['date_0']).toBe('第1希望の日程は必須です')
    })

    it('should validate first preferred option time slot', () => {
      const formData: FormData = {
        name: '田中太郎',
        image: '',
        notes: '',
        preferredOptions: [
          { date: '2024-01-15', timeSlot: '' },
          { date: '', timeSlot: '' },
          { date: '', timeSlot: '' },
          { date: '', timeSlot: '' },
          { date: '', timeSlot: '' }
        ]
      }
      
      const errors = validateForm(formData)
      expect(errors['timeSlot_0']).toBe('第1希望の時間帯は必須です')
    })

    it('should return empty object for valid form', () => {
      const formData: FormData = {
        name: '田中太郎',
        image: '',
        notes: '',
        preferredOptions: [
          { date: '2024-01-15', timeSlot: 'morning' },
          { date: '', timeSlot: '' },
          { date: '', timeSlot: '' },
          { date: '', timeSlot: '' },
          { date: '', timeSlot: '' }
        ]
      }
      
      const errors = validateForm(formData)
      expect(Object.keys(errors)).toHaveLength(0)
    })

    it('should handle name with only whitespace', () => {
      const formData: FormData = {
        name: '   ',
        image: '',
        notes: '',
        preferredOptions: [
          { date: '2024-01-15', timeSlot: 'morning' },
          { date: '', timeSlot: '' },
          { date: '', timeSlot: '' },
          { date: '', timeSlot: '' },
          { date: '', timeSlot: '' }
        ]
      }
      
      const errors = validateForm(formData)
      expect(errors.name).toBe('名前は必須です')
    })
  })

  describe('isRequired', () => {
    it('should return true for first option (index 0)', () => {
      expect(isRequired(0)).toBe(true)
    })

    it('should return false for other options', () => {
      expect(isRequired(1)).toBe(false)
      expect(isRequired(2)).toBe(false)
      expect(isRequired(3)).toBe(false)
      expect(isRequired(4)).toBe(false)
    })
  })

  describe('createEmptyFormData', () => {
    it('should create form data with empty values', () => {
      const formData = createEmptyFormData()
      
      expect(formData.name).toBe('')
      expect(formData.image).toBe('')
      expect(formData.notes).toBe('')
      expect(formData.preferredOptions).toHaveLength(5)
      
      formData.preferredOptions.forEach(option => {
        expect(option.date).toBe('')
        expect(option.timeSlot).toBe('')
      })
    })

    it('should create new instance each time', () => {
      const formData1 = createEmptyFormData()
      const formData2 = createEmptyFormData()
      
      expect(formData1).not.toBe(formData2)
      expect(formData1.preferredOptions).not.toBe(formData2.preferredOptions)
    })
  })
})