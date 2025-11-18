import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { imageId } = await request.json();

    if (!imageId) {
      return NextResponse.json({ error: 'imageId is required' }, { status: 400 });
    }

    // Update approval status to 'admin_rejected'
    const { data, error } = await supabase
      .from('artifact_metadata_upload_log')
      .update({ status: 'admin_rejected' })
      .eq('internal_reference_number', imageId)
      .select('internal_reference_number');

    if (error) {
      console.error('Error updating approval status:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data || data.length === 0) {
      console.warn('Deny endpoint was called but no matching image was found for internal_reference_number:', imageId);
      return NextResponse.json(
        { success: false, message: `No pending image found for reference ${imageId}` },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: 'Image rejected' });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('Error in deny endpoint:', errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
