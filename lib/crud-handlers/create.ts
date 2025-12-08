import { supabase } from '@/lib/db/supabase';
import { CrudRequest, TABLE_REGISTRY } from '@/lib/registry';

export type CreateRequest = CrudRequest & {
  action: 'create';
  data: Record<string, unknown>;
};

type InsertResult = {
  record: Record<string, unknown>;
  primaryKey: Record<string, unknown>;
};

const IDENTIFIER_REGEX = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

export async function handleCreate(request: CreateRequest): Promise<InsertResult> {
  const { table, data } = request;
  if (!data || Object.keys(data).length === 0) {
    throw new Error('Create action requires a non-empty data payload');
  }

  const tableConfig = TABLE_REGISTRY[table];
  if (!tableConfig) {
    throw new Error(`Table "${table}" is not registered`);
  }

  if (!tableConfig.allowedActions.includes('create')) {
    throw new Error(`Create action is not allowed for table "${table}"`);
  }

  validateIdentifier(table);
  Object.keys(data).forEach(validateIdentifier);

  const record = await insertRow(table, data);
  if (!record) {
    throw new Error(`Insert into "${table}" did not return a record`);
  }

  const primaryKey = extractPrimaryKey(record, tableConfig.primaryKey);
  return { record, primaryKey };
}

async function insertRow(table: string, data: Record<string, unknown>) {
  const { data: insertedRecord, error } = await supabase.from(table).insert([data]).select().single();

  if (error) {
    const details = error.details ? ` (${error.details})` : '';
    throw new Error(`Failed to insert into "${table}": ${error.message}${details}`);
  }

  return insertedRecord ?? null;
}

function extractPrimaryKey(record: Record<string, unknown>, primaryKey: string | string[]) {
  if (Array.isArray(primaryKey)) {
    return primaryKey.reduce<Record<string, unknown>>((acc, key) => {
      acc[key] = record[key];
      return acc;
    }, {});
  }

  return { [primaryKey]: record[primaryKey] };
}

function validateIdentifier(identifier: string) {
  if (!IDENTIFIER_REGEX.test(identifier)) {
    throw new Error(`Invalid identifier: ${identifier}`);
  }
}
