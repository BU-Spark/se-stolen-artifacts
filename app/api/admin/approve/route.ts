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

    // Get the pending image from artifact_metadata_upload_log
    const { data: pendingImage, error: pendingError } = await supabase
      .from('artifact_metadata_upload_log')
      .select('internal_reference_number, gcs_path, image_id')
      .eq('internal_reference_number', imageId)
      .eq('status', 'pending_review')
      .single();

    if (pendingError || !pendingImage) {
      return NextResponse.json({ error: 'Pending image not found' }, { status: 404 });
    }

    // Verify the statue exists
    const { data: statue, error: statueError } = await supabase
      .from('statues')
      .select('statue_id')
      .eq('statue_id', statueId)
      .single();

    if (statueError || !statue) {
      return NextResponse.json({ error: 'Statue not found' }, { status: 404 });
    }

    // Construct the public URL for the image
    const storageBucket = 'spark';
    const imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${storageBucket}/${pendingImage.gcs_path}`;

    // Check if image already exists in images table
    const { data: existingImage } = await supabase
      .from('images')
      .select('internal_reference_number')
      .eq('internal_reference_number', imageId)
      .single();

    if (existingImage) {
      // Update existing image with gcs_path and statue_id
      const { error: updateError } = await supabase
        .from('images')
        .update({
          image_gcs: pendingImage.gcs_path,
          image_url: imageUrl,
          statue_id: statueId,
        })
        .eq('internal_reference_number', imageId);

      if (updateError) {
        console.error('Error updating image:', updateError);
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }
    } else {
      // Insert new image into images table
      const { error: insertError } = await supabase.from('images').insert({
        internal_reference_number: pendingImage.internal_reference_number,
        image_gcs: pendingImage.gcs_path,
        image_url: imageUrl,
        statue_id: statueId,
      });

      if (insertError) {
        console.error('Error inserting image:', insertError);
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }
    }

    // Update status in artifact_metadata_upload_log to 'admin_approved'
    const { error: statusError } = await supabase
      .from('artifact_metadata_upload_log')
      .update({ status: 'admin_approved' })
      .eq('internal_reference_number', imageId);

    if (statusError) {
      console.error('Error updating approval status:', statusError);
      return NextResponse.json({ error: statusError.message }, { status: 500 });
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
