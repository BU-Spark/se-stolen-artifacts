-- Migration: Add hand_present column to artifact_metadata_upload_log table
-- This adds support for tracking whether a hand is present on the artifact

-- Add the column if it doesn't exist
ALTER TABLE artifact_metadata_upload_log
ADD COLUMN IF NOT EXISTS hand_present BOOLEAN DEFAULT FALSE;

-- Update the insert function to include hand_present
CREATE OR REPLACE FUNCTION insert_llm_artifact_metadata_withGCS(
	image_id_input TEXT,
    gcs_path_input TEXT,
    internal_reference_number_input TEXT,
	basic_search_metadata_input JSONB,
	advanced_search_metadata_input JSONB,
    short_description_input TEXT,
    long_description_input TEXT,
    ai_generated_input BOOLEAN
)
RETURNS UUID AS $$
DECLARE
	new_id UUID := gen_random_uuid();
BEGIN
	INSERT INTO artifact_metadata_upload_log (
		id,
		image_id,
        gcs_path,
        internal_reference_number,
		subject,
		dealer_name,
		suspected_current_location,
		artifact_title,
		photograph_location,
		first_appearance_year,
		first_appearance_year_outside_cambodia,
		repatriated,
		image_source,
		material,
		has_inscription,
		multiple_heads,
		four_arms,
		eight_arms,
		ten_arms,
		over_ten_arms,
		fragmentary,
		fragments_from_multiple_statues,
		head_present,
		torso_present,
		shoulder_elbow_present,
		elbow_wrist_present,
		hand_present,
		hip_knee_present,
		knee_ankle_present,
		foot_present,
		base_present,
		fragmented_at_neck,
		fragmented_at_shoulder,
		fragmented_at_elbow,
		fragmented_at_wrist,
		fragmented_at_upper_leg,
		fragmented_at_knee,
		fragmented_at_ankle,
        short_description,
        long_description,
        ai_generated,
		created_at
	) VALUES (
		new_id,
		image_id_input,
        gcs_path_input,
        internal_reference_number_input,
		basic_search_metadata_input->>'subject',
		basic_search_metadata_input->>'dealerName',
		basic_search_metadata_input->>'suspectedCurrentLocation',
		basic_search_metadata_input->>'artifactTitle',
		basic_search_metadata_input->>'photographLocation',
		(basic_search_metadata_input->>'firstAppearanceYear')::INTEGER,
		(basic_search_metadata_input->>'firstAppearanceYearOutsideCambodia')::INTEGER,
		COALESCE((basic_search_metadata_input->>'repatriated')::BOOLEAN, FALSE),
		advanced_search_metadata_input->>'imageSource',
		advanced_search_metadata_input->>'material',
		COALESCE((advanced_search_metadata_input->>'hasInscription')::BOOLEAN, FALSE),
		COALESCE((advanced_search_metadata_input->>'multipleHeads')::BOOLEAN, FALSE),
		COALESCE((advanced_search_metadata_input->>'fourArms')::BOOLEAN, FALSE),
		COALESCE((advanced_search_metadata_input->>'eightArms')::BOOLEAN, FALSE),
		COALESCE((advanced_search_metadata_input->>'tenArms')::BOOLEAN, FALSE),
		COALESCE((advanced_search_metadata_input->>'overTenArms')::BOOLEAN, FALSE),
		COALESCE((advanced_search_metadata_input->>'fragmentary')::BOOLEAN, FALSE),
		COALESCE((advanced_search_metadata_input->>'fragmentsFromMultipleStatues')::BOOLEAN, FALSE),
		COALESCE((advanced_search_metadata_input->>'headPresent')::BOOLEAN, FALSE),
		COALESCE((advanced_search_metadata_input->>'torsoPresent')::BOOLEAN, FALSE),
		COALESCE((advanced_search_metadata_input->>'shoulderElbowPresent')::BOOLEAN, FALSE),
		COALESCE((advanced_search_metadata_input->>'elbowWristPresent')::BOOLEAN, FALSE),
		COALESCE((advanced_search_metadata_input->>'handPresent')::BOOLEAN, FALSE),
		COALESCE((advanced_search_metadata_input->>'hipKneePresent')::BOOLEAN, FALSE),
		COALESCE((advanced_search_metadata_input->>'kneeAnklePresent')::BOOLEAN, FALSE),
		COALESCE((advanced_search_metadata_input->>'footPresent')::BOOLEAN, FALSE),
		COALESCE((advanced_search_metadata_input->>'basePresent')::BOOLEAN, FALSE),
		COALESCE((advanced_search_metadata_input->>'fragmentedAtNeck')::BOOLEAN, FALSE),
		COALESCE((advanced_search_metadata_input->>'fragmentedAtShoulder')::BOOLEAN, FALSE),
		COALESCE((advanced_search_metadata_input->>'fragmentedAtElbow')::BOOLEAN, FALSE),
		COALESCE((advanced_search_metadata_input->>'fragmentedAtWrist')::BOOLEAN, FALSE),
		COALESCE((advanced_search_metadata_input->>'fragmentedAtUpperLeg')::BOOLEAN, FALSE),
		COALESCE((advanced_search_metadata_input->>'fragmentedAtKnee')::BOOLEAN, FALSE),
		COALESCE((advanced_search_metadata_input->>'fragmentedAtAnkle')::BOOLEAN, FALSE),
        short_description_input,
        long_description_input,
        ai_generated_input,
		NOW()
	);
	RETURN new_id;
END;
$$ LANGUAGE plpgsql;

