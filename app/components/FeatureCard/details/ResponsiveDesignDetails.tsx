import { Link, List, ListItem, Stack, Typography } from '@mui/material';

export const ResponsiveDesignDetails = () => {
  return (
    <Stack spacing={2} component="section">
      <Typography variant="body2">
        Ensuring your application looks and functions flawlessly across all device sizes—desktops, tablets, and
        mobiles—is crucial for user experience and accessibility.
      </Typography>

      <Typography variant="subtitle2" component="h4">
        <Link
          href="https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Responsive/Responsive_design_building_blocks"
          target="_blank"
          rel="noopener noreferrer"
          underline="hover"
        >
          Core principles of responsive design
        </Link>
      </Typography>
      <List dense sx={{ listStyleType: 'disc', pl: 3 }}>
        <ListItem sx={{ display: 'list-item', pl: 0 }}>
          <Typography variant="body2">Fluid grids keep layouts flexible with relative units.</Typography>
        </ListItem>
        <ListItem sx={{ display: 'list-item', pl: 0 }}>
          <Typography variant="body2">Images and media scale within containers to prevent overflow.</Typography>
        </ListItem>
        <ListItem sx={{ display: 'list-item', pl: 0 }}>
          <Typography variant="body2">
            Targeted media queries ensure components adapt to viewport and orientation.
          </Typography>
        </ListItem>
      </List>

      <Typography variant="subtitle2" component="h4">
        Benefits of responsive design
      </Typography>
      <List dense sx={{ listStyleType: 'disc', pl: 3 }}>
        <ListItem sx={{ display: 'list-item', pl: 0 }}>
          <Typography variant="body2">Consistent experiences across devices increase satisfaction.</Typography>
        </ListItem>
        <ListItem sx={{ display: 'list-item', pl: 0 }}>
          <Typography variant="body2">Mobile-friendly sites receive better search visibility.</Typography>
        </ListItem>
        <ListItem sx={{ display: 'list-item', pl: 0 }}>
          <Typography variant="body2">Accessible design broadens reach and supports inclusivity.</Typography>
        </ListItem>
      </List>

      <Typography variant="subtitle2" component="h4">
        Testing responsive behaviour
      </Typography>
      <List dense sx={{ listStyleType: 'disc', pl: 3 }}>
        <ListItem sx={{ display: 'list-item', pl: 0 }}>
          <Typography variant="body2">Use browser DevTools to emulate a wide range of screen sizes.</Typography>
        </ListItem>
        <ListItem sx={{ display: 'list-item', pl: 0 }}>
          <Typography variant="body2">Validate on real hardware to catch subtle device quirks.</Typography>
        </ListItem>
        <ListItem sx={{ display: 'list-item', pl: 0 }}>
          <Typography variant="body2">Check both portrait and landscape orientations.</Typography>
        </ListItem>
      </List>
    </Stack>
  );
};
