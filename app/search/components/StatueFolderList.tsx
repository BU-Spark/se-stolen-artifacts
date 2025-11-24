'use client';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Box, Collapse, Divider, IconButton, Stack, Typography } from '@mui/material';
import { useState } from 'react';

type StatueFolder = {
  id: string;
  name: string;
  imageCount: number;
  images: Array<{ id: string; label: string; description: string }>;
};

const sampleFolders: StatueFolder[] = [
  {
    id: '1',
    name: 'Standing Vishnu (Angkor Thom North Gate)',
    imageCount: 4,
    images: [
      { id: '1-1', label: 'Front elevation', description: 'Captured during 2014 conservation survey' },
      { id: '1-2', label: 'Right profile', description: 'Shows arm break at elbow and surface wear' },
      { id: '1-3', label: 'Torso detail', description: 'Focus on costume patterning and ornamentation' },
      { id: '1-4', label: 'Rear view', description: 'Documents rear costume detailing' },
    ],
  },
  {
    id: '2',
    name: 'Bodhisattva Avalokiteshvara Fragment',
    imageCount: 3,
    images: [
      { id: '2-1', label: 'Catalog image', description: 'Primary catalog photography from accession record' },
      { id: '2-2', label: 'Head close-up', description: 'Highlights gilding remnants and facial features' },
      { id: '2-3', label: 'Side profile', description: 'Shows arm positioning and ornament detail' },
    ],
  },
  {
    id: '3',
    name: 'Kneeling Guardian Statue',
    imageCount: 5,
    images: [
      { id: '3-1', label: 'Pre-restoration', description: 'Photographed prior to 1998 conservation efforts' },
      { id: '3-2', label: 'Post-restoration', description: 'Shows stabilization and infill of missing sections' },
      { id: '3-3', label: 'Hands detail', description: 'Documents missing fingers and repair material' },
      { id: '3-4', label: 'Left profile', description: 'Illustrates surface erosion patterns' },
      { id: '3-5', label: 'Base detail', description: 'Shows mounting and original pedestal fragments' },
    ],
  },
  {
    id: '4',
    name: 'Bayon Temple Lokeshvara (Heads assemblage)',
    imageCount: 3,
    images: [
      { id: '4-1', label: 'Mounted head fragment', description: 'Documented during 2006 restoration efforts' },
      { id: '4-2', label: 'Left profile', description: 'Shows repair seams along jawline' },
      { id: '4-3', label: 'Crown detail', description: 'Highlights lotus motif incisions' },
    ],
  },
  {
    id: '5',
    name: 'Banteay Srei Devata Relief',
    imageCount: 2,
    images: [
      { id: '5-1', label: 'Panel overview', description: 'Photographed pre-excavation in 1916' },
      { id: '5-2', label: 'Ornament detail', description: 'Close-up of floral detailing along frame' },
    ],
  },
  {
    id: '6',
    name: 'Koh Ker Garuda Fragment',
    imageCount: 4,
    images: [
      { id: '6-1', label: 'Wing fragment', description: 'Primary catalog image showing break at shoulder' },
      { id: '6-2', label: 'Feather detail', description: 'Captures surviving incised feather patterns' },
      { id: '6-3', label: 'Archaeological context', description: 'Site photo illustrating original placement' },
      { id: '6-4', label: 'Reverse view', description: 'Shows mounting holes and attachment points' },
    ],
  },
  {
    id: '7',
    name: 'Phnom Bakheng Buddha Torso',
    imageCount: 3,
    images: [
      { id: '7-1', label: 'Seated torso', description: 'Studio photograph highlighting surface loss' },
      { id: '7-2', label: 'Side profile', description: 'Illustrates missing arms and lap details' },
      { id: '7-3', label: 'Chest detail', description: 'Shows garment folds and remaining ornament' },
    ],
  },
  {
    id: '8',
    name: 'Ta Prohm Apsara Torso',
    imageCount: 2,
    images: [
      { id: '8-1', label: 'Frontal view', description: 'Documents upper body and costume detail' },
      { id: '8-2', label: 'Side elevation', description: 'Shows hip contour and garment draping' },
    ],
  },
];

export default function StatueFolderList() {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <Stack sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Stack spacing={0} sx={{ flexShrink: 0, pb: 2 }}>
        <Stack spacing={0.5} sx={{ mb: 2 }}>
          <Typography component="h1" variant="h4" fontWeight={600}>
            Potential Matches
          </Typography>
          <Typography color="text.secondary" variant="body2">
            Click on statue folders to expand and view their associated images.
          </Typography>
        </Stack>
        <Divider />
      </Stack>
      <Box sx={{ flex: 1, overflow: 'auto', minHeight: 0, pr: 1 }}>
        <Stack spacing={2} sx={{ pb: 2 }}>
          {sampleFolders.map((folder) => (
            <Box
              key={folder.id}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                overflow: 'hidden',
                bgcolor: 'background.paper',
                flexShrink: 0,
              }}
            >
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                onClick={() => setExpanded(expanded === folder.id ? null : folder.id)}
                sx={{
                  p: 2,
                  cursor: 'pointer',
                  '&:hover': { bgcolor: expanded === folder.id ? 'transparent' : 'action.hover' },
                  gap: 2,
                }}
              >
                <Stack spacing={0.5} sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {folder.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {folder.imageCount} {folder.imageCount === 1 ? 'image' : 'images'}
                  </Typography>
                </Stack>
                <Box
                  sx={{
                    width: 120,
                    height: 150,
                    flexShrink: 0,
                    bgcolor: 'grey.100',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.625rem',
                    fontWeight: 600,
                    color: 'text.secondary',
                    textAlign: 'center',
                    p: 0.5,
                  }}
                >
                  {folder.images[0].label.toUpperCase()}
                </Box>
                <IconButton
                  size="small"
                  sx={{ transform: expanded === folder.id ? 'rotate(180deg)' : 'none', transition: '0.2s' }}
                >
                  <ExpandMoreIcon />
                </IconButton>
              </Stack>

              <Collapse in={expanded === folder.id}>
                <Box
                  sx={{
                    p: 2,
                    pt: 0,
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: 2,
                    minHeight: 400,
                  }}
                >
                  {folder.images.map((image) => (
                    <Box
                      key={image.id}
                      sx={{
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        p: 1.5,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1,
                      }}
                    >
                      <Box
                        sx={{
                          aspectRatio: '4/5',
                          bgcolor: 'grey.100',
                          border: '1px dashed',
                          borderColor: 'divider',
                          borderRadius: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          color: 'text.secondary',
                          textAlign: 'center',
                          p: 1,
                        }}
                      >
                        {image.label.toUpperCase()}
                      </Box>
                      <Typography variant="body2" fontWeight={600}>
                        {image.label}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {image.description}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Collapse>
            </Box>
          ))}
        </Stack>
      </Box>
    </Stack>
  );
}
