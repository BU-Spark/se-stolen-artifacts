import { createClient, type PostgrestError } from '@supabase/supabase-js';

import { TABLE_REGISTRY, type CrudRequest, type TableConfig } from '../registry';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export type DeleteRequest = CrudRequest & {
  action: 'delete';
  id: string | number | Record<string, unknown>;
};

/**
 * Dispatches a delete request using the table's configured delete rule.
 */
export async function handleDelete(
  request: DeleteRequest
): Promise<{ strategy: 'soft-delete' | 'hard-delete'; table: string }> {
  const { table, id } = request;

  if (id === undefined || id === null) {
    throw new Error('Delete action requires a primary key identifier');
  }

  const config = TABLE_REGISTRY[table];
  if (!config) {
    throw new Error(`Table "${table}" is not registered`);
  }

  if (!config.allowedActions.includes('delete')) {
    throw new Error(`Delete action is not allowed for table "${table}"`);
  }

  switch (config.deleteRule) {
    case 'soft-delete':
      await handleSoftDelete(table, config, id);
      return { strategy: 'soft-delete', table };

    case 'hard-delete':
      await hardDeleteRecord(table, config, id);
      return { strategy: 'hard-delete', table };

    default:
      throw new Error(`Delete rule "${config.deleteRule}" is not supported for table "${table}"`);
  }
}

/**
 * Map of tables that reference each table (for soft delete cascade)
 * Used to determine which records need to be handled when soft deleting
 */
const FK_REFERENCES: Record<
  string,
  Array<{ table: string; column: string; action: 'soft-delete' | 'hard-delete' | 'set-null' }>
> = {
  statues: [
    { table: 'images', column: 'statue_id', action: 'soft-delete' },
    // auction_events and statue_current_loc have required statue_id (NOT NULL)
    // So we hard delete them when soft deleting a statue
    { table: 'auction_events', column: 'statue_id', action: 'hard-delete' },
    { table: 'statue_subject', column: 'statue_id', action: 'hard-delete' },
    { table: 'statue_attributes', column: 'statue_id', action: 'hard-delete' },
    { table: 'statue_current_loc', column: 'statue_id', action: 'hard-delete' },
  ],
  images: [
    // Images don't have other tables referencing them directly
    // But we need to unlink from statue
  ],
};

/**
 * Hard deletes a record by applying the primary key filters and issuing a delete.
 *
 * - Updated lib/crud-handlers/delete.ts to add handleDelete/hardDeleteRecord, enforcing allowed actions from TABLE_REGISTRY,
 *   supporting composite keys, and returning whether a soft or hard strategy ran.
 * - Wired the new handler into app/api/admin/crud/route.ts, validating that delete calls include an id before dispatching.
 * - Use POST /api/admin/crud with {"table":"statue_attributes","action":"delete","id":{"statue_id":123,"attribute_id":5}} (or a
 *   single id for non-composite keys) to trigger a hard delete on tables whose deleteRule is hard-delete.
 */
async function hardDeleteRecord(
  table: string,
  config: TableConfig,
  id: string | number | Record<string, unknown>
): Promise<void> {
  let query = supabase.from(table).delete();

  if (Array.isArray(config.primaryKey)) {
    if (typeof id !== 'object' || id === null) {
      throw new Error(`Hard delete for table "${table}" requires a composite key object`);
    }

    const idObj = id as Record<string, unknown>;

    for (const key of config.primaryKey) {
      const value = idObj[key];

      if (value === undefined || value === null) {
        throw new Error(`Missing primary key value "${key}" for hard delete on "${table}"`);
      }

      if (typeof value !== 'string' && typeof value !== 'number') {
        throw new Error(`Invalid primary key type for "${key}" on "${table}"; expected string or number`);
      }

      query = query.eq(key, value);
    }
  } else {
    if (typeof id !== 'string' && typeof id !== 'number') {
      throw new Error(`Invalid identifier type for hard delete on "${table}"; expected string or number`);
    }

    query = query.eq(config.primaryKey, id);
  }

  const { error } = await query;

  if (error) {
    throw new Error(`Failed to hard delete from "${table}": ${error.message}`);
  }
}

/**
 * Handles soft delete for a table
 * Sets is_deleted = true and handles all referencing records
 */
export async function handleSoftDelete(
  table: string,
  config: TableConfig,
  id: string | number | Record<string, unknown>
): Promise<{ success: true; message?: string }> {
  // Step 1: Mark the main record as deleted
  await markAsDeleted(table, config, id);

  // Step 2: Handle all referencing records
  const references = FK_REFERENCES[table] || [];

  // Extract the actual ID value (handle composite keys)
  let idValue: string | number;
  if (Array.isArray(config.primaryKey)) {
    const idObj = id as Record<string, unknown>;
    const extractedValue = idObj[config.primaryKey[0]];
    if (typeof extractedValue !== 'string' && typeof extractedValue !== 'number') {
      throw new Error(`Invalid ID value for composite key: expected string or number, got ${typeof extractedValue}`);
    }
    idValue = extractedValue;
  } else {
    idValue = id as string | number;
  }

  for (const ref of references) {
    try {
      switch (ref.action) {
        case 'soft-delete':
          // Recursively soft delete referencing records
          await softDeleteReferencingRecords(ref.table, ref.column, idValue);
          break;

        case 'hard-delete':
          // Hard delete junction records (they're just links)
          await hardDeleteReferencingRecords(ref.table, ref.column, idValue);
          break;

        case 'set-null':
          // Set foreign key to null (unlink)
          await setNullReferencingRecords(ref.table, ref.column, idValue);
          break;
      }
    } catch (error) {
      console.warn(`Failed to handle reference ${ref.table}.${ref.column}:`, error);
      // Continue with other references even if one fails
    }
  }

  // Step 3: Special handling for images (unlink from statue after marking as deleted)
  if (table === 'images') {
    await unlinkImageFromStatue(id);
  }

  return { success: true };
}

/**
 * Marks a record as deleted by setting is_deleted = true
 */
async function markAsDeleted(
  table: string,
  config: TableConfig,
  id: string | number | Record<string, unknown>
): Promise<void> {
  if (Array.isArray(config.primaryKey)) {
    // Composite key
    const idObj = id as Record<string, unknown>;
    let query = supabase.from(table).update({ is_deleted: true });

    config.primaryKey.forEach((key) => {
      query = query.eq(key, idObj[key]);
    });

    const { error } = await query;
    if (error) throw new Error(`Failed to mark ${table} as deleted: ${error.message}`);
  } else {
    // Single primary key
    const { error } = await supabase.from(table).update({ is_deleted: true }).eq(config.primaryKey, id);

    if (error) throw new Error(`Failed to mark ${table} as deleted: ${error.message}`);
  }
}

/**
 * Soft deletes all records that reference the deleted record
 * Tables that support soft delete: statues, images
 */
async function softDeleteReferencingRecords(
  referencingTable: string,
  fkColumn: string,
  deletedId: string | number
): Promise<void> {
  // Tables that have is_deleted column
  const tablesWithSoftDelete = ['statues', 'images'];

  // First, find all records that reference this ID
  let query = supabase.from(referencingTable).select('*').eq(fkColumn, deletedId);

  // Only get non-deleted records if table supports soft delete
  if (tablesWithSoftDelete.includes(referencingTable)) {
    query = query.eq('is_deleted', false);
  }

  const { data: referencingRecords, error: fetchError } = await query;

  if (fetchError) {
    throw new Error(`Failed to fetch referencing records from ${referencingTable}: ${fetchError.message}`);
  }

  if (!referencingRecords || referencingRecords.length === 0) {
    return; // No records to delete
  }

  // Get the primary key for the referencing table
  let primaryKey: string;
  if (referencingTable === 'images') {
    primaryKey = 'internal_reference_number';
  } else if (referencingTable === 'statues') {
    primaryKey = 'statue_id';
  } else {
    primaryKey = 'id';
  }

  // Soft delete each referencing record
  for (const record of referencingRecords) {
    const recordId = record[primaryKey];
    if (!recordId) continue;

    if (tablesWithSoftDelete.includes(referencingTable)) {
      // Table has is_deleted column, mark as deleted
      const { error } = await supabase.from(referencingTable).update({ is_deleted: true }).eq(primaryKey, recordId);

      if (error) {
        console.warn(`Failed to soft delete ${referencingTable} record ${recordId}:`, error);
      }
    } else {
      // Table doesn't have is_deleted, set FK to null instead
      const { error } = await supabase
        .from(referencingTable)
        .update({ [fkColumn]: null })
        .eq(primaryKey, recordId);

      if (error) {
        console.warn(`Failed to unlink ${referencingTable} record ${recordId}:`, error);
      }
    }
  }
}

/**
 * Hard deletes junction table records (many-to-many links)
 */
async function hardDeleteReferencingRecords(
  referencingTable: string,
  fkColumn: string,
  deletedId: string | number
): Promise<void> {
  const { error } = await supabase.from(referencingTable).delete().eq(fkColumn, deletedId);

  if (error) {
    throw new Error(`Failed to delete junction records from ${referencingTable}: ${error.message}`);
  }
}

/**
 * Sets foreign key to null for referencing records (unlinks them)
 */
async function setNullReferencingRecords(
  referencingTable: string,
  fkColumn: string,
  deletedId: string | number
): Promise<void> {
  const { error } = await supabase
    .from(referencingTable)
    .update({ [fkColumn]: null })
    .eq(fkColumn, deletedId);

  if (error) {
    throw new Error(`Failed to set null in ${referencingTable}.${fkColumn}: ${error.message}`);
  }
}

/**
 * Special handling for images: unlink from statue
 * This is called after marking the image as deleted
 */
async function unlinkImageFromStatue(imageId: string | number | Record<string, unknown>): Promise<void> {
  const imageIdValue =
    typeof imageId === 'object' ? (imageId as Record<string, unknown>)['internal_reference_number'] : imageId;

  if (!imageIdValue) {
    throw new Error('Invalid image ID for unlinking from statue');
  }

  const { error } = await supabase
    .from('images')
    .update({ statue_id: null })
    .eq('internal_reference_number', imageIdValue);

  if (error) {
    throw new Error(`Failed to unlink image from statue: ${error.message}`);
  }
}

/**
 * Fully removes a statue and every related record, bypassing soft-delete semantics.
 * Also removes approvals/metadata linked to the statue's images to avoid FK violations.
 */
export async function hardDeleteStatueWithRelations(
  statueId: number
): Promise<{ statueId: number; deletedImageIds: string[] }> {
  if (!Number.isInteger(statueId) || statueId <= 0) {
    throw new Error('statueId must be a valid integer');
  }

  // Collect image IDs first so we can clear approval/metadata tables before deleting the rows.
  const { data: images, error: imagesError } = await supabase
    .from('images')
    .select('internal_reference_number')
    .eq('statue_id', statueId);

  if (imagesError) {
    throw new Error(`Failed to fetch images for statue ${statueId}: ${imagesError.message}`);
  }

  const imageIds =
    images?.map((img) => img.internal_reference_number).filter((id): id is string => typeof id === 'string') ?? [];

  if (imageIds.length > 0) {
    await deleteByColumn('approval', 'image_id', imageIds);
    await deleteByColumn('temp_artifact_metadata', 'image_id', imageIds, { ignoreMissingTable: true });
    await deleteByColumn('artifact_metadata_upload_log', 'image_id', imageIds, { ignoreMissingTable: true });
    await deleteByColumn('artifact_metadata_upload_log', 'internal_reference_number', imageIds, {
      ignoreMissingTable: true,
    });
  }

  const statueLinkedTables: Array<{ table: string; column: string }> = [
    { table: 'statue_current_loc', column: 'statue_id' },
    { table: 'statue_attributes', column: 'statue_id' },
    { table: 'statue_subject', column: 'statue_id' },
    { table: 'auction_events', column: 'statue_id' },
    { table: 'images', column: 'statue_id' },
  ];

  for (const { table, column } of statueLinkedTables) {
    await deleteByColumn(table, column, statueId);
  }

  await deleteByColumn('statues', 'statue_id', statueId);

  return { statueId, deletedImageIds: imageIds };
}

type DeleteByColumnOptions = {
  ignoreMissingTable?: boolean;
};

/**
 * Deletes rows from a table by matching a column against a single value or list.
 * When ignoreMissingTable is true, a missing relation error is swallowed so optional tables don't block deletion.
 */
async function deleteByColumn(
  table: string,
  column: string,
  value: number | string | number[] | string[],
  options: DeleteByColumnOptions = {}
): Promise<void> {
  const valuesArray = Array.isArray(value) ? value : [value];
  if (valuesArray.length === 0) return;

  const allNumbers = valuesArray.every((item) => typeof item === 'number');
  const allStrings = valuesArray.every((item) => typeof item === 'string');

  if (!allNumbers && !allStrings) {
    throw new Error(`deleteByColumn received mixed value types for "${table}.${column}"`);
  }

  const filterValues = allNumbers ? (valuesArray as number[]) : (valuesArray as string[]);

  const query = supabase.from(table).delete().in(column, filterValues);
  const { error } = await query;

  if (error) {
    if (options.ignoreMissingTable && isMissingTableError(error)) {
      console.warn(`Skipping optional delete on missing table "${table}"`);
      return;
    }

    throw new Error(`Failed to delete from "${table}": ${error.message}`);
  }
}

function isMissingTableError(error: PostgrestError): boolean {
  const message = error.message?.toLowerCase() ?? '';
  return (
    error.code === '42P01' ||
    error.code === '42703' ||
    message.includes('does not exist') ||
    message.includes('could not find the table') ||
    message.includes('schema cache')
  );
}
