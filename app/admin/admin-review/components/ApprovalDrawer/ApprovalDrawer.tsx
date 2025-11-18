'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Drawer,
  Box,
  Typography,
  Button,
  IconButton,
  Stack,
  Card,
  ImageList,
  ImageListItem,
  TextField,
  FormControlLabel,
  Checkbox,
  Divider,
  Collapse,
  Chip,
  Grid,
  CircularProgress,
} from '@mui/material';
import Image from 'next/image';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FolderIcon from '@mui/icons-material/Folder';
import ImageIcon from '@mui/icons-material/Image';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import SaveIcon from '@mui/icons-material/Save';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CheckIcon from '@mui/icons-material/Check';
import CancelIcon from '@mui/icons-material/Cancel';
import InfoIcon from '@mui/icons-material/Info';
import CategoryIcon from '@mui/icons-material/Category';
import PersonIcon from '@mui/icons-material/Person';
import WarningIcon from '@mui/icons-material/Warning';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { ApprovalDrawerProps, Folder, FolderImage, DrawerView } from './ApprovalDrawer.types';
import { PendingImageMetadata } from '../PendingImageCard/PendingImageCard.types';

export default function ApprovalDrawer({
  open,
  imageId,
  metadata,
  selectedFolderId,
  selectedFolderName,
  onClose,
  onSaveMetadata,
  onApprove,
  onAddToNew,
  onDeny,
  onFolderSelected,
}: ApprovalDrawerProps) {
  const [view, setView] = useState<DrawerView>('metadata');
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  const [folderImages, setFolderImages] = useState<FolderImage[]>([]);
  const [formData, setFormData] = useState<PendingImageMetadata>(metadata || {});
  const [metadataExpanded, setMetadataExpanded] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [metadataSaved, setMetadataSaved] = useState(false);
  const [availableFolders, setAvailableFolders] = useState<Folder[]>([]);
  const [loadingFolders, setLoadingFolders] = useState(false);
  const [loadingFolderImages, setLoadingFolderImages] = useState(false);
  const drawerContentRef = useRef<HTMLDivElement>(null);
  const prevOpenRef = useRef(open);

  // Fetch statues from API
  const fetchStatues = useCallback(async () => {
    setLoadingFolders(true);
    try {
      const response = await fetch('/api/admin/statues');
      const data = await response.json();

      if (response.ok && data.statues) {
        const folders = data.statues.map((statue: { id: string; name: string; imageCount: number }) => ({
          id: statue.id,
          name: statue.name,
          imageCount: statue.imageCount,
        }));
        setAvailableFolders(folders);
      } else {
        console.error('Failed to fetch statues:', data.error);
      }
    } catch (error) {
      console.error('Error fetching statues:', error);
    } finally {
      setLoadingFolders(false);
    }
  }, []);

  // Reset when drawer opens (only when transitioning from closed to open)
  useEffect(() => {
    if (open && !prevOpenRef.current) {
      // Drawer just opened - reset state to metadata view and fetch statues
      setView('metadata');
      setFolderImages([]);
      setFormData(metadata || {});
      setHasUnsavedChanges(false);
      // If metadata already exists and has content, consider it saved (user can proceed without re-saving)
      const hasMetadata = metadata ? Object.keys(metadata).length > 0 : false;
      setMetadataSaved(hasMetadata);
      // If metadata is saved, default to collapsed summary view; otherwise show form expanded
      setMetadataExpanded(!hasMetadata);
      // Reset selected folder state - will be restored after folders are fetched
      setSelectedFolder(null);
      // Fetch statues when drawer opens
      fetchStatues();
    }
    prevOpenRef.current = open;
  }, [open, metadata, fetchStatues]);

  // Sync formData when metadata prop changes (after save)
  useEffect(() => {
    if (open && metadata) {
      // Only update if we don't have unsaved changes to avoid overwriting user input
      if (!hasUnsavedChanges) {
        setFormData(metadata);
      }
    }
  }, [metadata, open, hasUnsavedChanges]);

  // Restore selected folder when availableFolders are loaded and selectedFolderId is provided
  useEffect(() => {
    if (availableFolders.length > 0 && selectedFolderId !== undefined) {
      if (selectedFolderId) {
        // selectedFolderId is a string (folder ID was selected)
        const folder = availableFolders.find((f) => f.id === selectedFolderId);
        if (folder) {
          setSelectedFolder(folder);
        }
      } else if (selectedFolderId === null) {
        // Explicit null means "new folder" was selected (not just uninitialized state)
        setSelectedFolder(null);
      }
    } else if (selectedFolderId === undefined) {
      // No selection has been made - clear any existing selection
      setSelectedFolder(null);
    }
  }, [availableFolders, selectedFolderId]);

  const handleFolderClick = async (folder: Folder) => {
    setSelectedFolder(folder);
    setView('folder-contents');
    setLoadingFolderImages(true);
    setFolderImages([]); // Clear previous images while loading

    try {
      const response = await fetch(`/api/admin/statues/${folder.id}/images`);
      const data = await response.json();

      if (response.ok && data.images) {
        setFolderImages(data.images);
      } else {
        console.error('Failed to fetch folder images:', data.error);
        setFolderImages([]);
      }
    } catch (error) {
      console.error('Error fetching folder images:', error);
      setFolderImages([]);
    } finally {
      setLoadingFolderImages(false);
    }
  };

  const handleBackToFolders = () => {
    setView('folder-list');
    setSelectedFolder(null);
  };

  const handleNavigateToFolders = () => {
    setView('folder-list');
    // Scroll to top when navigating to folder selection
    setTimeout(() => {
      drawerContentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  const handleTextChange = (field: keyof PendingImageMetadata) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData((prev) => {
      const updated = {
        ...prev,
        [field]: field.includes('year') ? (value ? parseInt(value, 10) : undefined) : value,
      };
      setHasUnsavedChanges(true);
      return updated;
    });
  };

  const handleCheckboxChange = (field: keyof PendingImageMetadata) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: e.target.checked };
      setHasUnsavedChanges(true);
      return updated;
    });
  };

  const handleSaveMetadata = () => {
    onSaveMetadata(imageId, formData);
    setHasUnsavedChanges(false);
    setMetadataExpanded(false); // Collapse after saving
    setMetadataSaved(true); // Mark metadata as saved
  };

  // Handle selecting an existing folder
  const handleAddToFolder = () => {
    if (selectedFolder) {
      // Pass selected folder back to parent with name for immediate display
      onFolderSelected?.(selectedFolder.id, selectedFolder.name);
      // Navigate back to metadata view (summary collapsed if metadata is saved)
      setView('metadata');
      const hasMetadata = metadata ? Object.keys(metadata).length > 0 : false;
      setMetadataExpanded(!hasMetadata);
    }
  };

  // Handle selecting a new folder
  const handleSelectNewFolder = () => {
    // Pass null to indicate new folder selection
    onFolderSelected?.(null, null);
    // Navigate back to metadata view (summary collapsed if metadata is saved)
    setView('metadata');
    const hasMetadata = metadata ? Object.keys(metadata).length > 0 : false;
    setMetadataExpanded(!hasMetadata);
  };

  // Helper to get fragmentation points that are true
  const getFragmentationPoints = () => {
    const points: string[] = [];
    if (formData.fragmented_at_neck) points.push('At Neck');
    if (formData.fragment_at_shoulder) points.push('At Shoulder');
    if (formData.fragmented_at_elbow) points.push('At Elbow');
    if (formData.fragmented_at_wrist) points.push('At Wrist');
    if (formData.fragmented_upper_leg) points.push('Upper Leg');
    if (formData.fragmented_at_knee) points.push('At Knee');
    if (formData.fragmented_at_ankle) points.push('At Ankle');
    return points;
  };

  // Helper to get body parts that are present
  const getBodyPartsPresent = () => {
    const parts: string[] = [];
    if (formData.head_present) parts.push('Head');
    if (formData.torso_present) parts.push('Torso');
    if (formData.shoulder_elbow_present) parts.push('Shoulder-Elbow');
    if (formData.elbow_wrist_present) parts.push('Elbow-Wrist');
    if (formData.hand_present) parts.push('Hand');
    if (formData.hip_knee_present) parts.push('Hip-Knee');
    if (formData.knee_ankle_present) parts.push('Knee-Ankle');
    if (formData.foot_present) parts.push('Foot');
    if (formData.base_present) parts.push('Base');
    return parts;
  };

  // Helper to get physical characteristics that are true
  const getPhysicalCharacteristics = () => {
    const characteristics: string[] = [];
    if (formData.repatriated) characteristics.push('Repatriated');
    if (formData.multiple_heads) characteristics.push('Multiple Heads');
    if (formData.four_arms) characteristics.push('Four Arms');
    if (formData.eight_arms) characteristics.push('Eight Arms');
    if (formData.ten_arms) characteristics.push('Ten Arms');
    if (formData.over_ten_arms) characteristics.push('Over Ten Arms');
    if (formData.fragmentary) characteristics.push('Fragmentary');
    if (formData.fragments_from_multiple_statues) characteristics.push('Multiple Statue Fragments');
    return characteristics;
  };

  // Check if basic info has any data
  const hasBasicInfo = () => {
    return !!(
      formData.title_of_object ||
      formData.suspected_current_location ||
      formData.year_first_appearance ||
      formData.year_first_appearance_outside_cambodia ||
      formData.image_source ||
      formData.photograph_location ||
      formData.dealer_gallery_collector_name ||
      formData.material_subject
    );
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: { xs: '100%', sm: 600 },
          p: 0,
        },
      }}
    >
      <Box component="form" sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
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
            {(view === 'folder-list' || view === 'folder-contents') && (
              <IconButton
                onClick={() => {
                  if (view === 'folder-contents') {
                    handleBackToFolders();
                  } else {
                    // Navigating back to metadata - restore saved folder selection
                    setView('metadata');
                    // Restore from saved selectedFolderId prop, not from local browsing state
                    if (selectedFolderId) {
                      const folder = availableFolders.find((f) => f.id === selectedFolderId);
                      if (folder) {
                        setSelectedFolder(folder);
                      }
                    } else if (selectedFolderId === null) {
                      setSelectedFolder(null);
                    } else {
                      // No saved selection - clear local state
                      setSelectedFolder(null);
                    }
                    // Restore collapsed state if metadata is saved
                    const hasMetadata = metadata ? Object.keys(metadata).length > 0 : false;
                    setMetadataExpanded(!hasMetadata);
                  }
                }}
                size="small"
                sx={{ mr: 1 }}
              >
                <ArrowBackIcon />
              </IconButton>
            )}
            <Typography variant="h6" fontWeight={600}>
              {view === 'metadata'
                ? 'Edit Metadata'
                : view === 'folder-list'
                  ? 'Select Destination Folder'
                  : 'Folder Contents'}
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Content - Scrollable */}
        <Box ref={drawerContentRef} sx={{ flexGrow: 1, overflow: 'auto', p: 3 }}>
          {view === 'metadata' ? (
            <Stack spacing={4}>
              {/* Metadata Editing Section */}
              <Box>
                {/* Status and Toggle Bar */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 2,
                    pb: 1,
                    borderBottom: 1,
                    borderColor: 'divider',
                  }}
                >
                  {hasUnsavedChanges ? (
                    <Typography
                      variant="body2"
                      color="warning.main"
                      sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                    >
                      <WarningIcon sx={{ fontSize: 16 }} />
                      Metadata must be saved before selecting folder
                    </Typography>
                  ) : metadataSaved ? (
                    <Typography
                      variant="body2"
                      color="success.main"
                      sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                    >
                      <CheckIcon sx={{ fontSize: 16 }} />
                      All changes saved
                    </Typography>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Ready to edit
                    </Typography>
                  )}
                  <IconButton
                    size="small"
                    onClick={() => setMetadataExpanded(!metadataExpanded)}
                    aria-label={metadataExpanded ? 'Collapse metadata' : 'Expand metadata'}
                  >
                    {metadataExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </IconButton>
                </Box>

                {/* Collapsed Summary View */}
                {!metadataExpanded && (
                  <Box sx={{ mt: 1 }}>
                    <Stack spacing={2.5}>
                      {/* Selected Folder Indicator - Show immediately using selectedFolderName prop */}
                      {selectedFolderId !== undefined && (
                        <Box
                          sx={{
                            p: 1.5,
                            borderRadius: 1,
                            bgcolor: 'secondary.main',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 1,
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <FolderIcon sx={{ fontSize: 18 }} />
                            <Typography variant="body2" fontWeight={500}>
                              Destination:{' '}
                              <strong>
                                {selectedFolderId === null
                                  ? 'New Folder'
                                  : selectedFolderName || selectedFolder?.name || 'Loading...'}
                              </strong>
                            </Typography>
                          </Box>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={handleNavigateToFolders}
                            sx={{
                              color: 'white',
                              borderColor: 'rgba(255, 255, 255, 0.5)',
                              minWidth: 'auto',
                              px: 1.5,
                              '&:hover': {
                                borderColor: 'white',
                                bgcolor: 'rgba(255, 255, 255, 0.1)',
                              },
                            }}
                          >
                            Change
                          </Button>
                        </Box>
                      )}

                      {/* Basic Information Summary - Always show header, show content if exists */}
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                          <InfoIcon sx={{ fontSize: 18 }} />
                          <Typography variant="subtitle2" fontWeight={600}>
                            Basic Information
                          </Typography>
                        </Box>
                        {hasBasicInfo() ? (
                          <Stack spacing={0.5} sx={{ mt: 1 }}>
                            {formData.title_of_object && (
                              <Typography variant="body2" color="text.secondary">
                                <strong>Title:</strong> {formData.title_of_object}
                              </Typography>
                            )}
                            {formData.material_subject && (
                              <Typography variant="body2" color="text.secondary">
                                <strong>Material:</strong> {formData.material_subject}
                              </Typography>
                            )}
                            {(formData.year_first_appearance || formData.year_first_appearance_outside_cambodia) && (
                              <Typography variant="body2" color="text.secondary">
                                {formData.year_first_appearance && (
                                  <>
                                    <strong>Year:</strong> {formData.year_first_appearance}
                                  </>
                                )}
                                {formData.year_first_appearance &&
                                  formData.year_first_appearance_outside_cambodia &&
                                  ' • '}
                                {formData.year_first_appearance_outside_cambodia && (
                                  <>Outside Cambodia: {formData.year_first_appearance_outside_cambodia}</>
                                )}
                              </Typography>
                            )}
                            {formData.suspected_current_location && (
                              <Typography variant="body2" color="text.secondary">
                                <strong>Location:</strong> {formData.suspected_current_location}
                              </Typography>
                            )}
                            {formData.image_source && (
                              <Typography variant="body2" color="text.secondary">
                                <strong>Source:</strong> {formData.image_source}
                              </Typography>
                            )}
                          </Stack>
                        ) : (
                          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', mt: 1 }}>
                            No information entered
                          </Typography>
                        )}
                      </Box>

                      {/* Physical Characteristics Summary */}
                      {getPhysicalCharacteristics().length > 0 && (
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                            <CategoryIcon sx={{ fontSize: 18 }} />
                            <Typography variant="subtitle2" fontWeight={600}>
                              Physical Characteristics
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                            {getPhysicalCharacteristics().map((char) => (
                              <Chip
                                key={char}
                                label={char}
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
                            ))}
                          </Box>
                        </Box>
                      )}

                      {/* Body Parts Present Summary */}
                      {getBodyPartsPresent().length > 0 && (
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                            <PersonIcon sx={{ fontSize: 18 }} />
                            <Typography variant="subtitle2" fontWeight={600}>
                              Body Parts Present
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                            {getBodyPartsPresent().map((part) => (
                              <Chip
                                key={part}
                                label={part}
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
                            ))}
                          </Box>
                        </Box>
                      )}

                      {/* Fragmentation Points Summary */}
                      {getFragmentationPoints().length > 0 && (
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                            <WarningIcon sx={{ fontSize: 18 }} />
                            <Typography variant="subtitle2" fontWeight={600}>
                              Fragmentation Points
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                            {getFragmentationPoints().map((point) => (
                              <Chip
                                key={point}
                                label={point}
                                icon={<CheckIcon sx={{ fontSize: 16 }} />}
                                size="small"
                                sx={{
                                  borderColor: 'success.main',
                                  borderWidth: 1,
                                  borderStyle: 'solid',
                                  bgcolor: 'rgba(46, 125, 50, 0.08)',
                                  color: 'success.dark',
                                  fontWeight: 500,
                                  '& .MuiChip-icon': {
                                    color: 'success.main',
                                  },
                                }}
                                variant="outlined"
                              />
                            ))}
                          </Box>
                        </Box>
                      )}
                    </Stack>
                  </Box>
                )}

                <Collapse in={metadataExpanded} timeout="auto">
                  <Box>
                    {/* Basic Information */}
                    <Box sx={{ mb: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                        <InfoIcon sx={{ fontSize: 18 }} />
                        <Typography variant="subtitle2" fontWeight={600}>
                          Basic Information
                        </Typography>
                      </Box>
                      <Stack spacing={2} sx={{ mt: 2 }}>
                        <TextField
                          label="Title of Object"
                          value={formData.title_of_object || ''}
                          onChange={handleTextChange('title_of_object')}
                          size="small"
                          fullWidth
                        />
                        <TextField
                          label="Suspected Current Location"
                          value={formData.suspected_current_location || ''}
                          onChange={handleTextChange('suspected_current_location')}
                          size="small"
                          fullWidth
                        />
                        <Grid container spacing={2}>
                          <Grid size={{ xs: 6 }}>
                            <TextField
                              label="Year of First Appearance"
                              type="number"
                              value={formData.year_first_appearance || ''}
                              onChange={handleTextChange('year_first_appearance')}
                              size="small"
                              fullWidth
                            />
                          </Grid>
                          <Grid size={{ xs: 6 }}>
                            <TextField
                              label="Year Outside Cambodia"
                              type="number"
                              value={formData.year_first_appearance_outside_cambodia || ''}
                              onChange={handleTextChange('year_first_appearance_outside_cambodia')}
                              size="small"
                              fullWidth
                            />
                          </Grid>
                        </Grid>
                        <TextField
                          label="Image Source"
                          value={formData.image_source || ''}
                          onChange={handleTextChange('image_source')}
                          size="small"
                          fullWidth
                        />
                        <TextField
                          label="Photograph Location"
                          value={formData.photograph_location || ''}
                          onChange={handleTextChange('photograph_location')}
                          size="small"
                          fullWidth
                        />
                        <TextField
                          label="Dealer/Gallery/Collector's Name"
                          value={formData.dealer_gallery_collector_name || ''}
                          onChange={handleTextChange('dealer_gallery_collector_name')}
                          size="small"
                          fullWidth
                        />
                        <TextField
                          label="Material Subject"
                          value={formData.material_subject || ''}
                          onChange={handleTextChange('material_subject')}
                          size="small"
                          fullWidth
                        />
                      </Stack>
                    </Box>

                    <Divider sx={{ my: 3 }} />

                    {/* Physical Characteristics */}
                    <Box sx={{ mb: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                        <CategoryIcon sx={{ fontSize: 18 }} />
                        <Typography variant="subtitle2" fontWeight={600}>
                          Physical Characteristics
                        </Typography>
                      </Box>
                      <Grid container spacing={1} sx={{ mt: 1 }}>
                        <Grid size={{ xs: 6, sm: 4 }}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={formData.repatriated || false}
                                onChange={handleCheckboxChange('repatriated')}
                                size="small"
                              />
                            }
                            label="Repatriated"
                          />
                        </Grid>
                        <Grid size={{ xs: 6, sm: 4 }}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={formData.multiple_heads || false}
                                onChange={handleCheckboxChange('multiple_heads')}
                                size="small"
                              />
                            }
                            label="Multiple Heads"
                          />
                        </Grid>
                        <Grid size={{ xs: 6, sm: 4 }}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={formData.four_arms || false}
                                onChange={handleCheckboxChange('four_arms')}
                                size="small"
                              />
                            }
                            label="Four Arms"
                          />
                        </Grid>
                        <Grid size={{ xs: 6, sm: 4 }}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={formData.eight_arms || false}
                                onChange={handleCheckboxChange('eight_arms')}
                                size="small"
                              />
                            }
                            label="Eight Arms"
                          />
                        </Grid>
                        <Grid size={{ xs: 6, sm: 4 }}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={formData.ten_arms || false}
                                onChange={handleCheckboxChange('ten_arms')}
                                size="small"
                              />
                            }
                            label="Ten Arms"
                          />
                        </Grid>
                        <Grid size={{ xs: 6, sm: 4 }}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={formData.over_ten_arms || false}
                                onChange={handleCheckboxChange('over_ten_arms')}
                                size="small"
                              />
                            }
                            label="Over Ten Arms"
                          />
                        </Grid>
                        <Grid size={{ xs: 6, sm: 4 }}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={formData.fragmentary || false}
                                onChange={handleCheckboxChange('fragmentary')}
                                size="small"
                              />
                            }
                            label="Fragmentary"
                          />
                        </Grid>
                        <Grid size={{ xs: 6, sm: 4 }}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={formData.fragments_from_multiple_statues || false}
                                onChange={handleCheckboxChange('fragments_from_multiple_statues')}
                                size="small"
                              />
                            }
                            label="Multiple Statue Fragments"
                          />
                        </Grid>
                      </Grid>
                    </Box>

                    <Divider sx={{ my: 3 }} />

                    {/* Body Parts Present */}
                    <Box sx={{ mb: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                        <PersonIcon sx={{ fontSize: 18 }} />
                        <Typography variant="subtitle2" fontWeight={600}>
                          Body Parts Present
                        </Typography>
                      </Box>
                      <Grid container spacing={1} sx={{ mt: 1 }}>
                        <Grid size={{ xs: 6, sm: 4 }}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={formData.head_present || false}
                                onChange={handleCheckboxChange('head_present')}
                                size="small"
                              />
                            }
                            label="Head"
                          />
                        </Grid>
                        <Grid size={{ xs: 6, sm: 4 }}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={formData.torso_present || false}
                                onChange={handleCheckboxChange('torso_present')}
                                size="small"
                              />
                            }
                            label="Torso"
                          />
                        </Grid>
                        <Grid size={{ xs: 6, sm: 4 }}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={formData.shoulder_elbow_present || false}
                                onChange={handleCheckboxChange('shoulder_elbow_present')}
                                size="small"
                              />
                            }
                            label="Shoulder-Elbow"
                          />
                        </Grid>
                        <Grid size={{ xs: 6, sm: 4 }}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={formData.elbow_wrist_present || false}
                                onChange={handleCheckboxChange('elbow_wrist_present')}
                                size="small"
                              />
                            }
                            label="Elbow-Wrist"
                          />
                        </Grid>
                        <Grid size={{ xs: 6, sm: 4 }}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={formData.hand_present || false}
                                onChange={handleCheckboxChange('hand_present')}
                                size="small"
                              />
                            }
                            label="Hand"
                          />
                        </Grid>
                        <Grid size={{ xs: 6, sm: 4 }}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={formData.hip_knee_present || false}
                                onChange={handleCheckboxChange('hip_knee_present')}
                                size="small"
                              />
                            }
                            label="Hip-Knee"
                          />
                        </Grid>
                        <Grid size={{ xs: 6, sm: 4 }}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={formData.knee_ankle_present || false}
                                onChange={handleCheckboxChange('knee_ankle_present')}
                                size="small"
                              />
                            }
                            label="Knee-Ankle"
                          />
                        </Grid>
                        <Grid size={{ xs: 6, sm: 4 }}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={formData.foot_present || false}
                                onChange={handleCheckboxChange('foot_present')}
                                size="small"
                              />
                            }
                            label="Foot"
                          />
                        </Grid>
                        <Grid size={{ xs: 6, sm: 4 }}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={formData.base_present || false}
                                onChange={handleCheckboxChange('base_present')}
                                size="small"
                              />
                            }
                            label="Base"
                          />
                        </Grid>
                      </Grid>
                    </Box>

                    <Divider sx={{ my: 3 }} />

                    {/* Fragmentation Points */}
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                        <WarningIcon sx={{ fontSize: 18 }} />
                        <Typography variant="subtitle2" fontWeight={600}>
                          Fragmentation Points
                        </Typography>
                      </Box>
                      <Grid container spacing={1} sx={{ mt: 1 }}>
                        <Grid size={{ xs: 6, sm: 4 }}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={formData.fragmented_at_neck || false}
                                onChange={handleCheckboxChange('fragmented_at_neck')}
                                size="small"
                              />
                            }
                            label="At Neck"
                          />
                        </Grid>
                        <Grid size={{ xs: 6, sm: 4 }}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={formData.fragment_at_shoulder || false}
                                onChange={handleCheckboxChange('fragment_at_shoulder')}
                                size="small"
                              />
                            }
                            label="At Shoulder"
                          />
                        </Grid>
                        <Grid size={{ xs: 6, sm: 4 }}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={formData.fragmented_at_elbow || false}
                                onChange={handleCheckboxChange('fragmented_at_elbow')}
                                size="small"
                              />
                            }
                            label="At Elbow"
                          />
                        </Grid>
                        <Grid size={{ xs: 6, sm: 4 }}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={formData.fragmented_at_wrist || false}
                                onChange={handleCheckboxChange('fragmented_at_wrist')}
                                size="small"
                              />
                            }
                            label="At Wrist"
                          />
                        </Grid>
                        <Grid size={{ xs: 6, sm: 4 }}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={formData.fragmented_upper_leg || false}
                                onChange={handleCheckboxChange('fragmented_upper_leg')}
                                size="small"
                              />
                            }
                            label="Upper Leg"
                          />
                        </Grid>
                        <Grid size={{ xs: 6, sm: 4 }}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={formData.fragmented_at_knee || false}
                                onChange={handleCheckboxChange('fragmented_at_knee')}
                                size="small"
                              />
                            }
                            label="At Knee"
                          />
                        </Grid>
                        <Grid size={{ xs: 6, sm: 4 }}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={formData.fragmented_at_ankle || false}
                                onChange={handleCheckboxChange('fragmented_at_ankle')}
                                size="small"
                              />
                            }
                            label="At Ankle"
                          />
                        </Grid>
                      </Grid>
                    </Box>

                    {/* Save Metadata Button */}
                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                      <Button
                        variant="outlined"
                        size="medium"
                        startIcon={<SaveIcon />}
                        onClick={handleSaveMetadata}
                        disabled={!hasUnsavedChanges}
                      >
                        Save Metadata
                      </Button>
                    </Box>
                  </Box>
                </Collapse>
              </Box>
            </Stack>
          ) : (
            /* Folder Selection Section */
            <Box>
              {view === 'folder-list' ? (
                <Stack spacing={2}>
                  {loadingFolders ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        Loading folders...
                      </Typography>
                    </Box>
                  ) : availableFolders.length === 0 ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        No folders available
                      </Typography>
                    </Box>
                  ) : (
                    availableFolders.map((folder) => (
                      <Card
                        key={folder.id}
                        variant="outlined"
                        sx={{
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          borderColor: selectedFolder?.id === folder.id ? 'secondary.main' : 'divider',
                          borderWidth: selectedFolder?.id === folder.id ? 2 : 1,
                          '&:hover': {
                            borderColor: selectedFolder?.id === folder.id ? 'secondary.main' : 'secondary.light',
                            bgcolor: 'action.hover',
                          },
                        }}
                        onClick={() => handleFolderClick(folder)}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', p: 3, gap: 2 }}>
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

                          {selectedFolder?.id === folder.id && (
                            <Box
                              sx={{
                                width: 32,
                                height: 32,
                                borderRadius: '50%',
                                bgcolor: 'secondary.main',
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
                    ))
                  )}
                </Stack>
              ) : (
                <Box>
                  {loadingFolderImages ? (
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
                      <CircularProgress size={40} />
                    </Box>
                  ) : folderImages.length === 0 ? (
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
                            unoptimized
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
          {view === 'metadata' ? (
            // Show Approve/Deny buttons if folder is selected, otherwise show Next button
            selectedFolderId !== undefined ? (
              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  color="success"
                  size="large"
                  fullWidth
                  startIcon={<CheckIcon />}
                  onClick={() => {
                    if (selectedFolderId && typeof selectedFolderId === 'string') {
                      onApprove(imageId, selectedFolderId, formData);
                    } else {
                      onAddToNew(imageId, formData);
                    }
                  }}
                  disabled={!metadataSaved || hasUnsavedChanges}
                  sx={{ whiteSpace: 'nowrap' }}
                >
                  Approve
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  fullWidth
                  startIcon={<CancelIcon />}
                  onClick={onDeny}
                  sx={{ whiteSpace: 'nowrap' }}
                >
                  Deny
                </Button>
              </Stack>
            ) : (
              <Button
                variant="contained"
                color="secondary"
                size="large"
                fullWidth
                endIcon={<ArrowForwardIcon />}
                onClick={handleNavigateToFolders}
                disabled={!metadataSaved || hasUnsavedChanges}
                sx={{ whiteSpace: 'nowrap' }}
              >
                Next: Select Folder
              </Button>
            )
          ) : (
            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                size="large"
                fullWidth
                startIcon={<CreateNewFolderIcon />}
                onClick={handleSelectNewFolder}
                sx={{ whiteSpace: 'nowrap' }}
              >
                Select New Folder
              </Button>
              <Button
                variant="contained"
                color="secondary"
                size="large"
                fullWidth
                startIcon={<SaveIcon />}
                onClick={handleAddToFolder}
                disabled={!selectedFolder}
                sx={{ whiteSpace: 'nowrap' }}
              >
                Select {selectedFolder?.name || 'Folder'}
              </Button>
            </Stack>
          )}
        </Box>
      </Box>
    </Drawer>
  );
}
