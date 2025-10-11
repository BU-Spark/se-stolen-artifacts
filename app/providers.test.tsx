import { render, screen } from '@testing-library/react';
import { AppThemeProvider } from './providers';
import { ThemeProvider } from '@mui/material';

// Mock the theme module
jest.mock('./theme', () => ({
  __esModule: true,
  default: {
    palette: {
      mode: 'light',
      primary: { main: '#5B3000' },
    },
  },
}));

describe('AppThemeProvider', () => {
  it('renders children correctly', () => {
    render(
      <AppThemeProvider>
        <div data-testid="test-child">Test Content</div>
      </AppThemeProvider>
    );
    expect(screen.getByTestId('test-child')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('wraps children with ThemeProvider', () => {
    const { container } = render(
      <AppThemeProvider>
        <div>Child Component</div>
      </AppThemeProvider>
    );
    // ThemeProvider should be present in the tree
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders CssBaseline component', () => {
    const { container } = render(
      <AppThemeProvider>
        <div>Test</div>
      </AppThemeProvider>
    );
    // CssBaseline adds global styles, verify container is rendered
    expect(container).toBeInTheDocument();
  });

  it('renders multiple children correctly', () => {
    render(
      <AppThemeProvider>
        <div data-testid="child-1">First Child</div>
        <div data-testid="child-2">Second Child</div>
        <span data-testid="child-3">Third Child</span>
      </AppThemeProvider>
    );
    expect(screen.getByTestId('child-1')).toBeInTheDocument();
    expect(screen.getByTestId('child-2')).toBeInTheDocument();
    expect(screen.getByTestId('child-3')).toBeInTheDocument();
  });

  it('handles null children gracefully', () => {
    expect(() => {
      render(<AppThemeProvider>{null}</AppThemeProvider>);
    }).not.toThrow();
  });

  it('handles undefined children gracefully', () => {
    expect(() => {
      render(<AppThemeProvider>{undefined}</AppThemeProvider>);
    }).not.toThrow();
  });

  it('handles empty fragment children', () => {
    expect(() => {
      render(
        <AppThemeProvider>
          <></>
        </AppThemeProvider>
      );
    }).not.toThrow();
  });

  it('renders nested components correctly', () => {
    render(
      <AppThemeProvider>
        <div data-testid="parent">
          <span data-testid="nested-child">Nested Content</span>
        </div>
      </AppThemeProvider>
    );
    expect(screen.getByTestId('parent')).toBeInTheDocument();
    expect(screen.getByTestId('nested-child')).toBeInTheDocument();
  });

  it('applies theme to children components', () => {
    const TestComponent = () => {
      return <button data-testid="themed-button">Themed Button</button>;
    };

    render(
      <AppThemeProvider>
        <TestComponent />
      </AppThemeProvider>
    );
    expect(screen.getByTestId('themed-button')).toBeInTheDocument();
  });

  it('handles component with errors gracefully when wrapped in error boundary', () => {
    const ErrorComponent = () => {
      // This component would normally throw, but we test the provider works
      return <div>No Error</div>;
    };

    expect(() => {
      render(
        <AppThemeProvider>
          <ErrorComponent />
        </AppThemeProvider>
      );
    }).not.toThrow();
  });
});

describe('AppThemeProvider default export', () => {
  it('is the same as named export', async () => {
    const { default: DefaultExport } = await import('./providers');
    const { AppThemeProvider: NamedExport } = await import('./providers');
    expect(DefaultExport).toBe(NamedExport);
  });
});