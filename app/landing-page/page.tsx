'use client';

import type { NextPage } from 'next';
import Link from 'next/link';
import { Box, Button, Stack, Typography } from '@mui/material';
import { Search } from '@mui/icons-material';
import MuiLink from '@mui/material/Link';
import { alpha } from '@mui/material/styles';

const LandingPage: NextPage = () => {
  return (
    <Box
      sx={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        width: '100vw',
        left: '50%',
        right: '50%',
        marginLeft: '-50vw',
        marginRight: '-50vw',
        overflowX: 'hidden',
        backgroundColor: (theme) => theme.palette.background.default,
      }}
    >
      <Box
        component="main"
        sx={{
          position: 'relative',
          zIndex: 1,
          flex: 1,
          width: '100%',
          minHeight: { xs: 'calc(100vh - 72px)', md: 'calc(100vh - 88px)' },
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'stretch', md: 'stretch' },
        }}
      >
        <Box
          sx={{
            flex: { xs: '0 0 auto', md: '1 1 50%' },
            width: { xs: '100%', md: '50%' },
            position: 'relative',
            minHeight: { xs: 240, md: '100%' },
            overflow: 'hidden',
          }}
        >
          <Box
            component="img"
            src="/logo.jpeg"
            alt="Khmer Statuary Project Logo"
            sx={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        </Box>
        <Box
          sx={{
            flex: { xs: '0 0 auto', md: '1 1 50%' },
            width: { xs: '100%', md: '50%' },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            px: { xs: 3, md: 6 },
            py: { xs: 6, md: 8 },
          }}
        >
          <Box
            sx={{
              position: 'relative',
              zIndex: 1,
              width: '100%',
              maxWidth: 560,
              borderRadius: 5,
              px: { xs: 4, md: 7 },
              py: { xs: 5, md: 7 },
              boxShadow: '0 32px 90px rgba(15,23,42,0.35)',
              backgroundColor: 'background.paper',
            }}
          >
            <Stack spacing={3} alignItems={{ xs: 'center', md: 'flex-start' }} textAlign={{ xs: 'center', md: 'left' }}>
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
                  href="https://statuaryproject.org"
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
                  our website (statuaryproject.org)
                </MuiLink>{' '}
                to read more about the design of this tool, the project&apos;s aims and objectives, and the problem of
                looting and how we hope to address it.
              </Typography>
              <Button variant="contained" size="large" component={Link} href="/search" endIcon={<Search />}>
                Explore the Database
              </Button>
            </Stack>
          </Box>
        </Box>
      </Box>
      <Box
        component="footer"
        sx={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          py: 4,
          px: { xs: 2, md: 4 },
          backgroundColor: (theme) => alpha(theme.palette.grey[100], 0.85),
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
