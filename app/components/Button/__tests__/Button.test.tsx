import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../Button';

describe('Button', () => {
  it('renders with default props', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
    expect(button.className).toContain('MuiButton-root');
    expect(button.className).toContain('MuiButton-contained');
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('can be disabled', () => {
    render(<Button disabled>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeDisabled();
  });

  it('renders with different variants', () => {
    const { rerender } = render(<Button variant="contained">Contained</Button>);
    expect(screen.getByRole('button').className).toContain('MuiButton-contained');

    rerender(<Button variant="outlined">Outlined</Button>);
    expect(screen.getByRole('button').className).toContain('MuiButton-outlined');

    rerender(<Button variant="text">Text</Button>);
    expect(screen.getByRole('button').className).toContain('MuiButton-text');
  });

  it('renders with different sizes', () => {
    const { rerender } = render(<Button size="small">Small</Button>);
    expect(screen.getByRole('button').className).toContain('MuiButton-sizeSmall');

    rerender(<Button size="medium">Medium</Button>);
    expect(screen.getByRole('button').className).toContain('MuiButton-sizeMedium');

    rerender(<Button size="large">Large</Button>);
    expect(screen.getByRole('button').className).toContain('MuiButton-sizeLarge');
  });

  it('applies custom className', () => {
    render(<Button className="custom-class">Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button.className).toContain('custom-class');
  });
});
