import { Link, List, ListItem, Stack, Typography } from '@mui/material';

export const ModernStackDetails = () => {
  return (
    <Stack spacing={2} component="section">
      <Typography variant="body2">
        This template embraces a modern stack to deliver high performance and developer productivity without sacrificing
        maintainability.
      </Typography>

      <Stack spacing={1}>
        <Typography variant="subtitle2" component="h4">
          <Link href="https://nextjs.org" target="_blank" rel="noopener noreferrer" underline="hover">
            Next.js 15+
          </Link>
        </Typography>
        <List dense sx={{ listStyleType: 'disc', pl: 3 }}>
          <ListItem sx={{ display: 'list-item', pl: 0 }}>
            <Typography variant="body2">
              Full-stack React framework featuring Server Components, the App Router, and route handlers.
            </Typography>
          </ListItem>
          <ListItem sx={{ display: 'list-item', pl: 0 }}>
            <Typography variant="body2">
              Optimises images, fonts, and scripts for exceptional Core Web Vitals.
            </Typography>
          </ListItem>
          <ListItem sx={{ display: 'list-item', pl: 0 }}>
            <Typography variant="body2">An industry-standard choice with a polished developer experience.</Typography>
          </ListItem>
        </List>
      </Stack>

      <Stack spacing={1}>
        <Typography variant="subtitle2" component="h4">
          <Link href="https://react.dev" target="_blank" rel="noopener noreferrer" underline="hover">
            React 19
          </Link>
        </Typography>
        <List dense sx={{ listStyleType: 'disc', pl: 3 }}>
          <ListItem sx={{ display: 'list-item', pl: 0 }}>
            <Typography variant="body2">
              Ships Action APIs,{' '}
              <Link
                href="https://react.dev/reference/react/useOptimistic"
                target="_blank"
                rel="noopener noreferrer"
                underline="hover"
              >
                useOptimistic
              </Link>
              , and enhanced concurrency primitives.
            </Typography>
          </ListItem>
          <ListItem sx={{ display: 'list-item', pl: 0 }}>
            <Typography variant="body2">Emphasises reusable components for clearer architecture.</Typography>
          </ListItem>
          <ListItem sx={{ display: 'list-item', pl: 0 }}>
            <Typography variant="body2">Backed by a vibrant ecosystem and community support.</Typography>
          </ListItem>
        </List>
      </Stack>

      <Stack spacing={1}>
        <Typography variant="subtitle2" component="h4">
          <Link href="https://www.typescriptlang.org" target="_blank" rel="noopener noreferrer" underline="hover">
            TypeScript
          </Link>
        </Typography>
        <List dense sx={{ listStyleType: 'disc', pl: 3 }}>
          <ListItem sx={{ display: 'list-item', pl: 0 }}>
            <Typography variant="body2">Static typing surfaces bugs early and improves code readability.</Typography>
          </ListItem>
          <ListItem sx={{ display: 'list-item', pl: 0 }}>
            <Typography variant="body2">Enhances maintainability and IDE tooling across teams.</Typography>
          </ListItem>
          <ListItem sx={{ display: 'list-item', pl: 0 }}>
            <Typography variant="body2">A best practice choice for scalable JavaScript applications.</Typography>
          </ListItem>
        </List>
      </Stack>
    </Stack>
  );
};
