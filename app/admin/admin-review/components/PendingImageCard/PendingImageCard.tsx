'use client';

import { useState, useRef } from 'react';
import { Box, Button, Card, CardActions, CardContent, CardMedia, Stack, Typography, Collapse } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { PendingImage, MetadataViewMode } from './PendingImageCard.types';
import MetadataSection from './MetadataSection';
import ApprovalDrawer from '../ApprovalDrawer';

type PendingImageCardProps = {
  image: PendingImage;
  downloadInFlight: boolean;
  onDownload: (imageId: string) => void;
  onSaveMetadata: (imageId: string, metadata: PendingImage['metadata']) => void;
  onApprove: (imageId: string, folderId: string, metadata: PendingImage['metadata']) => void;
  onAddToNew: (imageId: string, metadata: PendingImage['metadata']) => void;
  onDeny: (imageId: string) => void;
};

export default function PendingImageCard({
  image,
  downloadInFlight,
  onDownload,
  onSaveMetadata,
  onApprove,
  onAddToNew,
  onDeny,
}: PendingImageCardProps) {
  const [viewMode, setViewMode] = useState<MetadataViewMode>('collapsed');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const { internal_reference_number, image_url, title, description, metadata } = image;

  const handleToggleMetadata = () => {
    setViewMode((prev) => (prev === 'collapsed' ? 'viewing' : 'collapsed'));
  };

  const handleApproveClick = () => {
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
  };

  const handleSaveMetadata = (imageId: string, metadata: PendingImage['metadata']) => {
    onSaveMetadata(imageId, metadata);
  };

  const handleApprove = (imageId: string, folderId: string, metadata: PendingImage['metadata']) => {
    onApprove(imageId, folderId, metadata);
    setDrawerOpen(false);
  };

  const handleAddToNew = (imageId: string, metadata: PendingImage['metadata']) => {
    onAddToNew(imageId, metadata);
    setDrawerOpen(false);
  };

  return (
    <>
      <Card ref={cardRef} sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
        <CardMedia
          component="img"
          image={image_url || '/image-404-placeholder.avif'}
          alt={title || `Pending image ${internal_reference_number}`}
          sx={{ height: 280, objectFit: 'cover' }}
          loading="lazy"
        />

        <CardContent sx={{ flexGrow: 1 }}>
          <Stack spacing={1}>
            <Typography variant="h6" color="text.primary">
              {title || `Image ${internal_reference_number}`}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Reference ID: {internal_reference_number}
            </Typography>
            {description && (
              <Typography variant="body2" color="text.secondary">
                {description}
              </Typography>
            )}
          </Stack>

          {/* Expandable Metadata Section */}
          <Box sx={{ mt: 2 }}>
            <Button
              onClick={handleToggleMetadata}
              endIcon={viewMode === 'collapsed' ? <ExpandMoreIcon /> : <ExpandLessIcon />}
              variant="outlined"
              fullWidth
              size="small"
            >
              {viewMode === 'collapsed' ? 'Show Metadata' : 'Hide Metadata'}
            </Button>

            <Collapse in={viewMode !== 'collapsed'} timeout="auto">
              <Box sx={{ mt: 2 }}>
                <MetadataSection metadata={metadata} />
              </Box>
            </Collapse>
          </Box>
        </CardContent>

        <CardActions sx={{ px: 3, pb: 3 }}>
          <Button variant="contained" color="success" startIcon={<CheckCircleIcon />} onClick={handleApproveClick}>
            Approve
          </Button>
          <Button
            variant="contained"
            color="error"
            startIcon={<CancelIcon />}
            onClick={() => onDeny(internal_reference_number)}
          >
            Deny
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<DownloadIcon />}
            onClick={() => onDownload(internal_reference_number)}
            disabled={downloadInFlight}
          >
            {downloadInFlight ? 'Downloading...' : 'Download'}
          </Button>
        </CardActions>
      </Card>

      {/* Approval Drawer */}
      <ApprovalDrawer
        open={drawerOpen}
        imageId={internal_reference_number}
        imageUrl={image_url ?? null}
        imageTitle={title || `Image ${internal_reference_number}`}
        metadata={metadata}
        onClose={handleDrawerClose}
        onSaveMetadata={handleSaveMetadata}
        onApprove={handleApprove}
        onAddToNew={handleAddToNew}
      />
    </>
  );
}
