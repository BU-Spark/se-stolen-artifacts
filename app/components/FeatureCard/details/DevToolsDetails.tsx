import { Link, List, ListItem, Stack, Typography } from '@mui/material';

type Tool = {
  name: string;
  description: string[];
  url: string;
};

const tools: Tool[] = [
  {
    name: 'ESLint',
    url: 'https://eslint.org',
    description: [
      'Identifies problematic patterns and enforces consistent code quality.',
      'Extensible through plugins with instant editor feedback.',
      'Ideal for maintaining large codebases and preventing regressions.',
    ],
  },
  {
    name: 'Prettier',
    url: 'https://prettier.io',
    description: [
      'Automatically formats code for a uniform style across files.',
      'Opinionated defaults minimise configuration while supporting many languages.',
      'Eliminates style debates and saves time on reviews.',
    ],
  },
  {
    name: 'Husky',
    url: 'https://typicode.github.io/husky',
    description: [
      'Manages Git hooks to run scripts before commits or pushes.',
      'Automates linting, testing, and other quality gates.',
      'Simplifies hook setup with a friendly DX.',
    ],
  },
  {
    name: 'Jest',
    url: 'https://jestjs.io',
    description: [
      'Feature-rich testing framework supporting unit and integration workflows.',
      'Includes assertions, a runner, mocking, and snapshot testing out of the box.',
      'The de facto choice for JavaScript and React projects.',
    ],
  },
  {
    name: 'React Testing Library',
    url: 'https://testing-library.com/docs/react-testing-library/intro',
    description: [
      'Focuses on testing components via user interactions and accessibility queries.',
      'Encourages resilient, maintainable tests that mirror real usage.',
      'Pairs effectively with Jest for comprehensive coverage.',
    ],
  },
];

export const DevToolsDetails = () => {
  return (
    <Stack spacing={2} component="section">
      {tools.map((tool) => (
        <Stack key={tool.name} spacing={1}>
          <Typography variant="subtitle2" component="h4">
            <Link href={tool.url} target="_blank" rel="noopener noreferrer" underline="hover">
              {tool.name}
            </Link>
          </Typography>
          <List dense sx={{ listStyleType: 'disc', pl: 3 }}>
            {tool.description.map((item) => (
              <ListItem key={item} sx={{ display: 'list-item', pl: 0 }}>
                <Typography variant="body2">{item}</Typography>
              </ListItem>
            ))}
          </List>
        </Stack>
      ))}
    </Stack>
  );
};
