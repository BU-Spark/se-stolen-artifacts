'use client';

import * as React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Stack,
  Link,
  FormControlLabel,
  Checkbox,
} from '@mui/material';

export default function Login() {
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // TODO: form handling
  }

  return (
    <Box minHeight="100vh" display="flex" alignItems="center" justifyContent="center" px={2}>
      <Card sx={{ width: '100%', maxWidth: 400, borderRadius: 3 }} elevation={4}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" align="center" fontWeight={700} color="text.primary" mb={3}>
            Login
          </Typography>

          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2}>
              {/* Email */}
              <TextField id="email" name="email" type="email" label="Email" placeholder="Enter your email" fullWidth />

              {/* Password */}
              <TextField
                id="password"
                name="password"
                type="password"
                label="Password"
                placeholder="Enter your password"
                fullWidth
              />

              {/* Remember + Forgot */}
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <FormControlLabel
                  control={<Checkbox size="small" />}
                  label={<Typography variant="body2">Remember me</Typography>}
                />
                <Link href="#" underline="hover" variant="body2" color="primary">
                  Forgot password?
                </Link>
              </Stack>

              {/* Submit */}
              <Button type="submit" variant="contained" size="medium" fullWidth>
                Sign In
              </Button>
            </Stack>
          </Box>

          <Typography variant="body2" align="center" mt={3} color="text.secondary">
            Don&apos;t have an account?{' '}
            <Link href="#" underline="hover" color="primary">
              Sign up
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
