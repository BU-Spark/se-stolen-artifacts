import { forwardRef } from 'react';
import MuiButton from '@mui/material/Button';
import type { ButtonProps } from './Button.types';

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'contained', color = 'primary', ...props }, ref) => (
    <MuiButton ref={ref} variant={variant} color={color} {...props} />
  )
);

Button.displayName = 'Button';
