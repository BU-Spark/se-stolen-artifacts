import { buildSQLFromJSON, QueryConfig, SearchQuery } from '../sql-builder';

const normalize = (config: QueryConfig) => ({
  text: config.text.replace(/\s+/g, ' ').trim(),
  values: config.values,
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
