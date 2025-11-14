'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Stack,
  Typography,
  Dialog,
  IconButton,
  Toolbar,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import FitScreenIcon from '@mui/icons-material/FitScreen';
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
  downloadInFlight,
  onDownload,
  onSaveMetadata,
  onApprove,
  onAddToNew,
  onDeny,
}: PendingImageCardProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null | undefined>(undefined);
  const [selectedFolderName, setSelectedFolderName] = useState<string | null | undefined>(undefined);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const { internal_reference_number, image_url, title, description, short_description, ai_generated, metadata } = image;

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

  // Image viewer handlers
  const handleImageViewerOpen = () => {
    setImageViewerOpen(true);
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
  };

  const handleImageViewerClose = () => {
    setImageViewerOpen(false);
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.25, 5));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.25, 0.5));
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
  };

  const handleDownload = () => {
    onDownload(internal_reference_number);
  };

  // Pan/drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - panPosition.x,
        y: e.clientY - panPosition.y,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoomLevel > 1) {
      setPanPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Keyboard shortcuts
  useEffect(() => {
    if (!imageViewerOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleImageViewerClose();
      } else if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        handleZoomIn();
      } else if (e.key === '-') {
        e.preventDefault();
        handleZoomOut();
      } else if (e.key === '0') {
        e.preventDefault();
        handleResetZoom();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [imageViewerOpen]);

  return (
    <>
      <Card
        ref={cardRef}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          ...(ai_generated === true && {
            boxShadow:
              '0 0 25px rgba(255, 193, 7, 0.8), 0 0 50px rgba(255, 193, 7, 0.6), 0 0 75px rgba(255, 193, 7, 0.4)',
            border: '2px solid rgba(255, 193, 7, 0.5)',
            transition: 'box-shadow 0.3s ease, border 0.3s ease',
          }),
        }}
      >
        <Box sx={{ position: 'relative' }}>
          <CardMedia
            component="img"
            image={image_url || '/image-404-placeholder.avif'}
            alt={title || `Pending image ${internal_reference_number}`}
            sx={{ height: 280, objectFit: 'cover' }}
            loading="lazy"
          />
          <IconButton
            onClick={handleImageViewerOpen}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              bgcolor: 'rgba(0, 0, 0, 0.6)',
              color: 'white',
              '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.8)' },
            }}
            size="small"
            aria-label="Expand image"
          >
            <FullscreenIcon />
          </IconButton>
        </Box>

        <CardContent sx={{ flexGrow: 1 }}>
          <Stack spacing={1}>
            <Typography variant="h6" color="text.primary">
              {short_description || title || `Image ${internal_reference_number}`}
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

      {/* Image Viewer Dialog */}
      <Dialog
        open={imageViewerOpen}
        onClose={handleImageViewerClose}
        maxWidth={false}
        fullWidth
        PaperProps={{
          sx: {
            maxWidth: '90vw',
            maxHeight: '90vh',
            width: '90vw',
            height: '90vh',
            bgcolor: 'background.paper',
            m: 0,
            borderRadius: 2,
            boxShadow: 24,
          },
        }}
      >
        <Toolbar
          sx={{
            bgcolor: 'background.default',
            borderBottom: 1,
            borderColor: 'divider',
            justifyContent: 'space-between',
            minHeight: '64px !important',
            px: 2,
          }}
        >
          <Typography variant="h6" sx={{ flex: 1, color: 'text.primary' }}>
            {short_description || title || `Image ${internal_reference_number}`}
          </Typography>
          <Stack direction="row" spacing={0.5}>
            <IconButton
              onClick={handleZoomOut}
              disabled={zoomLevel <= 0.5}
              sx={{ color: 'text.secondary' }}
              aria-label="Zoom out"
            >
              <ZoomOutIcon />
            </IconButton>
            <Typography
              variant="body2"
              sx={{
                alignSelf: 'center',
                minWidth: 60,
                textAlign: 'center',
                color: 'text.secondary',
                fontWeight: 500,
              }}
            >
              {Math.round(zoomLevel * 100)}%
            </Typography>
            <IconButton
              onClick={handleZoomIn}
              disabled={zoomLevel >= 5}
              sx={{ color: 'text.secondary' }}
              aria-label="Zoom in"
            >
              <ZoomInIcon />
            </IconButton>
            <IconButton
              onClick={handleResetZoom}
              disabled={zoomLevel === 1}
              sx={{ color: 'text.secondary' }}
              aria-label="Reset zoom"
            >
              <FitScreenIcon />
            </IconButton>
            <IconButton
              onClick={handleDownload}
              disabled={downloadInFlight}
              sx={{ color: 'text.secondary' }}
              aria-label="Download image"
            >
              <DownloadIcon />
            </IconButton>
            <IconButton onClick={handleImageViewerClose} sx={{ color: 'text.secondary' }} aria-label="Close">
              <CloseIcon />
            </IconButton>
          </Stack>
        </Toolbar>
        <Box
          ref={imageContainerRef}
          sx={{
            position: 'relative',
            width: '100%',
            height: 'calc(90vh - 64px)',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'rgba(0, 0, 0, 0.05)',
            cursor: zoomLevel > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <Box
            component="img"
            src={image_url || '/image-404-placeholder.avif'}
            alt={title || `Pending image ${internal_reference_number}`}
            sx={{
              maxWidth: '100%',
              maxHeight: '100%',
              transform: `scale(${zoomLevel}) translate(${panPosition.x / zoomLevel}px, ${panPosition.y / zoomLevel}px)`,
              transition: isDragging ? 'none' : 'transform 0.2s ease-out',
              userSelect: 'none',
              pointerEvents: 'none',
            }}
          />
        </Box>
      </Dialog>
    </>
  );
}
