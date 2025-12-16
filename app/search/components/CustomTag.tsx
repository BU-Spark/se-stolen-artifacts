'use client';

import Tooltip from '@mui/material/Tooltip';
import Chip from '@mui/material/Chip';
import { alpha } from '@mui/material/styles';
import { themeTokens } from '@/app/theme';

type Selection = {
  id: string;
  label: string;
  type: 'binary' | 'text' | 'number';
  value: string | number | boolean;
  placeholder?: string;
  helperText?: string;
};

type CustomTagProps = {
  selection: Selection;
  onDelete: () => void;
  onChipClick: () => void;
};

export default function CustomTag({ selection, onDelete, onChipClick }: CustomTagProps) {
  const label =
    selection.id === 'limbsPresent'
      ? `${selection.label}: ${selection.value ? String(selection.value) || '—' : '—'}`
      : selection.type === 'binary'
        ? `${selection.label}: ${selection.value ? 'Yes' : 'No'}`
        : `${selection.label}: ${selection.value ? selection.value : '—'}`;

  const isFilled = selection.type === 'binary' || Boolean(selection.value);

  const chip = (
    <Chip
      label={label}
      color={selection.value ? 'primary' : 'default'}
      onClick={onChipClick}
      onDelete={onDelete}
      sx={{
        cursor: 'pointer',
        maxWidth: '100%',
        borderRadius: 2,
        backgroundColor: isFilled ? themeTokens.secondaryBlue : undefined,
        color: '#fff',
        borderColor: isFilled ? undefined : themeTokens.secondaryBlue,
        '&:hover': {
          backgroundColor: isFilled ? alpha(themeTokens.secondaryBlue, 0.8) : alpha(themeTokens.secondaryBlue, 0.1),
        },
      }}
    />
  );

  if (selection.type !== 'binary') return chip;

  return (
    <Tooltip title={`Click to toggle ${selection.value ? 'No' : 'Yes'}`} placement="top" arrow>
      {chip}
    </Tooltip>
  );
}
