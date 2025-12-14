import { supabase } from './supabase';
import type { StatueSearchFilters, StatueSearchRow } from './statueSearch.types';

type AttributeFlagKey = 'basePresent' | 'inscription' | 'multipleHeads' | 'fragmentary';

const ATTRIBUTE_FLAG_LABELS: Record<AttributeFlagKey, string> = {
  basePresent: 'Base Present',
  inscription: 'Inscription',
  multipleHeads: 'Multiple Heads',
  fragmentary: 'Fragmentary',
};

const isNonEmptyString = (value?: string | null): value is string =>
  typeof value === 'string' && value.trim().length > 0;

const normalizeAttributeLabel = (value: string): string =>
  value
    .replace(/[_-]+/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\b\w/g, (match) => match.toUpperCase());

const sanitizeForLike = (value: string): string => value.replace(/[%_]/g, '\\$&');

const buildLikeValue = (value: string): string => `%${sanitizeForLike(value.trim())}%`;

type SupabaseLocation = {
  location_name: string | null;
  country: string | null;
};

type SupabaseCurrentLocation = {
  id: number | null;
  location_id: number | null;
  last_mentioned_date: string | null;
  link: string | null;
  location: SupabaseLocation | SupabaseLocation[] | null;
};

type SupabaseImage = {
  internal_reference_number: string;
  image_url: string | null;
  image_gcs: string | null;
  image_source: string | null;
  is_deleted?: boolean | null;
  photograph_location: number | null;
};

type SupabaseAuctionEvent = {
  auction_name: string | null;
  auction_date: string | null;
  lot_number: string | null;
  auction_institutions: { name: string | null } | null;
};

type SupabaseStatueRow = {
  statue_id: number;
  description: string | null;
  provenance_history: string | null;
  first_known_appearance_year: number | null;
  first_known_appearance_outside_cambodia_year: number | null;
  arm_number: number | null;
  original_location_id: number | null;
  names: { statues_name: string | null } | { statues_name: string | null }[] | null;
  materials: { material_name: string | null } | { material_name: string | null }[] | null;
  original_location: SupabaseLocation | SupabaseLocation[] | null;
  statue_current_loc: SupabaseCurrentLocation[] | null;
  statue_subject: Array<{ subjects: { subject_name: string | null } | null }> | null;
  statue_attributes: Array<{ attributes: { attribute_name: string | null } | null }> | null;
  images: SupabaseImage[] | null;
  auction_events: SupabaseAuctionEvent[] | null;
};

type LocationMap = Record<number, SupabaseLocation>;

const SEARCH_SELECT = `
  statue_id,
  description,
  provenance_history,
  first_known_appearance_year,
  first_known_appearance_outside_cambodia_year,
  arm_number,
  original_location_id,
  names:statues_name (statues_name),
  materials:material (material_name),
  original_location:original_location_id (location_name, country),
  statue_current_loc (
    id,
    location_id,
    last_mentioned_date,
    link,
    location:location_id (location_name, country)
  ),
  statue_subject (
    subjects (subject_name)
  ),
  statue_attributes (
    attributes (attribute_name)
  ),
  images (
    internal_reference_number,
    image_url,
    image_gcs,
    image_source,
    is_deleted,
    photograph_location
  ),
  auction_events (
    auction_name,
    auction_date,
    lot_number,
    auction_institutions:auction_house_id (name)
  )
`;

type LocationRow = {
  id: number;
  location_name: string | null;
  country: string | null;
};

const buildLocationMap = async (rows: SupabaseStatueRow[]): Promise<LocationMap> => {
  const ids = new Set<number>();
  rows.forEach((row) =>
    (row.images ?? []).forEach((image) => {
      if (typeof image.photograph_location === 'number') {
        ids.add(image.photograph_location);
      }
    })
  );

  if (ids.size === 0) {
    return {};
  }

  const { data, error } = await supabase
    .from('locations')
    .select('id, location_name, country')
    .in('id', Array.from(ids));

  if (error || !data) {
    console.error('Failed to fetch photograph locations', error);
    return {};
  }

  const map: LocationMap = {};
  (data as LocationRow[]).forEach((loc) => {
    if (loc?.id != null) {
      map[loc.id] = { location_name: loc.location_name ?? null, country: loc.country ?? null };
    }
  });

  return map;
};

const uniqueStrings = (values?: (string | null | undefined)[]): string[] => {
  if (!values) return [];
  const seen = new Set<string>();
  const output: string[] = [];
  values.forEach((raw) => {
    const value = raw?.trim();
    if (!value || seen.has(value)) return;
    seen.add(value);
    output.push(value);
  });
  return output;
};

const getAttributeSet = (row: SupabaseStatueRow): Set<string> => {
  const names = (row.statue_attributes ?? [])
    .map((entry) => entry?.attributes?.attribute_name)
    .filter(isNonEmptyString)
    .map(normalizeAttributeLabel);
  return new Set(names);
};

const getSubjects = (row: SupabaseStatueRow): string[] =>
  uniqueStrings((row.statue_subject ?? []).map((entry) => entry?.subjects?.subject_name).filter(isNonEmptyString));

const pickSingle = <T>(value: T | T[] | null | undefined): T | null => {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }
  return value ?? null;
};

const pickLatestLocation = (locations: SupabaseCurrentLocation[] | null): SupabaseCurrentLocation | null => {
  if (!locations || locations.length === 0) return null;
  const sorted = [...locations].sort((a, b) => {
    const aDate = a?.last_mentioned_date ? new Date(a.last_mentioned_date).getTime() : -Infinity;
    const bDate = b?.last_mentioned_date ? new Date(b.last_mentioned_date).getTime() : -Infinity;
    if (aDate !== bDate) {
      return bDate - aDate;
    }
    const aId = a?.id ?? -Infinity;
    const bId = b?.id ?? -Infinity;
    return bId - aId;
  });
  return sorted[0] ?? null;
};

const mapImages = (row: SupabaseStatueRow, locationMap: LocationMap): StatueSearchRow['images'] => {
  const filtered = (row.images ?? []).filter((image) => !image.is_deleted);

  if (filtered.length === 0) {
    return null;
  }

  return filtered.map((image) => ({
    id: image.internal_reference_number,
    url: image.image_url,
    source: image.image_source,
    photographLocation:
      image.photograph_location != null ? (locationMap[image.photograph_location]?.location_name ?? null) : null,
    photographCountry:
      image.photograph_location != null ? (locationMap[image.photograph_location]?.country ?? null) : null,
    gcsPath: image.image_gcs ?? null,
  }));
};

const mapDealerHistory = (row: SupabaseStatueRow): StatueSearchRow['dealer_history'] => {
  const entries =
    row.auction_events?.map((event) => ({
      dealer: event.auction_institutions?.name ?? null,
      auctionName: event.auction_name ?? null,
      auctionDate: event.auction_date ? new Date(event.auction_date) : null,
      lotNumber: event.lot_number ?? null,
    })) ?? [];

  const nonEmpty = entries.filter((entry) => entry.dealer || entry.auctionName || entry.auctionDate || entry.lotNumber);

  return nonEmpty.length > 0 ? nonEmpty : null;
};

const mapStatueRow = (row: SupabaseStatueRow, locationMap: LocationMap): StatueSearchRow => {
  const currentLocation = pickLatestLocation(row.statue_current_loc);
  const currentLocationRecord = pickSingle(currentLocation?.location);
  const subjects = getSubjects(row);
  const attributes = uniqueStrings(
    (row.statue_attributes ?? []).map((entry) => entry?.attributes?.attribute_name).filter(isNonEmptyString)
  );
  const nameRecord = pickSingle(row.names);
  const materialRecord = pickSingle(row.materials);
  const originalLocationRecord = pickSingle(row.original_location);

  return {
    statue_id: row.statue_id,
    title: nameRecord?.statues_name ?? null,
    description: row.description ?? null,
    provenance_history: row.provenance_history ?? null,
    first_known_appearance_year: row.first_known_appearance_year ?? null,
    first_known_appearance_outside_cambodia_year: row.first_known_appearance_outside_cambodia_year ?? null,
    arm_number: row.arm_number ?? null,
    material: materialRecord?.material_name ?? null,
    original_location: originalLocationRecord?.location_name ?? null,
    original_country: originalLocationRecord?.country ?? null,
    current_location: currentLocationRecord?.location_name ?? null,
    current_country: currentLocationRecord?.country ?? null,
    last_mentioned_date: currentLocation?.last_mentioned_date ? new Date(currentLocation.last_mentioned_date) : null,
    current_location_link: currentLocation?.link ?? null,
    subjects: subjects,
    attributes: attributes.length > 0 ? attributes : [],
    images: mapImages(row, locationMap),
    dealer_history: mapDealerHistory(row),
  };
};

const applySupabaseFilters = (filters: StatueSearchFilters) => {
  const main = filters.main ?? {};
  const advanced = filters.advanced ?? {};

  let query = supabase
    .from('statues')
    .select(SEARCH_SELECT)
    .eq('is_deleted', false)
    .order('statue_id', { ascending: false });

  if (isNonEmptyString(main.subject)) {
    query = query.ilike('statue_subject.subjects.subject_name', buildLikeValue(main.subject));
  }

  if (isNonEmptyString(main.dealer)) {
    const like = buildLikeValue(main.dealer);
    query = query.or(
      [`auction_events.auction_name.ilike.${like}`, `auction_events.auction_institutions.name.ilike.${like}`].join(',')
    );
  }

  if (isNonEmptyString(main.titleOfObject)) {
    query = query.ilike('names.statues_name', buildLikeValue(main.titleOfObject));
  }

  const firstAppearance = main.yearFirstKnownAppearance;
  if (firstAppearance?.start != null) {
    query = query.gte('first_known_appearance_year', firstAppearance.start);
  }
  if (firstAppearance?.end != null) {
    query = query.lte('first_known_appearance_year', firstAppearance.end);
  }

  const outsideCambodia = main.yearFirstKnownAppearanceOutsideCambodia;
  if (outsideCambodia?.start != null) {
    query = query.gte('first_known_appearance_outside_cambodia_year', outsideCambodia.start);
  }
  if (outsideCambodia?.end != null) {
    query = query.lte('first_known_appearance_outside_cambodia_year', outsideCambodia.end);
  }

  if (isNonEmptyString(advanced.imageSource)) {
    query = query.ilike('images.image_source', buildLikeValue(advanced.imageSource));
  }

  if (isNonEmptyString(advanced.material)) {
    query = query.ilike('materials.material_name', buildLikeValue(advanced.material));
  }

  if (typeof advanced.numberOfArms === 'number') {
    query = query.eq('arm_number', advanced.numberOfArms);
  }

  return query;
};

const matchesPostFilters = (
  row: SupabaseStatueRow,
  filters: StatueSearchFilters,
  locationMap: LocationMap
): boolean => {
  const advanced = filters.advanced ?? {};
  const main = filters.main ?? {};
  const attributeSet = getAttributeSet(row);
  let attributeMismatch = false;
  const normalize = (value?: string | null) => value?.toLowerCase().trim() ?? '';

  (Object.keys(ATTRIBUTE_FLAG_LABELS) as AttributeFlagKey[]).forEach((key) => {
    const desired = advanced[key];
    if (typeof desired !== 'boolean') {
      return;
    }
    const normalizedLabel = normalizeAttributeLabel(ATTRIBUTE_FLAG_LABELS[key]);
    const hasAttribute = attributeSet.has(normalizedLabel);
    if (desired !== hasAttribute) {
      attributeMismatch = true;
    }
  });

  if (attributeMismatch) {
    return false;
  }

  const requireAttributes = (values?: string[]): boolean => {
    if (!values || values.length === 0) {
      return true;
    }
    return values.every((value) => attributeSet.has(normalizeAttributeLabel(value)));
  };

  if (!requireAttributes(advanced.limbsPresent)) {
    return false;
  }

  if (!requireAttributes(advanced.partsFragmented)) {
    return false;
  }

  if (isNonEmptyString(main.suspectedCurrentLocation)) {
    const term = normalize(main.suspectedCurrentLocation);
    const currentLocation = pickLatestLocation(row.statue_current_loc);
    const currentLocRecord = pickSingle(currentLocation?.location);
    const candidateValues = [currentLocRecord?.location_name, currentLocRecord?.country].map(normalize).filter(Boolean);

    const hasMatch = candidateValues.some((value) => value.includes(term));
    if (!hasMatch) return false;
  }

  if (isNonEmptyString(main.photographLocation)) {
    const term = normalize(main.photographLocation);
    const images = row.images ?? [];
    const hasMatch = images.some((img) => {
      const loc = typeof img.photograph_location === 'number' ? locationMap[img.photograph_location] : null;
      const values = [loc?.location_name, loc?.country].map(normalize).filter(Boolean);
      return values.some((value) => value.includes(term));
    });
    if (!hasMatch) return false;
  }

  if (typeof main.repatriated === 'boolean') {
    const currentLocation = pickLatestLocation(row.statue_current_loc);
    const hasCurrentLocation = currentLocation?.location_id != null;
    const hasOriginalLocation = row.original_location_id != null;
    const isRepatriated =
      hasCurrentLocation && hasOriginalLocation && currentLocation?.location_id === row.original_location_id;
    if (main.repatriated !== isRepatriated) {
      return false;
    }
  }

  return true;
};

export const executeStatueSearch = async (filters: StatueSearchFilters): Promise<StatueSearchRow[]> => {
  const query = applySupabaseFilters(filters ?? {});
  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  const rows = (data ?? []) as unknown as SupabaseStatueRow[];
  const locationMap = await buildLocationMap(rows);
  const filteredRows = rows.filter((row) => matchesPostFilters(row, filters ?? {}, locationMap));

  return filteredRows.map((row) => mapStatueRow(row, locationMap));
};
