import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function GET() {
  try {
    // Get distinct statue_ids from images table and count images per statue
    const { data: images, error: imagesError } = await supabase
      .from('images')
      .select('statue_id')
      .not('statue_id', 'is', null);

    if (imagesError) {
      return NextResponse.json({ error: imagesError.message }, { status: 500 });
    }

    // Group by statue_id and count images
    const statueCounts = new Map<number, number>();
    (images || []).forEach((image) => {
      const statueId = image.statue_id;
      if (statueId !== null) {
        statueCounts.set(statueId, (statueCounts.get(statueId) || 0) + 1);
      }
    });

    // Convert to array format and sort by statue_id
    const statuesWithCounts = Array.from(statueCounts.entries())
      .map(([statueId, imageCount]) => ({
        id: statueId.toString(),
        name: `Statue ${statueId}`,
        statueId: statueId,
        imageCount: imageCount,
      }))
      .sort((a, b) => a.statueId - b.statueId);

    return NextResponse.json({ statues: statuesWithCounts }, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
