import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ArtifactsUpload from './ArtifactsUpload';

describe('ArtifactsUpload /api/process-metadata calls', () => {
  type FetchMock = (
    input: RequestInfo | URL,
    init?: RequestInit
  ) => Promise<{ ok: boolean; json: () => Promise<unknown> }>;

  beforeEach(() => {
    // Ensure createObjectURL exists for image preview
    Object.defineProperty(global.URL, 'createObjectURL', {
      writable: true,
      value: jest.fn(() => 'blob:preview'),
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    Reflect.deleteProperty(global, 'fetch');
  });

  test('sends AI processing payload to /api/process-metadata when metadataMode is ai', async () => {
    const file = new File(['dummy-content'], 'photo.png', { type: 'image/png' });

    // capture fetch calls
    const fetchMockRuntime = jest.fn((input: RequestInfo | URL) => {
      if (typeof input === 'string' && input.includes('/api/upload')) {
        return Promise.resolve({ ok: true, json: async () => ({ id: 'img-ai-123' }) });
      }

      if (typeof input === 'string' && input.includes('/api/process-metadata')) {
        return Promise.resolve({ ok: true, json: async () => ({ success: true }) });
      }

      return Promise.resolve({ ok: true, json: async () => ({}) });
    });

    const fetchMock = fetchMockRuntime as unknown as FetchMock;

    (global as unknown as { fetch?: FetchMock }).fetch = fetchMock;

    const { container } = render(<ArtifactsUpload />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input).toBeTruthy();

    // Select file
    fireEvent.change(input, { target: { files: [file] } });

    // Wait for description fields to appear
    const shortDesc = (await waitFor(() => screen.getByLabelText(/Short Description/i), {
      timeout: 3000,
    })) as HTMLInputElement;
    const longDesc = screen.getByLabelText(/Detailed Description/i) as HTMLInputElement;

    // Fill descriptions (AI mode is default)
    fireEvent.change(shortDesc, { target: { value: 'AI short' } });
    fireEvent.change(longDesc, { target: { value: 'AI detailed description' } });

    // Click Upload
    const uploadButton = screen.getByRole('button', { name: /Upload/i });
    fireEvent.click(uploadButton);

    // Wait for process-metadata call
    await waitFor(() => expect(fetchMockRuntime).toHaveBeenCalled(), { timeout: 5000 });

    type FetchCall = [RequestInfo | URL, RequestInit?];
    const procCall = fetchMockRuntime.mock.calls.find(
      (call) => typeof call[0] === 'string' && (call[0] as string).includes('/api/process-metadata')
    ) as FetchCall | undefined;
    expect(procCall).toBeDefined();

    const init = procCall![1] as RequestInit | undefined;
    if (!init) throw new Error('process-metadata init not found');

    // body may be a stringified JSON
    const initBody = (init as unknown as { body?: unknown }).body;
    const body = typeof initBody === 'string' ? JSON.parse(initBody) : initBody;

    expect(body).toMatchObject({
      imageId: 'img-ai-123',
      shortDescription: 'AI short',
      processWithAI: true,
      longDescription: 'AI detailed description',
    });
  });

  test('sends manual metadata payload to /api/process-metadata when metadataMode is manual', async () => {
    const file = new File(['dummy-content'], 'photo.png', { type: 'image/png' });

    const fetchMockRuntime = jest.fn((input: RequestInfo | URL) => {
      if (typeof input === 'string' && input.includes('/api/upload')) {
        return Promise.resolve({ ok: true, json: async () => ({ id: 'img-manual-456' }) });
      }

      if (typeof input === 'string' && input.includes('/api/process-metadata')) {
        return Promise.resolve({ ok: true, json: async () => ({ success: true }) });
      }

      return Promise.resolve({ ok: true, json: async () => ({}) });
    });

    const fetchMock = fetchMockRuntime as unknown as FetchMock;

    (global as unknown as { fetch?: FetchMock }).fetch = fetchMock;

    const { container } = render(<ArtifactsUpload />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    // Select file
    fireEvent.change(input, { target: { files: [file] } });

    // Wait for short description to appear
    const shortDesc = (await waitFor(() => screen.getByLabelText(/Short Description/i), {
      timeout: 3000,
    })) as HTMLInputElement;

    // Switch to Manual Metadata Entry tab (role=tab)
    const manualTab = screen.getByRole('tab', { name: /Manual Metadata Entry/i });
    fireEvent.click(manualTab);

    // Fill the short description (manual mode doesn't require long description)
    fireEvent.change(shortDesc, { target: { value: 'Manual short' } });

    // Optionally fill a manual basic field if available. We will attempt to find a common label.
    // If specific fields exist in ManualMetadataForm, tests can be expanded to fill them.
    // Click Upload
    const uploadButton = screen.getByRole('button', { name: /Upload/i });
    fireEvent.click(uploadButton);

    // Wait for process-metadata call
    await waitFor(() => expect(fetchMockRuntime).toHaveBeenCalled(), { timeout: 5000 });

    type FetchCall = [RequestInfo | URL, RequestInit?];
    const procCall = fetchMockRuntime.mock.calls.find(
      (call) => typeof call[0] === 'string' && (call[0] as string).includes('/api/process-metadata')
    ) as FetchCall | undefined;
    expect(procCall).toBeDefined();

    const init = procCall![1] as RequestInit | undefined;
    if (!init) throw new Error('process-metadata init not found');

    const initBody = (init as unknown as { body?: unknown }).body;
    const body = typeof initBody === 'string' ? JSON.parse(initBody) : initBody;

    expect(body).toMatchObject({
      imageId: 'img-manual-456',
      shortDescription: 'Manual short',
      processWithAI: false,
    });

    // manualMetadata should be present (may be empty object fields)
    expect(body).toHaveProperty('manualMetadata');
    expect(body.manualMetadata).toHaveProperty('basicSearchMetadata');
    expect(body.manualMetadata).toHaveProperty('advancedSearchMetadata');
  });
});
