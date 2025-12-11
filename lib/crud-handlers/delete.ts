import type { TableConfig } from '../registry';
import { supabase } from '@/lib/db/supabase';

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
