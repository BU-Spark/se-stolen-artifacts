import { NextRequest, NextResponse } from 'next/server';

import { handleCreate, type CreateRequest } from '@/lib/crud-handlers/create';
import { handleUpdate, type UpdateRequest } from '@/lib/crud-handlers/update';
import { supabase } from '@/lib/db/supabase';
import { TABLE_REGISTRY } from '@/lib/registry';

const PENDING_STORAGE_BUCKET =
  process.env.SUPABASE_BUCKET_PENDING_IMAGES ??
  process.env.NEXT_PUBLIC_SUPABASE_BUCKET_PENDING_IMAGES ??
  'pending_images';
const APPROVED_STORAGE_BUCKET =
  process.env.SUPABASE_BUCKET_APPROVED_IMAGES ??
  process.env.NEXT_PUBLIC_SUPABASE_BUCKET_APPROVED_IMAGES ??
  'approved_images';
const TEMP_TABLE = 'temp_artifact_metadata';
const UPLOAD_LOG_TABLE = 'temp_artifact_metadata';

type CrudTable = keyof typeof TABLE_REGISTRY;
type LookupTable = 'subjects' | 'materials' | 'names' | 'locations' | 'attributes';

type AttributeBooleanFields = {
  has_inscription?: boolean | null;
  multiple_heads?: boolean | null;
  four_arms?: boolean | null;
  eight_arms?: boolean | null;
  ten_arms?: boolean | null;
  over_ten_arms?: boolean | null;
  fragmentary?: boolean | null;
  fragments_from_multiple_statues?: boolean | null;
  head_present?: boolean | null;
  torso_present?: boolean | null;
  shoulder_elbow_present?: boolean | null;
  elbow_wrist_present?: boolean | null;
  hand_present?: boolean | null;
  hip_knee_present?: boolean | null;
  knee_ankle_present?: boolean | null;
  foot_present?: boolean | null;
  base_present?: boolean | null;
  fragmented_at_neck?: boolean | null;
  fragmented_at_shoulder?: boolean | null;
  fragmented_at_elbow?: boolean | null;
  fragmented_at_wrist?: boolean | null;
  fragmented_at_upper_leg?: boolean | null;
  fragmented_at_knee?: boolean | null;
  fragmented_at_ankle?: boolean | null;
};

type AttributeFlagKey = keyof AttributeBooleanFields;

const ATTRIBUTE_FIELD_MAP: Record<AttributeFlagKey, string> = {
  has_inscription: 'Has inscription',
  multiple_heads: 'Multiple heads',
  four_arms: 'Four arms',
  eight_arms: 'Eight arms',
  ten_arms: 'Ten arms',
  over_ten_arms: 'Over ten arms',
  fragmentary: 'Fragmentary',
  fragments_from_multiple_statues: 'Fragments from multiple statues',
  head_present: 'Head present',
  torso_present: 'Torso present',
  shoulder_elbow_present: 'Shoulder to elbow present',
  elbow_wrist_present: 'Elbow to wrist present',
  hand_present: 'Hand present',
  hip_knee_present: 'Hip to knee present',
  knee_ankle_present: 'Knee to ankle present',
  foot_present: 'Foot present',
  base_present: 'Base present',
  fragmented_at_neck: 'Fragmented at neck',
  fragmented_at_shoulder: 'Fragmented at shoulder',
  fragmented_at_elbow: 'Fragmented at elbow',
  fragmented_at_wrist: 'Fragmented at wrist',
  fragmented_at_upper_leg: 'Fragmented at upper leg',
  fragmented_at_knee: 'Fragmented at knee',
  fragmented_at_ankle: 'Fragmented at ankle',
};

type TempArtifactRow = AttributeBooleanFields & {
  id: string;
  image_id: string;
  subject: string | null;
  dealer_name: string | null;
  suspected_current_location: string | null;
  artifact_title: string | null;
  photograph_location: string | null;
  first_appearance_year: number | null;
  first_appearance_year_outside_cambodia: number | null;
  repatriated: boolean | null;
  image_source: string | null;
  material: string | null;
  short_description?: string | null;
  long_description?: string | null;
  misc_information?: string | null;
  ai_generated?: boolean | null;
};

type UploadLogRow = {
  internal_reference_number: string | null;
  gcs_path: string | null;
  short_description: string | null;
  long_description: string | null;
  misc_information: string | null;
  ai_generated: boolean | null;
  image_source: string | null;
};

type EnsureStatueParams = {
  folderId?: string | number | null;
  tempRecord: TempArtifactRow;
  nameId: number | null;
  materialId: number | null;
  description: string | null;
  summary: string | null;
};

export async function POST(request: NextRequest) {
  try {
    const { imageId, folderId } = (await request.json()) as {
      imageId?: string;
      folderId?: string;
    };

    if (!imageId || typeof imageId !== 'string') {
      return NextResponse.json({ error: 'imageId is required' }, { status: 400 });
    }

    const tempRecord = await fetchTempRecord(imageId);
    const uploadRecord = await fetchUploadRecord(imageId);

    const referenceNumber = uploadRecord?.internal_reference_number ?? tempRecord.image_id ?? imageId;

    if (!referenceNumber) {
      return NextResponse.json({ error: 'Unable to determine internal reference number for image' }, { status: 400 });
    }

    const [subjectId, materialId, nameId, photoLocationId, currentLocationId] = await Promise.all([
      ensureLookup('subjects', 'subject_name', tempRecord.subject),
      ensureLookup('materials', 'material_name', tempRecord.material),
      ensureLookup('names', 'statues_name', tempRecord.artifact_title),
      ensureLookup('locations', 'location_name', tempRecord.photograph_location),
      ensureLookup('locations', 'location_name', tempRecord.suspected_current_location),
    ]);

    const description = tempRecord.long_description ?? uploadRecord?.long_description ?? null;
    const summary = tempRecord.short_description ?? uploadRecord?.short_description ?? null;

    const statueId = await ensureStatue({
      folderId,
      tempRecord,
      nameId,
      materialId,
      description,
      summary,
    });

    if (subjectId) {
      await ensureStatueSubject(statueId, subjectId);
    }

    if (currentLocationId) {
      await ensureCurrentLocation(statueId, currentLocationId);
    }

    await syncAttributes(statueId, tempRecord);

    const imageResult = await upsertImage({
      statueId,
      referenceNumber,
      gcsPath: uploadRecord?.gcs_path ?? null,
      imageSource: tempRecord.image_source ?? uploadRecord?.image_source ?? null,
      photographLocationId: photoLocationId,
      miscInformation: tempRecord.misc_information ?? uploadRecord?.misc_information ?? null,
    });

    await markUploadComplete(referenceNumber, tempRecord.id, imageResult.gcsPath);

    return NextResponse.json({
      success: true,
      result: {
        statueId,
        internalReferenceNumber: referenceNumber,
        image: imageResult.record,
      },
    });
  } catch (error) {
    console.error('Error handling admin CRUD approval', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function fetchTempRecord(imageId: string): Promise<TempArtifactRow> {
  const { data, error } = await supabase.from(TEMP_TABLE).select('*').eq('image_id', imageId).maybeSingle();

  if (error) {
    throw new Error(`Failed to load temporary metadata for ${imageId}: ${error.message}`);
  }

  if (!data) {
    throw new Error(`No temporary metadata found for image ${imageId}`);
  }

  return data as TempArtifactRow;
}

async function fetchUploadRecord(imageId: string): Promise<UploadLogRow | null> {
  const columns =
    'internal_reference_number, gcs_path, short_description, long_description, misc_information, ai_generated, image_source';

  const queryByColumn = (column: string) =>
    supabase
      .from(UPLOAD_LOG_TABLE)
      .select(columns)
      .eq(column, imageId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

  const byImageId = await queryByColumn('image_id');

  if (byImageId.error && byImageId.error.code !== 'PGRST116') {
    throw new Error(`Failed to load upload log for ${imageId}: ${byImageId.error.message}`);
  }

  if (byImageId.data) {
    return byImageId.data as UploadLogRow;
  }

  const byInternalReference = await queryByColumn('internal_reference_number');

  if (byInternalReference.error && byInternalReference.error.code !== 'PGRST116') {
    throw new Error(`Failed to load upload log for ${imageId}: ${byInternalReference.error.message}`);
  }

  return (byInternalReference.data as UploadLogRow) ?? null;
}

async function ensureStatue(params: EnsureStatueParams): Promise<number> {
  const { folderId, tempRecord, nameId, materialId, description, summary } = params;

  const payload = cleansePayload({
    statues_name: nameId ?? undefined,
    material: materialId ?? undefined,
    description: description ?? undefined,
    provenance_history: tempRecord.dealer_name ?? undefined,
    first_known_appearance_year: tempRecord.first_appearance_year ?? undefined,
    first_known_appearance_outside_cambodia_year: tempRecord.first_appearance_year_outside_cambodia ?? undefined,
    collection_mission: summary ?? undefined,
  });

  if (folderId) {
    const statueId = parseStatueId(folderId);
    await assertStatueExists(statueId);
    if (Object.keys(payload).length > 0) {
      await crudUpdate('statues', statueId, payload);
    }
    return statueId;
  }

  const createPayload =
    Object.keys(payload).length > 0 ? payload : { description: `Imported metadata for ${tempRecord.image_id}` };

  const record = await crudCreate('statues', createPayload);
  const primaryKey = extractPrimaryKeyValue('statues', record);

  if (typeof primaryKey !== 'number' || Number.isNaN(primaryKey)) {
    throw new Error('Unable to determine statue_id for newly created statue');
  }

  return primaryKey;
}

async function ensureStatueSubject(statueId: number, subjectId: number) {
  const { data, error } = await supabase
    .from('statue_subject')
    .select('statue_id')
    .eq('statue_id', statueId)
    .eq('subject_id', subjectId)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') {
    throw new Error(`Failed to check statue_subject link: ${error.message}`);
  }

  if (!data) {
    await crudCreate('statue_subject', {
      statue_id: statueId,
      subject_id: subjectId,
    });
  }
}

async function ensureCurrentLocation(statueId: number, locationId: number) {
  const { data, error } = await supabase
    .from('statue_current_loc')
    .select('id')
    .eq('statue_id', statueId)
    .eq('location_id', locationId)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') {
    throw new Error(`Failed to check statue_current_loc link: ${error.message}`);
  }

  if (!data) {
    await crudCreate('statue_current_loc', {
      statue_id: statueId,
      location_id: locationId,
    });
  }
}

async function syncAttributes(statueId: number, tempRecord: TempArtifactRow) {
  for (const [field, label] of Object.entries(ATTRIBUTE_FIELD_MAP) as Array<[AttributeFlagKey, string]>) {
    const flagValue = tempRecord[field];
    if (!flagValue) {
      continue;
    }

    const attributeId = await ensureLookup('attributes', 'attribute_name', label);
    if (!attributeId) {
      continue;
    }

    const { data, error } = await supabase
      .from('statue_attributes')
      .select('statue_id')
      .eq('statue_id', statueId)
      .eq('attribute_id', attributeId)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to check statue attribute ${label}: ${error.message}`);
    }

    if (!data) {
      await crudCreate('statue_attributes', {
        statue_id: statueId,
        attribute_id: attributeId,
      });
    }
  }
}

async function upsertImage(params: {
  statueId: number;
  referenceNumber: string;
  gcsPath: string | null;
  imageSource: string | null;
  photographLocationId: number | null;
  miscInformation: string | null;
}): Promise<{ record: Record<string, unknown>; gcsPath: string | null }> {
  const { statueId, referenceNumber, gcsPath, imageSource, photographLocationId, miscInformation } = params;

  const approvedPath = await ensureApprovedStoragePath(referenceNumber, gcsPath);

  const basePayload = cleansePayload({
    statue_id: statueId,
    image_gcs: approvedPath ?? undefined,
    image_url: buildPublicImageUrl(approvedPath),
    image_source: imageSource ?? undefined,
    photograph_location: photographLocationId ?? undefined,
    observations_comments: miscInformation ?? undefined,
  });

  const { data: existing, error } = await supabase
    .from('images')
    .select('internal_reference_number')
    .eq('internal_reference_number', referenceNumber)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') {
    throw new Error(`Failed to look up image ${referenceNumber}: ${error.message}`);
  }

  if (existing) {
    const updatedRecord = (await crudUpdate('images', referenceNumber, basePayload)) ?? {
      internal_reference_number: referenceNumber,
      ...basePayload,
    };

    return { record: updatedRecord, gcsPath: approvedPath ?? null };
  }

  const record = await crudCreate('images', {
    internal_reference_number: referenceNumber,
    ...basePayload,
  });

  return { record, gcsPath: approvedPath ?? null };
}

async function markUploadComplete(referenceNumber: string, tempRowId: string, approvedPath: string | null) {
  const updatePayload: Record<string, unknown> = { status: 'admin_approved' };
  if (approvedPath) {
    updatePayload.gcs_path = approvedPath;
  }

  const { error: statusError } = await supabase
    .from(UPLOAD_LOG_TABLE)
    .update(updatePayload)
    .eq('internal_reference_number', referenceNumber);

  if (statusError) {
    throw new Error(`Failed to update approval status for ${referenceNumber}: ${statusError.message}`);
  }

  const { error: deleteError } = await supabase.from(TEMP_TABLE).delete().eq('id', tempRowId);

  if (deleteError) {
    throw new Error(`Failed to remove temporary metadata for ${referenceNumber}: ${deleteError.message}`);
  }
}

async function ensureLookup(table: LookupTable, column: string, value?: string | null): Promise<number | null> {
  if (!value) {
    return null;
  }

  const normalized = String(value).trim();
  if (!normalized) {
    return null;
  }

  const config = TABLE_REGISTRY[table];
  if (Array.isArray(config.primaryKey)) {
    throw new Error(`Lookup helper does not support composite keys for table "${table}"`);
  }

  const { data, error } = await supabase
    .from(table)
    .select(config.primaryKey as string)
    .ilike(column, normalized)
    .limit(1)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') {
    throw new Error(`Failed to look up ${table} value "${normalized}": ${error.message}`);
  }

  const existingRow = data as Record<string, unknown> | null;
  const existingId = existingRow?.[config.primaryKey as string];
  if (existingId != null) {
    const numericId = Number(existingId);
    return Number.isNaN(numericId) ? null : numericId;
  }

  const record = await crudCreate(table, { [column]: normalized });
  const recordRow = record as Record<string, unknown>;
  const newId = recordRow?.[config.primaryKey as string];
  const numericId = Number(newId);
  return Number.isNaN(numericId) ? null : numericId;
}

async function crudCreate<T extends CrudTable>(table: T, data: Record<string, unknown>) {
  const payload = cleansePayload(data);
  if (Object.keys(payload).length === 0) {
    throw new Error(`Create payload for table "${table}" cannot be empty`);
  }

  const result = await handleCreate({
    action: 'create',
    table,
    data: payload,
  } as CreateRequest);

  return result.record;
}

async function crudUpdate<T extends CrudTable>(table: T, id: string | number, data: Record<string, unknown>) {
  const payload = cleansePayload(data);
  if (Object.keys(payload).length === 0) {
    return null;
  }

  const result = await handleUpdate({
    action: 'update',
    table,
    id,
    data: payload,
  } as UpdateRequest);

  return result.record;
}

function cleansePayload(payload: Record<string, unknown>) {
  return Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined));
}

async function assertStatueExists(statueId: number) {
  const { data, error } = await supabase.from('statues').select('statue_id').eq('statue_id', statueId).maybeSingle();

  if (error && error.code !== 'PGRST116') {
    throw new Error(`Failed to verify statue ${statueId}: ${error.message}`);
  }

  if (!data) {
    throw new Error(`Statue ${statueId} not found`);
  }
}

function parseStatueId(value: string | number): number {
  const parsed = typeof value === 'string' ? Number.parseInt(value, 10) : value;
  if (!Number.isFinite(parsed)) {
    throw new Error('Invalid folderId provided');
  }
  return parsed;
}

function extractPrimaryKeyValue(table: CrudTable, record: Record<string, unknown>) {
  const config = TABLE_REGISTRY[table];
  if (Array.isArray(config.primaryKey)) {
    throw new Error(`Cannot extract primary key for table "${table}" with composite key`);
  }
  return record?.[config.primaryKey as string];
}

function buildPublicImageUrl(gcsPath: string | null) {
  if (!gcsPath) {
    return undefined;
  }

  const { bucket, path } = parseStoragePath(gcsPath);
  if (!path) {
    return undefined;
  }

  const bucketName = bucket ?? APPROVED_STORAGE_BUCKET;
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucketName}/${path}`;
}

async function ensureApprovedStoragePath(referenceNumber: string, rawPath: string | null) {
  if (!rawPath) {
    return null;
  }

  const parsed = parseStoragePath(rawPath);
  if (!parsed.path) {
    return null;
  }

  const sourceBucket = parsed.bucket ?? PENDING_STORAGE_BUCKET;
  const pathWithinBucket = parsed.path;

  if (sourceBucket === APPROVED_STORAGE_BUCKET) {
    return `${APPROVED_STORAGE_BUCKET}/${pathWithinBucket}`;
  }

  const { data, error } = await supabase.storage.from(sourceBucket).download(pathWithinBucket);

  if (error || !data) {
    throw new Error(`Failed to download image from bucket ${sourceBucket}: ${error?.message ?? 'Unknown error'}`);
  }

  const targetKey = buildApprovedStorageKey(referenceNumber, pathWithinBucket);
  const { error: uploadError } = await supabase.storage.from(APPROVED_STORAGE_BUCKET).upload(targetKey, data, {
    upsert: true,
    contentType: data.type || undefined,
  });

  if (uploadError) {
    throw new Error(`Failed to upload approved image: ${uploadError.message}`);
  }

  if (sourceBucket === PENDING_STORAGE_BUCKET) {
    const { error: deleteError } = await supabase.storage.from(PENDING_STORAGE_BUCKET).remove([pathWithinBucket]);

    if (deleteError) {
      console.warn(
        `Warning: approved image copied but pending copy could not be removed (${pathWithinBucket}): ${deleteError.message}`
      );
    }
  }

  return `${APPROVED_STORAGE_BUCKET}/${targetKey}`;
}

function parseStoragePath(rawPath: string): { bucket: string | null; path: string } {
  const trimmed = rawPath.trim().replace(/^\/+/, '');
  const parts = trimmed.split('/').filter(Boolean);
  const candidateBucket = parts[0];

  if (candidateBucket === PENDING_STORAGE_BUCKET || candidateBucket === APPROVED_STORAGE_BUCKET) {
    return {
      bucket: candidateBucket,
      path: parts.slice(1).join('/'),
    };
  }

  return {
    bucket: null,
    path: trimmed,
  };
}

function buildApprovedStorageKey(referenceNumber: string, originalPath: string) {
  const sanitizedRef = referenceNumber.replace(/[^a-zA-Z0-9_-]/g, '_');
  const fileName = originalPath.split('/').filter(Boolean).pop() ?? `${sanitizedRef}.jpg`;
  return `${sanitizedRef}/${fileName}`;
}
