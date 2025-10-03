'use client';

import type { NextPage } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
  AppBar,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Container,
  Grid,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material';
import { ArrowForward, Insights, Security, TravelExplore } from '@mui/icons-material';
import { ThemeToggle } from '../components/ThemeToggle';

const LandingPage: NextPage = () => {
  const missionHighlights = [
    {
      icon: <Insights fontSize="large" color="primary" />,
      title: 'Data + Heritage',
      description:
        'We pair provenance researchers with machine learning engineers to surface missing links in artifact histories.',
      image: '/about/artifact-card.svg',
    },
    {
      icon: <TravelExplore fontSize="large" color="primary" />,
      title: 'Global Network',
      description:
        'Partnerships with cultural ministries and museums on six continents let us investigate leads quickly.',
      image: '/globe.svg',
    },
    {
      icon: <Security fontSize="large" color="primary" />,
      title: 'Secure Collaboration',
      description:
        'A shared evidence vault enables investigators to coordinate discreet recoveries and return ceremonies.',
      image: '/window.svg',
    },
  ];

  const teamMembers = [
    {
      name: 'Ava Chen',
      role: 'Head of Provenance Research',
      image: '/team/ava-chen.svg',
      alt: 'Portrait of Ava Chen',
    },
    {
      name: 'Liam Patel',
      role: 'Machine Learning Lead',
      image: '/team/liam-patel.svg',
      alt: 'Portrait of Liam Patel',
    },
    {
      name: 'Nina Ross',
      role: 'Field Outreach Director',
      image: '/team/nina-ross.svg',
      alt: 'Portrait of Nina Ross',
    },
    {
      name: 'Mateo Ruiz',
      role: 'Cultural Heritage Analyst',
      image: '/team/mateo-ruiz.svg',
      alt: 'Portrait of Mateo Ruiz',
    },
    {
      name: 'Sam Park',
      role: 'Security & Compliance Officer',
      image: '/team/sam-park.svg',
      alt: 'Portrait of Sam Park',
    },
    {
      name: 'Zoe Hendrix',
      role: 'Partnerships Manager',
      image: '/team/zoe-hendrix.svg',
      alt: 'Portrait of Zoe Hendrix',
    },
  ];

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
            Machine Learning for Stolen Artifacts
          </Typography>
          <Stack direction="row" spacing={{ xs: 1.5, md: 3 }} alignItems="center">
            <Stack direction="row" spacing={{ xs: 1.5, md: 2 }} sx={{ display: { xs: 'none', md: 'flex' } }}>
              <Button color="inherit" size="medium" component={Link} href="#about">
                About
              </Button>
              <Button color="inherit" size="medium" component={Link} href="#team">
                Team
              </Button>
            </Stack>
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

      <Box component="main">
        <Container component="section" sx={{ py: { xs: 10, md: 16 } }}>
          <Grid container spacing={{ xs: 6, md: 10 }} alignItems="center">
            <Grid item xs={12} md={6}>
              <Stack spacing={3}>
                <Typography variant="h5" color="text.primary">
                  This database and search engine is an initiative of the Khmer Statuary Project. Please visit our
                  website to read more about the design of this tool, the project&#39;s aims and objectives, and the
                  problem of looting and how we hope to address it.
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  aspectRatio: '4 / 3',
                  borderRadius: 6,
                  overflow: 'hidden',
                  boxShadow: (theme) =>
                    theme.palette.mode === 'light'
                      ? '0 32px 64px rgba(15,23,42,0.15)'
                      : '0 32px 64px rgba(10,14,25,0.45)',
                  backgroundColor: 'background.paper',
                }}
              >
                <Image src="/window.svg" alt="Investigation workspace" fill priority style={{ objectFit: 'cover' }} />
              </Box>
            </Grid>
          </Grid>
        </Container>

        <Container component="section" id="about" sx={{ py: { xs: 8, md: 12 } }}>
          <Stack spacing={3} textAlign="center" maxWidth={760} mx="auto">
            <Typography variant="h3">A Glance of the DataBase</Typography>
          </Stack>
          <Grid container spacing={{ xs: 4, md: 6 }} sx={{ mt: { xs: 6, md: 8 } }}>
            {missionHighlights.map((highlight) => (
              <Grid item xs={12} md={4} key={highlight.title}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <CardHeader
                    avatar={
                      <Box
                        sx={{
                          width: 56,
                          height: 56,
                          borderRadius: 3,
                          display: 'grid',
                          placeItems: 'center',
                          backgroundColor: (theme) => theme.palette.action.selected,
                        }}
                      >
                        {highlight.icon}
                      </Box>
                    }
                    title={highlight.title}
                    titleTypographyProps={{ variant: 'h6' }}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      {highlight.description}
                    </Typography>
                  </CardContent>
                  <Box
                    sx={{
                      position: 'relative',
                      width: '100%',
                      pb: '65%',
                      borderRadius: '0 0 16px 16px',
                      overflow: 'hidden',
                    }}
                  >
                    <Image src={highlight.image} alt={highlight.title} fill style={{ objectFit: 'cover' }} />
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>

        <Container component="section" id="team" sx={{ py: { xs: 8, md: 12 } }}>
          <Stack spacing={3} textAlign="center" maxWidth={720} mx="auto">
            <Typography variant="h3">Specialists across provenance, policy, and product</Typography>
            <Typography variant="body1" color="text.secondary">
              Each case team combines historians, investigators, community advocates, and security experts to ensure
              repatriations honour the cultures we serve.
            </Typography>
          </Stack>
          <Grid container spacing={{ xs: 4, sm: 6, md: 8 }} sx={{ mt: { xs: 5, md: 8 } }}>
            {teamMembers.map((member) => (
              <Grid item xs={12} sm={6} md={4} key={member.name}>
                <Card sx={{ textAlign: 'center', py: 4, px: 3, height: '100%' }}>
                  <Box
                    sx={{
                      mx: 'auto',
                      width: 120,
                      height: 120,
                      borderRadius: '50%',
                      overflow: 'hidden',
                      border: (theme) => `4px solid ${theme.palette.primary.main}`,
                      mb: 3,
                    }}
                  >
                    <Image
                      src={member.image}
                      alt={member.alt}
                      width={160}
                      height={160}
                      style={{ width: '100%', height: '100%' }}
                    />
                  </Box>
                  <Typography variant="h6">{member.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {member.role}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      <Box component="footer" sx={{ py: 6, borderTop: (theme) => `1px solid ${theme.palette.divider}` }}>
        <Container>
          <Grid container spacing={4}>
            <Grid item xs={12} md={5}>
              <Typography variant="h6" gutterBottom>
                Machine Learning for Stolen Artifacts
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Purpose-built tooling for tracing cultural heritage, orchestrating secure returns, and documenting
                celebratory reunifications.
              </Typography>
            </Grid>
            <Grid item xs={6} md={2}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }} gutterBottom>
                Product
              </Typography>
              <Stack spacing={1.25}>
                <Button color="inherit" component={Link} href="#about" sx={{ justifyContent: 'flex-start', px: 0 }}>
                  Overview
                </Button>
                <Button color="inherit" component={Link} href="/signup" sx={{ justifyContent: 'flex-start', px: 0 }}>
                  Pricing
                </Button>
                <Button color="inherit" component={Link} href="/login" sx={{ justifyContent: 'flex-start', px: 0 }}>
                  Case studies
                </Button>
              </Stack>
            </Grid>
            <Grid item xs={6} md={2}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }} gutterBottom>
                Resources
              </Typography>
              <Stack spacing={1.25}>
                <Button color="inherit" component={Link} href="/" sx={{ justifyContent: 'flex-start', px: 0 }}>
                  Blog
                </Button>
                <Button color="inherit" component={Link} href="/" sx={{ justifyContent: 'flex-start', px: 0 }}>
                  Guides
                </Button>
                <Button color="inherit" component={Link} href="/" sx={{ justifyContent: 'flex-start', px: 0 }}>
                  Help center
                </Button>
              </Stack>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }} gutterBottom>
                Stay in touch
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Join our monthly briefing on restitution cases and research breakthroughs.
              </Typography>
            </Grid>
          </Grid>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 4 }}>
            © {new Date().getFullYear()} Machine Learning for Stolen Artifacts. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;
