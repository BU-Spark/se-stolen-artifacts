CREATE OR REPLACE FUNCTION handle_new_image_upload(
  image_url_input TEXT,
  image_gcs_input TEXT
)
RETURNS TEXT 
AS $$
DECLARE
  new_internal_ref_id TEXT;
  next_statue_id INTEGER;
  next_approval_id INTEGER;
BEGIN
  SELECT gen_random_uuid() INTO new_internal_ref_id;
  SELECT COALESCE(MAX(statue_id), 0) + 1 INTO next_statue_id FROM statues;
  SELECT COALESCE(MAX(approval_id), 0) + 1 INTO next_approval_id FROM approval;

  -- Insert the new statue row
  INSERT INTO statues (statue_id)
  VALUES (next_statue_id);

  INSERT INTO images (
    internal_reference_number,
    image_url,
    image_gcs,
    statue_id
  )
  VALUES (
    new_internal_ref_id,
    image_url_input,
    image_gcs_input,
    next_statue_id
  );

  INSERT INTO approval (
    image_id,
    status,
    admin_id,
    approval_id
  )
  VALUES (
    new_internal_ref_id, 
    'pending_review',        
    'cacf0e78-f815-4a47-abed-179aa74c40eb',
    next_approval_id
  );

  RETURN new_internal_ref_id;
END;
$$ LANGUAGE plpgsql;