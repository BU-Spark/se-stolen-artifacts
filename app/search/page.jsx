'use client';

// hooks
import { useMemo, useRef, useState } from 'react';

// components
import {
  Autocomplete,
  Button,
  Checkbox,
  Collapse,
  Container,
  Divider,
  FormControlLabel,
  Grid,
  Paper,
  Slider,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

// constants
import { BASIC_FIELDS, ADVANCED_PARAMS } from '@/app/search/constants';

// utils
import { getInitialBasicState, normalizeLimbList } from '@/app/search/utils';

// custom components
import CustomTag from '@/app/search/components/CustomTag';

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

  const subjectField = BASIC_FIELDS.find((field) => field.id === 'subject');
  const supportingTextFields = BASIC_FIELDS.filter((field) => field.type === 'text' && field.id !== 'subject');
  const sliderFields = BASIC_FIELDS.filter((field) => field.type === 'slider');
  const checkboxField = BASIC_FIELDS.find((field) => field.type === 'checkbox');

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
      if (field.type === 'slider') {
        const sliderValue = Array.isArray(value) ? value : field.defaultValue;
        return sliderValue[0] !== field.min || sliderValue[1] !== field.max;
      }
      return String(value ?? '').trim() !== '';
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
              <Button type="submit" variant="contained" size="large" sx={{ px: 4, py: 1.5 }}>
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
                <Stack spacing={3}>
                  {subjectField ? (
                    <TextField
                      fullWidth
                      label={subjectField.label}
                      placeholder={subjectField.placeholder}
                      value={basicValues[subjectField.id]}
                      onChange={(event) => handleBasicChange(subjectField.id, event.target.value)}
                    />
                  ) : null}

                  {supportingTextFields.length > 0 ? (
                    <Grid container spacing={2}>
                      {supportingTextFields.map((field) => (
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
                  ) : null}

                  {sliderFields.length > 0 ? (
                    <Stack spacing={3}>
                      {sliderFields.map((field) => {
                        const sliderValue = Array.isArray(basicValues[field.id])
                          ? basicValues[field.id]
                          : [...field.defaultValue];
                        const [rangeStart, rangeEnd] = sliderValue;

                        return (
                          <Stack key={field.id} spacing={1.5} sx={{ px: { xs: 0, sm: 1 } }}>
                            <Stack direction="row" alignItems="center" justifyContent="space-between">
                              <Typography variant="subtitle2" fontWeight={600} color="text.primary">
                                {field.label}
                              </Typography>
                            </Stack>
                            <Stack
                              direction="row"
                              alignItems="center"
                              spacing={2}
                              sx={{ width: { xs: '100%', md: '75%', ml: 10 } }}
                            >
                              <Slider
                                color="secondary"
                                min={field.min}
                                max={field.max}
                                step={1}
                                marks={[
                                  { value: field.min, label: String(field.min) },
                                  { value: field.max, label: String(field.max) },
                                ]}
                                value={sliderValue}
                                valueLabelDisplay="auto"
                                sx={{ flexGrow: 1 }}
                                onChange={(_event, newValue) => {
                                  if (Array.isArray(newValue) && newValue.length === 2) {
                                    handleBasicChange(field.id, [...newValue]);
                                  }
                                }}
                              />
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ minWidth: 100, textAlign: 'right' }}
                              >
                                {`${rangeStart} - ${rangeEnd}`}
                              </Typography>
                            </Stack>
                          </Stack>
                        );
                      })}
                    </Stack>
                  ) : null}

                  {checkboxField ? (
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={Boolean(basicValues[checkboxField.id])}
                          onChange={(event) => handleBasicChange(checkboxField.id, event.target.checked)}
                        />
                      }
                      label={checkboxField.label}
                      sx={{ alignSelf: 'flex-start', mt: 1 }}
                    />
                  ) : null}
                </Stack>
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
