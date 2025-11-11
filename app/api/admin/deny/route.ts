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
    const { error } = await supabase.from('approval').update({ status: 'admin_rejected' }).eq('image_id', imageId);

    if (error) {
      console.error('Error updating approval status:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Image rejected' });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('Error in deny endpoint:', errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
