'use client';

import { useState, useRef, useCallback } from 'react';
import { Box, Button, Card, CardContent, LinearProgress, Stack, Typography, Alert, Chip } from '@mui/material';
import { CloudUpload, Clear, CheckCircle } from '@mui/icons-material';
import { alpha } from '@mui/material/styles';

type LocalPreview = {
  kind: 'image' | 'csv' | 'json' | 'unknown';
  name: string;
  sizeBytes: number;
  previewUrl?: string;
  textPreview?: string;
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

export default function ArtifactsUpload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<LocalPreview | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
    const basePreview: LocalPreview = {
      kind,
      name: file.name,
      sizeBytes: file.size,
    };

    if (kind === 'image') {
      const previewUrl = URL.createObjectURL(file);
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
      setUploadComplete(false);
      setProgress(0);

      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      setSelectedFile(file);
      const previewData = await generatePreview(file);
      setPreview(previewData);
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
          {!selectedFile && (
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
                backgroundColor: isDragging ? (theme) => alpha(theme.palette.primary.main, 0.05) : 'transparent',
                '&:hover': {
                  borderColor: 'primary.main',
                  backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.02),
                },
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <Stack spacing={2} alignItems="center">
                <CloudUpload sx={{ fontSize: 56, color: 'text.secondary' }} />
                <Box>
                  <Typography variant="body1" fontWeight={600} gutterBottom>
                    Drop your file here or click to browse
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

              {/* Progress Bar */}
              {(isUploading || uploadComplete) && (
                <Box>
                  <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4 }} />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, textAlign: 'right' }}>
                    {progress}%
                  </Typography>
                </Box>
              )}

              {/* Preview Content */}
              {preview.kind === 'image' && preview.previewUrl && (
                <Box
                  sx={{
                    borderRadius: 2,
                    overflow: 'hidden',
                    border: '1px solid',
                    borderColor: 'divider',
                    maxWidth: 400,
                    mx: 'auto',
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={preview.previewUrl}
                    alt="Preview"
                    style={{
                      width: '100%',
                      height: 'auto',
                      display: 'block',
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

              {/* Action Buttons */}
              {!isUploading && !uploadComplete && (
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
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
