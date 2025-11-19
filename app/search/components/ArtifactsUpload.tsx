'use client';

import { themeTokens } from '@/app/theme';
import { useState, useRef, useCallback } from 'react';

// MUI
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

// major metadata types
import type {
  BasicSearchMetadata,
  AdvancedSearchMetadata,
  ProcessMetadataRequest,
  ProcessMetadataResponse,
} from '@/app/types/metadata.types';

// local components
import DropZone from './DropZone';
import DescriptionMetadataEntry from './DescriptionMetadataEntry';

// local utils
import { formatFileSize, validateFile, getFileKind } from '@/app/search/utils';

// local types
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

const ACCEPTED_TYPES = ['.jpg', '.jpeg', '.png', '.webp', '.csv', '.json'];

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
  const [shortDescription, setShortDescription] = useState<string>('');
  const [longDescription, setLongDescription] = useState<string>('');
  const [descriptionError, setDescriptionError] = useState<string | null>(null);
  // metadata mode: 'ai' means use descriptions + LLM, 'manual' means user fills structured metadata
  const [metadataMode, setMetadataMode] = useState<'ai' | 'manual'>('ai');

  // Manual metadata state (partial, mirrors ManualArtifactMetadata)
  const [manualBasic, setManualBasic] = useState<Partial<BasicSearchMetadata>>({
    subject: '',
    dealerName: '',
    suspectedCurrentLocation: '',
    artifactTitle: '',
    photographLocation: '',
    firstAppearanceYear: undefined,
    firstAppearanceYearOutsideCambodia: undefined,
    repatriated: false,
  });

  const [manualAdvanced, setManualAdvanced] = useState<Partial<AdvancedSearchMetadata>>({
    imageSource: '',
    material: '',
    hasInscription: false,

    // Head/Arms Configuration
    multipleHeads: false,
    fourArms: false,
    eightArms: false,
    tenArms: false,
    overTenArms: false,

    // Overall Condition
    fragmentary: false,
    fragmentsFromMultipleStatues: false,

    // Body Parts Present
    headPresent: false,
    torsoPresent: false,
    shoulderElbowPresent: false,
    elbowWristPresent: false,
    handPresent: false,
    hipKneePresent: false,
    kneeAnklePresent: false,
    footPresent: false,
    basePresent: false,

    // Fragmentation Points
    fragmentedAtNeck: false,
    fragmentedAtShoulder: false,
    fragmentedAtElbow: false,
    fragmentedAtWrist: false,
    fragmentedAtUpperLeg: false,
    fragmentedAtKnee: false,
    fragmentedAtAnkle: false,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleUpload = async () => {
    if (!selectedFile) return;

    if (!shortDescription.trim()) {
      setDescriptionError('Short description is required');
      return;
    }

    // long description is required only when using AI processing
    if (metadataMode === 'ai' && !longDescription.trim()) {
      setDescriptionError('Detailed description is required for AI processing');
      return;
    }

    setIsUploading(true);
    setProgress(0);
    setError(null);
    setDescriptionError(null);

    // Simulate progress: 0% → 85% while uploading
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 85) {
          clearInterval(progressInterval);
          return 85;
        }
        return prev + 5;
      });
    }, 150);

    try {
      // Create FormData to send the file and descriptions
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('shortDescription', shortDescription.trim());
      if (longDescription.trim()) formData.append('longDescription', longDescription.trim());

      // Call the upload API
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }

      // If we have an image ID, send the descriptions to the metadata processing endpoint
      if (result.id) {
        try {
          // Build metadata processing payload depending on mode
          const payload: ProcessMetadataRequest =
            metadataMode === 'ai'
              ? {
                  imageId: result.id,
                  gcsPath: result.gcsPath,
                  shortDescription: shortDescription.trim(),
                  processWithAI: true,
                  longDescription: longDescription.trim(),
                  internalReferenceNumber: result.internalReferenceNumber,
                }
              : {
                  imageId: result.id,
                  gcsPath: result.gcsPath,
                  shortDescription: shortDescription.trim(),
                  processWithAI: false,
                  manualMetadata: {
                    basicSearchMetadata: manualBasic,
                    advancedSearchMetadata: manualAdvanced,
                  },
                  internalReferenceNumber: result.internalReferenceNumber,
                  ...(longDescription.trim() && { longDescription: longDescription.trim() }),
                };

          const llmResponse = await fetch('/api/process-metadata', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          });

          let llmResult: ProcessMetadataResponse | null = null;
          try {
            llmResult = await llmResponse.json();
          } catch (parseErr) {
            console.error('Failed to parse metadata response JSON:', parseErr);
          }

          if (!llmResponse.ok || !llmResult?.success) {
            const requiresManualEntry = Boolean(llmResult?.requiresManualEntry);
            const defaultMessage = requiresManualEntry
              ? 'AI metadata extraction failed. Please provide metadata manually.'
              : 'Metadata processing failed. Please try again.';
            const errorMessage = typeof llmResult?.error === 'string' ? llmResult.error : defaultMessage;

            if (requiresManualEntry) {
              setMetadataMode('manual');
              setDescriptionError('AI processing was unable to extract metadata. Please complete the manual fields.');
            }

            throw new Error(errorMessage);
          }

          console.log('Metadata processing successful:', llmResult);
        } catch (llmErr) {
          const metadataError = llmErr instanceof Error ? llmErr.message : 'Metadata processing failed.';
          clearInterval(progressInterval);
          setIsUploading(false);
          setProgress(0);
          setError(metadataError);
          return;
        }
      }

      // Clear interval and jump to 100%
      clearInterval(progressInterval);
      setProgress(100);

      // Brief delay before marking as complete for smooth animation
      setTimeout(() => {
        setIsUploading(false);
        setUploadComplete(true);
        onUploadComplete?.();
      }, 300);

      console.log('Upload successful:', result);
    } catch (err) {
      console.error('Upload error:', err);
      clearInterval(progressInterval);
      setError(err instanceof Error ? err.message : 'Upload failed');
      setIsUploading(false);
      setProgress(0);
    }
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
    setShortDescription('');
    setLongDescription('');
    setDescriptionError(null);
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

          {/* Drop Zone */}
          {!selectedFile && !isLoadingPreview && (
            <DropZone
              isDragging={isDragging}
              handleDragEnter={handleDragEnter}
              handleDragLeave={handleDragLeave}
              handleDragOver={handleDragOver}
              handleDrop={handleDrop}
              handleFileInputChange={handleFileInputChange}
              fileInputRef={fileInputRef}
              ACCEPTED_TYPES={ACCEPTED_TYPES}
            />
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
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: 2,
                    overflow: 'hidden',
                    border: '1px solid',
                    borderColor: 'divider',
                    maxWidth: 600,
                    width: '100%',
                    height: 400, // Set a fixed height for centering
                    margin: '0 auto', // Center the container horizontally
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
                      height: '100%',
                      objectFit: 'cover',
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

              {/* Description / Metadata Mode Tabs */}
              {!isUploading && !uploadComplete && !imageLoadError && (
                <DescriptionMetadataEntry
                  metadataMode={metadataMode}
                  setMetadataMode={setMetadataMode}
                  shortDescription={shortDescription}
                  setShortDescription={setShortDescription}
                  longDescription={longDescription}
                  setLongDescription={setLongDescription}
                  descriptionError={descriptionError}
                  setDescriptionError={setDescriptionError}
                  manualBasic={manualBasic}
                  setManualBasic={setManualBasic}
                  manualAdvanced={manualAdvanced}
                  setManualAdvanced={setManualAdvanced}
                />
              )}

              {/* Progress Bar - BELOW descriptions */}
              {(isUploading || uploadComplete) && (
                <Box>
                  <LinearProgress
                    variant="determinate"
                    value={progress}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: (theme) => alpha(theme.palette.grey[400], 0.25),
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: themeTokens.secondaryBlue,
                      },
                    }}
                  />
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
                    onClick={handleUpload}
                    disabled={!selectedFile}
                  >
                    Upload
                  </Button>
                </Stack>
              )}

              {/* Success Message and Upload Another Button */}
              {uploadComplete && (
                <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center">
                  <Typography
                    variant="body2"
                    color="success.main"
                    sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                  >
                    <CheckCircle fontSize="small" />
                    Image uploaded successfully and sent for review
                  </Typography>
                  <Button variant="outlined" onClick={handleClear}>
                    Upload Another
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
