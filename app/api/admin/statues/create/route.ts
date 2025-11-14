import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function POST() {
  try {
    // Get the maximum statue_id to create the next one
    const { data: maxStatue, error: maxError } = await supabase
      .from('statues')
      .select('statue_id')
      .order('statue_id', { ascending: false })
      .limit(1)
      .single();

    // PGRST116 is "no rows returned" which is fine for empty table
    if (maxError && maxError.code !== 'PGRST116') {
      return NextResponse.json({ error: maxError.message }, { status: 500 });
    }

    const nextStatueId = maxStatue ? maxStatue.statue_id + 1 : 1;

    // Insert the new statue
    const { data: newStatue, error: insertError } = await supabase
      .from('statues')
      .insert({ statue_id: nextStatueId })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      statue: {
        id: newStatue.statue_id.toString(),
        name: `Statue ${newStatue.statue_id}`,
        statueId: newStatue.statue_id,
        imageCount: 0,
      },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
