import { Prisma, PrismaClient } from '@prisma/client';

import { prisma as defaultPrisma } from './prisma';

type YearRange = {
  start?: number | null;
  end?: number | null;
};

export interface MainSearchFilters {
  subject?: string | null;
  dealer?: string | null;
  suspectedCurrentLocation?: string | null;
  titleOfObject?: string | null;
  photographLocation?: string | null;
  yearFirstKnownAppearance?: YearRange | null;
  yearFirstKnownAppearanceOutsideCambodia?: YearRange | null;
  repatriated?: boolean | null;
}

export interface AdvancedSearchFilters {
  imageSource?: string | null;
  material?: string | null;
  basePresent?: boolean | null;
  inscription?: boolean | null;
  multipleHeads?: boolean | null;
  fragmentary?: boolean | null;
  numberOfArms?: number | null;
  limbsPresent?: string[];
  partsFragmented?: string[];
}

export interface StatueSearchFilters {
  main?: MainSearchFilters | null;
  advanced?: AdvancedSearchFilters | null;
}

type AttributeFlagKey = 'basePresent' | 'inscription' | 'multipleHeads' | 'fragmentary';

const ATTRIBUTE_FLAG_LABELS: Record<AttributeFlagKey, string> = {
  basePresent: 'Base Present',
  inscription: 'Inscription',
  multipleHeads: 'Multiple Heads',
  fragmentary: 'Fragmentary',
};

const isNonEmptyString = (value?: string | null): value is string =>
  typeof value === 'string' && value.trim().length > 0;

const uniqueNormalizedStrings = (values?: string[]): string[] => {
  if (!values) return [];
  const seen = new Set<string>();
  const results: string[] = [];
  values.forEach((value) => {
    if (!isNonEmptyString(value)) {
      return;
    }

    const normalized = normalizeAttributeLabel(value);
    if (!seen.has(normalized)) {
      seen.add(normalized);
      results.push(normalized);
    }
  });
  return results;
};

const normalizeAttributeLabel = (value: string): string =>
  value
    .replace(/[_-]+/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\b\w/g, (match) => match.toUpperCase());

const sanitizeForLike = (value: string): string => value.replace(/[%_]/g, '\\$&');

const buildLikeValue = (value: string): string => `%${sanitizeForLike(value.trim())}%`;

const buildILikeCondition = (column: string, value: string): Prisma.Sql =>
  Prisma.sql`${Prisma.raw(column)} ILIKE ${buildLikeValue(value)} ESCAPE '\\'`;

const makeAttributePresenceClause = (attributeName: string, shouldExist: boolean): Prisma.Sql => {
  const normalized = normalizeAttributeLabel(attributeName);
  const subQuery = Prisma.sql`
    SELECT 1
    FROM statue_attributes sa
    JOIN attributes a ON a.id = sa.attribute_id
    WHERE sa.statue_id = s.statue_id
      AND a.attribute_name = ${normalized}
  `;

  return shouldExist ? Prisma.sql`EXISTS (${subQuery})` : Prisma.sql`NOT EXISTS (${subQuery})`;
};

const applyAttributeFlags = (filters: AdvancedSearchFilters | null | undefined, where: Prisma.Sql[]): void => {
  if (!filters) return;

  (Object.keys(ATTRIBUTE_FLAG_LABELS) as AttributeFlagKey[]).forEach((key) => {
    const value = filters[key];
    if (typeof value === 'boolean') {
      where.push(makeAttributePresenceClause(ATTRIBUTE_FLAG_LABELS[key], value));
    }
  });
};

const applyAttributeCollections = (values: string[] | undefined, shouldExist: boolean, where: Prisma.Sql[]): void => {
  uniqueNormalizedStrings(values).forEach((attributeName) => {
    where.push(makeAttributePresenceClause(attributeName, shouldExist));
  });
};

export type StatueSearchRow = {
  statue_id: number;
  title: string | null;
  description: string | null;
  provenance_history: string | null;
  first_known_appearance_year: number | null;
  first_known_appearance_outside_cambodia_year: number | null;
  arm_number: number | null;
  material: string | null;
  original_location: string | null;
  original_country: string | null;
  current_location: string | null;
  current_country: string | null;
  last_mentioned_date: Date | null;
  current_location_link: string | null;
  subjects: string[] | null;
  attributes: string[] | null;
  images: Array<{
    id: string;
    url: string | null;
    source: string | null;
    photographLocation: string | null;
    photographCountry: string | null;
  }> | null;
  dealer_history: Array<{
    dealer: string | null;
    auctionName: string | null;
    auctionDate: Date | null;
    lotNumber: string | null;
  }> | null;
};

export const buildStatueSearchQuery = (filters: StatueSearchFilters = {}): Prisma.Sql => {
  const main = filters.main ?? {};
  const advanced = filters.advanced ?? {};
  const where: Prisma.Sql[] = [];

  if (isNonEmptyString(main.subject)) {
    where.push(buildILikeCondition('subj.subject_name', main.subject));
  }

  if (isNonEmptyString(main.dealer)) {
    const dealerLike = buildLikeValue(main.dealer);
    where.push(
      Prisma.sql`(
        ai.name ILIKE ${dealerLike} ESCAPE '\\'
        OR ae.auction_name ILIKE ${dealerLike} ESCAPE '\\'
      )`
    );
  }

  if (isNonEmptyString(main.suspectedCurrentLocation)) {
    const like = buildLikeValue(main.suspectedCurrentLocation);
    where.push(
      Prisma.sql`(
        curr_loc.location_name ILIKE ${like} ESCAPE '\\'
        OR curr_loc.country ILIKE ${like} ESCAPE '\\'
      )`
    );
  }

  if (isNonEmptyString(main.titleOfObject)) {
    where.push(buildILikeCondition('n.statues_name', main.titleOfObject));
  }

  if (isNonEmptyString(main.photographLocation)) {
    const like = buildLikeValue(main.photographLocation);
    where.push(
      Prisma.sql`(
        photo_loc.location_name ILIKE ${like} ESCAPE '\\'
        OR photo_loc.country ILIKE ${like} ESCAPE '\\'
      )`
    );
  }

  const firstAppearance = main.yearFirstKnownAppearance;
  if (firstAppearance?.start != null) {
    where.push(Prisma.sql`s.first_known_appearance_year >= ${firstAppearance.start}`);
  }
  if (firstAppearance?.end != null) {
    where.push(Prisma.sql`s.first_known_appearance_year <= ${firstAppearance.end}`);
  }

  const outsideCambodia = main.yearFirstKnownAppearanceOutsideCambodia;
  if (outsideCambodia?.start != null) {
    where.push(Prisma.sql`s.first_known_appearance_outside_cambodia_year >= ${outsideCambodia.start}`);
  }
  if (outsideCambodia?.end != null) {
    where.push(Prisma.sql`s.first_known_appearance_outside_cambodia_year <= ${outsideCambodia.end}`);
  }

  if (typeof main.repatriated === 'boolean') {
    if (main.repatriated) {
      where.push(Prisma.sql`curr.location_id IS NOT NULL AND curr.location_id = s.original_location_id`);
    } else {
      where.push(Prisma.sql`curr.location_id IS NULL OR curr.location_id <> s.original_location_id`);
    }
  }

  if (isNonEmptyString(advanced.imageSource)) {
    where.push(buildILikeCondition('img.image_source', advanced.imageSource));
  }

  if (isNonEmptyString(advanced.material)) {
    where.push(buildILikeCondition('m.material_name', advanced.material));
  }

  if (typeof advanced.numberOfArms === 'number') {
    where.push(Prisma.sql`s.arm_number = ${advanced.numberOfArms}`);
  }

  applyAttributeFlags(advanced, where);
  applyAttributeCollections(advanced.limbsPresent, true, where);
  applyAttributeCollections(advanced.partsFragmented, true, where);

  const whereClause = where.length > 0 ? Prisma.sql`WHERE ${Prisma.join(where, ' AND ')}` : Prisma.sql``;

  return Prisma.sql`
    SELECT
      s.statue_id,
      n.statues_name AS title,
      s.description,
      s.provenance_history,
      s.first_known_appearance_year,
      s.first_known_appearance_outside_cambodia_year,
      s.arm_number,
      m.material_name AS material,
      orig.location_name AS original_location,
      orig.country AS original_country,
      curr_loc.location_name AS current_location,
      curr_loc.country AS current_country,
      curr.last_mentioned_date,
      curr.link AS current_location_link,
      array_remove(array_agg(DISTINCT subj.subject_name), NULL) AS subjects,
      array_remove(array_agg(DISTINCT attr.attribute_name), NULL) AS attributes,
      jsonb_agg(
        DISTINCT jsonb_build_object(
          'id', img.internal_reference_number,
          'url', img.image_url,
          'source', img.image_source,
          'photographLocation', photo_loc.location_name,
          'photographCountry', photo_loc.country
        )
      ) FILTER (WHERE img.internal_reference_number IS NOT NULL) AS images,
      jsonb_agg(
        DISTINCT jsonb_build_object(
          'dealer', ai.name,
          'auctionName', ae.auction_name,
          'auctionDate', ae.auction_date,
          'lotNumber', ae.lot_number
        )
      ) FILTER (WHERE ae.id IS NOT NULL) AS dealer_history
    FROM statues s
    LEFT JOIN names n ON n.id = s.statues_name
    LEFT JOIN materials m ON m.id = s.material
    LEFT JOIN locations orig ON orig.id = s.original_location_id
    LEFT JOIN LATERAL (
      SELECT curr_loc_inner.*
      FROM statue_current_loc curr_loc_inner
      WHERE curr_loc_inner.statue_id = s.statue_id
      ORDER BY curr_loc_inner.last_mentioned_date DESC NULLS LAST, curr_loc_inner.id DESC
      LIMIT 1
    ) curr ON TRUE
    LEFT JOIN locations curr_loc ON curr_loc.id = curr.location_id
    LEFT JOIN statue_subject ss ON ss.statue_id = s.statue_id
    LEFT JOIN subjects subj ON subj.id = ss.subject_id
    LEFT JOIN statue_attributes sa ON sa.statue_id = s.statue_id
    LEFT JOIN attributes attr ON attr.id = sa.attribute_id
    LEFT JOIN images img ON img.statue_id = s.statue_id
    LEFT JOIN locations photo_loc ON photo_loc.id = img.photograph_location
    LEFT JOIN auction_events ae ON ae.statue_id = s.statue_id
    LEFT JOIN auction_institutions ai ON ai.id = ae.auction_house_id
    ${whereClause}
    GROUP BY
      s.statue_id,
      n.statues_name,
      s.description,
      s.provenance_history,
      s.first_known_appearance_year,
      s.first_known_appearance_outside_cambodia_year,
      s.arm_number,
      m.material_name,
      orig.location_name,
      orig.country,
      curr_loc.location_name,
      curr_loc.country,
      curr.last_mentioned_date,
      curr.link
    ORDER BY s.statue_id DESC
  `;
};

export const executeStatueSearch = async (
  filters: StatueSearchFilters,
  client: PrismaClient = defaultPrisma
): Promise<StatueSearchRow[]> => {
  const query = buildStatueSearchQuery(filters);
  return client.$queryRaw<StatueSearchRow[]>(query);
};
