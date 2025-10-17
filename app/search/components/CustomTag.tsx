'use client';

import Tooltip from '@mui/material/Tooltip';
import Chip from '@mui/material/Chip';
import { alpha } from '@mui/material/styles';

type Selection = {
  id: string;
  label: string;
  type: 'binary' | 'text' | 'number';
  value: unknown;
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
        '&:hover': (theme) => ({
          backgroundColor: selection.value ? alpha(theme.palette.primary.main, 0.2) : theme.palette.grey[400],
        }),
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
