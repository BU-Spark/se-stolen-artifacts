import { Box, Divider, Stack, Typography, Chip } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import InfoIcon from '@mui/icons-material/Info';
import CategoryIcon from '@mui/icons-material/Category';
import PersonIcon from '@mui/icons-material/Person';
import WarningIcon from '@mui/icons-material/Warning';
import { PendingImageMetadata } from './PendingImageCard.types';

type MetadataSectionProps = {
  metadata?: PendingImageMetadata;
};

function BooleanChip({ value, label }: { value?: boolean; label: string }) {
  // Only show chip if value is true
  if (value !== true) return null;

  return (
    <Chip
      label={label}
      icon={<CheckIcon sx={{ fontSize: 16 }} />}
      size="small"
      sx={{
        borderColor: 'success.main',
        bgcolor: 'rgba(46, 125, 50, 0.08)',
        color: 'success.dark',
        fontWeight: 500,
        '& .MuiChip-icon': {
          color: 'success.main',
        },
      }}
      variant="outlined"
    />
  );
}

function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
  if (!value) return null;

  return (
    <Box>
      <Typography variant="caption" color="text.secondary" display="block">
        {label}
      </Typography>
      <Typography variant="body2" color="text.primary">
        {value}
      </Typography>
    </Box>
  );
}

export default function MetadataSection({ metadata }: MetadataSectionProps) {
  if (!metadata) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
        No metadata available
      </Typography>
    );
  }

  return (
    <Stack spacing={3} sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
      {/* Basic Information */}
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
          <InfoIcon sx={{ fontSize: 18 }} />
          <Typography variant="subtitle2" fontWeight={600}>
            Basic Information
          </Typography>
        </Box>
        <Stack spacing={1.5} sx={{ mt: 1 }}>
          <InfoRow label="Title of Object" value={metadata.title_of_object} />
          <InfoRow label="Suspected Current Location" value={metadata.suspected_current_location} />
          <InfoRow label="Year of First Appearance" value={metadata.year_first_appearance} />
          <InfoRow
            label="Year of First Appearance Outside Cambodia"
            value={metadata.year_first_appearance_outside_cambodia}
          />
          <InfoRow label="Image Source" value={metadata.image_source} />
          <InfoRow label="Photograph Location" value={metadata.photograph_location} />
          <InfoRow label="Dealer/Gallery/Collector's Name" value={metadata.dealer_gallery_collector_name} />
          <InfoRow label="Material Subject" value={metadata.material_subject} />
        </Stack>
      </Box>

      <Divider />

      {/* Physical Characteristics */}
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
          <CategoryIcon sx={{ fontSize: 18 }} />
          <Typography variant="subtitle2" fontWeight={600}>
            Physical Characteristics
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
          <BooleanChip value={metadata.repatriated} label="Repatriated" />
          <BooleanChip value={metadata.multiple_heads} label="Multiple Heads" />
          <BooleanChip value={metadata.four_arms} label="Four Arms" />
          <BooleanChip value={metadata.eight_arms} label="Eight Arms" />
          <BooleanChip value={metadata.ten_arms} label="Ten Arms" />
          <BooleanChip value={metadata.over_ten_arms} label="Over Ten Arms" />
          <BooleanChip value={metadata.fragmentary} label="Fragmentary" />
          <BooleanChip value={metadata.fragments_from_multiple_statues} label="Multiple Statue Fragments" />
        </Box>
      </Box>

      <Divider />

      {/* Body Parts Present */}
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
          <PersonIcon sx={{ fontSize: 18 }} />
          <Typography variant="subtitle2" fontWeight={600}>
            Body Parts Present
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
          <BooleanChip value={metadata.head_present} label="Head" />
          <BooleanChip value={metadata.torso_present} label="Torso" />
          <BooleanChip value={metadata.shoulder_elbow_present} label="Shoulder-Elbow" />
          <BooleanChip value={metadata.elbow_wrist_present} label="Elbow-Wrist" />
          <BooleanChip value={metadata.hand_present} label="Hand" />
          <BooleanChip value={metadata.hip_knee_present} label="Hip-Knee" />
          <BooleanChip value={metadata.knee_ankle_present} label="Knee-Ankle" />
          <BooleanChip value={metadata.foot_present} label="Foot" />
          <BooleanChip value={metadata.base_present} label="Base" />
        </Box>
      </Box>

      <Divider />

      {/* Fragmentation Points */}
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
          <WarningIcon sx={{ fontSize: 18 }} />
          <Typography variant="subtitle2" fontWeight={600}>
            Fragmentation Points
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
          <BooleanChip value={metadata.fragmented_at_neck} label="At Neck" />
          <BooleanChip value={metadata.fragment_at_shoulder} label="At Shoulder" />
          <BooleanChip value={metadata.fragmented_at_elbow} label="At Elbow" />
          <BooleanChip value={metadata.fragmented_at_wrist} label="At Wrist" />
          <BooleanChip value={metadata.fragmented_upper_leg} label="Upper Leg" />
          <BooleanChip value={metadata.fragmented_at_knee} label="At Knee" />
          <BooleanChip value={metadata.fragmented_at_ankle} label="At Ankle" />
        </Box>
      </Box>
    </Stack>
  );
}
