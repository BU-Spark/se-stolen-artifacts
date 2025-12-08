import { supabase } from '@/lib/db/supabase';
import { CrudRequest, TABLE_REGISTRY } from '@/lib/registry';

export type UpdateRequest = CrudRequest & {
  action: 'update';
  id: string | number;
  data: Record<string, unknown>;
};

export async function handleUpdate(request: UpdateRequest) {
  const { table, id, data } = request;

  if (id === undefined || id === null) {
    throw new Error('Update action requires a primary key identifier');
  }

  if (!data || Object.keys(data).length === 0) {
    throw new Error('Update action requires a non-empty data payload');
  }

  const tableConfig = TABLE_REGISTRY[table];
  if (!tableConfig) {
    throw new Error(`Table "${table}" is not registered`);
  }

  if (!tableConfig.allowedActions.includes('update')) {
    throw new Error(`Update action is not allowed for table "${table}"`);
  }

  const primaryKey = tableConfig.primaryKey;
  if (Array.isArray(primaryKey)) {
    throw new Error(`Update handler does not yet support composite primary keys for table "${table}"`);
  }

  const { data: result, error } = await supabase.from(table).update(data).eq(primaryKey, id).select().single();

  if (error) {
    throw new Error(`Failed to update "${table}": ${error.message}`);
  }

  if (!result) {
    throw new Error(`Update on "${table}" did not return a record`);
  }

  return {
    record: result,
    primaryKey: { [primaryKey]: result[primaryKey] },
  };
}
