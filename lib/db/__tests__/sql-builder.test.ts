import {
  buildAttributeCondition,
  buildSQLFromJSON,
  coalesceBoolean,
  coalesceNumber,
  coalesceString,
  collectStringArray,
  extractYearRange,
  isFiniteNumber,
  normalizeRange,
  QueryConfig,
  SearchQuery,
} from '../sql-builder';

const normalize = (config: QueryConfig) => ({
  text: config.text.replace(/\s+/g, ' ').trim(),
  values: config.values,
});

describe('isFiniteNumber', () => {
  it('returns true only for finite numbers', () => {
    expect(isFiniteNumber(0)).toBe(true);
    expect(isFiniteNumber(-42.5)).toBe(true);
    expect(isFiniteNumber(Number.POSITIVE_INFINITY)).toBe(false);
    expect(isFiniteNumber(Number.NaN)).toBe(false);
    expect(isFiniteNumber('5')).toBe(false);
  });
});

describe('coalesceString', () => {
  it('returns the first non-empty trimmed string', () => {
    expect(coalesceString(null, undefined, '  ', '  value  ', 'next')).toBe('value');
  });

  it('returns undefined when no strings provided', () => {
    expect(coalesceString(null, undefined, 123)).toBeUndefined();
  });
});

describe('coalesceBoolean', () => {
  it('returns the first boolean value encountered', () => {
    expect(coalesceBoolean(null, 'true', false, true)).toBe(false);
  });

  it('returns undefined when no boolean present', () => {
    expect(coalesceBoolean(null, undefined, 0)).toBeUndefined();
  });
});

describe('coalesceNumber', () => {
  it('returns the first finite number', () => {
    expect(coalesceNumber(undefined, Number.NaN, '3', 7, 9)).toBe(7);
  });

  it('returns undefined when no finite number present', () => {
    expect(coalesceNumber(null, Number.POSITIVE_INFINITY)).toBeUndefined();
  });
});

describe('normalizeRange', () => {
  it('returns start and end in ascending order', () => {
    expect(normalizeRange({ start: 1950, end: 1900 })).toEqual({ start: 1900, end: 1950 });
  });

  it('omits invalid bounds', () => {
    expect(normalizeRange({ start: null, end: 2000 })).toEqual({ end: 2000 });
    expect(normalizeRange({ start: 1980, end: Number.NaN })).toEqual({ start: 1980 });
  });
});

describe('extractYearRange', () => {
  it('handles array inputs and orders bounds correctly', () => {
    expect(extractYearRange([2000, 1900])).toEqual({ start: 1900, end: 2000 });
  });

  it('reads object inputs and ignores invalid options', () => {
    expect(extractYearRange(null, { start: 'not-a-number' }, { start: 1950 })).toEqual({ start: 1950 });
    expect(extractYearRange(undefined, { end: 1800 })).toEqual({ end: 1800 });
  });
});

describe('collectStringArray', () => {
  it('collects trimmed unique strings from arrays', () => {
    expect(collectStringArray([' head ', 'Torso', '', 'head'])).toEqual(['head', 'Torso']);
  });

  it('splits comma-delimited strings and deduplicates entries', () => {
    expect(collectStringArray('Arm,Leg,Arm , ')).toEqual(['Arm', 'Leg']);
  });
});

describe('buildAttributeCondition', () => {
  it('adds EXISTS condition when attribute should exist', () => {
    const calls: Array<{ template: string; params: unknown[] }> = [];
    const addCondition = (template: string, ...params: unknown[]) => {
      calls.push({ template, params });
    };

    buildAttributeCondition('  Inscription  ', true, addCondition);

    expect(calls).toHaveLength(1);
    expect(calls[0]?.template).toContain('EXISTS (');
    expect(calls[0]?.template).toContain('attr1.attribute_name ILIKE ?');
    expect(calls[0]?.params).toEqual(['Inscription']);
  });

  it('adds NOT EXISTS condition when attribute should not exist', () => {
    const calls: Array<{ template: string; params: unknown[] }> = [];
    const addCondition = (template: string, ...params: unknown[]) => {
      calls.push({ template, params });
    };

    buildAttributeCondition('Fragmentary', false, addCondition);

    expect(calls).toHaveLength(1);
    expect(calls[0]?.template).toContain('NOT EXISTS (');
    expect(calls[0]?.params).toEqual(['Fragmentary']);
  });

  it('skips adding a condition for empty labels', () => {
    const addCondition = jest.fn();
    buildAttributeCondition('   ', true, addCondition);
    expect(addCondition).not.toHaveBeenCalled();
  });
});

describe('buildSQLFromJSON', () => {
  it('returns base query with no filters when payload is empty', () => {
    const config = buildSQLFromJSON();
    const normalized = normalize(config);

    expect(normalized.text).toContain('SELECT');
    expect(normalized.text).toContain('FROM public.statues AS statues_base');
    expect(normalized.text).not.toContain(' WHERE ');
    expect(config.values).toHaveLength(0);
  });

  it('applies subject and year range filters', () => {
    const payload: SearchQuery = {
      main: {
        subject: 'Vishnu',
        yearFirstKnownAppearance: { start: 1900, end: 1950 },
      },
    };

    const config = buildSQLFromJSON(payload);
    const normalized = normalize(config);

    expect(normalized.text).toContain('WHERE');
    expect(normalized.text).toContain('sub1.subject_name ILIKE $1');
    expect(normalized.text).toContain('statues_base.first_known_appearance_year BETWEEN $2 AND $3');
    expect(config.values).toEqual(['%Vishnu%', 1900, 1950]);
  });

  it('handles advanced filters with booleans and list inputs', () => {
    const payload: SearchQuery = {
      main: {
        photographLocation: 'New York',
      },
      advanced: {
        basePresent: true,
        limbsPresent: ['Head', 'Torso'],
      },
    };

    const config = buildSQLFromJSON(payload);
    const normalized = normalize(config);

    expect(normalized.text).toContain('loc_photo.location_name ILIKE $1');
    expect(normalized.text).toContain('loc_photo.country ILIKE $2');
    expect(normalized.text).toContain('EXISTS ( SELECT 1 FROM public.statue_attributes sa1');
    expect(normalized.text).toContain('attr1.attribute_name ILIKE $3');
    expect(normalized.text).toContain('attr2.attribute_name ILIKE $4');
    expect(normalized.text).toContain('attr2.attribute_name ILIKE $5');
    expect(config.values).toEqual(['%New York%', '%New York%', 'Base Present', '%Head%', '%Torso%']);
  });
});
