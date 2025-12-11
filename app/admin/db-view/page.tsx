'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Tooltip,
  CardMedia,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Refresh,
  ImageSearch,
  Fullscreen,
  Close,
  ExpandMore,
  ExpandLess,
} from '@mui/icons-material';
import { useUser } from '@clerk/nextjs';

const TABLES = [
  { value: 'statues', label: 'Statues' },
  // Images table removed - images are shown within statues table via expand/collapse
  { value: 'locations', label: 'Locations' },
  { value: 'materials', label: 'Materials' },
  { value: 'names', label: 'Names' },
  { value: 'subjects', label: 'Subjects' },
  { value: 'attributes', label: 'Attributes' },
  { value: 'photographers', label: 'Photographers' },
  { value: 'auction_institutions', label: 'Auction Institutions' },
  { value: 'auction_events', label: 'Auction Events' },
];

type RowData = Record<string, unknown>;

// Fields that should be truncated with hover tooltip (table -> array of field names)
const TRUNCATE_FIELDS: Record<string, string[]> = {
  statues: ['description', 'provenance_history'],
  images: ['observations_comments', 'image_url', 'image_gcs'],
  locations: ['location_name'],
  auction_institutions: ['address', 'contact_info'],
  statue_current_loc: ['link'],
  // Add more tables/fields as needed
};

const MAX_PREVIEW_LENGTH = 100; // Characters to show before truncation

// Utility function to truncate text
const truncateText = (text: string | null | undefined, maxLength: number = MAX_PREVIEW_LENGTH): string => {
  if (!text) return '';
  const str = String(text);
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength) + '...';
};

// Check if a field should be truncated
const shouldTruncate = (table: string, fieldName: string): boolean => {
  return TRUNCATE_FIELDS[table]?.includes(fieldName) ?? false;
};

// Foreign key field mappings: fieldName -> { referencedTable, displayField, idField }
const FOREIGN_KEY_MAPPINGS: Record<
  string,
  Record<string, { referencedTable: string; displayField: string; idField: string }>
> = {
  statues: {
    original_location_id: { referencedTable: 'locations', displayField: 'location_name', idField: 'id' },
    material: { referencedTable: 'materials', displayField: 'material_name', idField: 'id' },
    statues_name: { referencedTable: 'names', displayField: 'statues_name', idField: 'id' },
  },
  images: {
    statue_id: { referencedTable: 'statues', displayField: 'statue_id', idField: 'statue_id' },
    photograph_location: { referencedTable: 'locations', displayField: 'location_name', idField: 'id' },
    photographer: { referencedTable: 'photographers', displayField: 'photographer_name', idField: 'id' },
  },
  auction_events: {
    statue_id: { referencedTable: 'statues', displayField: 'statue_id', idField: 'statue_id' },
    auction_house_id: { referencedTable: 'auction_institutions', displayField: 'name', idField: 'id' },
  },
  statue_current_loc: {
    statue_id: { referencedTable: 'statues', displayField: 'statue_id', idField: 'statue_id' },
    location_id: { referencedTable: 'locations', displayField: 'location_name', idField: 'id' },
  },
  statue_subject: {
    statue_id: { referencedTable: 'statues', displayField: 'statue_id', idField: 'statue_id' },
    subject_id: { referencedTable: 'subjects', displayField: 'subject_name', idField: 'id' },
  },
  statue_attributes: {
    statue_id: { referencedTable: 'statues', displayField: 'statue_id', idField: 'statue_id' },
    attribute_id: { referencedTable: 'attributes', displayField: 'attribute_name', idField: 'id' },
  },
};

export default function AdminDbViewPage() {
  const { isLoaded } = useUser();
  const [selectedTable, setSelectedTable] = useState<string>('statues');
  const [data, setData] = useState<RowData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dialogError, setDialogError] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState<RowData>({});
  const [foreignKeyData, setForeignKeyData] = useState<Record<string, RowData[]>>({});
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [rowToDelete, setRowToDelete] = useState<RowData | null>(null);
  const [statueIdFilter, setStatueIdFilter] = useState<string>('');
  const [expandedStatues, setExpandedStatues] = useState<Set<number>>(new Set());
  const [statueImages, setStatueImages] = useState<Record<number, RowData[]>>({});
  const [loadingImages, setLoadingImages] = useState<Record<number, boolean>>({});
  const [associatedImageCount, setAssociatedImageCount] = useState<number | null>(null);
  const [loadingImageCount, setLoadingImageCount] = useState(false);
  const editDialogContentRef = useRef<HTMLDivElement>(null);
  const addDialogContentRef = useRef<HTMLDivElement>(null);

  const fetchData = useCallback(async () => {
    if (!selectedTable) return;

    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/admin/db-view/${selectedTable}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch data');
      }

      setData(result.data || []);
    } catch (fetchError: unknown) {
      const message = fetchError instanceof Error ? fetchError.message : 'An unknown error occurred';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [selectedTable]);

  const fetchForeignKeyData = useCallback(async () => {
    if (!selectedTable) return;

    const fkMappings = FOREIGN_KEY_MAPPINGS[selectedTable];
    if (!fkMappings) return;

    const tablesToFetch = new Set<string>();
    Object.values(fkMappings).forEach((mapping) => {
      tablesToFetch.add(mapping.referencedTable);
    });

    const fetchPromises = Array.from(tablesToFetch).map(async (table) => {
      try {
        const response = await fetch(`/api/admin/db-view/${table}`);
        const result = await response.json();
        if (response.ok) {
          return { table, data: result.data || [] };
        }
        return { table, data: [] };
      } catch {
        return { table, data: [] };
      }
    });

    const results = await Promise.all(fetchPromises);
    const fkData: Record<string, RowData[]> = {};
    results.forEach(({ table, data }) => {
      fkData[table] = data;
    });
    setForeignKeyData(fkData);
  }, [selectedTable]);

  useEffect(() => {
    if (isLoaded) {
      fetchData();
      fetchForeignKeyData();
    }
  }, [isLoaded, fetchData, fetchForeignKeyData]);

  useEffect(() => {
    if (dialogError) {
      // Scroll to top of the open dialog when error occurs
      if (editDialogOpen && editDialogContentRef.current) {
        editDialogContentRef.current.scrollTop = 0;
      }
      if (addDialogOpen && addDialogContentRef.current) {
        addDialogContentRef.current.scrollTop = 0;
      }
    }
  }, [dialogError, editDialogOpen, addDialogOpen]);

  const handleTableChange = (newTable: string) => {
    setSelectedTable(newTable);
    setData([]);
    setForeignKeyData({});
    setStatueIdFilter(''); // Reset filter when switching tables
    setExpandedStatues(new Set()); // Reset expanded statues when switching tables
    setStatueImages({}); // Clear images for new table
    setLoadingImages({}); // Clear loading states for new table
  };

  const handleEdit = (row: RowData) => {
    setFormData({ ...row });
    setDialogError(null);
    setEditDialogOpen(true);
  };

  const handleAdd = () => {
    setFormData({});
    setDialogError(null);
    setAddDialogOpen(true);
  };

  const handleDeleteClick = async (row: RowData) => {
    setRowToDelete(row);
    setAssociatedImageCount(null);
    setDeleteDialogOpen(true);

    // If deleting a statue, fetch the count of associated images
    if (selectedTable === 'statues' && row.statue_id) {
      setLoadingImageCount(true);
      try {
        const response = await fetch(`/api/admin/db-view/images`);
        const result = await response.json();
        if (response.ok && result.data) {
          // Count images that belong to this statue and are not deleted
          const count = result.data.filter((img: RowData) => img.statue_id === row.statue_id && !img.is_deleted).length;
          setAssociatedImageCount(count);
        }
      } catch (error) {
        console.error('Failed to fetch image count:', error);
        // Don't block deletion if count fetch fails
      } finally {
        setLoadingImageCount(false);
      }
    }
  };

  const handleDeleteConfirm = async () => {
    if (!rowToDelete) return;

    try {
      const primaryKey =
        selectedTable === 'statues' ? 'statue_id' : selectedTable === 'images' ? 'internal_reference_number' : 'id';
      const id = rowToDelete[primaryKey];

      const response = await fetch(`/api/admin/db-view/${selectedTable}?id=${encodeURIComponent(String(id))}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        // Parse foreign key constraint errors to provide better messages
        const errorMessage = result.error || 'Failed to delete record';
        let userFriendlyMessage = errorMessage;

        if (errorMessage.includes('foreign key constraint')) {
          const constraintName = errorMessage.match(/constraint "([^"]+)"/)?.[1] || '';

          // Images table constraints
          if (constraintName.includes('approval_image_id_fkey') || errorMessage.includes('approval')) {
            userFriendlyMessage = `Cannot delete this image because it is referenced by approval records. Please delete the related approval records first, or use the admin review page to handle this image.`;
          }
          // Statues table constraints
          else if (
            constraintName.includes('images_statue_id_fkey') ||
            (errorMessage.includes('images') && selectedTable === 'statues')
          ) {
            userFriendlyMessage = `Cannot delete this statue because it has associated images. Please delete the related images first.`;
          } else if (
            constraintName.includes('auction_events_statue_id_fkey') ||
            errorMessage.includes('auction_events')
          ) {
            userFriendlyMessage = `Cannot delete this statue because it has associated auction events. Please delete the related auction events first.`;
          } else if (
            constraintName.includes('statue_subject_statue_id_fkey') ||
            errorMessage.includes('statue_subject')
          ) {
            userFriendlyMessage = `Cannot delete this statue because it has associated subjects. Please delete the related statue-subject relationships first.`;
          } else if (
            constraintName.includes('statue_attributes_statue_id_fkey') ||
            errorMessage.includes('statue_attributes')
          ) {
            userFriendlyMessage = `Cannot delete this statue because it has associated attributes. Please delete the related statue-attribute relationships first.`;
          } else if (
            constraintName.includes('statue_current_loc_statue_id_fkey') ||
            errorMessage.includes('statue_current_loc')
          ) {
            userFriendlyMessage = `Cannot delete this statue because it has associated current location records. Please delete the related current location records first.`;
          }
          // Locations table constraints
          else if (
            constraintName.includes('statues_original_location_id_fkey') ||
            (errorMessage.includes('statues') && errorMessage.includes('original_location'))
          ) {
            userFriendlyMessage = `Cannot delete this location because it is used as an original location for statues. Please update or delete the related statues first.`;
          } else if (
            constraintName.includes('statue_current_loc_location_id_fkey') ||
            (errorMessage.includes('statue_current_loc') && errorMessage.includes('location'))
          ) {
            userFriendlyMessage = `Cannot delete this location because it is used in current location records. Please delete the related current location records first.`;
          } else if (
            constraintName.includes('images_photograph_location_fkey') ||
            (errorMessage.includes('images') && errorMessage.includes('photograph_location'))
          ) {
            userFriendlyMessage = `Cannot delete this location because it is used as a photograph location for images. Please update or delete the related images first.`;
          }
          // Materials table constraints
          else if (
            constraintName.includes('statues_material_fkey') ||
            (errorMessage.includes('statues') && errorMessage.includes('material'))
          ) {
            userFriendlyMessage = `Cannot delete this material because it is used by statues. Please update or delete the related statues first.`;
          }
          // Names table constraints
          else if (
            constraintName.includes('statues_statues_name_fkey') ||
            (errorMessage.includes('statues') && errorMessage.includes('statues_name'))
          ) {
            userFriendlyMessage = `Cannot delete this name because it is used by statues. Please update or delete the related statues first.`;
          }
          // Subjects table constraints
          else if (
            constraintName.includes('statue_subject_subject_id_fkey') ||
            (errorMessage.includes('statue_subject') && errorMessage.includes('subject'))
          ) {
            userFriendlyMessage = `Cannot delete this subject because it is used in statue-subject relationships. Please delete the related statue-subject records first.`;
          }
          // Attributes table constraints
          else if (
            constraintName.includes('statue_attributes_attribute_id_fkey') ||
            (errorMessage.includes('statue_attributes') && errorMessage.includes('attribute'))
          ) {
            userFriendlyMessage = `Cannot delete this attribute because it is used in statue-attribute relationships. Please delete the related statue-attribute records first.`;
          }
          // Photographers table constraints
          else if (
            constraintName.includes('images_photographer_fkey') ||
            (errorMessage.includes('images') && errorMessage.includes('photographer'))
          ) {
            userFriendlyMessage = `Cannot delete this photographer because they have associated images. Please update or delete the related images first.`;
          }
          // AuctionInstitutions table constraints
          else if (
            constraintName.includes('auction_events_auction_house_id_fkey') ||
            (errorMessage.includes('auction_events') && errorMessage.includes('auction_house'))
          ) {
            userFriendlyMessage = `Cannot delete this auction institution because it has associated auction events. Please delete the related auction events first.`;
          }
          // Images table constraints (statue_id)
          else if (
            constraintName.includes('images_statue_id_fkey') ||
            (errorMessage.includes('images') && errorMessage.includes('statue_id'))
          ) {
            userFriendlyMessage = `Cannot delete this statue because it has associated images. Please delete the related images first.`;
          }
          // Generic fallback
          else {
            userFriendlyMessage = `Cannot delete this record because it is referenced by other records in the database. Please delete the related records first.`;
          }
        }

        throw new Error(userFriendlyMessage);
      }

      setDeleteDialogOpen(false);
      setRowToDelete(null);
      setAssociatedImageCount(null);
      await fetchData();
    } catch (deleteError: unknown) {
      const message = deleteError instanceof Error ? deleteError.message : 'Failed to delete record';
      setError(message);
      setDeleteDialogOpen(false);
      setRowToDelete(null);
      setAssociatedImageCount(null);
      // Scroll to top of page to show error message
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setRowToDelete(null);
    setAssociatedImageCount(null);
  };

  const handleSave = async (isEdit: boolean) => {
    try {
      setDialogError(null);
      const url = `/api/admin/db-view/${selectedTable}`;
      const method = isEdit ? 'PUT' : 'POST';

      // Prepare data with proper type conversions for foreign keys
      const fkMappings = FOREIGN_KEY_MAPPINGS[selectedTable] || {};
      const preparedData = { ...formData };

      // Convert foreign key string values to numbers (or null)
      Object.keys(fkMappings).forEach((fieldName) => {
        const value = preparedData[fieldName];
        if (value === '' || value === null || value === undefined) {
          preparedData[fieldName] = null;
        } else if (typeof value === 'string' && !isNaN(Number(value))) {
          preparedData[fieldName] = Number(value);
        }
      });

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preparedData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `Failed to ${isEdit ? 'update' : 'create'} record`);
      }

      setEditDialogOpen(false);
      setAddDialogOpen(false);
      setFormData({});
      setDialogError(null);
      await fetchData();
    } catch (saveError: unknown) {
      const message = saveError instanceof Error ? saveError.message : 'Failed to save record';
      setDialogError(message);
    }
  };

  const getColumns = (): string[] => {
    if (data.length === 0) return [];
    const cols = Object.keys(data[0]);
    // Filter out is_deleted column for statues table (keep it in DB, just hide in UI)
    if (selectedTable === 'statues') {
      return cols.filter((col) => col !== 'is_deleted');
    }
    return cols;
  };

  const columns = getColumns();
  const getPrimaryKey = () => {
    return selectedTable === 'statues' ? 'statue_id' : selectedTable === 'images' ? 'internal_reference_number' : 'id';
  };

  // Filter data based on statue_id filter for images table
  const filteredData =
    selectedTable === 'images' && statueIdFilter
      ? data.filter((row) => {
          const statueId = String(row.statue_id ?? '');
          return statueId === statueIdFilter || statueId.includes(statueIdFilter);
        })
      : data;

  // Helper function to get image URL - tries public URL first, falls back to API for signed URL
  const getImageUrl = useCallback(async (row: RowData): Promise<string | null> => {
    const imageId = row.internal_reference_number;
    if (!imageId) return null;

    // First, try constructing public URL from image_gcs
    if (row.image_gcs) {
      const gcsPath = String(row.image_gcs).trim().replace(/^\/+/, ''); // Remove leading slashes
      const parts = gcsPath.split('/').filter(Boolean);

      if (parts.length > 0) {
        // The bucket name is the first part (e.g., 'approved_images' or 'pending_images')
        const bucketName = parts[0];
        // The path is everything after the bucket name
        const path = parts.slice(1).join('/');

        if (bucketName && path) {
          const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucketName}/${path}`;
          return publicUrl;
        }
      }
    }

    // Fallback: use API endpoint for signed URL (for private buckets or if image_gcs is missing)
    try {
      const response = await fetch(`/api/admin/image-url/${encodeURIComponent(String(imageId))}`);
      const result = await response.json();
      return response.ok ? result.url : null;
    } catch {
      return null;
    }
  }, []);

  // Fetch image URLs when images table is selected
  useEffect(() => {
    if (selectedTable === 'images' && data.length > 0) {
      const fetchImageUrls = async () => {
        const urlMap: Record<string, string> = {};
        await Promise.all(
          data.map(async (row) => {
            const imageId = String(row.internal_reference_number);
            const url = await getImageUrl(row);
            if (url) {
              urlMap[imageId] = url;
            }
          })
        );
        setImageUrls(urlMap);
      };
      fetchImageUrls();
    } else {
      setImageUrls({});
    }
  }, [data, selectedTable, getImageUrl]);

  const handleImageClick = (imageUrl: string) => {
    setSelectedImageUrl(imageUrl);
    setImageDialogOpen(true);
  };

  const handleStatueToggle = async (statueId: number) => {
    const newExpanded = new Set(expandedStatues);

    if (newExpanded.has(statueId)) {
      // Collapse - remove from set
      newExpanded.delete(statueId);
      setExpandedStatues(newExpanded);
    } else {
      // Expand - fetch images for this statue
      newExpanded.add(statueId);
      setExpandedStatues(newExpanded);

      // If images not already loaded, fetch them
      if (!statueImages[statueId]) {
        setLoadingImages((prev) => ({ ...prev, [statueId]: true }));
        try {
          const response = await fetch(`/api/admin/db-view/images`);
          const result = await response.json();
          if (response.ok && result.data) {
            // Filter images for this statue_id
            const imagesForStatue = result.data.filter((img: RowData) => img.statue_id === statueId);
            setStatueImages((prev) => ({ ...prev, [statueId]: imagesForStatue }));

            // Fetch image URLs for these images
            const urlMap: Record<string, string> = {};
            await Promise.all(
              imagesForStatue.map(async (row: RowData) => {
                const imageId = String(row.internal_reference_number);
                const url = await getImageUrl(row);
                if (url) {
                  urlMap[imageId] = url;
                }
              })
            );
            setImageUrls((prev) => ({ ...prev, ...urlMap }));
          }
        } catch (error) {
          console.error('Failed to fetch images for statue:', error);
        } finally {
          setLoadingImages((prev) => ({ ...prev, [statueId]: false }));
        }
      }
    }
  };

  const renderFormField = (col: string, isEdit: boolean) => {
    const primaryKey = getPrimaryKey();
    const isPrimaryKey = col === primaryKey;
    const fkMappings = FOREIGN_KEY_MAPPINGS[selectedTable];
    const fkMapping = fkMappings?.[col];

    // If this is a foreign key field, render a Select dropdown
    if (fkMapping) {
      const referencedData = foreignKeyData[fkMapping.referencedTable] || [];
      const currentValue = formData[col];
      // Convert to string for Select component, handle null/undefined
      const selectValue =
        currentValue === null || currentValue === undefined || currentValue === '' ? '' : String(currentValue);

      return (
        <FormControl key={col} fullWidth>
          <InputLabel>{col}</InputLabel>
          <Select
            value={selectValue}
            label={col}
            onChange={(e) => {
              const newValue =
                e.target.value === '' ? null : isNaN(Number(e.target.value)) ? e.target.value : Number(e.target.value);
              setFormData({ ...formData, [col]: newValue });
            }}
            disabled={isPrimaryKey}
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {referencedData.map((row: RowData) => {
              const id = row[fkMapping.idField];
              const display = row[fkMapping.displayField] ?? id;
              return (
                <MenuItem key={String(id)} value={String(id)}>
                  {String(display)} (ID: {String(id)})
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
      );
    }

    // Otherwise, render a TextField
    return (
      <TextField
        key={col}
        label={col}
        value={formData[col] ?? ''}
        onChange={(e) => setFormData({ ...formData, [col]: e.target.value })}
        disabled={isPrimaryKey}
        fullWidth
        multiline={typeof formData[col] === 'string' && formData[col]?.length > 50}
        rows={typeof formData[col] === 'string' && formData[col]?.length > 50 ? 3 : 1}
        placeholder={isPrimaryKey && !isEdit ? 'Auto-generated' : `Enter ${col}`}
      />
    );
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Box
        component="main"
        sx={{
          pt: { xs: 6, md: 8 },
          pb: 6,
        }}
      >
        <Container maxWidth="xl">
          <Stack spacing={3} mb={4}>
            <Button
              variant="outlined"
              component={Link}
              href="/admin/admin-review"
              startIcon={<ImageSearch />}
              sx={{ alignSelf: 'flex-start' }}
            >
              Pending Images
            </Button>
            <Typography component="h1" variant="h4" fontWeight={700} color="text.primary">
              Database Admin View
            </Typography>
            <Typography variant="body1" color="text.secondary">
              View and manage database records. Select a table to view its data.
            </Typography>

            <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Select Table</InputLabel>
                <Select value={selectedTable} label="Select Table" onChange={(e) => handleTableChange(e.target.value)}>
                  {TABLES.map((table) => (
                    <MenuItem key={table.value} value={table.value}>
                      {table.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Removed images filter since images table is now integrated into statues */}

              <Button variant="contained" startIcon={<Add />} onClick={handleAdd} disabled={!selectedTable}>
                Add Record
              </Button>

              <IconButton onClick={fetchData} disabled={loading}>
                <Refresh />
              </IconButton>
            </Stack>

            {error && (
              <Alert severity="error" onClose={() => setError(null)}>
                {error}
              </Alert>
            )}
          </Stack>

          {loading ? (
            <Stack alignItems="center" justifyContent="center" sx={{ minHeight: '50vh' }}>
              <CircularProgress color="secondary" />
            </Stack>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    {selectedTable === 'statues' && (
                      <TableCell key="expand" sx={{ fontWeight: 600, width: '50px' }}>
                        {/* Empty header for expand column */}
                      </TableCell>
                    )}
                    {selectedTable === 'images' && (
                      <TableCell key="preview" sx={{ fontWeight: 600 }}>
                        Preview
                      </TableCell>
                    )}
                    {columns.map((col) => (
                      <TableCell key={col} sx={{ fontWeight: 600 }}>
                        {col}
                      </TableCell>
                    ))}
                    <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredData.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={
                          columns.length + (selectedTable === 'statues' ? 2 : selectedTable === 'images' ? 2 : 1)
                        }
                        align="center"
                      >
                        <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                          {data.length === 0
                            ? 'No data available'
                            : selectedTable === 'images' && statueIdFilter
                              ? `No images found for statue ID: ${statueIdFilter}`
                              : 'No data available'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredData.map((row, index) => {
                      const primaryKey = getPrimaryKey();
                      const rowKey = row[primaryKey] ?? index;
                      const imageId = selectedTable === 'images' ? String(row.internal_reference_number) : null;
                      const imageUrl = imageId ? imageUrls[imageId] : null;
                      const isStatueRow = selectedTable === 'statues';
                      const statueId = isStatueRow ? Number(row.statue_id) : null;
                      const isExpanded = statueId !== null && expandedStatues.has(statueId);
                      const imagesForStatue = statueId ? statueImages[statueId] || [] : [];
                      const isLoadingImages = statueId ? loadingImages[statueId] : false;

                      return (
                        <>
                          <TableRow key={String(rowKey)} hover>
                            {isStatueRow && (
                              <TableCell>
                                <IconButton
                                  size="small"
                                  onClick={() => statueId !== null && handleStatueToggle(statueId)}
                                  disabled={isLoadingImages}
                                >
                                  {isExpanded ? <ExpandLess /> : <ExpandMore />}
                                </IconButton>
                              </TableCell>
                            )}
                            {selectedTable === 'images' && (
                              <TableCell key="preview" sx={{ padding: '8px', width: '200px', minWidth: '200px' }}>
                                {imageUrl ? (
                                  <Box
                                    sx={{
                                      position: 'relative',
                                      width: '100%',
                                      height: '180px',
                                      borderRadius: '4px',
                                      overflow: 'hidden',
                                      cursor: 'pointer',
                                      bgcolor: 'grey.100',
                                      '&:hover': {
                                        opacity: 0.9,
                                        '& .expand-button': {
                                          bgcolor: 'rgba(0, 0, 0, 0.8)',
                                        },
                                      },
                                    }}
                                    onClick={() => handleImageClick(imageUrl)}
                                  >
                                    <CardMedia
                                      component="img"
                                      image={imageUrl}
                                      alt="Preview"
                                      sx={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'contain',
                                        bgcolor: 'grey.50',
                                      }}
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = '/image-404-placeholder.avif';
                                      }}
                                    />
                                    <IconButton
                                      size="small"
                                      className="expand-button"
                                      sx={{
                                        position: 'absolute',
                                        top: 4,
                                        right: 4,
                                        bgcolor: 'rgba(0, 0, 0, 0.6)',
                                        color: 'white',
                                        '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.8)' },
                                      }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleImageClick(imageUrl);
                                      }}
                                      aria-label="Expand image"
                                    >
                                      <Fullscreen fontSize="small" />
                                    </IconButton>
                                  </Box>
                                ) : (
                                  <Box
                                    sx={{
                                      width: '100%',
                                      height: '180px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      bgcolor: 'grey.100',
                                      borderRadius: '4px',
                                    }}
                                  >
                                    <CircularProgress size={40} sx={{ color: 'error.main' }} />
                                  </Box>
                                )}
                              </TableCell>
                            )}
                            {columns.map((col) => {
                              const cellValue = row[col];
                              const isObject = typeof cellValue === 'object' && cellValue !== null;
                              const stringValue = isObject ? JSON.stringify(cellValue) : String(cellValue ?? '');
                              const needsTruncation =
                                shouldTruncate(selectedTable, col) && stringValue.length > MAX_PREVIEW_LENGTH;

                              const cellContent = needsTruncation ? truncateText(stringValue) : stringValue;

                              return (
                                <TableCell
                                  key={col}
                                  sx={{
                                    maxWidth: needsTruncation ? '300px' : 'none',
                                    overflow: needsTruncation ? 'hidden' : 'visible',
                                    textOverflow: needsTruncation ? 'ellipsis' : 'clip',
                                    whiteSpace: needsTruncation ? 'nowrap' : 'normal',
                                    position: 'relative',
                                    padding: needsTruncation ? 0 : undefined,
                                  }}
                                >
                                  {needsTruncation ? (
                                    <Tooltip
                                      title={stringValue}
                                      arrow
                                      placement="top-start"
                                      componentsProps={{
                                        tooltip: {
                                          sx: {
                                            maxWidth: '500px',
                                            whiteSpace: 'normal',
                                          },
                                        },
                                        arrow: {
                                          sx: {
                                            color: 'rgba(0, 0, 0, 0.76)',
                                          },
                                        },
                                      }}
                                    >
                                      <Box
                                        component="span"
                                        sx={{
                                          display: 'block',
                                          width: '100%',
                                          minHeight: '100%',
                                          cursor: 'help',
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis',
                                          padding: '16px',
                                          boxSizing: 'border-box',
                                        }}
                                      >
                                        {cellContent}
                                      </Box>
                                    </Tooltip>
                                  ) : (
                                    cellContent
                                  )}
                                </TableCell>
                              );
                            })}
                            <TableCell>
                              <Stack direction="row" spacing={1}>
                                <IconButton size="small" color="primary" onClick={() => handleEdit(row)}>
                                  <Edit fontSize="small" />
                                </IconButton>
                                <IconButton size="small" color="error" onClick={() => handleDeleteClick(row)}>
                                  <Delete fontSize="small" />
                                </IconButton>
                              </Stack>
                            </TableCell>
                          </TableRow>
                          {/* Expanded images rows for statues */}
                          {isStatueRow && isExpanded && (
                            <>
                              {isLoadingImages ? (
                                <TableRow>
                                  <TableCell colSpan={columns.length + 2} align="center">
                                    <CircularProgress size={24} />
                                  </TableCell>
                                </TableRow>
                              ) : imagesForStatue.length === 0 ? (
                                <TableRow>
                                  <TableCell colSpan={columns.length + 2} align="center" sx={{ bgcolor: 'grey.50' }}>
                                    <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                                      No images found for this statue
                                    </Typography>
                                  </TableCell>
                                </TableRow>
                              ) : (
                                <>
                                  {/* Image column headers */}
                                  {imagesForStatue.length > 0 &&
                                    (() => {
                                      const firstImage = imagesForStatue[0];
                                      const imageColumns = Object.keys(firstImage).filter(
                                        (col) => col !== 'is_deleted'
                                      );
                                      return (
                                        <TableRow sx={{ bgcolor: 'grey.100' }}>
                                          <TableCell /> {/* Empty cell for expand column */}
                                          <TableCell sx={{ fontWeight: 600 }}>Preview</TableCell>
                                          {imageColumns.map((col) => (
                                            <TableCell key={`header-${col}`} sx={{ fontWeight: 600 }}>
                                              {col}
                                            </TableCell>
                                          ))}
                                          {/* Add empty cells if image columns are fewer than statue columns */}
                                          {imageColumns.length < columns.length &&
                                            Array.from({ length: columns.length - imageColumns.length }).map(
                                              (_, idx) => <TableCell key={`empty-header-${idx}`} />
                                            )}
                                          <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                                        </TableRow>
                                      );
                                    })()}
                                  {/* Image data rows */}
                                  {imagesForStatue.map((imageRow) => {
                                    const imgId = String(imageRow.internal_reference_number);
                                    const imgUrl = imageUrls[imgId];
                                    // Get image columns (excluding is_deleted)
                                    const imageColumns = Object.keys(imageRow).filter((col) => col !== 'is_deleted');
                                    // Calculate how many columns we need to span
                                    // Header has: expand (1) + statue columns (columns.length) + actions (1) = columns.length + 2
                                    // Image row needs: expand (1) + preview (1) + image columns (imageColumns.length) + actions (1)
                                    // But we need to match the header structure, so we'll show preview + image columns
                                    // and span the rest to match statue columns

                                    return (
                                      <TableRow key={`img-${imgId}`} sx={{ bgcolor: 'grey.50' }}>
                                        <TableCell /> {/* Empty cell for expand column */}
                                        <TableCell sx={{ padding: '8px', width: '200px', minWidth: '200px' }}>
                                          {imgUrl ? (
                                            <Box
                                              sx={{
                                                position: 'relative',
                                                width: '100%',
                                                height: '180px',
                                                borderRadius: '4px',
                                                overflow: 'hidden',
                                                cursor: 'pointer',
                                                bgcolor: 'grey.100',
                                                '&:hover': {
                                                  opacity: 0.9,
                                                  '& .expand-button': {
                                                    bgcolor: 'rgba(0, 0, 0, 0.8)',
                                                  },
                                                },
                                              }}
                                              onClick={() => handleImageClick(imgUrl)}
                                            >
                                              <CardMedia
                                                component="img"
                                                image={imgUrl}
                                                alt="Preview"
                                                sx={{
                                                  width: '100%',
                                                  height: '100%',
                                                  objectFit: 'contain',
                                                  bgcolor: 'grey.50',
                                                }}
                                                onError={(e) => {
                                                  const target = e.target as HTMLImageElement;
                                                  target.src = '/image-404-placeholder.avif';
                                                }}
                                              />
                                              <IconButton
                                                size="small"
                                                className="expand-button"
                                                sx={{
                                                  position: 'absolute',
                                                  top: 4,
                                                  right: 4,
                                                  bgcolor: 'rgba(0, 0, 0, 0.6)',
                                                  color: 'white',
                                                  '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.8)' },
                                                }}
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleImageClick(imgUrl);
                                                }}
                                                aria-label="Expand image"
                                              >
                                                <Fullscreen fontSize="small" />
                                              </IconButton>
                                            </Box>
                                          ) : isLoadingImages ? (
                                            <Box
                                              sx={{
                                                width: '100%',
                                                height: '180px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                bgcolor: 'grey.100',
                                                borderRadius: '4px',
                                              }}
                                            >
                                              <CircularProgress size={40} />
                                            </Box>
                                          ) : (
                                            <Box
                                              sx={{
                                                width: '100%',
                                                height: '180px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                bgcolor: 'grey.100',
                                                borderRadius: '4px',
                                              }}
                                            >
                                              <Typography variant="body2" color="text.secondary">
                                                No preview
                                              </Typography>
                                            </Box>
                                          )}
                                        </TableCell>
                                        {/* Render image columns - show all image columns */}
                                        {imageColumns.map((col) => {
                                          const cellValue = imageRow[col];
                                          const isObject = typeof cellValue === 'object' && cellValue !== null;
                                          const stringValue = isObject
                                            ? JSON.stringify(cellValue)
                                            : String(cellValue ?? '');
                                          const needsTruncation =
                                            shouldTruncate('images', col) && stringValue.length > MAX_PREVIEW_LENGTH;
                                          const cellContent = needsTruncation ? truncateText(stringValue) : stringValue;

                                          return (
                                            <TableCell
                                              key={col}
                                              sx={{
                                                maxWidth: needsTruncation ? '300px' : 'none',
                                                overflow: needsTruncation ? 'hidden' : 'visible',
                                                textOverflow: needsTruncation ? 'ellipsis' : 'clip',
                                                whiteSpace: needsTruncation ? 'nowrap' : 'normal',
                                              }}
                                            >
                                              {needsTruncation ? (
                                                <Tooltip title={stringValue} arrow placement="top-start">
                                                  <Box component="span" sx={{ cursor: 'help' }}>
                                                    {cellContent}
                                                  </Box>
                                                </Tooltip>
                                              ) : (
                                                cellContent
                                              )}
                                            </TableCell>
                                          );
                                        })}
                                        {/* If image columns are fewer than statue columns, add empty cells to match */}
                                        {imageColumns.length < columns.length &&
                                          Array.from({ length: columns.length - imageColumns.length }).map((_, idx) => (
                                            <TableCell key={`empty-${idx}`} />
                                          ))}
                                        <TableCell>
                                          <Stack direction="row" spacing={1}>
                                            <IconButton
                                              size="small"
                                              color="primary"
                                              onClick={() => handleEdit(imageRow)}
                                            >
                                              <Edit fontSize="small" />
                                            </IconButton>
                                            <IconButton
                                              size="small"
                                              color="error"
                                              onClick={() => handleDeleteClick(imageRow)}
                                            >
                                              <Delete fontSize="small" />
                                            </IconButton>
                                          </Stack>
                                        </TableCell>
                                      </TableRow>
                                    );
                                  })}
                                </>
                              )}
                            </>
                          )}
                        </>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Container>
      </Box>

      {/* Edit Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false);
          setDialogError(null);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Record</DialogTitle>
        <DialogContent ref={editDialogContentRef}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {dialogError && (
              <Alert severity="error" onClose={() => setDialogError(null)}>
                {dialogError}
              </Alert>
            )}
            {columns.map((col) => renderFormField(col, true))}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setEditDialogOpen(false);
              setDialogError(null);
            }}
          >
            Cancel
          </Button>
          <Button onClick={() => handleSave(true)} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Dialog */}
      <Dialog
        open={addDialogOpen}
        onClose={() => {
          setAddDialogOpen(false);
          setDialogError(null);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Add New Record</DialogTitle>
        <DialogContent ref={addDialogContentRef}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {dialogError && (
              <Alert severity="error" onClose={() => setDialogError(null)}>
                {dialogError}
              </Alert>
            )}
            {columns.map((col) => renderFormField(col, false))}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setAddDialogOpen(false);
              setDialogError(null);
            }}
          >
            Cancel
          </Button>
          <Button onClick={() => handleSave(false)} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Image Preview Dialog */}
      <Dialog
        open={imageDialogOpen}
        onClose={() => {
          setImageDialogOpen(false);
          setSelectedImageUrl(null);
        }}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: 'rgba(0, 0, 0, 0.9)',
          },
        }}
      >
        <DialogContent sx={{ padding: 0, position: 'relative' }}>
          {selectedImageUrl && (
            <>
              <IconButton
                onClick={() => {
                  setImageDialogOpen(false);
                  setSelectedImageUrl(null);
                }}
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  bgcolor: 'rgba(255, 255, 255, 0.9)',
                  zIndex: 1,
                  '&:hover': { bgcolor: 'rgba(255, 255, 255, 1)' },
                }}
                aria-label="Close"
              >
                <Close />
              </IconButton>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  minHeight: '70vh',
                  padding: 2,
                }}
              >
                <CardMedia
                  component="img"
                  image={selectedImageUrl}
                  alt="Full size image"
                  sx={{
                    maxWidth: '100%',
                    maxHeight: '80vh',
                    objectFit: 'contain',
                  }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/image-404-placeholder.avif';
                  }}
                />
              </Box>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedTable === 'statues' && associatedImageCount !== null && associatedImageCount > 0
            ? 'Delete Warning'
            : 'Confirm Delete'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            {/* Catastrophic warning for statues with associated images */}
            {selectedTable === 'statues' && associatedImageCount !== null && associatedImageCount > 0 && (
              <Alert severity="error" icon={false}>
                <Typography variant="body2">
                  Deleting this statue will also delete {associatedImageCount} associated image
                  {associatedImageCount !== 1 ? 's' : ''} and all related records. This action cannot be undone.
                </Typography>
              </Alert>
            )}

            {/* Loading state for image count */}
            {selectedTable === 'statues' && loadingImageCount && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={16} />
                <Typography variant="body2" color="text.secondary">
                  Checking for associated images...
                </Typography>
              </Box>
            )}

            {/* Standard confirmation message */}
            <Typography>
              Are you sure you want to delete{' '}
              {rowToDelete && (
                <strong>
                  {selectedTable === 'statues'
                    ? `statue ${rowToDelete.statue_id}`
                    : selectedTable === 'images'
                      ? `image ${rowToDelete.internal_reference_number}`
                      : `record ${rowToDelete[getPrimaryKey()]}`}
                </strong>
              )}
              ?
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Yes, Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
