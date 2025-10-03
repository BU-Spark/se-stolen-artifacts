import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { ThemeToggle } from './ThemeToggle';
import { MuiThemeProvider } from '../../theme-provider';

const STORAGE_KEY = 'mui-color-mode';

const mockMatchMedia = (matches: boolean) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
};

const renderWithProvider = () =>
  render(
    <MuiThemeProvider>
      <ThemeToggle />
    </MuiThemeProvider>
  );

describe('ThemeToggle', () => {
  beforeEach(() => {
    localStorage.removeItem(STORAGE_KEY);
    delete document.documentElement.dataset.theme;
  });

  afterEach(() => {
    cleanup();
  });

  test('renders and defaults to light mode when system prefers light', () => {
    mockMatchMedia(false);
    renderWithProvider();

    expect(document.documentElement.dataset.theme).toBe('light');
    expect(screen.getByRole('button', { name: /switch to dark mode/i })).toBeInTheDocument();
  });

  test('honours dark system preference on initial render', () => {
    mockMatchMedia(true);
    renderWithProvider();

    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(screen.getByRole('button', { name: /switch to light mode/i })).toBeInTheDocument();
  });

  test('toggles between light and dark modes on click', () => {
    mockMatchMedia(false);
    renderWithProvider();
    const button = screen.getByRole('button', { name: /switch to dark mode/i });

    fireEvent.click(button);
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(screen.getByRole('button', { name: /switch to light mode/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /switch to light mode/i }));
    expect(document.documentElement.dataset.theme).toBe('light');
  });

  test('persists selection to localStorage and restores on next render', () => {
    mockMatchMedia(false);
    const { unmount } = renderWithProvider();
    fireEvent.click(screen.getByRole('button', { name: /switch to dark mode/i }));
    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '""')).toBe('dark');

    unmount();

    // Force light system preference but expect persisted dark mode
    mockMatchMedia(false);
    renderWithProvider();
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(screen.getByRole('button', { name: /switch to light mode/i })).toBeInTheDocument();
  });
});
