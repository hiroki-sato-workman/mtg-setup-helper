import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTheme } from '../useTheme'

describe('useTheme', () => {
  const mockLocalStorage = global.localStorage as any
  const mockClassList = global.document.documentElement.classList as any

  beforeEach(() => {
    vi.clearAllMocks()
    mockLocalStorage.getItem.mockReturnValue(null)
  })

  describe('initialization', () => {
    it('should initialize with light theme when no saved theme', () => {
      mockLocalStorage.getItem.mockReturnValue(null)
      
      const { result } = renderHook(() => useTheme())
      
      expect(result.current.theme).toBe('light')
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('theme')
    })

    it('should initialize with saved light theme', () => {
      mockLocalStorage.getItem.mockReturnValue('light')
      
      const { result } = renderHook(() => useTheme())
      
      expect(result.current.theme).toBe('light')
    })

    it('should initialize with saved dark theme', () => {
      mockLocalStorage.getItem.mockReturnValue('dark')
      
      const { result } = renderHook(() => useTheme())
      
      expect(result.current.theme).toBe('dark')
    })

    it('should fallback to light theme for invalid saved value', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid')
      
      const { result } = renderHook(() => useTheme())
      
      expect(result.current.theme).toBe('light')
    })
  })

  describe('theme application', () => {
    it('should apply light theme classes', () => {
      mockLocalStorage.getItem.mockReturnValue('light')
      
      renderHook(() => useTheme())
      
      expect(mockClassList.remove).toHaveBeenCalledWith('dark', 'light')
      expect(mockClassList.add).toHaveBeenCalledWith('light')
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('theme', 'light')
    })

    it('should apply dark theme classes', () => {
      mockLocalStorage.getItem.mockReturnValue('dark')
      
      renderHook(() => useTheme())
      
      expect(mockClassList.remove).toHaveBeenCalledWith('dark', 'light')
      expect(mockClassList.add).toHaveBeenCalledWith('dark')
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('theme', 'dark')
    })
  })

  describe('toggleTheme', () => {
    it('should toggle from light to dark', () => {
      mockLocalStorage.getItem.mockReturnValue('light')
      
      const { result } = renderHook(() => useTheme())
      
      act(() => {
        result.current.toggleTheme()
      })
      
      expect(result.current.theme).toBe('dark')
      expect(mockClassList.add).toHaveBeenCalledWith('dark')
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('theme', 'dark')
    })

    it('should toggle from dark to light', () => {
      mockLocalStorage.getItem.mockReturnValue('dark')
      
      const { result } = renderHook(() => useTheme())
      
      act(() => {
        result.current.toggleTheme()
      })
      
      expect(result.current.theme).toBe('light')
      expect(mockClassList.add).toHaveBeenCalledWith('light')
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('theme', 'light')
    })

    it('should toggle multiple times correctly', () => {
      mockLocalStorage.getItem.mockReturnValue('light')
      
      const { result } = renderHook(() => useTheme())
      
      // Toggle to dark
      act(() => {
        result.current.toggleTheme()
      })
      expect(result.current.theme).toBe('dark')
      
      // Toggle back to light
      act(() => {
        result.current.toggleTheme()
      })
      expect(result.current.theme).toBe('light')
      
      // Toggle to dark again
      act(() => {
        result.current.toggleTheme()
      })
      expect(result.current.theme).toBe('dark')
    })
  })

  describe('localStorage persistence', () => {
    it('should save theme to localStorage on change', () => {
      mockLocalStorage.getItem.mockReturnValue('light')
      
      const { result } = renderHook(() => useTheme())
      
      act(() => {
        result.current.toggleTheme()
      })
      
      expect(mockLocalStorage.setItem).toHaveBeenLastCalledWith('theme', 'dark')
    })

    it('should save theme to localStorage on initial load', () => {
      mockLocalStorage.getItem.mockReturnValue('dark')
      
      renderHook(() => useTheme())
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('theme', 'dark')
    })
  })

  describe('DOM manipulation', () => {
    it('should remove both classes before adding new one', () => {
      mockLocalStorage.getItem.mockReturnValue('light')
      
      const { result } = renderHook(() => useTheme())
      
      act(() => {
        result.current.toggleTheme()
      })
      
      // Should remove both classes first
      expect(mockClassList.remove).toHaveBeenCalledWith('dark', 'light')
      // Then add the new class
      expect(mockClassList.add).toHaveBeenCalledWith('dark')
    })

    it('should handle class changes on every theme update', () => {
      mockLocalStorage.getItem.mockReturnValue('light')
      
      const { result } = renderHook(() => useTheme())
      
      // Initial render
      expect(mockClassList.remove).toHaveBeenCalledTimes(1)
      expect(mockClassList.add).toHaveBeenCalledTimes(1)
      
      act(() => {
        result.current.toggleTheme()
      })
      
      // After toggle
      expect(mockClassList.remove).toHaveBeenCalledTimes(2)
      expect(mockClassList.add).toHaveBeenCalledTimes(2)
    })
  })
})