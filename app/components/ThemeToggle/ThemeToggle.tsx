'use client';

import { DarkModeOutlined, LightModeOutlined } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';
import { useColorMode } from '../../theme-provider';

export function ThemeToggle() {
  const { mode, toggleMode } = useColorMode();
  const isDark = mode === 'dark';

  return (
    <Tooltip title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}>
      <IconButton
        color="inherit"
        onClick={toggleMode}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        size="large"
      >
        {isDark ? <LightModeOutlined fontSize="small" /> : <DarkModeOutlined fontSize="small" />}
      </IconButton>
    </Tooltip>
  );
}
