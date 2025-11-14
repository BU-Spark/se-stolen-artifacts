'use client';

import { useState, useRef } from 'react';
import { Box, Button, Card, CardActions, CardContent, CardMedia, Stack, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { PendingImage } from './PendingImageCard.types';
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
  onSaveMetadata,
  onApprove,
  onAddToNew,
  onDeny,
}: PendingImageCardProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null | undefined>(undefined);
  const [selectedFolderName, setSelectedFolderName] = useState<string | null | undefined>(undefined);
  const cardRef = useRef<HTMLDivElement>(null);
  const { internal_reference_number, image_url, title, description, metadata } = image;

  const handleEditMetadataClick = () => {
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

  const handleFolderSelected = (folderId: string | null, folderName?: string | null) => {
    setSelectedFolderId(folderId);
    setSelectedFolderName(folderName || (folderId === null ? null : undefined));
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

          {/* Edit Metadata Button */}
          <Box sx={{ mt: 2 }}>
            <Button onClick={handleEditMetadataClick} variant="outlined" fullWidth size="small">
              Edit Metadata
            </Button>
          </Box>
        </CardContent>

        <CardActions sx={{ px: 3, pb: 3 }}>
          <Button
            variant="contained"
            color="success"
            startIcon={<CheckCircleIcon />}
            onClick={() => {
              // If a folder is selected, approve to that folder; otherwise create new folder
              if (selectedFolderId && typeof selectedFolderId === 'string') {
                onApprove(internal_reference_number, selectedFolderId, metadata || {});
              } else {
                onAddToNew(internal_reference_number, metadata || {});
              }
            }}
            sx={{ whiteSpace: 'nowrap' }}
          >
            Approve
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<CancelIcon />}
            onClick={() => onDeny(internal_reference_number)}
            sx={{ whiteSpace: 'nowrap' }}
          >
            Deny
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
        selectedFolderId={selectedFolderId}
        selectedFolderName={selectedFolderName}
        onClose={handleDrawerClose}
        onSaveMetadata={handleSaveMetadata}
        onApprove={handleApprove}
        onAddToNew={handleAddToNew}
        onFolderSelected={handleFolderSelected}
      />
    </>
  );
}
