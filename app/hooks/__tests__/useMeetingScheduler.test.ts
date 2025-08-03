import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useMeetingScheduler } from '../useMeetingScheduler'
import type { Meeting } from '~/types/meeting'

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}

// Mock FileReader
const mockFileReader = {
  readAsText: vi.fn(),
  result: '',
  onload: null as ((e: any) => void) | null
}

global.localStorage = mockLocalStorage as any
global.FileReader = vi.fn(() => mockFileReader) as any

// Mock timers for toast functionality
vi.useFakeTimers()

describe('useMeetingScheduler', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockLocalStorage.getItem.mockReturnValue(null)
  })

  afterEach(() => {
    vi.clearAllTimers()
  })

  describe('initialization', () => {
    it('should initialize with empty state', () => {
      const { result } = renderHook(() => useMeetingScheduler())
      
      expect(result.current.meetings).toEqual([])
      expect(result.current.showForm).toBe(false)
      expect(result.current.editingMeeting).toBe(null)
      expect(result.current.formData.name).toBe('')
      // Initial validation errors are expected for empty form
      expect(Object.keys(result.current.validationErrors).length).toBeGreaterThan(0)
      expect(result.current.toasts).toEqual([])
    })

    it('should load meetings from localStorage', () => {
      const savedMeetings: Meeting[] = [
        {
          id: 1,
          name: '田中太郎',
          image: '',
          notes: '',
          preferredOptions: [{ date: '2024-01-15', timeSlot: 'morning' }],
          confirmedDate: '',
          confirmedTimeSlot: '',
          confirmedStartTime: '',
          confirmedEndTime: '',
          status: 'pending'
        }
      ]
      
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(savedMeetings))
      
      const { result } = renderHook(() => useMeetingScheduler())
      
      expect(result.current.meetings).toEqual(savedMeetings)
    })

    it('should handle invalid localStorage data', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid json')
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      const { result } = renderHook(() => useMeetingScheduler())
      
      expect(result.current.meetings).toEqual([])
      expect(consoleSpy).toHaveBeenCalled()
      
      consoleSpy.mockRestore()
    })
  })

  describe('form validation', () => {
    it('should validate form data automatically', () => {
      const { result } = renderHook(() => useMeetingScheduler())
      
      // Initial state should have validation errors
      expect(result.current.validationErrors.name).toBe('名前は必須です')
      expect(result.current.validationErrors['date_0']).toBe('第1希望の日程は必須です')
      expect(result.current.validationErrors['timeSlot_0']).toBe('第1希望の時間帯は必須です')
    })

    it('should clear validation errors when form is valid', () => {
      const { result } = renderHook(() => useMeetingScheduler())
      
      act(() => {
        result.current.setFormData({
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
        })
      })
      
      expect(Object.keys(result.current.validationErrors)).toHaveLength(0)
    })
  })

  describe('meeting management', () => {
    it('should add new meeting', () => {
      const { result } = renderHook(() => useMeetingScheduler())
      
      // Set valid form data
      act(() => {
        result.current.setFormData({
          name: '田中太郎',
          image: '',
          notes: 'テスト面談',
          preferredOptions: [
            { date: '2024-01-15', timeSlot: 'morning' },
            { date: '', timeSlot: '' },
            { date: '', timeSlot: '' },
            { date: '', timeSlot: '' },
            { date: '', timeSlot: '' }
          ]
        })
      })
      
      act(() => {
        result.current.addMeeting()
      })
      
      expect(result.current.meetings).toHaveLength(1)
      expect(result.current.meetings[0].name).toBe('田中太郎')
      expect(result.current.meetings[0].notes).toBe('テスト面談')
      expect(result.current.meetings[0].status).toBe('pending')
      expect(result.current.showForm).toBe(false)
    })

    it('should not add meeting with validation errors', () => {
      const { result } = renderHook(() => useMeetingScheduler())
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
      
      act(() => {
        result.current.addMeeting()
      })
      
      expect(result.current.meetings).toHaveLength(0)
      expect(alertSpy).toHaveBeenCalledWith('入力内容に不備があります。赤い項目を確認してください。')
      
      alertSpy.mockRestore()
    })

    it('should edit existing meeting', () => {
      const { result } = renderHook(() => useMeetingScheduler())
      
      // Add a meeting first
      act(() => {
        result.current.setFormData({
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
        })
      })
      
      act(() => {
        result.current.addMeeting()
      })
      
      const meeting = result.current.meetings[0]
      
      // Edit the meeting
      act(() => {
        result.current.editMeeting(meeting)
      })
      
      expect(result.current.editingMeeting).toEqual(meeting)
      expect(result.current.showForm).toBe(true)
      expect(result.current.formData.name).toBe('田中太郎')
    })

    it('should delete meeting', () => {
      const { result } = renderHook(() => useMeetingScheduler())
      
      // Add a meeting first
      act(() => {
        result.current.setFormData({
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
        })
      })
      
      act(() => {
        result.current.addMeeting()
      })
      
      const meetingId = result.current.meetings[0].id
      
      act(() => {
        result.current.deleteMeeting(meetingId)
      })
      
      expect(result.current.meetings).toHaveLength(0)
    })
  })

  describe('meeting confirmation', () => {
    it('should open time dialog for confirmation', () => {
      const { result } = renderHook(() => useMeetingScheduler())
      
      act(() => {
        result.current.confirmMeeting(1, '2024-01-15', 'morning')
      })
      
      expect(result.current.showTimeDialog).toBe(true)
      expect(result.current.timeDialogData).toEqual({
        meetingId: 1,
        date: '2024-01-15',
        timeSlot: 'morning'
      })
    })

    it('should finalize confirmation with time', () => {
      const { result } = renderHook(() => useMeetingScheduler())
      
      // Add a meeting first
      act(() => {
        result.current.setFormData({
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
        })
      })
      
      act(() => {
        result.current.addMeeting()
      })
      
      const meetingId = result.current.meetings[0].id
      
      // Confirm meeting
      act(() => {
        result.current.confirmMeeting(meetingId, '2024-01-15', 'morning')
      })
      
      act(() => {
        result.current.finalizeConfirmation('10:00', '11:00')
      })
      
      const updatedMeeting = result.current.meetings[0]
      expect(updatedMeeting.confirmedDate).toBe('2024-01-15')
      expect(updatedMeeting.confirmedTimeSlot).toBe('morning')
      expect(updatedMeeting.confirmedStartTime).toBe('10:00')
      expect(updatedMeeting.confirmedEndTime).toBe('11:00')
      expect(updatedMeeting.status).toBe('confirmed')
      expect(result.current.showTimeDialog).toBe(false)
    })

    it('should reset confirmation', () => {
      const { result } = renderHook(() => useMeetingScheduler())
      
      // Add and confirm a meeting
      act(() => {
        result.current.setFormData({
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
        })
      })
      
      act(() => {
        result.current.addMeeting()
      })
      
      const meetingId = result.current.meetings[0].id
      
      act(() => {
        result.current.confirmMeeting(meetingId, '2024-01-15', 'morning')
      })
      
      act(() => {
        result.current.finalizeConfirmation('10:00', '11:00')
      })
      
      // Reset confirmation
      act(() => {
        result.current.resetConfirmation(meetingId)
      })
      
      const resetMeeting = result.current.meetings[0]
      expect(resetMeeting.confirmedDate).toBe('')
      expect(resetMeeting.confirmedTimeSlot).toBe('')
      expect(resetMeeting.confirmedStartTime).toBe('')
      expect(resetMeeting.confirmedEndTime).toBe('')
      expect(resetMeeting.status).toBe('pending')
    })
  })

  describe('toast management', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should show toast message', () => {
      const { result } = renderHook(() => useMeetingScheduler())
      
      act(() => {
        result.current.showToast('テストメッセージ', 'success')
      })
      
      expect(result.current.toasts).toHaveLength(1)
      expect(result.current.toasts[0].message).toBe('テストメッセージ')
      expect(result.current.toasts[0].type).toBe('success')
    })

    it('should auto-remove toast after 3 seconds', () => {
      const { result } = renderHook(() => useMeetingScheduler())
      
      act(() => {
        result.current.showToast('テストメッセージ')
      })
      
      expect(result.current.toasts).toHaveLength(1)
      
      act(() => {
        vi.advanceTimersByTime(3000)
      })
      
      expect(result.current.toasts).toHaveLength(0)
    })

    it('should manually remove toast', () => {
      const { result } = renderHook(() => useMeetingScheduler())
      
      act(() => {
        result.current.showToast('テストメッセージ')
      })
      
      const toastId = result.current.toasts[0].id
      
      act(() => {
        result.current.removeToast(toastId)
      })
      
      expect(result.current.toasts).toHaveLength(0)
    })
  })

  describe('form utilities', () => {
    it('should handle image upload', () => {
      const { result } = renderHook(() => useMeetingScheduler())
      
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      const mockEvent = {
        target: { files: [mockFile] }
      } as unknown as React.ChangeEvent<HTMLInputElement>
      
      // Mock FileReader
      const mockReader = {
        readAsDataURL: vi.fn(),
        result: 'data:image/jpeg;base64,test',
        onload: null as ((e: any) => void) | null
      }
      
      global.FileReader = vi.fn(() => mockReader) as any
      
      act(() => {
        result.current.handleImageUpload(mockEvent)
        // Simulate onload
        mockReader.onload?.({ target: { result: 'data:image/jpeg;base64,test' } })
      })
      
      expect(result.current.formData.image).toBe('data:image/jpeg;base64,test')
    })

    it('should remove image', () => {
      const { result } = renderHook(() => useMeetingScheduler())
      
      act(() => {
        result.current.setFormData({
          ...result.current.formData,
          image: 'test-image'
        })
      })
      
      act(() => {
        result.current.removeImage()
      })
      
      expect(result.current.formData.image).toBe('')
    })

    it('should update preferred option', () => {
      const { result } = renderHook(() => useMeetingScheduler())
      
      act(() => {
        result.current.updatePreferredOption(0, 'date', '2024-01-15')
      })
      
      expect(result.current.formData.preferredOptions[0].date).toBe('2024-01-15')
      
      act(() => {
        result.current.updatePreferredOption(0, 'timeSlot', 'morning')
      })
      
      expect(result.current.formData.preferredOptions[0].timeSlot).toBe('morning')
    })

    it('should reset form', () => {
      const { result } = renderHook(() => useMeetingScheduler())
      
      // Set some form data
      act(() => {
        result.current.setFormData({
          name: '田中太郎',
          image: 'test-image',
          notes: 'テスト',
          preferredOptions: [
            { date: '2024-01-15', timeSlot: 'morning' },
            { date: '', timeSlot: '' },
            { date: '', timeSlot: '' },
            { date: '', timeSlot: '' },
            { date: '', timeSlot: '' }
          ]
        })
      })
      
      act(() => {
        result.current.resetForm()
      })
      
      expect(result.current.showForm).toBe(false)
      expect(result.current.editingMeeting).toBe(null)
      expect(result.current.formData.name).toBe('')
      expect(result.current.formData.image).toBe('')
      expect(result.current.formData.notes).toBe('')
    })

    it('should open new meeting form', () => {
      const { result } = renderHook(() => useMeetingScheduler())
      
      act(() => {
        result.current.openNewMeetingForm()
      })
      
      expect(result.current.showForm).toBe(true)
      expect(result.current.editingMeeting).toBe(null)
    })
  })

  describe('localStorage persistence', () => {
    it('should save meetings to localStorage when meetings change', () => {
      const { result } = renderHook(() => useMeetingScheduler())
      
      act(() => {
        result.current.setFormData({
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
        })
      })
      
      act(() => {
        result.current.addMeeting()
      })
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'meetingSchedulerData',
        expect.stringContaining('田中太郎')
      )
    })
  })
})