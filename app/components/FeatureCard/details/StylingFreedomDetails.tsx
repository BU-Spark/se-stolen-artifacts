import { Link, List, ListItem, Stack, Typography } from '@mui/material';

const stylingLibraries = [
  { name: 'Tailwind CSS', url: 'https://tailwindcss.com' },
  { name: 'Emotion', url: 'https://emotion.sh' },
  { name: 'Styled Components', url: 'https://styled-components.com' },
];

const componentLibraries = [
  { name: 'Material UI', url: 'https://mui.com', note: "Google's component system" },
  { name: 'Chakra UI', url: 'https://chakra-ui.com' },
  { name: 'Mantine', url: 'https://mantine.dev' },
  { name: 'Radix UI', url: 'https://radix-ui.com', note: 'Unstyled, accessible primitives' },
  { name: 'Ant Design', url: 'https://ant.design/', note: "Alibaba's enterprise library" },
  { name: 'shadcn/ui', url: 'https://ui.shadcn.com', note: 'Radix primitives + Tailwind styling' },
];

export const StylingFreedomDetails = () => {
  return (
    <Stack spacing={2} component="section">
      <Typography variant="body2">
        The template intentionally remains styling-library agnostic so you can adopt the approach that best suits your
        product. Historical CSS modules provide a minimal baseline, but you can layer in any design system.
      </Typography>
      <Typography variant="body2">
        Explore the{' '}
        <Link
          href="https://nextjs.org/docs/app/building-your-application/styling/css-modules"
          target="_blank"
          rel="noopener noreferrer"
          underline="hover"
        >
          CSS Modules guide
        </Link>{' '}
        to understand the default setup before swapping in your preferred tooling.
      </Typography>

      <Typography variant="subtitle2" component="h4">
        Popular styling utilities
      </Typography>
      <List dense sx={{ listStyleType: 'disc', pl: 3 }}>
        {stylingLibraries.map((library) => (
          <ListItem key={library.name} sx={{ display: 'list-item', pl: 0 }}>
            <Link href={library.url} target="_blank" rel="noopener noreferrer" underline="hover">
              {library.name}
            </Link>
          </ListItem>
        ))}
      </List>

      <Typography variant="subtitle2" component="h4">
        Component libraries to evaluate
      </Typography>
      <List dense sx={{ listStyleType: 'disc', pl: 3 }}>
        {componentLibraries.map((library) => (
          <ListItem key={library.name} sx={{ display: 'list-item', pl: 0 }}>
            <Typography variant="body2">
              <Link href={library.url} target="_blank" rel="noopener noreferrer" underline="hover">
                {library.name}
              </Link>
              {library.note ? ` (${library.note})` : ''}
            </Typography>
          </ListItem>
        ))}
      </List>
    </Stack>
  );
};
