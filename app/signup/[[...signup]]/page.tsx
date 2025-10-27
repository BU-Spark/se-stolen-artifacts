'use client';

import { useState } from 'react';
import { useSignUp } from '@clerk/nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Box, Button, TextField, Typography, Paper, Divider, Alert, CircularProgress, Stack } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

export default function SignUpPage() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect_url') || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    setLoading(true);
    setError('');

    try {
      await signUp.create({
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        emailAddress: email,
        password,
      });

      // Send email verification code
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setVerifying(true);
    } catch (err) {
      console.error('Sign up error:', err);
      const message =
        err && typeof err === 'object' && 'errors' in err && Array.isArray(err.errors)
          ? err.errors[0]?.message
          : 'Failed to create account';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    setLoading(true);
    setError('');

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (completeSignUp.status === 'complete') {
        await setActive({ session: completeSignUp.createdSessionId });
        router.push(redirectUrl);
      } else {
        setError('Verification incomplete. Please try again.');
      }
    } catch (err) {
      console.error('Verification error:', err);
      const message =
        err && typeof err === 'object' && 'errors' in err && Array.isArray(err.errors)
          ? err.errors[0]?.message
          : 'Invalid verification code';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    if (!isLoaded) return;

    setLoading(true);
    setError('');

    try {
      await signUp.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: window.location.href,
        redirectUrlComplete: redirectUrl,
      });
    } catch (err) {
      console.error('Google sign up error:', err);
      const message =
        err && typeof err === 'object' && 'errors' in err && Array.isArray(err.errors)
          ? err.errors[0]?.message
          : 'Failed to sign up with Google';
      setError(message);
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
          px: 2,
        }}
      >
        <Paper
          elevation={8}
          sx={{
            maxWidth: 420,
            width: '100%',
            p: 3,
            backdropFilter: 'blur(10px)',
            background: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid rgba(3, 46, 161, 0.1)',
          }}
        >
          <Stack spacing={2.5}>
            <Box sx={{ textAlign: 'center' }}>
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  bgcolor: 'primary.main',
                  mb: 1.5,
                  background: 'linear-gradient(135deg, #E00025, #B8001E)',
                }}
              >
                <PersonAddOutlinedIcon sx={{ fontSize: 28, color: 'white' }} />
              </Box>
              <Typography variant="h5" fontWeight={700} color="secondary.main" gutterBottom>
                Verify Your Email
              </Typography>
              <Typography variant="body2" color="text.secondary">
                We&apos;ve sent a code to <strong>{email}</strong>
              </Typography>
            </Box>

            {error && <Alert severity="error">{error}</Alert>}

            <form onSubmit={handleVerify}>
              <Stack spacing={1.5}>
                <TextField
                  fullWidth
                  label="Verification Code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                  disabled={loading}
                  autoFocus
                  placeholder="Enter 6-digit code"
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      boxShadow: 'none',
                    },
                  }}
                />

                <Button
                  fullWidth
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  endIcon={loading ? <CircularProgress size={18} color="inherit" /> : <ArrowForwardIcon />}
                  sx={{
                    py: 1.2,
                    mt: 0.5,
                  }}
                >
                  {loading ? 'Verifying...' : 'Verify Email'}
                </Button>

                <Button fullWidth variant="text" onClick={() => setVerifying(false)} disabled={loading}>
                  Back to Sign Up
                </Button>
              </Stack>
            </form>
          </Stack>
        </Paper>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
        px: 2,
      }}
    >
      <Paper
        elevation={8}
        sx={{
          maxWidth: 420,
          width: '100%',
          p: 3,
          backdropFilter: 'blur(10px)',
          background: 'rgba(255, 255, 255, 0.95)',
          border: '1px solid rgba(3, 46, 161, 0.1)',
        }}
      >
        <Stack spacing={2.5}>
          {/* Header */}
          <Box sx={{ textAlign: 'center' }}>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 56,
                height: 56,
                borderRadius: '50%',
                bgcolor: 'primary.main',
                mb: 1.5,
                background: 'linear-gradient(135deg, #E00025, #B8001E)',
              }}
            >
              <PersonAddOutlinedIcon sx={{ fontSize: 28, color: 'white' }} />
            </Box>
            <Typography variant="h5" fontWeight={700} color="secondary.main" gutterBottom>
              Create Account
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Join the Khmer Statuary Project
            </Typography>
          </Box>

          {error && <Alert severity="error">{error}</Alert>}

          {/* Google Sign Up */}
          <Button
            fullWidth
            variant="outlined"
            startIcon={<GoogleIcon />}
            onClick={handleGoogleSignUp}
            disabled={loading}
            sx={{
              py: 1.2,
              borderWidth: 2,
              '&:hover': {
                borderWidth: 2,
              },
            }}
          >
            Continue with Google
          </Button>

          {/* Divider */}
          <Divider>
            <Typography variant="body2" color="text.secondary">
              or
            </Typography>
          </Divider>

          {/* Sign Up Form */}
          <form onSubmit={handleSubmit}>
            <Stack spacing={1.5}>
              <Stack direction="row" spacing={1.5}>
                <TextField
                  fullWidth
                  label={
                    <>
                      First name
                      <Box
                        component="span"
                        className="optional-text"
                        sx={{ ml: 'auto', pl: 4, color: 'text.secondary' }}
                      >
                        Optional
                      </Box>
                    </>
                  }
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  disabled={loading}
                  autoComplete="given-name"
                  autoFocus
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      boxShadow: 'none',
                    },
                    '& .MuiInputLabel-root:not(.MuiInputLabel-shrink) .optional-text': {
                      fontSize: '0.65rem',
                    },
                    '& .MuiInputLabel-root.MuiInputLabel-shrink .optional-text': {
                      fontSize: '0.75rem',
                    },
                  }}
                />
                <TextField
                  fullWidth
                  label={
                    <>
                      Last name
                      <Box
                        component="span"
                        className="optional-text"
                        sx={{ ml: 'auto', pl: 4, color: 'text.secondary' }}
                      >
                        Optional
                      </Box>
                    </>
                  }
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={loading}
                  autoComplete="family-name"
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      boxShadow: 'none',
                    },
                    '& .MuiInputLabel-root:not(.MuiInputLabel-shrink) .optional-text': {
                      fontSize: '0.65rem',
                    },
                    '& .MuiInputLabel-root.MuiInputLabel-shrink .optional-text': {
                      fontSize: '0.75rem',
                    },
                  }}
                />
              </Stack>

              <TextField
                fullWidth
                label="Email address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                autoComplete="email"
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    boxShadow: 'none',
                  },
                }}
              />

              <TextField
                fullWidth
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                autoComplete="new-password"
                helperText="Must be at least 8 characters"
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    boxShadow: 'none',
                  },
                }}
              />

              <Button
                fullWidth
                type="submit"
                variant="contained"
                disabled={loading}
                endIcon={loading ? <CircularProgress size={18} color="inherit" /> : <ArrowForwardIcon />}
                sx={{
                  py: 1.2,
                  mt: 0.5,
                }}
              >
                {loading ? 'Creating account...' : 'Sign Up'}
              </Button>
            </Stack>
          </form>

          {/* Footer Links */}
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{' '}
              <Link
                href={redirectUrl !== '/' ? `/signin?redirect_url=${encodeURIComponent(redirectUrl)}` : '/signin'}
                style={{ color: '#E00025', fontWeight: 600 }}
              >
                Sign in
              </Link>
            </Typography>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
}
