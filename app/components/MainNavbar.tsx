'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AppBar, Toolbar, Typography, Button, Stack } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useUser, useClerk } from '@clerk/nextjs';

export default function MainNavbar() {
  const pathname = usePathname();
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useClerk();

  // Determine which buttons to show based on the current path and auth state
  let rightContent = null;
  if (pathname === '/search') {
    rightContent = (
      <Button variant="outlined" startIcon={<ArrowBackIcon />} component={Link} href="/">
        Back to Home
      </Button>
    );
  } else if (pathname === '/' || pathname === '/landing-page') {
    if (isLoaded && isSignedIn) {
      rightContent = (
        <Stack direction="row" spacing={2} alignItems="center">
          <Typography variant="body1">Welcome, {user?.firstName || 'User'}</Typography>
          <Button variant="outlined" onClick={() => signOut({ redirectUrl: '/' })}>
            Log out
          </Button>
        </Stack>
      );
    } else {
      rightContent = (
        <Stack direction="row" spacing={2}>
          <Button variant="text" component={Link} href="/signin">
            Log in
          </Button>
          <Button variant="contained" endIcon={<ArrowForwardIcon />} component={Link} href="/signup">
            Sign up
          </Button>
        </Stack>
      );
    }
  }

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
        {rightContent}
      </Toolbar>
    </AppBar>
  );
}
