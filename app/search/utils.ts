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
