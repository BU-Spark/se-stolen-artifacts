'use client';

import { useState, useEffect } from 'react';
import { Drawer, Box, Typography, Button, IconButton, Stack, Card, ImageList, ImageListItem } from '@mui/material';
import Image from 'next/image';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FolderIcon from '@mui/icons-material/Folder';
import AddIcon from '@mui/icons-material/Add';
import ImageIcon from '@mui/icons-material/Image';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import { ApprovalDrawerProps, Folder, FolderImage, DrawerView } from './ApprovalDrawer.types';

// TODO: Fetch these from your database or configuration
const AVAILABLE_FOLDERS: Folder[] = [
  { id: 'folder-1', name: 'Folder 1', imageCount: 12 },
  { id: 'folder-2', name: 'Folder 2', imageCount: 8 },
  { id: 'folder-3', name: 'Folder 3', imageCount: 5 },
  { id: 'folder-4', name: 'Folder 4', imageCount: 0 },
];

// TODO: Fetch from API based on folder ID
const MOCK_FOLDER_IMAGES: Record<string, FolderImage[]> = {
  'folder-2': [
    { id: '1', url: 'https://picsum.photos/seed/statue1/300/300', title: 'Ancient Statue 1' },
    { id: '2', url: 'https://picsum.photos/seed/statue2/300/300', title: 'Ancient Statue 2' },
    { id: '3', url: 'https://picsum.photos/seed/statue3/300/300', title: 'Ancient Statue 3' },
    { id: '4', url: 'https://picsum.photos/seed/statue4/300/300', title: 'Ancient Statue 4' },
  ],
};

export default function ApprovalDrawer({ open, imageId, onClose, onApprove, onAddToNew }: ApprovalDrawerProps) {
  const [view, setView] = useState<DrawerView>('folder-list');
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  const [folderImages, setFolderImages] = useState<FolderImage[]>([]);

  // Reset to folder list when drawer opens
  useEffect(() => {
    if (open) {
      setView('folder-list');
      setSelectedFolder(null);
      setFolderImages([]);
    }
  }, [open]);

  const handleFolderClick = (folder: Folder) => {
    setSelectedFolder(folder);
    // TODO: Fetch images from API
    setFolderImages(MOCK_FOLDER_IMAGES[folder.id] || []);
    setView('folder-contents');
  };

  const handleBackToFolders = () => {
    setView('folder-list');
    setSelectedFolder(null);
  };

  const handleAddToFolder = () => {
    if (selectedFolder) {
      onApprove(imageId, selectedFolder.id);
      onClose();
    }
  };

  const handleAddToNew = () => {
    onAddToNew(imageId);
    onClose();
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: { xs: '100%', sm: 520 },
          p: 0,
        },
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 3,
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {view === 'folder-contents' && (
              <IconButton onClick={handleBackToFolders} size="small" sx={{ mr: 1 }}>
                <ArrowBackIcon />
              </IconButton>
            )}
            <Typography variant="h6" fontWeight={600}>
              {view === 'folder-list' ? 'Select a folder' : selectedFolder?.name}
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Content */}
        <Box sx={{ flexGrow: 1, overflow: 'auto', p: 3 }}>
          {view === 'folder-list' ? (
            /* Folder List View */
            <Stack spacing={2}>
              {AVAILABLE_FOLDERS.map((folder) => (
                <Card
                  key={folder.id}
                  variant="outlined"
                  sx={{
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    borderColor: selectedFolder?.id === folder.id ? 'primary.main' : 'divider',
                    borderWidth: selectedFolder?.id === folder.id ? 2 : 1,
                    '&:hover': {
                      borderColor: 'primary.light',
                      bgcolor: 'action.hover',
                    },
                  }}
                  onClick={() => handleFolderClick(folder)}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', p: 3, gap: 2 }}>
                    {/* Folder Icon with Image Preview */}
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: 1,
                        bgcolor: 'grey.100',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <ImageIcon sx={{ fontSize: 40, color: 'grey.400' }} />
                    </Box>

                    {/* Folder Info */}
                    <Box sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <FolderIcon sx={{ color: 'text.secondary' }} />
                        <Typography variant="h6" fontWeight={500}>
                          {folder.name}
                        </Typography>
                      </Box>
                      {folder.imageCount !== undefined && (
                        <Typography variant="body2" color="text.secondary">
                          {folder.imageCount} {folder.imageCount === 1 ? 'image' : 'images'}
                        </Typography>
                      )}
                    </Box>

                    {/* Checkmark if selected */}
                    {selectedFolder?.id === folder.id && (
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          bgcolor: 'primary.main',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                        }}
                      >
                        ✓
                      </Box>
                    )}
                  </Box>
                </Card>
              ))}
            </Stack>
          ) : (
            /* Folder Contents View */
            <Box>
              {folderImages.length === 0 ? (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    py: 8,
                    gap: 2,
                  }}
                >
                  <FolderIcon sx={{ fontSize: 64, color: 'grey.300' }} />
                  <Typography variant="body1" color="text.secondary">
                    This folder is empty
                  </Typography>
                </Box>
              ) : (
                <ImageList cols={2} gap={16}>
                  {folderImages.map((image) => (
                    <ImageListItem key={image.id}>
                      <Image
                        src={image.url}
                        alt={image.title}
                        width={250}
                        height={250}
                        style={{
                          borderRadius: 8,
                          objectFit: 'cover',
                          width: '100%',
                          height: 'auto',
                        }}
                      />
                    </ImageListItem>
                  ))}
                </ImageList>
              )}
            </Box>
          )}
        </Box>

        {/* Footer Actions */}
        <Box
          sx={{
            p: 3,
            borderTop: 1,
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}
        >
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              size="large"
              fullWidth
              startIcon={<CreateNewFolderIcon />}
              onClick={handleAddToNew}
            >
              Add to New
            </Button>
            <Button
              variant="contained"
              size="large"
              fullWidth
              startIcon={<AddIcon />}
              onClick={handleAddToFolder}
              disabled={!selectedFolder}
            >
              Add to {selectedFolder?.name || 'Folder'}
            </Button>
          </Stack>
        </Box>
      </Box>
    </Drawer>
  );
}
