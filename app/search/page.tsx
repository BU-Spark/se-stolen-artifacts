import { Container, Paper, Stack, Typography } from '@mui/material';

const LoginPage = () => {
  return (
    <Container maxWidth="sm" sx={{ py: { xs: 10, md: 14 } }}>
      <Paper elevation={3} sx={{ p: { xs: 4, md: 6 }, borderRadius: 4 }}>
        <Stack spacing={4}>
          <Stack spacing={1.5}>
            <Typography variant="h3" component="h1">
              Search
            </Typography>
          </Stack>
        </Stack>
      </Paper>
    </Container>
  );
};

export default LoginPage;
