export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

export const validateFile = (file: File): string | null => {
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ACCEPTED_TYPES = ['.jpg', '.jpeg', '.png', '.webp', '.csv', '.json'];
  const ACCEPTED_MIME_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'text/csv',
    'application/json',
    'application/csv',
  ];
  if (file.size > MAX_FILE_SIZE) {
    return `File size exceeds 10MB limit. Your file is ${formatFileSize(file.size)}.`;
  }
  const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
  const isValidExtension = ACCEPTED_TYPES.includes(fileExtension);
  const isValidMimeType = ACCEPTED_MIME_TYPES.includes(file.type);
  if (!isValidExtension && !isValidMimeType) {
    return `Unsupported file type. Accepted formats: ${ACCEPTED_TYPES.join(', ')}`;
  }
  return null;
};

export const getFileKind = (file: File): 'image' | 'csv' | 'json' | 'unknown' => {
  if (file.type.startsWith('image/')) return 'image';
  if (file.name.endsWith('.csv') || file.type === 'text/csv') return 'csv';
  if (file.name.endsWith('.json') || file.type === 'application/json') return 'json';
  return 'unknown';
};
import { BASIC_FIELDS } from '@/app/search/constants';

type BasicState = Record<string, unknown>;

export const getInitialBasicState = () =>
  BASIC_FIELDS.reduce<BasicState>((acc, field) => {
    if (field.type === 'checkbox') {
      acc[field.id] = false;
    } else if (field.type === 'slider') {
      acc[field.id] = Array.isArray(field.defaultValue) ? [...field.defaultValue] : field.defaultValue;
    } else {
      acc[field.id] = '';
    }
    return acc;
  }, {});

export const normalizeLimbList = (raw: string) => {
  if (!raw) return [];
  const parts = String(raw)
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean);

  const seen = new Set();
  const out = [];
  for (const p of parts) {
    const normalized = p
      .toLowerCase()
      .split(/[\s-]+/)
      .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1) : ''))
      .join(' ');
    if (!seen.has(normalized)) {
      seen.add(normalized);
      out.push(normalized);
    }
  }
  return out;
};
