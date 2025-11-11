import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function GET() {
  try {
    // Fetch all statues ordered by statue_id
    const { data: statues, error: statuesError } = await supabase
      .from('statues')
      .select('statue_id')
      .order('statue_id', { ascending: true });

    if (statuesError) {
      return NextResponse.json({ error: statuesError.message }, { status: 500 });
    }

    // For each statue, count only APPROVED images (exclude pending_review and admin_rejected)
    const statuesWithCounts = await Promise.all(
      (statues || []).map(async (statue) => {
        // Get all images for this statue
        const { data: images, error: imagesError } = await supabase
          .from('images')
          .select('internal_reference_number')
          .eq('statue_id', statue.statue_id);

        if (imagesError || !images || images.length === 0) {
          return {
            id: statue.statue_id.toString(),
            name: `Statue ${statue.statue_id}`,
            statueId: statue.statue_id,
            imageCount: 0,
          };
        }

        // Get approval statuses for these images
        const imageIds = images.map((img) => img.internal_reference_number);
        const { data: approvals, error: approvalsError } = await supabase
          .from('approval')
          .select('image_id, status')
          .in('image_id', imageIds);

        if (approvalsError || !approvals) {
          return {
            id: statue.statue_id.toString(),
            name: `Statue ${statue.statue_id}`,
            statueId: statue.statue_id,
            imageCount: 0,
          };
        }

        // Count only approved images (status === 'admin_approved')
        const approvedCount = approvals.filter((a) => a.status === 'admin_approved').length;

        return {
          id: statue.statue_id.toString(),
          name: `Statue ${statue.statue_id}`,
          statueId: statue.statue_id,
          imageCount: approvedCount,
        };
      })
    );

    return NextResponse.json({ statues: statuesWithCounts }, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
