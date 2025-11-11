import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { imageId, folderId } = await request.json();

    if (!imageId) {
      return NextResponse.json({ error: 'imageId is required' }, { status: 400 });
    }

    if (!folderId) {
      return NextResponse.json({ error: 'folderId (statue_id) is required' }, { status: 400 });
    }

    // Convert folderId (string) to statue_id (integer)
    const statueId = parseInt(folderId, 10);
    if (isNaN(statueId)) {
      return NextResponse.json({ error: 'Invalid folderId' }, { status: 400 });
    }

    // Verify the image exists
    const { data: image, error: imageError } = await supabase
      .from('images')
      .select('*')
      .eq('internal_reference_number', imageId)
      .single();

    if (imageError || !image) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    // Verify the statue exists (optional but good practice)
    const { data: statue, error: statueError } = await supabase
      .from('statues')
      .select('statue_id')
      .eq('statue_id', statueId)
      .single();

    if (statueError || !statue) {
      return NextResponse.json({ error: 'Statue not found' }, { status: 404 });
    }

    // Update approval status to 'admin_approved'
    const { error: approvalError } = await supabase
      .from('approval')
      .update({ status: 'admin_approved' })
      .eq('image_id', imageId);

    if (approvalError) {
      console.error('Error updating approval status:', approvalError);
      return NextResponse.json({ error: approvalError.message }, { status: 500 });
    }

    // Update the image's statue_id to assign it to the correct folder
    const { error: updateError } = await supabase
      .from('images')
      .update({ statue_id: statueId })
      .eq('internal_reference_number', imageId);

    if (updateError) {
      console.error('Error updating image statue_id:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Image approved and assigned to statue',
      statueId,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('Error in approve endpoint:', errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
