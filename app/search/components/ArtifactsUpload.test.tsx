import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ArtifactsUpload from './ArtifactsUpload';

type FetchMock = (
  input: RequestInfo | URL,
  init?: RequestInit
) => Promise<{ ok: boolean; json: () => Promise<unknown> }>;

describe('ArtifactsUpload upload flow', () => {
  beforeEach(() => {
    Object.defineProperty(global.URL, 'createObjectURL', {
      writable: true,
      value: jest.fn(() => 'blob:preview'),
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('selects a file, fills descriptions, uploads and shows success message', async () => {
    const file = new File(['dummy-content'], 'test-image.png', { type: 'image/png' });

    // Prepare fetch mock: first call -> /api/upload, second -> /api/process-metadata
    const fetchMockRuntime = jest.fn((input: RequestInfo | URL) => {
      if (typeof input === 'string' && input.includes('/api/upload')) {
        return Promise.resolve({ ok: true, json: async () => ({ id: 'fake-image-id' }) });
      }

      if (typeof input === 'string' && input.includes('/api/process-metadata')) {
        return Promise.resolve({ ok: true, json: async () => ({ success: true }) });
      }

      return Promise.resolve({ ok: true, json: async () => ({}) });
    });

    const fetchMock = fetchMockRuntime as unknown as FetchMock;

    // Assign to global.fetch (jsdom/node environment may not have fetch defined)
    (global as unknown as { fetch?: FetchMock }).fetch = fetchMock;

    const { container } = render(<ArtifactsUpload onUploadComplete={jest.fn()} />);

    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input).toBeTruthy();

    // Simulate selecting the file
    // Select the file and wait for the preview + description UI to appear
    fireEvent.change(input, { target: { files: [file] } });

    const shortDesc = (await waitFor(() => screen.getByLabelText(/Short Description/i), {
      timeout: 3000,
    })) as HTMLInputElement;
    const longDesc = screen.getByLabelText(/Detailed Description/i) as HTMLInputElement;
    expect(shortDesc).toBeInTheDocument();
    expect(longDesc).toBeInTheDocument();

    // Fill descriptions
    fireEvent.change(shortDesc, { target: { value: 'A short description' } });
    fireEvent.change(longDesc, { target: { value: 'A longer, more detailed description' } });

    // Click Upload
    const uploadButton = screen.getByRole('button', { name: /Upload/i });
    expect(uploadButton).toBeInTheDocument();

    // Click upload and wait for the upload to complete and success UI to appear
    fireEvent.click(uploadButton);

    // Ensure fetch was called at least once for upload
    await waitFor(() => expect(fetchMock).toHaveBeenCalled(), { timeout: 5000 });

    // Expect success UI to be shown (component updates after async processing)
    await waitFor(() => expect(screen.getByText(/Image uploaded successfully/i)).toBeInTheDocument(), {
      timeout: 5000,
    });

    // cleanup
    fetchMockRuntime.mockReset();
    Reflect.deleteProperty(global, 'fetch');
  });
});
