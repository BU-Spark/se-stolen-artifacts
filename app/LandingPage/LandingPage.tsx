'use client';

import type { NextPage } from 'next';
import Link from 'next/link';
import { AppBar, Box, Button, Stack, Toolbar, Typography } from '@mui/material';
import { ArrowForward, Search } from '@mui/icons-material';
import { ThemeToggle } from '../components/ThemeToggle';
import MuiLink from '@mui/material/Link';
import { alpha } from '@mui/material/styles';

const LandingPage: NextPage = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundImage: (theme) =>
          theme.palette.mode === 'light'
            ? 'linear-gradient(180deg, rgba(79,156,249,0.12) 0%, rgba(15,23,42,0.04) 100%)'
            : 'linear-gradient(180deg, rgba(15,23,42,0.85) 0%, rgba(11,17,25,0.92) 100%)',
      }}
    >
      <AppBar position="sticky" color="transparent" sx={{ backdropFilter: 'blur(12px)' }}>
        <Toolbar sx={{ justifyContent: 'space-between', gap: 2, minHeight: { xs: 72, md: 88 } }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Khmer Statuary Project
          </Typography>
          <Stack direction="row" spacing={{ xs: 1.5, md: 3 }} alignItems="center">
            <Stack direction="row" spacing={1}>
              <Button variant="text" component={Link} href="/login">
                Log in
              </Button>
              <Button variant="contained" endIcon={<ArrowForward />} component={Link} href="/signup">
                Sign up
              </Button>
            </Stack>
            <ThemeToggle />
          </Stack>
        </Toolbar>
      </AppBar>

      <Box
        component="main"
        sx={{
          position: 'relative',
          minHeight: { xs: 'calc(100vh - 72px)', md: 'calc(100vh - 88px)' },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: { xs: 2, md: 4 },
          py: { xs: 12, md: 16 },
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            display: 'flex',
            '& > span': {
              flex: 1,
              backgroundRepeat: 'no-repeat',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: (theme) => (theme.palette.mode === 'light' ? 'saturate(0.9)' : 'brightness(0.85)'),
              opacity: (theme) => (theme.palette.mode === 'light' ? 0.6 : 0.5),
            },
          }}
        >
          <Box component="span" sx={{ backgroundImage: "url('temple.jpg')" }} />
        </Box>
        <Box
          sx={{
            position: 'relative',
            zIndex: 1,
            width: '100%',
            maxWidth: 540,
            borderRadius: 5,
            px: { xs: 3, md: 6 },
            py: { xs: 4, md: 6 },
            boxShadow: (theme) =>
              theme.palette.mode === 'light' ? '0 30px 80px rgba(15,23,42,0.25)' : '0 32px 90px rgba(0,0,0,0.55)',
            backgroundColor: (theme) =>
              alpha(
                theme.palette.mode === 'light' ? theme.palette.background.paper : theme.palette.background.default,
                theme.palette.mode === 'light' ? 0.4 : 0.3
              ),
            backdropFilter: 'blur(24px)',
          }}
        >
          <Stack spacing={3} alignItems="center" textAlign="center">
            <Box
              sx={{
                backgroundColor: 'primary.main',
                color: 'common.white',
                px: 2.5,
                py: 0.75,
                borderRadius: 9999,
                fontSize: { xs: '0.75rem', md: '0.875rem' },
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: 0.8,
              }}
            >
              Introduction
            </Box>
            <Typography variant="h6" color="text.primary">
              This database and search engine is an initiative of the Khmer Statuary Project. Please visit{' '}
              <MuiLink
                href="statuaryproject.org"
                target="_blank"
                rel="noopener"
                sx={{
                  color: 'primary.main',
                  fontWeight: 600,
                  textDecoration: 'none',
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
              >
                our website(statuaryproject.org)
              </MuiLink>{' '}
              to read more about the design of this tool, the project&#39;s aims and objectives, and the problem of
              looting and how we hope to address it.
            </Typography>
            <Button variant="contained" size="large" component={Link} href="/search" endIcon={<Search />}>
              Explore the DataBase
            </Button>
          </Stack>
        </Box>
      </Box>
      <Box
        component="footer"
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          py: 4,
          px: { xs: 2, md: 4 },
          backgroundColor: (theme) =>
            theme.palette.mode === 'light'
              ? alpha(theme.palette.grey[50], 0.9)
              : alpha(theme.palette.background.paper, 0.4),
          borderTop: (theme) => `1px solid ${alpha(theme.palette.divider, 0.6)}`,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Contact Us: <MuiLink href="mailto:statuaryproject@gmail.com">statuaryproject@gmail.com</MuiLink>
        </Typography>
      </Box>
    </Box>
  );
};

export default LandingPage;
