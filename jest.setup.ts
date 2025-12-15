import '@testing-library/jest-dom';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local for tests
config({ path: resolve(__dirname, '.env.local') });

// Mock window.matchMedia for all tests when a DOM is available
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
}
