/**
 * Query builder that converts the search payload from the UI into a parameterised SQL query.
 * Intended usage: `import { buildSQLFromJSON, SearchQuery } from './sql-builder';`
 */

export interface YearRange {
  start?: number | null;
  end?: number | null;
}

interface NormalizedYearRange {
  start?: number;
  end?: number;
}

export type YearRangeInput = YearRange | [number, number] | null | undefined;

export interface MainFilters {
  subject?: string | null;
  subjectName?: string | null;
  dealer?: string | null;
  dealerName?: string | null;
  suspectedCurrentLocation?: string | null;
  suspectedCurrentColation?: string | null;
  suspectedCurrentLocationName?: string | null;
  titleOfObject?: string | null;
  artifactTitle?: string | null;
  title?: string | null;
  photographLocation?: string | null;
  photoLocation?: string | null;
  yearFirstKnownAppearance?: YearRangeInput;
  firstAppearanceYear?: YearRangeInput;
  yearFirstKnownAppearanceOutsideCambodia?: YearRangeInput;
  firstAppearanceYearOutsideCambodia?: YearRangeInput;
  repatriated?: boolean | null;
  isRepatriated?: boolean | null;
}

export interface AdvancedFilters {
  imageSource?: string | null;
  image_source?: string | null;
  material?: string | null;
  basePresent?: boolean | null;
  inscription?: boolean | null;
  hasInscription?: boolean | null;
  multipleHeads?: boolean | null;
  hasMultipleHeads?: boolean | null;
  fragmentary?: boolean | null;
  numberOfArms?: number | null;
  armNumber?: number | null;
  limbsPresent?: string[] | string | null;
  partsFragmented?: string[] | string | null;
}

export interface SearchQuery {
  main?: MainFilters | null;
  advanced?: AdvancedFilters | null;
}

type QueryValue = string | number | boolean;

export interface QueryConfig {
  text: string;
  values: QueryValue[];
}

const DEFAULT_REPATRIATION_COUNTRY = 'Cambodia';
const STATUES_TABLE = 'public.statues';
const STATUES_ALIAS = 'statues_base';

const ATTRIBUTE_LABELS = {
  basePresent: 'Base Present',
  inscription: 'Inscription',
  hasInscription: 'Inscription',
  multipleHeads: 'Multiple Heads',
  hasMultipleHeads: 'Multiple Heads',
  fragmentary: 'Fragmentary',
} as const;

export const isFiniteNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);

export const coalesceString = (...values: unknown[]): string | undefined => {
  for (const value of values) {
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed) {
        return trimmed;
      }
    }
  }
  return undefined;
};

export const coalesceBoolean = (...values: unknown[]): boolean | undefined => {
  for (const value of values) {
    if (typeof value === 'boolean') {
      return value;
    }
  }
  return undefined;
};

export const coalesceNumber = (...values: unknown[]): number | undefined => {
  for (const value of values) {
    if (isFiniteNumber(value)) {
      return value;
    }
  }
  return undefined;
};

export const normalizeRange = (range: YearRange): NormalizedYearRange => {
  let start = isFiniteNumber(range.start) ? range.start : undefined;
  let end = isFiniteNumber(range.end) ? range.end : undefined;
  if (start !== undefined && end !== undefined && start > end) {
    [start, end] = [end, start];
  }
  return { start, end };
};

export const extractYearRange = (...inputs: unknown[]): NormalizedYearRange | undefined => {
  for (const input of inputs) {
    if (!input) continue;
    if (Array.isArray(input) && input.length >= 2) {
      const [startCandidate, endCandidate] = input;
      const start = isFiniteNumber(startCandidate) ? startCandidate : undefined;
      const end = isFiniteNumber(endCandidate) ? endCandidate : undefined;
      if (start !== undefined || end !== undefined) {
        return normalizeRange({ start, end });
      }
    } else if (typeof input === 'object') {
      const rangeInput = input as Partial<YearRange>;
      const start = isFiniteNumber(rangeInput.start) ? rangeInput.start : undefined;
      const end = isFiniteNumber(rangeInput.end) ? rangeInput.end : undefined;
      if (start !== undefined || end !== undefined) {
        return normalizeRange({ start, end });
      }
    }
  }
  return undefined;
};

export const collectStringArray = (value: unknown): string[] => {
  const items: string[] = [];

  if (Array.isArray(value)) {
    for (const entry of value) {
      if (typeof entry === 'string') {
        const trimmed = entry.trim();
        if (trimmed) {
          items.push(trimmed);
        }
      }
    }
  } else if (typeof value === 'string') {
    const parts = value
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean);
    items.push(...parts);
  }

  return Array.from(new Set(items));
};

export const buildAttributeCondition = (
  attributeLabel: string,
  shouldExist: boolean,
  addCondition: (template: string, ...params: QueryValue[]) => void
) => {
  const subQuery = `
    SELECT 1
    FROM public.statue_attributes sa1
    JOIN public.attributes attr1 ON attr1.id = sa1.attribute_id
    WHERE sa1.statue_id = ${STATUES_ALIAS}.statue_id
      AND attr1.attribute_name ILIKE ?
  `;

  const label = attributeLabel.trim();
  if (!label) {
    return;
  }

  if (shouldExist) {
    addCondition(`EXISTS (${subQuery})`, label);
  } else {
    addCondition(`NOT EXISTS (${subQuery})`, label);
  }
};

export const buildSQLFromJSON = (query: SearchQuery = {}): QueryConfig => {
  const main = query.main ?? {};
  const advanced = query.advanced ?? {};

  const conditions: string[] = [];
  const values: QueryValue[] = [];

  const addCondition = (template: string, ...params: QueryValue[]) => {
    let text = template;

    for (const param of params) {
      const placeholder = `$${values.length + 1}`;
      const next = text.replace('?', placeholder);
      if (next === text) {
        throw new Error(`Insufficient placeholders in condition: "${template}"`);
      }
      text = next;
      values.push(param);
    }

    if (text.includes('?')) {
      throw new Error(`Unbound placeholder(s) remain in condition: "${template}"`);
    }

    conditions.push(text.trim());
  };

  const subject = coalesceString(main.subject, main.subjectName);
  if (subject) {
    addCondition(
      `EXISTS (
        SELECT 1
        FROM public.statue_subject ss1
        JOIN public.subjects sub1 ON sub1.id = ss1.subject_id
        WHERE ss1.statue_id = ${STATUES_ALIAS}.statue_id
          AND sub1.subject_name ILIKE ?
      )`,
      `%${subject}%`
    );
  }

  const dealer = coalesceString(main.dealer, main.dealerName);
  if (dealer) {
    addCondition(
      `EXISTS (
        SELECT 1
        FROM public.auction_events ae1
        JOIN public.auction_institutions ai1 ON ai1.id = ae1.auction_house_id
        WHERE ae1.statue_id = ${STATUES_ALIAS}.statue_id
          AND ai1.name ILIKE ?
      )`,
      `%${dealer}%`
    );
  }

  const suspectedCurrentLocation = coalesceString(
    main.suspectedCurrentLocation,
    main.suspectedCurrentColation,
    main.suspectedCurrentLocationName
  );
  if (suspectedCurrentLocation) {
    const wildcard = `%${suspectedCurrentLocation}%`;
    addCondition(
      `EXISTS (
        SELECT 1
        FROM public.statue_current_loc scl1
        JOIN public.locations loc1 ON loc1.id = scl1.location_id
        WHERE scl1.statue_id = ${STATUES_ALIAS}.statue_id
          AND (loc1.location_name ILIKE ? OR loc1.country ILIKE ?)
      )`,
      wildcard,
      wildcard
    );
  }

  const title = coalesceString(main.titleOfObject, main.artifactTitle, main.title);
  if (title) {
    addCondition('n.statues_name ILIKE ?', `%${title}%`);
  }

  const photographLocation = coalesceString(main.photographLocation, main.photoLocation);
  if (photographLocation) {
    const wildcard = `%${photographLocation}%`;
    addCondition(
      `EXISTS (
        SELECT 1
        FROM public.images img1
        JOIN public.locations loc_photo ON loc_photo.id = img1.photograph_location
        WHERE img1.statue_id = ${STATUES_ALIAS}.statue_id
          AND (loc_photo.location_name ILIKE ? OR loc_photo.country ILIKE ?)
      )`,
      wildcard,
      wildcard
    );
  }

  const firstAppearanceRange = extractYearRange(main.yearFirstKnownAppearance, main.firstAppearanceYear);
  if (firstAppearanceRange) {
    const { start, end } = firstAppearanceRange;
    if (start !== undefined && end !== undefined) {
      addCondition(`${STATUES_ALIAS}.first_known_appearance_year BETWEEN ? AND ?`, start, end);
    } else if (start !== undefined) {
      addCondition(`${STATUES_ALIAS}.first_known_appearance_year >= ?`, start);
    } else if (end !== undefined) {
      addCondition(`${STATUES_ALIAS}.first_known_appearance_year <= ?`, end);
    }
  }

  const outsideCambodiaRange = extractYearRange(
    main.yearFirstKnownAppearanceOutsideCambodia,
    main.firstAppearanceYearOutsideCambodia
  );
  if (outsideCambodiaRange) {
    const { start, end } = outsideCambodiaRange;
    if (start !== undefined && end !== undefined) {
      addCondition(`${STATUES_ALIAS}.first_known_appearance_outside_cambodia_year BETWEEN ? AND ?`, start, end);
    } else if (start !== undefined) {
      addCondition(`${STATUES_ALIAS}.first_known_appearance_outside_cambodia_year >= ?`, start);
    } else if (end !== undefined) {
      addCondition(`${STATUES_ALIAS}.first_known_appearance_outside_cambodia_year <= ?`, end);
    }
  }

  const repatriated = coalesceBoolean(main.repatriated, main.isRepatriated);
  if (typeof repatriated === 'boolean') {
    const wildcard = `%${DEFAULT_REPATRIATION_COUNTRY}%`;
    const subQuery = `
      SELECT 1
      FROM public.statue_current_loc scl2
      JOIN public.locations loc2 ON loc2.id = scl2.location_id
      WHERE scl2.statue_id = ${STATUES_ALIAS}.statue_id
        AND (loc2.country ILIKE ? OR loc2.location_name ILIKE ?)
    `;
    if (repatriated) {
      addCondition(`EXISTS (${subQuery})`, wildcard, wildcard);
    } else {
      addCondition(`NOT EXISTS (${subQuery})`, wildcard, wildcard);
    }
  }

  const imageSource = coalesceString(advanced.imageSource, advanced.image_source);
  if (imageSource) {
    addCondition(
      `EXISTS (
        SELECT 1
        FROM public.images img2
        WHERE img2.statue_id = ${STATUES_ALIAS}.statue_id
          AND img2.image_source ILIKE ?
      )`,
      `%${imageSource}%`
    );
  }

  const material = coalesceString(advanced.material);
  if (material) {
    addCondition(
      `EXISTS (
        SELECT 1
        FROM public.materials m2
        WHERE m2.id = ${STATUES_ALIAS}.material
          AND m2.material_name ILIKE ?
      )`,
      `%${material}%`
    );
  }

  const armNumber = coalesceNumber(advanced.numberOfArms, advanced.armNumber);
  if (armNumber !== undefined) {
    addCondition(`${STATUES_ALIAS}.arm_number = ?`, armNumber);
  }

  const basePresent = coalesceBoolean(advanced.basePresent);
  if (typeof basePresent === 'boolean') {
    buildAttributeCondition(ATTRIBUTE_LABELS.basePresent, basePresent, addCondition);
  }

  const inscription = coalesceBoolean(advanced.inscription, advanced.hasInscription);
  if (typeof inscription === 'boolean') {
    buildAttributeCondition(ATTRIBUTE_LABELS.inscription, inscription, addCondition);
  }

  const multipleHeads = coalesceBoolean(advanced.multipleHeads, advanced.hasMultipleHeads);
  if (typeof multipleHeads === 'boolean') {
    buildAttributeCondition(ATTRIBUTE_LABELS.multipleHeads, multipleHeads, addCondition);
  }

  const fragmentary = coalesceBoolean(advanced.fragmentary);
  if (typeof fragmentary === 'boolean') {
    buildAttributeCondition(ATTRIBUTE_LABELS.fragmentary, fragmentary, addCondition);
  }

  const limbsPresent = collectStringArray(advanced.limbsPresent);
  for (const limb of limbsPresent) {
    addCondition(
      `EXISTS (
        SELECT 1
        FROM public.statue_attributes sa2
        JOIN public.attributes attr2 ON attr2.id = sa2.attribute_id
        WHERE sa2.statue_id = ${STATUES_ALIAS}.statue_id
          AND attr2.attribute_name ILIKE ?
      )`,
      `%${limb}%`
    );
  }

  const partsFragmented = collectStringArray(advanced.partsFragmented);
  for (const part of partsFragmented) {
    addCondition(
      `EXISTS (
        SELECT 1
        FROM public.statue_attributes sa3
        JOIN public.attributes attr3 ON attr3.id = sa3.attribute_id
        WHERE sa3.statue_id = ${STATUES_ALIAS}.statue_id
          AND attr3.attribute_name ILIKE ?
      )`,
      `%${part}%`
    );
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join('\n  AND ')}` : '';

  const selectClause = `SELECT ${STATUES_ALIAS}.statue_id,
                               ${STATUES_ALIAS}.description,
                               ${STATUES_ALIAS}.provenance_history,
                               ${STATUES_ALIAS}.first_known_appearance_year,
                               ${STATUES_ALIAS}.first_known_appearance_outside_cambodia_year,
                               ${STATUES_ALIAS}.inventory_number,
                               ${STATUES_ALIAS}.collection_mission,
                               ${STATUES_ALIAS}.arm_number,
                               n.statues_name                                                                 AS title_of_object,
                               m.material_name,
                               orig.location_name                                                             AS original_location,
                               orig.country                                                                   AS original_country,
                               curr.location_name                                                             AS suspected_current_location,
                               curr.country                                                                   AS suspected_current_country,
                               scl.last_mentioned_date                                                        AS suspected_current_last_mentioned_date,
                               scl.link                                                                       AS suspected_current_link,
                               array_remove(array_agg(DISTINCT sub.subject_name), NULL)                       AS subjects,
                               array_remove(array_agg(DISTINCT attr.attribute_name), NULL)                    AS attributes,
                               jsonb_agg(DISTINCT jsonb_build_object(
                                       'internalReferenceNumber', img.internal_reference_number,
                                       'imageUrl', img.image_url,
                                       'imageGcs', img.image_gcs,
                                       'imageSource', img.image_source,
                                       'photoLocation', photo_loc.location_name,
                                       'photoCountry', photo_loc.country,
                                       'dateOfPhotograph', img.date_of_photograph,
                                       'photographer', phot.photographer_name,
                                       'observationsComments', img.observations_comments
                                                  )) FILTER (WHERE img.internal_reference_number IS NOT NULL) AS images,
                               jsonb_agg(DISTINCT jsonb_build_object(
                                       'auctionId', ae.id,
                                       'auctionName', ae.auction_name,
                                       'auctionDate', ae.auction_date,
                                       'lotNumber', ae.lot_number,
                                       'dealerName', ai.name,
                                       'dealerAddress', ai.address,
                                       'dealerContactInfo', ai.contact_info
                                                  ))
                               FILTER (WHERE ae.id IS NOT NULL)                                               AS auction_events
                        FROM ${STATUES_TABLE} AS ${STATUES_ALIAS}
                                 LEFT JOIN public.names n ON n.id = ${STATUES_ALIAS}.statues_name
                                 LEFT JOIN public.materials m ON m.id = ${STATUES_ALIAS}.material
                                 LEFT JOIN public.locations orig ON orig.id = ${STATUES_ALIAS}.original_location_id
                                 LEFT JOIN public.statue_current_loc scl ON scl.statue_id = ${STATUES_ALIAS}.statue_id
                                 LEFT JOIN public.locations curr ON curr.id = scl.location_id
                                 LEFT JOIN public.statue_subject ss ON ss.statue_id = ${STATUES_ALIAS}.statue_id
                                 LEFT JOIN public.subjects sub ON sub.id = ss.subject_id
                                 LEFT JOIN public.statue_attributes sa ON sa.statue_id = ${STATUES_ALIAS}.statue_id
                                 LEFT JOIN public.attributes attr ON attr.id = sa.attribute_id
                                 LEFT JOIN public.images img ON img.statue_id = ${STATUES_ALIAS}.statue_id
                                 LEFT JOIN public.locations photo_loc ON photo_loc.id = img.photograph_location
                                 LEFT JOIN public.photographers phot ON phot.id = img.photographer
                                 LEFT JOIN public.auction_events ae ON ae.statue_id = ${STATUES_ALIAS}.statue_id
                                 LEFT JOIN public.auction_institutions ai ON ai.id = ae.auction_house_id
                        group by n.statues_name, m.material_name, orig.country, curr.location_name, scl.last_mentioned_date, scl.link`;

  const groupByClause = `GROUP BY
  ${STATUES_ALIAS}.statue_id,
  ${STATUES_ALIAS}.description,
  ${STATUES_ALIAS}.provenance_history,
  ${STATUES_ALIAS}.first_known_appearance_year,
  ${STATUES_ALIAS}.first_known_appearance_outside_cambodia_year,
  ${STATUES_ALIAS}.inventory_number,
  ${STATUES_ALIAS}.collection_mission,
  ${STATUES_ALIAS}.arm_number,
  n.statues_name,
  m.material_name,
  orig.location_name,
  orig.country,
  curr.location_name,
  curr.country,
  scl.last_mentioned_date,
  scl.link`;

  const orderClause = `ORDER BY n.statues_name NULLS LAST, ${STATUES_ALIAS}.statue_id`;

  const queryParts = [selectClause, whereClause, groupByClause, orderClause].filter(Boolean);
  const text = queryParts.join('\n');

  return { text, values };
};
