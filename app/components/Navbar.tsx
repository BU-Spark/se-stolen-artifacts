'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Stack, Menu, MenuItem } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useUser, useClerk } from '@clerk/nextjs';

export default function Navbar() {
  const pathname = usePathname();
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  const [adminMenuAnchor, setAdminMenuAnchor] = useState<null | HTMLElement>(null);

  // Determine which buttons to show based on the current path and auth state
  let rightContent = null;
  let isAdmin = false;
  if (
    pathname === '/search' ||
    pathname === '/admin/admin-review' ||
    pathname === '/admin/db-view' ||
    pathname === '/signin' ||
    pathname === '/signup'
  ) {
    rightContent = (
      <Button variant="outlined" startIcon={<ArrowBackIcon />} component={Link} href="/">
        Back to Home
      </Button>
    );
  } else if (pathname === '/' || pathname === '/landing-page') {
    if (isLoaded && isSignedIn) {
      isAdmin = user?.publicMetadata?.role === 'admin';
    }
    // Don't render auth buttons until Clerk has finished loading
    if (!isLoaded) {
      rightContent = null;
    } else if (isSignedIn) {
      const handleAdminMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAdminMenuAnchor(event.currentTarget);
      };

      const handleAdminMenuClose = () => {
        setAdminMenuAnchor(null);
      };

      rightContent = (
        <Stack direction="row" spacing={2} alignItems="center">
          <Typography variant="body1">Welcome, {user?.firstName || 'User'}</Typography>
          {isAdmin && (
            <>
              <Button variant="contained" color="primary" onClick={handleAdminMenuOpen} sx={{ position: 'relative' }}>
                Admin
              </Button>
              <Menu
                anchorEl={adminMenuAnchor}
                open={Boolean(adminMenuAnchor)}
                onClose={handleAdminMenuClose}
                MenuListProps={{
                  'aria-labelledby': 'admin-button',
                }}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'left',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'left',
                }}
              >
                <MenuItem component={Link} href="/admin/admin-review" onClick={handleAdminMenuClose}>
                  Pending Images
                </MenuItem>
                <MenuItem component={Link} href="/admin/db-view" onClick={handleAdminMenuClose}>
                  Admin DB View
                </MenuItem>
              </Menu>
            </>
          )}
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
        <Link
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.75rem',
            textDecoration: 'none',
            color: 'inherit',
          }}
        >
          <Image src="/KSP_Eye.png" alt="Khmer Statuary Project logo" width={32} height={16} priority />
          <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.1 }}>
            Khmer Statuary Project
          </Typography>
        </Link>
        {rightContent}
      </Toolbar>
    </AppBar>
  );
}
