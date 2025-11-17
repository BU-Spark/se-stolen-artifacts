import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ArtifactsUpload from './ArtifactsUpload';

describe('ArtifactsUpload - manual metadata payload', () => {
  type FetchMock = (
    input: RequestInfo | URL,
    init?: RequestInit
  ) => Promise<{ ok: boolean; json: () => Promise<unknown> }>;

  beforeEach(() => {
    Object.defineProperty(global.URL, 'createObjectURL', {
      writable: true,
      value: jest.fn(() => 'blob:preview'),
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    Reflect.deleteProperty(global, 'fetch');
  });

  test('sends manualMetadata in /api/process-metadata when manual mode is selected', async () => {
    const file = new File(['dummy'], 'test.png', { type: 'image/png' });

    // Mock fetch and capture calls
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

    (global as unknown as { fetch?: FetchMock }).fetch = fetchMock;

    const { container } = render(<ArtifactsUpload />);

    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input).toBeTruthy();

    // select file
    fireEvent.change(input, { target: { files: [file] } });

    // wait for short description field to appear
    const shortDesc = (await waitFor(() => screen.getByLabelText(/Short Description/i), {
      timeout: 3000,
    })) as HTMLInputElement;

    // switch to Manual Metadata Entry tab (tabs have role="tab")
    const manualTab = screen.getByRole('tab', { name: /Manual Metadata Entry/i });
    fireEvent.click(manualTab);

    // fill required short description (long description not required in manual mode)
    fireEvent.change(shortDesc, { target: { value: 'Short desc for manual' } });

    // click Upload
    const uploadButton = screen.getByRole('button', { name: /Upload/i });
    fireEvent.click(uploadButton);

    // wait for fetch calls to complete
    await waitFor(() => expect(fetchMockRuntime).toHaveBeenCalled(), { timeout: 5000 });

    // Find the process-metadata call and inspect its body
    type FetchCall = [RequestInfo | URL, RequestInit?];
    const procCall = fetchMockRuntime.mock.calls.find(
      (call) => typeof call[0] === 'string' && (call[0] as string).includes('/api/process-metadata')
    ) as FetchCall | undefined;
    expect(procCall).toBeDefined();

    const init = procCall![1] as RequestInit | undefined;
    if (!init) throw new Error('process-metadata init not found');
    // body should be a JSON string
    const initBody = (init as unknown as { body?: unknown }).body;
    const body = typeof initBody === 'string' ? JSON.parse(initBody) : initBody;

    expect(body).toHaveProperty('imageId', 'fake-image-id');
    // Manual metadata payload shape
    expect(body).toHaveProperty('manualMetadata');
    expect(body.manualMetadata).toHaveProperty('basicSearchMetadata');
    expect(body.manualMetadata).toHaveProperty('advancedSearchMetadata');
  });
});
