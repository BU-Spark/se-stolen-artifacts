import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function handleGetPendingImages() {
  try {
    const { data: approvals, error: approvalError } = await supabase
      .from('approval')
      .select('image_id')
      .eq('status', 'pending_review');

    if (approvalError) return { images: [], error: approvalError.message };

    const imageIds = approvals.map((a) => a.image_id);

    const { data: images, error: imageError } = await supabase
      .from('images')
      .select('*')
      .in('internal_reference_number', imageIds);

    if (imageError) return { images: [], error: imageError.message };

    return { images };
  } catch (error: unknown) {
    return { images: [], error: error.message };
  }
}
