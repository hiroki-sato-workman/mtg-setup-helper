import '@testing-library/jest-dom'
import { beforeAll, vi } from 'vitest'

// Mock DOM globals
beforeAll(() => {
  // Mock window.alert
  global.alert = vi.fn()
  
  // Mock DOM APIs
  global.document = {
    ...global.document,
    createElement: vi.fn(() => ({
      click: vi.fn(),
      href: '',
      download: '',
    })),
    body: {
      appendChild: vi.fn(),
      removeChild: vi.fn(),
    },
    documentElement: {
      classList: {
        add: vi.fn(),
        remove: vi.fn(),
        contains: vi.fn(),
        toggle: vi.fn(),
      },
    },
  } as any

  global.URL = {
    createObjectURL: vi.fn(() => 'blob:mock-url'),
    revokeObjectURL: vi.fn(),
  } as any

  global.Blob = vi.fn() as any

  // Mock localStorage
  const mockStorage = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  }
  global.localStorage = mockStorage as any

  // Mock FileReader
  global.FileReader = vi.fn(() => ({
    readAsText: vi.fn(),
    readAsDataURL: vi.fn(),
    result: '',
    onload: null,
  })) as any
})