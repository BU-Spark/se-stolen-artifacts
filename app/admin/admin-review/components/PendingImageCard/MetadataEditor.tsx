import { useState } from 'react';
import { Box, Button, TextField, FormControlLabel, Checkbox, Stack, Typography, Divider, Grid } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import { PendingImageMetadata } from './PendingImageCard.types';

type MetadataEditorProps = {
  metadata?: PendingImageMetadata;
  onSave: (metadata: PendingImageMetadata) => void;
  onCancel: () => void;
};

export default function MetadataEditor({ metadata, onSave, onCancel }: MetadataEditorProps) {
  const [formData, setFormData] = useState<PendingImageMetadata>(metadata || {});

  const handleTextChange = (field: keyof PendingImageMetadata) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      [field]: field.includes('year') ? (value ? parseInt(value, 10) : undefined) : value,
    }));
  };

  const handleCheckboxChange = (field: keyof PendingImageMetadata) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.checked }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
      <Stack spacing={3}>
        {/* Basic Information */}
        <Box>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            📦 Basic Information
          </Typography>
          <Stack spacing={2}>
            <TextField
              label="Title of Object"
              value={formData.title_of_object || ''}
              onChange={handleTextChange('title_of_object')}
              size="small"
              fullWidth
            />
            <TextField
              label="Suspected Current Location"
              value={formData.suspected_current_location || ''}
              onChange={handleTextChange('suspected_current_location')}
              size="small"
              fullWidth
            />
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <TextField
                  label="Year of First Appearance"
                  type="number"
                  value={formData.year_first_appearance || ''}
                  onChange={handleTextChange('year_first_appearance')}
                  size="small"
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  label="Year Outside Cambodia"
                  type="number"
                  value={formData.year_first_appearance_outside_cambodia || ''}
                  onChange={handleTextChange('year_first_appearance_outside_cambodia')}
                  size="small"
                  fullWidth
                />
              </Grid>
            </Grid>
            <TextField
              label="Image Source"
              value={formData.image_source || ''}
              onChange={handleTextChange('image_source')}
              size="small"
              fullWidth
            />
            <TextField
              label="Photograph Location"
              value={formData.photograph_location || ''}
              onChange={handleTextChange('photograph_location')}
              size="small"
              fullWidth
            />
            <TextField
              label="Dealer/Gallery/Collector's Name"
              value={formData.dealer_gallery_collector_name || ''}
              onChange={handleTextChange('dealer_gallery_collector_name')}
              size="small"
              fullWidth
            />
            <TextField
              label="Material Subject"
              value={formData.material_subject || ''}
              onChange={handleTextChange('material_subject')}
              size="small"
              fullWidth
            />
          </Stack>
        </Box>

        <Divider />

        {/* Physical Characteristics */}
        <Box>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            🗿 Physical Characteristics
          </Typography>
          <Grid container spacing={1}>
            <Grid size={{ xs: 6, sm: 4 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.repatriated || false}
                    onChange={handleCheckboxChange('repatriated')}
                    size="small"
                  />
                }
                label="Repatriated"
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 4 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.multiple_heads || false}
                    onChange={handleCheckboxChange('multiple_heads')}
                    size="small"
                  />
                }
                label="Multiple Heads"
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 4 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.four_arms || false}
                    onChange={handleCheckboxChange('four_arms')}
                    size="small"
                  />
                }
                label="Four Arms"
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 4 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.eight_arms || false}
                    onChange={handleCheckboxChange('eight_arms')}
                    size="small"
                  />
                }
                label="Eight Arms"
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 4 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.ten_arms || false}
                    onChange={handleCheckboxChange('ten_arms')}
                    size="small"
                  />
                }
                label="Ten Arms"
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 4 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.over_ten_arms || false}
                    onChange={handleCheckboxChange('over_ten_arms')}
                    size="small"
                  />
                }
                label="Over Ten Arms"
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 4 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.fragmentary || false}
                    onChange={handleCheckboxChange('fragmentary')}
                    size="small"
                  />
                }
                label="Fragmentary"
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 4 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.fragments_from_multiple_statues || false}
                    onChange={handleCheckboxChange('fragments_from_multiple_statues')}
                    size="small"
                  />
                }
                label="Multiple Statue Fragments"
              />
            </Grid>
          </Grid>
        </Box>

        <Divider />

        {/* Body Parts Present */}
        <Box>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            👤 Body Parts Present
          </Typography>
          <Grid container spacing={1}>
            <Grid size={{ xs: 6, sm: 4 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.head_present || false}
                    onChange={handleCheckboxChange('head_present')}
                    size="small"
                  />
                }
                label="Head"
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 4 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.torso_present || false}
                    onChange={handleCheckboxChange('torso_present')}
                    size="small"
                  />
                }
                label="Torso"
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 4 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.shoulder_elbow_present || false}
                    onChange={handleCheckboxChange('shoulder_elbow_present')}
                    size="small"
                  />
                }
                label="Shoulder-Elbow"
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 4 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.elbow_wrist_present || false}
                    onChange={handleCheckboxChange('elbow_wrist_present')}
                    size="small"
                  />
                }
                label="Elbow-Wrist"
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 4 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.hand_present || false}
                    onChange={handleCheckboxChange('hand_present')}
                    size="small"
                  />
                }
                label="Hand"
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 4 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.hip_knee_present || false}
                    onChange={handleCheckboxChange('hip_knee_present')}
                    size="small"
                  />
                }
                label="Hip-Knee"
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 4 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.knee_ankle_present || false}
                    onChange={handleCheckboxChange('knee_ankle_present')}
                    size="small"
                  />
                }
                label="Knee-Ankle"
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 4 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.foot_present || false}
                    onChange={handleCheckboxChange('foot_present')}
                    size="small"
                  />
                }
                label="Foot"
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 4 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.base_present || false}
                    onChange={handleCheckboxChange('base_present')}
                    size="small"
                  />
                }
                label="Base"
              />
            </Grid>
          </Grid>
        </Box>

        <Divider />

        {/* Fragmentation Points */}
        <Box>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            ⚠️ Fragmentation Points
          </Typography>
          <Grid container spacing={1}>
            <Grid size={{ xs: 6, sm: 4 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.fragmented_at_neck || false}
                    onChange={handleCheckboxChange('fragmented_at_neck')}
                    size="small"
                  />
                }
                label="At Neck"
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 4 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.fragment_at_shoulder || false}
                    onChange={handleCheckboxChange('fragment_at_shoulder')}
                    size="small"
                  />
                }
                label="At Shoulder"
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 4 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.fragmented_at_elbow || false}
                    onChange={handleCheckboxChange('fragmented_at_elbow')}
                    size="small"
                  />
                }
                label="At Elbow"
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 4 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.fragmented_at_wrist || false}
                    onChange={handleCheckboxChange('fragmented_at_wrist')}
                    size="small"
                  />
                }
                label="At Wrist"
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 4 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.fragmented_upper_leg || false}
                    onChange={handleCheckboxChange('fragmented_upper_leg')}
                    size="small"
                  />
                }
                label="Upper Leg"
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 4 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.fragmented_at_knee || false}
                    onChange={handleCheckboxChange('fragmented_at_knee')}
                    size="small"
                  />
                }
                label="At Knee"
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 4 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.fragmented_at_ankle || false}
                    onChange={handleCheckboxChange('fragmented_at_ankle')}
                    size="small"
                  />
                }
                label="At Ankle"
              />
            </Grid>
          </Grid>
        </Box>

        {/* Action Buttons */}
        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button onClick={onCancel} startIcon={<CancelIcon />} variant="outlined">
            Cancel
          </Button>
          <Button type="submit" startIcon={<SaveIcon />} variant="contained" color="primary">
            Save Changes
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
