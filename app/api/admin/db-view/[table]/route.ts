import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { handleSoftDelete } from '@/lib/crud-handlers/delete';
import { TABLE_REGISTRY } from '@/lib/registry';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

// Allowed tables for admin access (security)
const ALLOWED_TABLES = [
  'statues',
  'images',
  'locations',
  'materials',
  'names',
  'subjects',
  'attributes',
  'photographers',
  'auction_institutions',
  'auction_events',
  'statue_current_loc',
  'statue_subject',
  'statue_attributes',
];

export async function GET(request: NextRequest, { params }: { params: Promise<{ table: string }> }) {
  try {
    const { table } = await params;

    if (!ALLOWED_TABLES.includes(table)) {
      return NextResponse.json({ error: `Table "${table}" is not allowed` }, { status: 403 });
    }

    // Determine primary key for ordering
    const orderBy = table === 'statues' ? 'statue_id' : table === 'images' ? 'internal_reference_number' : 'id';

    // Get table configuration from registry
    const config = TABLE_REGISTRY[table];
    if (!config) {
      return NextResponse.json({ error: `Table "${table}" is not registered` }, { status: 400 });
    }

    // Build query
    let query = supabase.from(table).select('*');

    // Filter out soft-deleted records if table supports soft delete
    if (config.deleteRule === 'soft-delete') {
      query = query.eq('is_deleted', false);
    }

    // For images table, only show approved images (those in approved_images bucket)
    if (table === 'images') {
      const APPROVED_BUCKET = 'approved_images';
      // Filter to only show images where image_gcs starts with approved_images/
      query = query.like('image_gcs', `${APPROVED_BUCKET}/%`);
    }

    const { data, error } = await query.order(orderBy, { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ table: string }> }) {
  try {
    const { table } = await params;

    if (!ALLOWED_TABLES.includes(table)) {
      return NextResponse.json({ error: `Table "${table}" is not allowed` }, { status: 403 });
    }

    const body = await request.json();
    const { data, error } = await supabase.from(table).insert(body).select().single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ table: string }> }) {
  try {
    const { table } = await params;

    if (!ALLOWED_TABLES.includes(table)) {
      return NextResponse.json({ error: `Table "${table}" is not allowed` }, { status: 403 });
    }

    // Determine primary key based on table FIRST
    const primaryKey = table === 'statues' ? 'statue_id' : table === 'images' ? 'internal_reference_number' : 'id';

    const body = await request.json();

    // Extract the primary key value using the correct field name
    const primaryKeyValue = body[primaryKey];

    if (!primaryKeyValue) {
      return NextResponse.json({ error: `${primaryKey} is required for update` }, { status: 400 });
    }

    // Remove the primary key from updateData (it shouldn't be updated)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { [primaryKey]: _unused, ...updateData } = body;

    const { data, error } = await supabase
      .from(table)
      .update(updateData)
      .eq(primaryKey, primaryKeyValue)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ table: string }> }) {
  try {
    const { table } = await params;

    if (!ALLOWED_TABLES.includes(table)) {
      return NextResponse.json({ error: `Table "${table}" is not allowed` }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required for deletion' }, { status: 400 });
    }

    // Get table configuration from registry
    const config = TABLE_REGISTRY[table];
    if (!config) {
      return NextResponse.json({ error: `Table "${table}" is not registered` }, { status: 400 });
    }

    // Check if delete action is allowed
    if (!config.allowedActions.includes('delete')) {
      return NextResponse.json({ error: `Delete action is not allowed for table "${table}"` }, { status: 403 });
    }

    // Parse ID based on primary key type
    let parsedId: string | number | Record<string, unknown>;
    if (Array.isArray(config.primaryKey)) {
      // Composite key - would need multiple IDs, not supported in current API
      return NextResponse.json({ error: 'Composite key deletion not supported via this endpoint' }, { status: 400 });
    } else {
      // Single primary key - parse as number if primary key is statue_id, otherwise string
      parsedId = table === 'statues' ? Number.parseInt(id, 10) : id;
      if (table === 'statues' && Number.isNaN(parsedId)) {
        return NextResponse.json({ error: 'Invalid statue_id' }, { status: 400 });
      }
    }

    // Use appropriate delete strategy based on registry
    switch (config.deleteRule) {
      case 'soft-delete':
        await handleSoftDelete(table, config, parsedId);
        return NextResponse.json({ success: true, message: 'Record soft deleted successfully' }, { status: 200 });

      case 'hard-delete': {
        // Direct hard delete
        const primaryKey = config.primaryKey as string;
        const { error } = await supabase.from(table).delete().eq(primaryKey, parsedId);
        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json({ success: true, message: 'Record deleted successfully' }, { status: 200 });
      }

      case 'set-null':
        // TODO: Implement set-null strategy (set foreign keys to null)
        return NextResponse.json({ error: 'set-null delete strategy not yet implemented' }, { status: 501 });

      case 'cascade':
        // TODO: Implement cascade strategy (delete related records)
        return NextResponse.json({ error: 'cascade delete strategy not yet implemented' }, { status: 501 });

      default:
        return NextResponse.json({ error: `Unknown delete rule: ${config.deleteRule}` }, { status: 500 });
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
