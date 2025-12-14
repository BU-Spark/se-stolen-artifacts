import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db/supabase';

export async function GET() {
  try {
    // Get all statues that have NOT been soft-deleted
    const { data: statues, error: statuesError } = await supabase
      .from('statues')
      .select('statue_id, statues_name, is_deleted')
      .eq('is_deleted', false);

    if (statuesError) {
      return NextResponse.json({ error: statuesError.message }, { status: 500 });
    }

    // Get image counts per statue (ignoring deleted images)
    const { data: images, error: imagesError } = await supabase
      .from('images')
      .select('statue_id')
      .eq('is_deleted', false)
      .not('statue_id', 'is', null);

    if (imagesError) {
      return NextResponse.json({ error: imagesError.message }, { status: 500 });
    }

    const statueCounts = new Map<number, number>();
    (images || []).forEach((image) => {
      const statueId = image.statue_id;
      if (statueId !== null) {
        statueCounts.set(statueId, (statueCounts.get(statueId) || 0) + 1);
      }
    });

    const statuesWithCounts = (statues || [])
      .map((statue) => ({
        id: statue.statue_id?.toString() ?? '',
        statueId: statue.statue_id,
        name: statue.statues_name || `Statue ${statue.statue_id}`,
        imageCount: statueCounts.get(statue.statue_id) || 0,
      }))
      .sort((a, b) => a.statueId - b.statueId);

    return NextResponse.json({ statues: statuesWithCounts }, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
