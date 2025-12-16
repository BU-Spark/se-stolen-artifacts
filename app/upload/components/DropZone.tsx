import React from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { CloudUpload } from '@mui/icons-material';
import { alpha } from '@mui/material/styles';

interface DropZoneProps {
  isDragging: boolean;
  handleDragEnter: (e: React.DragEvent) => void;
  handleDragLeave: (e: React.DragEvent) => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent) => void;
  handleFileInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  ACCEPTED_TYPES: string[];
}

export default function DropZone({
  isDragging,
  handleDragEnter,
  handleDragLeave,
  handleDragOver,
  handleDrop,
  handleFileInputChange,
  fileInputRef,
  ACCEPTED_TYPES,
}: DropZoneProps) {
  return (
    <Box
      role="button"
      tabIndex={0}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      sx={{
        border: '2px dashed',
        borderColor: isDragging ? 'primary.main' : 'divider',
        borderRadius: 3,
        p: 6,
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        backgroundColor: isDragging ? (theme) => alpha(theme.palette.grey[500], 0.15) : 'transparent',
        '&:hover': {
          borderColor: 'primary.main',
          backgroundColor: (theme) => alpha(theme.palette.grey[500], 0.08),
        },
      }}
      onClick={() => fileInputRef.current?.click()}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          fileInputRef.current?.click();
        }
      }}
    >
      <Stack spacing={2} alignItems="center">
        <CloudUpload sx={{ fontSize: 56, color: isDragging ? 'primary.main' : 'text.secondary' }} />
        <Box>
          <Typography variant="body1" fontWeight={600} gutterBottom>
            {isDragging ? 'Drop your file here' : 'Drop your file here or click to browse'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Accepted formats: JPG, JPEG, PNG, WEBP (max 10MB)
          </Typography>
        </Box>
      </Stack>
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        onChange={handleFileInputChange}
        style={{ display: 'none' }}
      />
    </Box>
  );
}
