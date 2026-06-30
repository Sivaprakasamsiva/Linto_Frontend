// Frontend test setup
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock matchMedia for components that use it (theme context)
window.matchMedia = window.matchMedia || function(query) {
  return {
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  };
};

// Mock IntersectionObserver
class MockIntersectionObserver {
  constructor(callback) { this.callback = callback; }
  observe() { return null; }
  unobserve() { return null; }
  disconnect() { return null; }
}
window.IntersectionObserver = MockIntersectionObserver;

// Mock scrollTo
window.scrollTo = vi.fn();
