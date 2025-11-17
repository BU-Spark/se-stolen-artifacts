import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ArtifactsUpload from './ArtifactsUpload';

describe('ArtifactsUpload preview parsing', () => {
  beforeEach(() => {
    // Ensure createObjectURL exists but is not used for non-image files
    Object.defineProperty(global.URL, 'createObjectURL', {
      writable: true,
      value: jest.fn(() => 'blob:preview'),
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('parses CSV preview and displays first lines', async () => {
    const csvContent = `col1,col2,col3\n1,2,3\n4,5,6\n7,8,9`;
    const file = new File([csvContent], 'data.csv', { type: 'text/csv' });
    // jsdom/File.text may not behave the same in this test env — stub the instance method
    (file as unknown as { text: () => Promise<string> }).text = async () => csvContent;

    const { container } = render(<ArtifactsUpload />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input).toBeTruthy();

    fireEvent.change(input, { target: { files: [file] } });

    // Wait for the CSV textPreview to appear (it is rendered inside a <pre>)
    await waitFor(() => expect(screen.getByText(/1,2,3/)).toBeInTheDocument(), { timeout: 3000 });

    // Also assert that the header is present
    expect(screen.getByText(/col1,col2,col3/)).toBeInTheDocument();
  });

  test('parses JSON preview and pretty-prints first lines', async () => {
    const obj = { a: 1, b: 'two', nested: { x: 10, y: 'yes' } };
    const jsonContent = JSON.stringify(obj);
    const file = new File([jsonContent], 'data.json', { type: 'application/json' });
    (file as unknown as { text: () => Promise<string> }).text = async () => jsonContent;

    const { container } = render(<ArtifactsUpload />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input).toBeTruthy();

    fireEvent.change(input, { target: { files: [file] } });

    // Wait for pretty-printed JSON to appear; look for a piece of the formatted output
    await waitFor(() => expect(screen.getByText(/"a": 1/)).toBeInTheDocument(), { timeout: 3000 });
    expect(screen.getByText(/"nested": \{/)).toBeInTheDocument();
  });

  test('shows error text for invalid JSON preview', async () => {
    const badJson = '{ this is not: valid json }';
    const file = new File([badJson], 'bad.json', { type: 'application/json' });
    (file as unknown as { text: () => Promise<string> }).text = async () => badJson;

    const { container } = render(<ArtifactsUpload />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input).toBeTruthy();

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => expect(screen.getByText(/Invalid JSON format/)).toBeInTheDocument(), { timeout: 3000 });
  });
});
