'use client';

import { Box, TextField, FormControlLabel, Checkbox, Grid, Divider, Typography, Stack } from '@mui/material';
import type { BasicSearchMetadata, AdvancedSearchMetadata } from '@/app/types/metadata.types';

type ManualMetadataFormProps = {
  manualBasic: Partial<BasicSearchMetadata>;
  setManualBasic: React.Dispatch<React.SetStateAction<Partial<BasicSearchMetadata>>>;
  manualAdvanced: Partial<AdvancedSearchMetadata>;
  setManualAdvanced: React.Dispatch<React.SetStateAction<Partial<AdvancedSearchMetadata>>>;
};

export default function ManualMetadataForm({
  manualBasic,
  setManualBasic,
  manualAdvanced,
  setManualAdvanced,
}: ManualMetadataFormProps) {
  return (
    <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 2 }}>
      <Typography variant="subtitle2" fontWeight={600} gutterBottom>
        Basic metadata
      </Typography>
      <Stack spacing={2}>
        <TextField
          label="Subject"
          value={manualBasic.subject}
          onChange={(e) => setManualBasic((s) => ({ ...s, subject: e.target.value }))}
          size="small"
          fullWidth
        />
        <TextField
          label="Dealer / Gallery / Collector"
          value={manualBasic.dealerName}
          onChange={(e) => setManualBasic((s) => ({ ...s, dealerName: e.target.value }))}
          size="small"
          fullWidth
        />
        <TextField
          label="Suspected Current Location"
          value={manualBasic.suspectedCurrentLocation}
          onChange={(e) => setManualBasic((s) => ({ ...s, suspectedCurrentLocation: e.target.value }))}
          size="small"
          fullWidth
        />
        <Grid container spacing={2}>
          <Grid size={{ xs: 6 }}>
            <TextField
              label="Year of First Appearance"
              type="number"
              value={manualBasic.firstAppearanceYear || ''}
              onChange={(e) =>
                setManualBasic((s) => ({
                  ...s,
                  firstAppearanceYear: e.target.value ? parseInt(e.target.value, 10) : undefined,
                }))
              }
              size="small"
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <TextField
              label="Year First Appearance Outside Cambodia"
              type="number"
              value={manualBasic.firstAppearanceYearOutsideCambodia || ''}
              onChange={(e) =>
                setManualBasic((s) => ({
                  ...s,
                  firstAppearanceYearOutsideCambodia: e.target.value ? parseInt(e.target.value, 10) : undefined,
                }))
              }
              size="small"
              fullWidth
            />
          </Grid>
        </Grid>
        <FormControlLabel
          control={
            <Checkbox
              checked={!!manualBasic.repatriated}
              onChange={(e) => setManualBasic((s) => ({ ...s, repatriated: e.target.checked }))}
              size="small"
            />
          }
          label="Repatriated"
        />

        <Divider />

        <Typography variant="subtitle2" fontWeight={600} gutterBottom>
          Advanced metadata
        </Typography>
        <TextField
          label="Image Source"
          value={manualAdvanced.imageSource}
          onChange={(e) => setManualAdvanced((s) => ({ ...s, imageSource: e.target.value }))}
          size="small"
          fullWidth
        />
        <TextField
          label="Material"
          value={manualAdvanced.material}
          onChange={(e) => setManualAdvanced((s) => ({ ...s, material: e.target.value }))}
          size="small"
          fullWidth
        />
        {/* Advanced boolean fields grouped similarly to admin form */}
        <Typography variant="subtitle2" fontWeight={600} gutterBottom>
          Physical characteristics
        </Typography>
        <Grid container spacing={1} sx={{ mb: 1 }}>
          <Grid size={{ xs: 6, sm: 4 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={!!manualAdvanced.hasInscription}
                  onChange={(e) => setManualAdvanced((s) => ({ ...s, hasInscription: e.target.checked }))}
                  size="small"
                />
              }
              label="Has inscription"
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 4 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={!!manualAdvanced.multipleHeads}
                  onChange={(e) => setManualAdvanced((s) => ({ ...s, multipleHeads: e.target.checked }))}
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
                  checked={!!manualAdvanced.fourArms}
                  onChange={(e) => setManualAdvanced((s) => ({ ...s, fourArms: e.target.checked }))}
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
                  checked={!!manualAdvanced.eightArms}
                  onChange={(e) => setManualAdvanced((s) => ({ ...s, eightArms: e.target.checked }))}
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
                  checked={!!manualAdvanced.tenArms}
                  onChange={(e) => setManualAdvanced((s) => ({ ...s, tenArms: e.target.checked }))}
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
                  checked={!!manualAdvanced.overTenArms}
                  onChange={(e) => setManualAdvanced((s) => ({ ...s, overTenArms: e.target.checked }))}
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
                  checked={!!manualAdvanced.fragmentary}
                  onChange={(e) => setManualAdvanced((s) => ({ ...s, fragmentary: e.target.checked }))}
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
                  checked={!!manualAdvanced.fragmentsFromMultipleStatues}
                  onChange={(e) => setManualAdvanced((s) => ({ ...s, fragmentsFromMultipleStatues: e.target.checked }))}
                  size="small"
                />
              }
              label="Multiple Statue Fragments"
            />
          </Grid>
        </Grid>

        <Divider />

        <Typography variant="subtitle2" fontWeight={600} gutterBottom>
          Body Parts Present
        </Typography>
        <Grid container spacing={1} sx={{ mb: 1 }}>
          <Grid size={{ xs: 6, sm: 4 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={!!manualAdvanced.headPresent}
                  onChange={(e) => setManualAdvanced((s) => ({ ...s, headPresent: e.target.checked }))}
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
                  checked={!!manualAdvanced.torsoPresent}
                  onChange={(e) => setManualAdvanced((s) => ({ ...s, torsoPresent: e.target.checked }))}
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
                  checked={!!manualAdvanced.shoulderElbowPresent}
                  onChange={(e) => setManualAdvanced((s) => ({ ...s, shoulderElbowPresent: e.target.checked }))}
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
                  checked={!!manualAdvanced.elbowWristPresent}
                  onChange={(e) => setManualAdvanced((s) => ({ ...s, elbowWristPresent: e.target.checked }))}
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
                  checked={!!manualAdvanced.hipKneePresent}
                  onChange={(e) => setManualAdvanced((s) => ({ ...s, hipKneePresent: e.target.checked }))}
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
                  checked={!!manualAdvanced.kneeAnklePresent}
                  onChange={(e) => setManualAdvanced((s) => ({ ...s, kneeAnklePresent: e.target.checked }))}
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
                  checked={!!manualAdvanced.footPresent}
                  onChange={(e) => setManualAdvanced((s) => ({ ...s, footPresent: e.target.checked }))}
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
                  checked={!!manualAdvanced.basePresent}
                  onChange={(e) => setManualAdvanced((s) => ({ ...s, basePresent: e.target.checked }))}
                  size="small"
                />
              }
              label="Base"
            />
          </Grid>
        </Grid>

        <Divider />

        <Typography variant="subtitle2" fontWeight={600} gutterBottom>
          Fragmentation Points
        </Typography>
        <Grid container spacing={1} sx={{ mb: 1 }}>
          <Grid size={{ xs: 6, sm: 4 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={!!manualAdvanced.fragmentedAtNeck}
                  onChange={(e) => setManualAdvanced((s) => ({ ...s, fragmentedAtNeck: e.target.checked }))}
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
                  checked={!!manualAdvanced.fragmentedAtShoulder}
                  onChange={(e) => setManualAdvanced((s) => ({ ...s, fragmentedAtShoulder: e.target.checked }))}
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
                  checked={!!manualAdvanced.fragmentedAtElbow}
                  onChange={(e) => setManualAdvanced((s) => ({ ...s, fragmentedAtElbow: e.target.checked }))}
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
                  checked={!!manualAdvanced.fragmentedAtWrist}
                  onChange={(e) => setManualAdvanced((s) => ({ ...s, fragmentedAtWrist: e.target.checked }))}
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
                  checked={!!manualAdvanced.fragmentedAtUpperLeg}
                  onChange={(e) => setManualAdvanced((s) => ({ ...s, fragmentedAtUpperLeg: e.target.checked }))}
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
                  checked={!!manualAdvanced.fragmentedAtKnee}
                  onChange={(e) => setManualAdvanced((s) => ({ ...s, fragmentedAtKnee: e.target.checked }))}
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
                  checked={!!manualAdvanced.fragmentedAtAnkle}
                  onChange={(e) => setManualAdvanced((s) => ({ ...s, fragmentedAtAnkle: e.target.checked }))}
                  size="small"
                />
              }
              label="At Ankle"
            />
          </Grid>
        </Grid>
      </Stack>
    </Box>
  );
}
