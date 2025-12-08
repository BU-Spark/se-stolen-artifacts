import { createClient } from '@supabase/supabase-js';
import type { TableConfig } from '../registry';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

/**
 * Handles update operation for a table
 * Updates records based on primary key (single or composite)
 */
export async function handleUpdate(
  table: string,
  config: TableConfig,
  id: string | number | Record<string, unknown>,
  data: Record<string, unknown>
): Promise<Record<string, unknown>> {
  // Validate that update is allowed for this table
  if (!config.allowedActions.includes('update')) {
    throw new Error(`Update action not allowed for table "${table}"`);
  }

  // Remove primary key from update data (shouldn't be updated)
  let updateData = { ...data };
  if (Array.isArray(config.primaryKey)) {
    // For composite keys, remove all primary key fields
    config.primaryKey.forEach((key) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [key]: _unused, ...rest } = updateData;
      updateData = rest;
    });
  } else {
    // For single primary key, remove it
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { [config.primaryKey]: _unused, ...rest } = updateData;
    updateData = rest;
  }

  // Handle composite keys
  if (Array.isArray(config.primaryKey)) {
    // For composite keys, id should be an object with all key values
    const idObj = id as Record<string, unknown>;

    // Validate that all composite key values are provided
    for (const key of config.primaryKey) {
      if (!(key in idObj) || idObj[key] === undefined || idObj[key] === null) {
        throw new Error(`Missing required composite key field: ${key}`);
      }
    }

    // Build query with all composite key conditions
    let query = supabase.from(table).update(updateData);

    config.primaryKey.forEach((key) => {
      query = query.eq(key, idObj[key]);
    });

    const { data: result, error } = await query.select().single();

    if (error) {
      throw new Error(`Failed to update ${table}: ${error.message}`);
    }

    if (!result) {
      throw new Error(`No record found in ${table} with the provided composite key`);
    }

    return result;
  } else {
    // Single primary key
    const idValue = id as string | number;

    if (idValue === undefined || idValue === null) {
      throw new Error(`ID is required for updating ${table}`);
    }

    const { data: result, error } = await supabase
      .from(table)
      .update(updateData)
      .eq(config.primaryKey, idValue)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update ${table}: ${error.message}`);
    }

    if (!result) {
      throw new Error(`No record found in ${table} with ${config.primaryKey} = ${idValue}`);
    }

    return result;
  }
}
