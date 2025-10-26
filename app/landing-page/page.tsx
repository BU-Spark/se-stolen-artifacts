'use client';

import type { NextPage } from 'next';
import Link from 'next/link';
import { Box, Button, Stack, Typography } from '@mui/material';
import { Search } from '@mui/icons-material';
import MuiLink from '@mui/material/Link';
import { alpha } from '@mui/material/styles';
import { useUser, useClerk } from '@clerk/nextjs';

const LandingPage: NextPage = () => {
  const { isSignedIn, user } = useUser();
  const { signOut } = useClerk();

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
        backgroundImage: 'linear-gradient(180deg, rgba(79,156,249,0.12) 0%, rgba(15,23,42,0.12) 100%)',
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 0,
          display: 'flex',
          '& > span': {
            flex: 1,
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'saturate(0.9)',
            opacity: 0.55,
          },
        }}
      >
        <Box component="span" sx={{ backgroundImage: "url('/temple.jpg')" }} />
      </Box>
      <AppBar
        position="sticky"
        color="transparent"
        sx={{ backdropFilter: 'blur(12px)', zIndex: (theme) => theme.zIndex.appBar + 1 }}
      >
        <Toolbar
          sx={{
            justifyContent: 'space-between',
            gap: 2,
            minHeight: { xs: 72, md: 88 },
            px: { xs: 2, md: 4 },
            width: '100%',
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Khmer Statuary Project
          </Typography>
          <Stack direction="row" spacing={{ xs: 1.5, md: 3 }} alignItems="center">
            {!isSignedIn ? (
              <>
                <Button variant="text" component={Link} href="/signin">
                  Log in
                </Button>
                <Button variant="contained" endIcon={<ArrowForward />} component={Link} href="/signup">
                  Sign up
                </Button>
              </>
            ) : (
              <>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  Hello, {user?.firstName}
                </Typography>
                <Button variant="contained" onClick={() => signOut()}>
                  Sign out
                </Button>
              </>
            )}
          </Stack>
        </Toolbar>
      </AppBar>

      <Box
        component="main"
        sx={{
          position: 'relative',
          zIndex: 1,
          flex: 1,
          minHeight: { xs: 'calc(100vh - 72px)', md: 'calc(100vh - 88px)' },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: { xs: 2, md: 4 },
          py: { xs: 12, md: 16 },
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
            backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.4),
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
              Explore the DataBase
            </Button>
          </Stack>
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
