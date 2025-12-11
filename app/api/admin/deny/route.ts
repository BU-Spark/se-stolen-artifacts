import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db/supabase';

const TEMP_TABLE = 'temp_artifact_metadata';

export async function POST(request: NextRequest) {
  try {
    const { imageId } = await request.json();

    if (!imageId) {
      return NextResponse.json({ error: 'imageId is required' }, { status: 400 });
    }

    const attemptStatusUpdate = (column: 'image_id' | 'internal_reference_number') =>
      supabase
        .from(TEMP_TABLE)
        .update({ status: 'admin_rejected' })
        .eq(column, imageId)
        .select('image_id, internal_reference_number');

    let { data, error } = await attemptStatusUpdate('image_id');

    if (error) {
      console.error('Error updating approval status by image_id:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data || data.length === 0) {
      ({ data, error } = await attemptStatusUpdate('internal_reference_number'));

      if (error) {
        console.error('Error updating approval status by internal_reference_number:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    if (!data || data.length === 0) {
      console.warn('Deny endpoint could not find a pending image for identifier:', imageId);
      return NextResponse.json(
        { success: false, message: `No pending image found for identifier ${imageId}` },
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
