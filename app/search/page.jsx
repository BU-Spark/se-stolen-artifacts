'use client';

import React, { useState } from 'react';
import {
  Container,
  TextField,
  Typography,
  Box,
  Grid,
  Slider,
  FormControlLabel,
  Checkbox,
  Button,
  FormGroup,
  Paper,
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#607d8b',
    },
    secondary: {
      main: '#8d6e63',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
    h4: {
      fontWeight: 600,
      marginBottom: '1rem',
    },
    h6: {
      fontWeight: 500,
      marginBottom: '1rem',
      color: '#455a64',
    },
  },
});

function valuetext(value) {
  return `${value}`;
}

export default function SearchPage() {
  const [yearAppearance, setYearAppearance] = useState([1900, 2000]);
  const [datePhotograph, setDatePhotograph] = useState([1950, 2025]);

  const handleYearChange = (event, newValue) => {
    setYearAppearance(newValue);
  };

  const handleDateChange = (event, newValue) => {
    setDatePhotograph(newValue);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, md: 4 },
            borderRadius: '16px',
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h4" gutterBottom>
              Cambodian Statue Archive Search
            </Typography>
            <TextField
              fullWidth
              id="main-search"
              label="Search by Title or Keywords"
              variant="outlined"
              sx={{ maxWidth: '700px' }}
            />
          </Box>

          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Box>
                <Typography variant="h6">Identifiers</Typography>
                <TextField fullWidth id="irn-search" label="IRN Number" variant="outlined" sx={{ mb: 2 }} />
                <TextField fullWidth id="location-search" label="Location" variant="outlined" />
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box>
                <Typography variant="h6">Attributes</Typography>
                <FormGroup sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
                  <FormControlLabel control={<Checkbox />} label="Repatriated" />
                  <FormControlLabel control={<Checkbox />} label="Multiple Heads" />
                  <FormControlLabel control={<Checkbox />} label="Fragmentary" />
                </FormGroup>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Box>
                <Typography id="year-appearance-slider-label" gutterBottom>
                  Year of Appearance Range: {yearAppearance[0]} - {yearAppearance[1]}
                </Typography>
                <Slider
                  getAriaLabel={() => 'Year of Appearance Range'}
                  value={yearAppearance}
                  onChange={handleYearChange}
                  valueLabelDisplay="auto"
                  getAriaValueText={valuetext}
                  min={500}
                  max={2024}
                  marks={[
                    { value: 500, label: '500' },
                    { value: 1250, label: '1250' },
                    { value: 2024, label: '2024' },
                  ]}
                />
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Box>
                <Typography id="date-photograph-slider-label" gutterBottom>
                  Date of Photograph Range: {datePhotograph[0]} - {datePhotograph[1]}
                </Typography>
                <Slider
                  getAriaLabel={() => 'Date of Photograph Range'}
                  value={datePhotograph}
                  onChange={handleDateChange}
                  valueLabelDisplay="auto"
                  getAriaValueText={valuetext}
                  min={1900}
                  max={2024}
                  marks={[
                    { value: 1900, label: '1900' },
                    { value: 1960, label: '1960' },
                    { value: 2024, label: '2024' },
                  ]}
                />
              </Box>
            </Grid>
          </Grid>

          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Button variant="contained" color="primary" size="large">
              Search
            </Button>
          </Box>
        </Paper>
      </Container>
    </ThemeProvider>
  );
}
