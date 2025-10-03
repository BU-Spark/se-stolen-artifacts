'use client';

import type { FeatureCardProps } from './FeatureCard.types';
import { Box, Card, Stack, Typography } from '@mui/material';

export const FeatureCard = ({ id, icon, title, description, details, isExpanded, onClick }: FeatureCardProps) => {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick(id);
    }
  };

  return (
    <Card
      onClick={() => onClick(id)}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-expanded={isExpanded}
      aria-controls={`details-${id}`}
      sx={{
        p: 3,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        cursor: 'pointer',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
        borderWidth: 1.5,
        borderStyle: 'solid',
        borderColor: isExpanded ? 'primary.main' : 'divider',
        backgroundImage: isExpanded
          ? (theme) =>
              theme.palette.mode === 'light'
                ? 'linear-gradient(135deg, rgba(79,156,249,0.15), rgba(40,167,69,0.15))'
                : 'linear-gradient(135deg, rgba(79,156,249,0.25), rgba(40,167,69,0.25))'
          : 'none',
        backdropFilter: isExpanded ? 'blur(6px)' : 'none',
        '&:hover': {
          transform: 'translateY(-6px)',
          boxShadow: 6,
        },
      }}
    >
      <Stack spacing={1.5} alignItems="flex-start">
        <Box sx={{ fontSize: '2.5rem', lineHeight: 1 }}>{icon}</Box>
        <Typography variant="h6">{title}</Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </Stack>
      <Box
        id={`details-${id}`}
        data-testid="feature-details"
        aria-hidden={!isExpanded}
        data-expanded={isExpanded}
        sx={{
          mt: isExpanded ? 2 : 0,
          pt: isExpanded ? 2 : 0,
          borderTop: '1px dashed',
          borderColor: 'divider',
          maxHeight: isExpanded ? 320 : 0,
          opacity: isExpanded ? 1 : 0,
          overflow: 'hidden',
          transition: 'all 0.3s ease',
        }}
      >
        <Box sx={{ color: 'text.secondary', fontSize: '0.95rem', lineHeight: 1.7 }}>{details}</Box>
      </Box>
    </Card>
  );
};
