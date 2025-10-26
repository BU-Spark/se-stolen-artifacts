'use client';

import Link from 'next/link';
import { AppBar, Toolbar, Typography, Button, Stack } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function SearchNavbar() {
  return (
    <AppBar
      position="fixed"
      sx={{
        left: 0,
        right: 0,
        top: 0,
        width: '100vw',
        minWidth: '100vw',
        margin: 0,
        padding: 0,
        bgcolor: 'background.paper',
        color: 'text.primary',
        zIndex: (theme) => theme.zIndex.appBar + 1,
        boxShadow: 'none',
      }}
      elevation={1}
    >
      <Toolbar
        sx={{
          justifyContent: 'space-between',
          minHeight: { xs: 44, md: 56 },
          px: { xs: 2, md: 4 },
          width: '100vw',
          minWidth: '100vw',
          margin: 0,
          padding: 0,
        }}
      >
        <Typography
          variant="h6"
          component={Link}
          href="/"
          sx={{ fontWeight: 700, textDecoration: 'none', color: 'inherit' }}
        >
          Khmer Statuary Project
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" startIcon={<ArrowBackIcon />} component={Link} href="/">
            Back to Home
          </Button>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
