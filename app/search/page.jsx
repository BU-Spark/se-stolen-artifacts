'use client';

import { themeTokens } from '@/app/theme';
import { useMemo, useRef, useState } from 'react';
import {
  Autocomplete,
  Button,
  Checkbox,
  Chip,
  Collapse,
  Container,
  Divider,
  FormControlLabel,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import { alpha } from '@mui/material/styles';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const BASIC_FIELDS = [
  {
    id: 'artifactTitle',
    label: 'Title of Object',
    type: 'text',
    placeholder: 'e.g. Head of Buddha',
  },
  {
    id: 'dealerName',
    label: 'Dealer',
    type: 'text',
    placeholder: 'e.g. John Dwyer Oriental Art',
  },
  {
    id: 'subject',
    label: 'Subject',
    type: 'text',
    placeholder: 'e.g. Vishnu',
  },
  {
    id: 'photographLocation',
    label: 'Photograph Location',
    type: 'text',
    placeholder: 'e.g. New York',
  },
  {
    id: 'repreciated',
    label: 'Repreciated',
    type: 'checkbox',
  },
];

const ADVANCED_PARAMS = [
  {
    id: 'imageSource',
    label: 'Image Source',
    type: 'text',
    helperText: 'Origin of the artifact image.',
    placeholder: 'e.g. Getty Museum',
  },
  {
    id: 'material',
    label: 'Material',
    type: 'text',
    helperText: 'Primary material composing the artifact.',
    placeholder: 'e.g. Sandstone',
  },
  {
    id: 'firstAppearanceYear',
    label: 'Year of First Known Appearance',
    type: 'number',
    helperText: 'Year the artifact was first documented.',
    placeholder: 'e.g. 1923',
  },
  {
    id: 'firstAppearanceYearOutsideCambodia',
    label: 'Year of First Known Appearance Outside Cambodia',
    type: 'number',
    helperText: 'Year the artifact was first documented.',
    placeholder: 'e.g. 1923',
  },
  {
    id: 'basePresent',
    label: 'Base Present',
    type: 'binary',
    helperText: 'Toggle to filter by artifacts that have a base present.',
  },
  {
    id: 'hasInscription',
    label: 'Inscription',
    type: 'binary',
    helperText: 'Toggle to filter by artifacts with inscriptions.',
  },
  {
    id: 'hasMultipleHeads',
    label: 'Multiple Heads',
    type: 'binary',
    helperText: 'Toggle to filter by artifacts with multiple heads.',
  },
  {
    id: 'fragmentary',
    label: 'Fragmentary',
    type: 'binary',
    helperText: 'Toggle to filter by artifacts that are fragmentary.',
  },
  {
    id: 'armNumber',
    label: 'Number of Arms',
    type: 'number',
    helperText: 'Provide the numeric arm identifier.',
    placeholder: 'e.g. 4, 8, 10...',
  },
  {
    id: 'limbsPresent',
    label: 'Limbs Present',
    type: 'text',
    helperText: 'Comma-separated list of limbs present.',
    placeholder: 'e.g. head, torso, hip-knee',
  },
  {
    id: 'partsFragmented',
    label: 'Parts Fragmented',
    type: 'text',
    helperText: 'Comma-separated list of fragmented parts.',
    placeholder: 'e.g. neck, shoulder, upper leg',
  },
];

const getInitialBasicState = () =>
  BASIC_FIELDS.reduce((acc, field) => {
    acc[field.id] = field.type === 'checkbox' ? false : '';
    return acc;
  }, {});

const normalizeLimbList = (raw) => {
  if (!raw) return [];
  const parts = String(raw)
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean);

  const seen = new Set();
  const out = [];
  for (let p of parts) {
    const normalized = p
      .toLowerCase()
      .split(/[\s-]+/)
      .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1) : ''))
      .join(' ');
    if (!seen.has(normalized)) {
      seen.add(normalized);
      out.push(normalized);
    }
  }
  return out;
};

export default function SearchPage() {
  const [query] = useState('');
  const [basicValues, setBasicValues] = useState(getInitialBasicState);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [advancedSelections, setAdvancedSelections] = useState([]);
  const [activeParamId, setActiveParamId] = useState(null);
  const [advancedInputValue, setAdvancedInputValue] = useState('');
  const autocompleteInputRef = useRef(null);

  const activeParam = useMemo(
    () => advancedSelections.find((selection) => selection.id === activeParamId) ?? null,
    [advancedSelections, activeParamId]
  );

  const availableAdvancedOptions = useMemo(
    () => ADVANCED_PARAMS.filter((param) => !advancedSelections.some((selection) => selection.id === param.id)),
    [advancedSelections]
  );

  const toggleAdvanced = () => {
    setIsAdvancedOpen((prev) => !prev);
  };

  const handleBasicChange = (fieldId, value) => {
    setBasicValues((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
  };

  const focusAdvancedInput = () => {
    requestAnimationFrame(() => {
      autocompleteInputRef.current?.focus();
    });
  };

  const handleRemoveAdvanced = (id) => {
    setAdvancedSelections((prev) => prev.filter((selection) => selection.id !== id));
    if (activeParamId === id) {
      setActiveParamId(null);
      setAdvancedInputValue('');
    }
  };

  const handleToggleBinary = (id) => {
    setAdvancedSelections((prev) =>
      prev.map((selection) => (selection.id === id ? { ...selection, value: !selection.value } : selection))
    );
  };

  const handleAdvancedChange = (_event, _value, reason, details) => {
    if (reason === 'selectOption' && details?.option) {
      const option = details.option;

      setAdvancedSelections((prev) => {
        if (prev.some((selection) => selection.id === option.id)) {
          return prev;
        }
        const initialValue = option.type === 'binary' ? true : '';
        return [...prev, { ...option, value: initialValue }];
      });

      if (option.type === 'binary') {
        setActiveParamId(null);
        setAdvancedInputValue('');
      } else {
        setActiveParamId(option.id);
        setAdvancedInputValue('');
        focusAdvancedInput();
      }
    } else if (reason === 'removeOption' && details?.option) {
      handleRemoveAdvanced(details.option.id);
    } else if (reason === 'clear') {
      setAdvancedSelections([]);
      setActiveParamId(null);
      setAdvancedInputValue('');
    }
  };

  const handleAdvancedInputChange = (_event, value, reason) => {
    if (activeParamId && reason === 'input') {
      const param = ADVANCED_PARAMS.find((p) => p.id === activeParamId);
      let newValue = value;
      if (param?.type === 'number') {
        if (/^-?\d{0,}(\.\d{0,})?$/.test(value)) {
          newValue = value;
        } else {
          // ignore rest
          return;
        }
      }
      setAdvancedInputValue(newValue);
      setAdvancedSelections((prev) =>
        prev.map((selection) =>
          selection.id === activeParamId
            ? { ...selection, value: param?.type === 'number' && newValue !== '' ? Number(newValue) : newValue }
            : selection
        )
      );
    } else if (reason === 'clear') {
      setAdvancedInputValue('');
      setActiveParamId(null);
    } else {
      setAdvancedInputValue(value);
    }
  };

  const finalizeActiveParam = () => {
    if (!activeParamId) {
      return;
    }

    if (activeParamId === 'limbsPresent') {
      setAdvancedSelections((prev) => {
        const sel = prev.find((s) => s.id === activeParamId);
        if (!sel) return prev;
        const normalized = normalizeLimbList(sel.value);
        if (normalized.length === 0) {
          return prev.filter((s) => s.id !== activeParamId);
        }
        return prev.map((s) => (s.id === activeParamId ? { ...s, value: normalized.join(', ') } : s));
      });
    }

    setActiveParamId(null);
    setAdvancedInputValue('');
  };

  const handleAdvancedInputKeyDown = (event) => {
    if (!activeParamId) {
      return;
    }

    if (event.key === 'Enter' || event.key === 'Tab') {
      event.preventDefault();
      finalizeActiveParam();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      setAdvancedSelections((prev) =>
        prev.map((selection) => (selection.id === activeParamId ? { ...selection, value: '' } : selection))
      );
      finalizeActiveParam();
    }
  };

  const handleChipClick = (selection) => {
    if (selection.type === 'binary') {
      handleToggleBinary(selection.id);
      return;
    }

    setActiveParamId(selection.id);
    setAdvancedInputValue(typeof selection.value === 'string' ? selection.value : '');
    focusAdvancedInput();
  };

  const handleSubmit = (event) => {
    event.preventDefault(); // prevents page reload

    const hasBasic = Object.entries(basicValues).some(([key, value]) => {
      const field = BASIC_FIELDS.find((f) => f.id === key);
      if (!field) return false;
      if (field.type === 'checkbox') return Boolean(value);
      return String(value).trim() !== '';
    });

    if (!hasBasic) {
      alert('Must fill out at least one parameter before searching!');
      return;
    }

    const payload = {
      query,
      basics: basicValues,
      advanced: advancedSelections.map((selection) => {
        if (selection.id === 'limbsPresent') {
          return { id: selection.id, value: normalizeLimbList(selection.value) };
        }

        return {
          id: selection.id,
          value:
            selection.type === 'binary'
              ? Boolean(selection.value)
              : typeof selection.value === 'string'
                ? selection.value
                : '',
        };
      }),
    };
    console.log('Search payload', payload);
  };

  const CustomTag = ({ selection, onDelete, onChipClick }) => {
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
          '&:hover': {
            backgroundColor: (theme) =>
              selection.value ? alpha(theme.palette.primary.main, 0.2) : theme.palette.grey[400],
          },
        }}
      />
    );

    if (selection.type !== 'binary') {
      return chip;
    }

    return (
      <Tooltip title={`Click to toggle ${selection.value ? 'No' : 'Yes'}`} placement="top" arrow>
        {chip}
      </Tooltip>
    );
  };

  return (
    <Container component="main" maxWidth="lg" sx={{ py: 6 }}>
      <Paper component="form" elevation={3} onSubmit={handleSubmit} sx={{ p: { xs: 3, md: 4 } }}>
        <Stack spacing={4}>
          <Grid container alignItems="center" justifyContent="space-between">
            <Grid size={4}>
              <Typography component="h1" variant="h4" fontWeight={600} gutterBottom>
                Artifact Search
              </Typography>
              <Typography color="text.secondary">
                Look up stolen artifacts by name, collection, or tailor your search with advanced filters.
              </Typography>
            </Grid>
            <Grid>
              <Button
                type="submit"
                variant="contained"
                size="large"
                sx={{
                  px: 4,
                  py: 1.5,
                  bgcolor: themeTokens.primary,
                  '&:hover': { bgcolor: themeTokens.primaryLight },
                }}
              >
                Search
              </Button>
            </Grid>
          </Grid>

          <Divider />

          <Stack spacing={3}>
            <Typography variant="h6" fontWeight={600}>
              Main Parameters
            </Typography>
            <Grid container spacing={2} alignItems="start">
              <Grid size={{ xs: 12, md: 9 }}>
                <Grid container spacing={2}>
                  {BASIC_FIELDS.filter((f) => f.type !== 'checkbox').map((field) => (
                    <Grid key={field.id} size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        label={field.label}
                        placeholder={field.placeholder}
                        value={basicValues[field.id]}
                        onChange={(event) => handleBasicChange(field.id, event.target.value)}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Grid>

              <Grid size={{ xs: 12, md: 3 }} container alignItems="flex-start">
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={Boolean(basicValues['repreciated'])}
                      onChange={(event) => handleBasicChange('repreciated', event.target.checked)}
                    />
                  }
                  label={BASIC_FIELDS.find((f) => f.id === 'repreciated')?.label}
                />
              </Grid>
            </Grid>
          </Stack>

          <Divider />

          <Stack spacing={2}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h6" fontWeight={600}>
                Advanced Filters
              </Typography>
              <Button
                variant="text"
                endIcon={
                  <ExpandMoreIcon
                    sx={{
                      transform: isAdvancedOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 150ms ease',
                    }}
                  />
                }
                onClick={toggleAdvanced}
              >
                {isAdvancedOpen ? 'Hide' : 'Show'} advanced
              </Button>
            </Stack>

            <Collapse in={isAdvancedOpen} timeout={250} unmountOnExit>
              <Stack spacing={3} sx={{ mt: 1 }}>
                <Autocomplete
                  multiple
                  freeSolo
                  disableCloseOnSelect
                  filterSelectedOptions
                  disablePortal
                  slotProps={{
                    listbox: { style: { maxHeight: 200, overflowY: 'auto' } },
                  }}
                  renderValue={() => null}
                  options={activeParam ? [] : availableAdvancedOptions}
                  getOptionLabel={(option) => option.label}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  value={advancedSelections}
                  inputValue={advancedInputValue}
                  onChange={handleAdvancedChange}
                  onInputChange={handleAdvancedInputChange}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      type={activeParam?.type === 'number' ? 'number' : 'text'}
                      label={activeParam ? `Enter ${activeParam.label.toLowerCase()}` : 'Add advanced parameter'}
                      placeholder={
                        activeParam ? (activeParam.placeholder ?? 'Enter a value') : 'Start typing to search filters'
                      }
                      helperText={
                        activeParam?.helperText ?? (activeParam ? 'Press Enter to save this filter.' : undefined)
                      }
                      inputRef={autocompleteInputRef}
                      onKeyDown={handleAdvancedInputKeyDown}
                    />
                  )}
                />
                {advancedSelections.length > 0 && (
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {advancedSelections.map((selection) => (
                      <CustomTag
                        key={selection.id}
                        selection={selection}
                        onDelete={() => handleRemoveAdvanced(selection.id)}
                        onChipClick={() => handleChipClick(selection)}
                      />
                    ))}
                  </Stack>
                )}
              </Stack>
            </Collapse>
          </Stack>
        </Stack>
      </Paper>
    </Container>
  );
}
