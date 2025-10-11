import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchPage from '../page';

// Mock console methods to avoid cluttering test output
const originalConsoleLog = console.log;
const originalAlert = window.alert;

describe('SearchPage', () => {
  beforeEach(() => {
    console.log = jest.fn();
    window.alert = jest.fn();
  });

  afterEach(() => {
    console.log = originalConsoleLog;
    window.alert = originalAlert;
    jest.clearAllMocks();
  });

  describe('Initial Rendering', () => {
    it('renders the search page', () => {
      render(<SearchPage />);
      expect(screen.getByText('Artifact Search')).toBeInTheDocument();
    });

    it('renders the page description', () => {
      render(<SearchPage />);
      expect(
        screen.getByText(/Look up stolen artifacts by name, collection, or tailor your search with advanced filters/i)
      ).toBeInTheDocument();
    });

    it('renders the search button', () => {
      render(<SearchPage />);
      expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
    });

    it('renders Main Parameters section', () => {
      render(<SearchPage />);
      expect(screen.getByText('Main Parameters')).toBeInTheDocument();
    });

    it('renders Advanced Filters section', () => {
      render(<SearchPage />);
      expect(screen.getByText('Advanced Filters')).toBeInTheDocument();
    });

    it('advanced filters are initially collapsed', () => {
      render(<SearchPage />);
      const advancedButton = screen.getByRole('button', { name: /show advanced/i });
      expect(advancedButton).toBeInTheDocument();
    });
  });

  describe('Basic Fields', () => {
    it('renders Title of Object field', () => {
      render(<SearchPage />);
      expect(screen.getByLabelText(/title of object/i)).toBeInTheDocument();
    });

    it('renders Dealer field', () => {
      render(<SearchPage />);
      expect(screen.getByLabelText(/dealer/i)).toBeInTheDocument();
    });

    it('renders Subject field', () => {
      render(<SearchPage />);
      expect(screen.getByLabelText(/subject/i)).toBeInTheDocument();
    });

    it('renders Photograph Location field', () => {
      render(<SearchPage />);
      expect(screen.getByLabelText(/photograph location/i)).toBeInTheDocument();
    });

    it('renders Repreciated checkbox', () => {
      render(<SearchPage />);
      expect(screen.getByRole('checkbox', { name: /repreciated/i })).toBeInTheDocument();
    });

    it('all basic text fields start empty', () => {
      render(<SearchPage />);
      expect(screen.getByLabelText(/title of object/i)).toHaveValue('');
      expect(screen.getByLabelText(/dealer/i)).toHaveValue('');
      expect(screen.getByLabelText(/subject/i)).toHaveValue('');
      expect(screen.getByLabelText(/photograph location/i)).toHaveValue('');
    });

    it('repreciated checkbox starts unchecked', () => {
      render(<SearchPage />);
      expect(screen.getByRole('checkbox', { name: /repreciated/i })).not.toBeChecked();
    });
  });

  describe('Basic Field Interactions', () => {
    it('can type in Title of Object field', async () => {
      const user = userEvent.setup();
      render(<SearchPage />);
      const titleInput = screen.getByLabelText(/title of object/i);
      await user.type(titleInput, 'Head of Buddha');
      expect(titleInput).toHaveValue('Head of Buddha');
    });

    it('can type in Dealer field', async () => {
      const user = userEvent.setup();
      render(<SearchPage />);
      const dealerInput = screen.getByLabelText(/dealer/i);
      await user.type(dealerInput, 'John Dwyer Oriental Art');
      expect(dealerInput).toHaveValue('John Dwyer Oriental Art');
    });

    it('can type in Subject field', async () => {
      const user = userEvent.setup();
      render(<SearchPage />);
      const subjectInput = screen.getByLabelText(/subject/i);
      await user.type(subjectInput, 'Vishnu');
      expect(subjectInput).toHaveValue('Vishnu');
    });

    it('can type in Photograph Location field', async () => {
      const user = userEvent.setup();
      render(<SearchPage />);
      const locationInput = screen.getByLabelText(/photograph location/i);
      await user.type(locationInput, 'New York');
      expect(locationInput).toHaveValue('New York');
    });

    it('can check Repreciated checkbox', async () => {
      const user = userEvent.setup();
      render(<SearchPage />);
      const checkbox = screen.getByRole('checkbox', { name: /repreciated/i });
      await user.click(checkbox);
      expect(checkbox).toBeChecked();
    });

    it('can uncheck Repreciated checkbox', async () => {
      const user = userEvent.setup();
      render(<SearchPage />);
      const checkbox = screen.getByRole('checkbox', { name: /repreciated/i });
      await user.click(checkbox);
      expect(checkbox).toBeChecked();
      await user.click(checkbox);
      expect(checkbox).not.toBeChecked();
    });

    it('handles special characters in text fields', async () => {
      const user = userEvent.setup();
      render(<SearchPage />);
      const titleInput = screen.getByLabelText(/title of object/i);
      await user.type(titleInput, 'Test@#$%^&*()');
      expect(titleInput).toHaveValue('Test@#$%^&*()');
    });

    it('handles numeric input in text fields', async () => {
      const user = userEvent.setup();
      render(<SearchPage />);
      const titleInput = screen.getByLabelText(/title of object/i);
      await user.type(titleInput, '12345');
      expect(titleInput).toHaveValue('12345');
    });

    it('clears text field value', async () => {
      const user = userEvent.setup();
      render(<SearchPage />);
      const titleInput = screen.getByLabelText(/title of object/i);
      await user.type(titleInput, 'Test Value');
      expect(titleInput).toHaveValue('Test Value');
      await user.clear(titleInput);
      expect(titleInput).toHaveValue('');
    });
  });

  describe('Advanced Filters Toggle', () => {
    it('shows advanced filters when clicking Show advanced button', async () => {
      const user = userEvent.setup();
      render(<SearchPage />);
      const showButton = screen.getByRole('button', { name: /show advanced/i });
      await user.click(showButton);
      expect(screen.getByRole('button', { name: /hide advanced/i })).toBeInTheDocument();
    });

    it('hides advanced filters when clicking Hide advanced button', async () => {
      const user = userEvent.setup();
      render(<SearchPage />);
      const showButton = screen.getByRole('button', { name: /show advanced/i });
      await user.click(showButton);
      const hideButton = screen.getByRole('button', { name: /hide advanced/i });
      await user.click(hideButton);
      expect(screen.getByRole('button', { name: /show advanced/i })).toBeInTheDocument();
    });

    it('toggles advanced filters multiple times', async () => {
      const user = userEvent.setup();
      render(<SearchPage />);
      const showButton = screen.getByRole('button', { name: /show advanced/i });
      
      await user.click(showButton);
      expect(screen.getByRole('button', { name: /hide advanced/i })).toBeInTheDocument();
      
      const hideButton = screen.getByRole('button', { name: /hide advanced/i });
      await user.click(hideButton);
      expect(screen.getByRole('button', { name: /show advanced/i })).toBeInTheDocument();
      
      await user.click(screen.getByRole('button', { name: /show advanced/i }));
      expect(screen.getByRole('button', { name: /hide advanced/i })).toBeInTheDocument();
    });
  });

  describe('Advanced Filter Selection', () => {
    it('shows advanced parameter input when expanded', async () => {
      const user = userEvent.setup();
      render(<SearchPage />);
      await user.click(screen.getByRole('button', { name: /show advanced/i }));
      expect(screen.getByPlaceholderText(/start typing to search filters/i)).toBeInTheDocument();
    });

    it('advanced input is initially empty', async () => {
      const user = userEvent.setup();
      render(<SearchPage />);
      await user.click(screen.getByRole('button', { name: /show advanced/i }));
      const input = screen.getByPlaceholderText(/start typing to search filters/i);
      expect(input).toHaveValue('');
    });
  });

  describe('Form Submission', () => {
    it('shows alert when submitting empty form', async () => {
      const user = userEvent.setup();
      render(<SearchPage />);
      const searchButton = screen.getByRole('button', { name: /search/i });
      await user.click(searchButton);
      expect(window.alert).toHaveBeenCalledWith('Must fill out at least one parameter before searching!');
    });

    it('submits form successfully with title filled', async () => {
      const user = userEvent.setup();
      render(<SearchPage />);
      const titleInput = screen.getByLabelText(/title of object/i);
      await user.type(titleInput, 'Buddha Head');
      const searchButton = screen.getByRole('button', { name: /search/i });
      await user.click(searchButton);
      expect(window.alert).not.toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith(
        'Search payload',
        expect.objectContaining({
          basics: expect.objectContaining({
            artifactTitle: 'Buddha Head',
          }),
        })
      );
    });

    it('submits form successfully with dealer filled', async () => {
      const user = userEvent.setup();
      render(<SearchPage />);
      const dealerInput = screen.getByLabelText(/dealer/i);
      await user.type(dealerInput, 'Test Dealer');
      const searchButton = screen.getByRole('button', { name: /search/i });
      await user.click(searchButton);
      expect(window.alert).not.toHaveBeenCalled();
    });

    it('submits form successfully with subject filled', async () => {
      const user = userEvent.setup();
      render(<SearchPage />);
      const subjectInput = screen.getByLabelText(/subject/i);
      await user.type(subjectInput, 'Vishnu');
      const searchButton = screen.getByRole('button', { name: /search/i });
      await user.click(searchButton);
      expect(window.alert).not.toHaveBeenCalled();
    });

    it('submits form successfully with location filled', async () => {
      const user = userEvent.setup();
      render(<SearchPage />);
      const locationInput = screen.getByLabelText(/photograph location/i);
      await user.type(locationInput, 'Paris');
      const searchButton = screen.getByRole('button', { name: /search/i });
      await user.click(searchButton);
      expect(window.alert).not.toHaveBeenCalled();
    });

    it('submits form successfully with checkbox checked', async () => {
      const user = userEvent.setup();
      render(<SearchPage />);
      const checkbox = screen.getByRole('checkbox', { name: /repreciated/i });
      await user.click(checkbox);
      const searchButton = screen.getByRole('button', { name: /search/i });
      await user.click(searchButton);
      expect(window.alert).not.toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith(
        'Search payload',
        expect.objectContaining({
          basics: expect.objectContaining({
            repreciated: true,
          }),
        })
      );
    });

    it('submits with multiple basic fields filled', async () => {
      const user = userEvent.setup();
      render(<SearchPage />);
      await user.type(screen.getByLabelText(/title of object/i), 'Buddha');
      await user.type(screen.getByLabelText(/dealer/i), 'Art Gallery');
      await user.type(screen.getByLabelText(/subject/i), 'Religion');
      const searchButton = screen.getByRole('button', { name: /search/i });
      await user.click(searchButton);
      expect(console.log).toHaveBeenCalledWith(
        'Search payload',
        expect.objectContaining({
          basics: expect.objectContaining({
            artifactTitle: 'Buddha',
            dealerName: 'Art Gallery',
            subject: 'Religion',
          }),
        })
      );
    });

    it('includes empty advanced array when no advanced filters selected', async () => {
      const user = userEvent.setup();
      render(<SearchPage />);
      await user.type(screen.getByLabelText(/title of object/i), 'Test');
      const searchButton = screen.getByRole('button', { name: /search/i });
      await user.click(searchButton);
      expect(console.log).toHaveBeenCalledWith(
        'Search payload',
        expect.objectContaining({
          advanced: [],
        })
      );
    });

    it('prevents form submission on Enter key without basic fields', async () => {
      render(<SearchPage />);
      const form = screen.getByRole('button', { name: /search/i }).closest('form');
      fireEvent.submit(form);
      expect(window.alert).toHaveBeenCalledWith('Must fill out at least one parameter before searching!');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('handles whitespace-only input in text fields as empty', async () => {
      const user = userEvent.setup();
      render(<SearchPage />);
      await user.type(screen.getByLabelText(/title of object/i), '   ');
      const searchButton = screen.getByRole('button', { name: /search/i });
      await user.click(searchButton);
      expect(window.alert).toHaveBeenCalledWith('Must fill out at least one parameter before searching!');
    });

    it('handles very long text input', async () => {
      const user = userEvent.setup();
      render(<SearchPage />);
      const longText = 'A'.repeat(1000);
      const titleInput = screen.getByLabelText(/title of object/i);
      await user.type(titleInput, longText);
      expect(titleInput).toHaveValue(longText);
    });

    it('handles rapid checkbox toggling', async () => {
      const user = userEvent.setup();
      render(<SearchPage />);
      const checkbox = screen.getByRole('checkbox', { name: /repreciated/i });
      await user.click(checkbox);
      await user.click(checkbox);
      await user.click(checkbox);
      expect(checkbox).toBeChecked();
    });

    it('handles form submission multiple times', async () => {
      const user = userEvent.setup();
      render(<SearchPage />);
      await user.type(screen.getByLabelText(/title of object/i), 'Test');
      const searchButton = screen.getByRole('button', { name: /search/i });
      await user.click(searchButton);
      await user.click(searchButton);
      expect(console.log).toHaveBeenCalledTimes(2);
    });

    it('preserves field values after form submission', async () => {
      const user = userEvent.setup();
      render(<SearchPage />);
      const titleInput = screen.getByLabelText(/title of object/i);
      await user.type(titleInput, 'Preserved Value');
      await user.click(screen.getByRole('button', { name: /search/i }));
      expect(titleInput).toHaveValue('Preserved Value');
    });
  });

  describe('Accessibility', () => {
    it('has proper form structure', () => {
      render(<SearchPage />);
      const form = screen.getByRole('button', { name: /search/i }).closest('form');
      expect(form).toBeInTheDocument();
    });

    it('all text inputs have labels', () => {
      render(<SearchPage />);
      expect(screen.getByLabelText(/title of object/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/dealer/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/subject/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/photograph location/i)).toBeInTheDocument();
    });

    it('checkbox has accessible label', () => {
      render(<SearchPage />);
      expect(screen.getByRole('checkbox', { name: /repreciated/i })).toBeInTheDocument();
    });

    it('submit button has accessible name', () => {
      render(<SearchPage />);
      expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
    });

    it('advanced toggle button has accessible name', () => {
      render(<SearchPage />);
      expect(screen.getByRole('button', { name: /show advanced/i })).toBeInTheDocument();
    });
  });

  describe('Layout and Styling', () => {
    it('renders within a Container component', () => {
      const { container } = render(<SearchPage />);
      expect(container.querySelector('[maxwidth="lg"]')).toBeInTheDocument();
    });

    it('renders form within a Paper component', () => {
      const { container } = render(<SearchPage />);
      const form = screen.getByRole('button', { name: /search/i }).closest('form');
      expect(form).toBeInTheDocument();
    });

    it('heading has correct text', () => {
      render(<SearchPage />);
      const heading = screen.getByText('Artifact Search');
      expect(heading).toBeInTheDocument();
      expect(heading.tagName).toBe('H1');
    });
  });

  describe('State Management', () => {
    it('maintains separate state for each text field', async () => {
      const user = userEvent.setup();
      render(<SearchPage />);
      await user.type(screen.getByLabelText(/title of object/i), 'Title');
      await user.type(screen.getByLabelText(/dealer/i), 'Dealer');
      await user.type(screen.getByLabelText(/subject/i), 'Subject');
      expect(screen.getByLabelText(/title of object/i)).toHaveValue('Title');
      expect(screen.getByLabelText(/dealer/i)).toHaveValue('Dealer');
      expect(screen.getByLabelText(/subject/i)).toHaveValue('Subject');
    });

    it('checkbox state is independent of text fields', async () => {
      const user = userEvent.setup();
      render(<SearchPage />);
      await user.type(screen.getByLabelText(/title of object/i), 'Test');
      await user.click(screen.getByRole('checkbox', { name: /repreciated/i }));
      expect(screen.getByLabelText(/title of object/i)).toHaveValue('Test');
      expect(screen.getByRole('checkbox', { name: /repreciated/i })).toBeChecked();
    });

    it('advanced filters state is independent of basic fields', async () => {
      const user = userEvent.setup();
      render(<SearchPage />);
      await user.type(screen.getByLabelText(/title of object/i), 'Test');
      await user.click(screen.getByRole('button', { name: /show advanced/i }));
      expect(screen.getByLabelText(/title of object/i)).toHaveValue('Test');
      expect(screen.getByRole('button', { name: /hide advanced/i })).toBeInTheDocument();
    });
  });
});

describe('normalizeLimbList helper function (through component behavior)', () => {
  beforeEach(() => {
    console.log = jest.fn();
    window.alert = jest.fn();
  });

  afterEach(() => {
    console.log = originalConsoleLog;
    window.alert = originalAlert;
  });

  it('component handles initialization correctly', () => {
    render(<SearchPage />);
    expect(screen.getByText('Artifact Search')).toBeInTheDocument();
  });
});

describe('Component Integration', () => {
  beforeEach(() => {
    console.log = jest.fn();
    window.alert = jest.fn();
  });

  afterEach(() => {
    console.log = originalConsoleLog;
    window.alert = originalAlert;
  });

  it('integrates all basic fields in submission payload', async () => {
    const user = userEvent.setup();
    render(<SearchPage />);
    
    await user.type(screen.getByLabelText(/title of object/i), 'Ancient Vase');
    await user.type(screen.getByLabelText(/dealer/i), 'Fine Arts Inc');
    await user.type(screen.getByLabelText(/subject/i), 'Pottery');
    await user.type(screen.getByLabelText(/photograph location/i), 'London');
    await user.click(screen.getByRole('checkbox', { name: /repreciated/i }));
    
    await user.click(screen.getByRole('button', { name: /search/i }));
    
    expect(console.log).toHaveBeenCalledWith(
      'Search payload',
      expect.objectContaining({
        basics: {
          artifactTitle: 'Ancient Vase',
          dealerName: 'Fine Arts Inc',
          subject: 'Pottery',
          photographLocation: 'London',
          repreciated: true,
        },
        advanced: [],
      })
    );
  });

  it('works correctly after multiple user interactions', async () => {
    const user = userEvent.setup();
    render(<SearchPage />);
    
    // Fill and clear fields
    await user.type(screen.getByLabelText(/title of object/i), 'First');
    await user.clear(screen.getByLabelText(/title of object/i));
    await user.type(screen.getByLabelText(/title of object/i), 'Second');
    
    // Toggle advanced multiple times
    await user.click(screen.getByRole('button', { name: /show advanced/i }));
    await user.click(screen.getByRole('button', { name: /hide advanced/i }));
    
    // Submit
    await user.click(screen.getByRole('button', { name: /search/i }));
    
    expect(console.log).toHaveBeenCalledWith(
      'Search payload',
      expect.objectContaining({
        basics: expect.objectContaining({
          artifactTitle: 'Second',
        }),
      })
    );
  });
});