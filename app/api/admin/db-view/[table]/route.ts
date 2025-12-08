import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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

    const { data, error } = await supabase.from(table).select('*').order(orderBy, { ascending: true });

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

    // Determine primary key based on table
    const primaryKey = table === 'statues' ? 'statue_id' : table === 'images' ? 'internal_reference_number' : 'id';

    const { error } = await supabase.from(table).delete().eq(primaryKey, id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
