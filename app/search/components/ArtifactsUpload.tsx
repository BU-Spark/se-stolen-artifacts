'use client';

import { useState, useRef, useCallback } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  LinearProgress,
  Stack,
  Typography,
  Alert,
  Chip,
  CircularProgress,
} from '@mui/material';
import { CloudUpload, Clear, CheckCircle } from '@mui/icons-material';
import { alpha } from '@mui/material/styles';

type LocalPreview = {
  kind: 'image' | 'csv' | 'json' | 'unknown';
  name: string;
  sizeBytes: number;
  previewUrl?: string;
  textPreview?: string;
};

type ArtifactsUploadProps = {
  onUploadComplete?: () => void;
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_TYPES = ['.jpg', '.jpeg', '.png', '.webp', '.csv', '.json'];
const ACCEPTED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'text/csv',
  'application/json',
  'application/csv',
];

export default function ArtifactsUpload({ onUploadComplete }: ArtifactsUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<LocalPreview | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageLoadError, setImageLoadError] = useState(false);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return `File size exceeds 10MB limit. Your file is ${formatFileSize(file.size)}.`;
    }

    // Check file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    const isValidExtension = ACCEPTED_TYPES.includes(fileExtension);
    const isValidMimeType = ACCEPTED_MIME_TYPES.includes(file.type);

    if (!isValidExtension && !isValidMimeType) {
      return `Unsupported file type. Accepted formats: ${ACCEPTED_TYPES.join(', ')}`;
    }

    return null;
  };

  const getFileKind = (file: File): LocalPreview['kind'] => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.name.endsWith('.csv') || file.type === 'text/csv') return 'csv';
    if (file.name.endsWith('.json') || file.type === 'application/json') return 'json';
    return 'unknown';
  };

  const generatePreview = async (file: File): Promise<LocalPreview> => {
    const kind = getFileKind(file);
    console.log('File type:', file.type, 'Kind:', kind);
    const basePreview: LocalPreview = {
      kind,
      name: file.name,
      sizeBytes: file.size,
    };

    if (kind === 'image') {
      const previewUrl = URL.createObjectURL(file);
      console.log('Generated preview URL:', previewUrl);
      return { ...basePreview, previewUrl };
    }

    if (kind === 'csv' || kind === 'json') {
      try {
        const text = await file.text();
        const lines = text.split('\n').slice(0, 10); // First 10 lines
        let textPreview = lines.join('\n');

        if (kind === 'json') {
          try {
            const parsed = JSON.parse(text);
            textPreview = JSON.stringify(parsed, null, 2).split('\n').slice(0, 10).join('\n');
          } catch {
            return { ...basePreview, textPreview: 'Invalid JSON format' };
          }
        }

        return { ...basePreview, textPreview };
      } catch {
        return { ...basePreview, textPreview: 'Unable to read file contents' };
      }
    }

    return basePreview;
  };

  const handleFileSelect = useCallback(
    async (file: File) => {
      setError(null);
      setImageLoadError(false);
      setUploadComplete(false);
      setProgress(0);
      setIsLoadingPreview(true);

      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        setIsLoadingPreview(false);
        return;
      }

      setSelectedFile(file);
      try {
        // Add minimum delay to show loading state
        const [previewData] = await Promise.all([
          generatePreview(file),
          new Promise((resolve) => setTimeout(resolve, 1500)), // 1500ms minimum loading time
        ]);
        console.log('Preview data:', previewData);
        setPreview(previewData);
      } catch (err) {
        console.error('Error generating preview:', err);
        setError('Failed to generate preview. Please try another file.');
      } finally {
        setIsLoadingPreview(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect]
  );

  const simulateUpload = () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setProgress(0);
    setError(null);

    // Simulate progress: 0 → 85%
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 85) {
          clearInterval(interval);
          // Pause at 85% then complete
          setTimeout(() => {
            setProgress(100);
            setTimeout(() => {
              setIsUploading(false);
              setUploadComplete(true);
              // Trigger the callback to show search form
              onUploadComplete?.();
            }, 300);
          }, 500);
          return 85;
        }
        return prev + 5;
      });
    }, 100);
  };

  const handleClear = () => {
    setSelectedFile(null);
    setPreview(null);
    setProgress(0);
    setIsUploading(false);
    setUploadComplete(false);
    setError(null);
    setImageLoadError(false);
    setIsLoadingPreview(false);
    if (preview?.previewUrl) {
      URL.revokeObjectURL(preview.previewUrl);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card elevation={2} sx={{ mb: 4 }}>
      <CardContent sx={{ p: { xs: 3, md: 4 } }}>
        <Stack spacing={3}>
          {/* Header */}
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Upload Artifacts
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Upload images or data files (CSV, JSON) for artifact analysis
              </Typography>
            </Box>
            {selectedFile && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<Clear />}
                onClick={handleClear}
                disabled={isUploading}
              >
                Clear
              </Button>
            )}
          </Stack>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Success Alert */}
          {uploadComplete && !error && (
            <Alert severity="success" icon={<CheckCircle />}>
              File ready to submit! ({selectedFile?.name})
            </Alert>
          )}

          {/* Drop Zone */}
          {!selectedFile && !isLoadingPreview && (
            <Box
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
            >
              <Stack spacing={2} alignItems="center">
                <CloudUpload sx={{ fontSize: 56, color: isDragging ? 'primary.main' : 'text.secondary' }} />
                <Box>
                  <Typography variant="body1" fontWeight={600} gutterBottom>
                    {isDragging ? 'Drop your file here' : 'Drop your file here or click to browse'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Accepted formats: JPG, PNG, WEBP, CSV, JSON (max 10MB)
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
          )}

          {/* Loading State */}
          {isLoadingPreview && (
            <Box
              sx={{
                border: '2px dashed',
                borderColor: 'divider',
                borderRadius: 3,
                p: 6,
                textAlign: 'center',
              }}
            >
              <Stack spacing={2} alignItems="center">
                <CircularProgress size={56} />
                <Box>
                  <Typography variant="body1" fontWeight={600} gutterBottom>
                    Processing file...
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Generating preview
                  </Typography>
                </Box>
              </Stack>
            </Box>
          )}

          {/* File Preview */}
          {selectedFile && preview && (
            <Stack spacing={2}>
              {/* File Info */}
              <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                <Chip label={preview.kind.toUpperCase()} color="primary" size="small" sx={{ fontWeight: 600 }} />
                <Typography variant="body2" fontWeight={600} sx={{ flex: 1, minWidth: 200 }}>
                  {preview.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatFileSize(preview.sizeBytes)}
                </Typography>
              </Stack>

              {/* Image Load Error */}
              {preview.kind === 'image' && imageLoadError && (
                <Alert severity="error">
                  Unable to load image preview. The image file may be corrupted or in an unsupported format. Please try
                  another image.
                </Alert>
              )}

              {/* Preview Content - ABOVE progress bar */}
              {preview.kind === 'image' && preview.previewUrl && !imageLoadError && (
                <Box
                  sx={{
                    borderRadius: 2,
                    overflow: 'hidden',
                    border: '1px solid',
                    borderColor: 'divider',
                    maxWidth: 600,
                    width: '100%',
                    backgroundColor: (theme) => alpha(theme.palette.grey[500], 0.05),
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={preview.previewUrl}
                    alt="Artifact preview"
                    onError={(e) => {
                      console.error('Image failed to load:', preview.previewUrl);
                      setImageLoadError(true);
                      e.currentTarget.style.display = 'none';
                    }}
                    onLoad={(e) => {
                      console.log('Image loaded successfully:', preview.previewUrl);
                      setImageLoadError(false);
                      e.currentTarget.style.display = 'block';
                    }}
                    style={{
                      width: '100%',
                      height: 'auto',
                      display: 'block',
                      maxHeight: '500px',
                      objectFit: 'contain',
                    }}
                  />
                </Box>
              )}

              {(preview.kind === 'csv' || preview.kind === 'json') && preview.textPreview && (
                <Box
                  sx={{
                    backgroundColor: (theme) => alpha(theme.palette.grey[500], 0.05),
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    p: 2,
                    maxHeight: 200,
                    overflow: 'auto',
                  }}
                >
                  <Typography
                    component="pre"
                    variant="body2"
                    sx={{
                      fontFamily: 'monospace',
                      fontSize: '0.75rem',
                      margin: 0,
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                    }}
                  >
                    {preview.textPreview}
                  </Typography>
                </Box>
              )}

              {/* Progress Bar - BELOW image preview */}
              {(isUploading || uploadComplete) && (
                <Box>
                  <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4 }} />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, textAlign: 'right' }}>
                    {progress}%
                  </Typography>
                </Box>
              )}

              {/* Action Buttons */}
              {!isUploading && !uploadComplete && !imageLoadError && (
                <Stack direction="row" spacing={2} justifyContent="flex-end">
                  <Button variant="text" onClick={handleClear}>
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<CloudUpload />}
                    onClick={simulateUpload}
                    disabled={!selectedFile}
                  >
                    Upload
                  </Button>
                </Stack>
              )}

              {/* Submit Button - After upload completes */}
              {uploadComplete && (
                <Stack direction="row" spacing={2} justifyContent="flex-end">
                  <Button variant="contained" size="large">
                    Submit
                  </Button>
                </Stack>
              )}
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
