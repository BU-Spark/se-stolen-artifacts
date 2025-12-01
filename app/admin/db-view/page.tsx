'use client';

import { useEffect, useState, useCallback } from 'react';
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
} from '@mui/material';
import { Add, Edit, Delete, Refresh, ImageSearch } from '@mui/icons-material';
import { useUser } from '@clerk/nextjs';

const TABLES = [
  { value: 'statues', label: 'Statues' },
  { value: 'images', label: 'Images' },
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

export default function AdminDbViewPage() {
  const { isLoaded } = useUser();
  const [selectedTable, setSelectedTable] = useState<string>('statues');
  const [data, setData] = useState<RowData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState<RowData>({});

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

  useEffect(() => {
    if (isLoaded) {
      fetchData();
    }
  }, [isLoaded, fetchData]);

  const handleTableChange = (newTable: string) => {
    setSelectedTable(newTable);
    setData([]);
  };

  const handleEdit = (row: RowData) => {
    setFormData({ ...row });
    setEditDialogOpen(true);
  };

  const handleAdd = () => {
    setFormData({});
    setAddDialogOpen(true);
  };

  const handleDelete = async (row: RowData) => {
    if (!confirm(`Are you sure you want to delete this record?`)) return;

    try {
      const primaryKey =
        selectedTable === 'statues' ? 'statue_id' : selectedTable === 'images' ? 'internal_reference_number' : 'id';
      const id = row[primaryKey];

      const response = await fetch(`/api/admin/db-view/${selectedTable}?id=${encodeURIComponent(String(id))}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete record');
      }

      await fetchData();
    } catch (deleteError: unknown) {
      const message = deleteError instanceof Error ? deleteError.message : 'Failed to delete record';
      setError(message);
    }
  };

  const handleSave = async (isEdit: boolean) => {
    try {
      const url = `/api/admin/db-view/${selectedTable}`;
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `Failed to ${isEdit ? 'update' : 'create'} record`);
      }

      setEditDialogOpen(false);
      setAddDialogOpen(false);
      setFormData({});
      await fetchData();
    } catch (saveError: unknown) {
      const message = saveError instanceof Error ? saveError.message : 'Failed to save record';
      setError(message);
    }
  };

  const getColumns = (): string[] => {
    if (data.length === 0) return [];
    return Object.keys(data[0]);
  };

  const columns = getColumns();
  const getPrimaryKey = () => {
    return selectedTable === 'statues' ? 'statue_id' : selectedTable === 'images' ? 'internal_reference_number' : 'id';
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

            <Stack direction="row" spacing={2} alignItems="center">
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
                    {columns.map((col) => (
                      <TableCell key={col} sx={{ fontWeight: 600 }}>
                        {col}
                      </TableCell>
                    ))}
                    <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={columns.length + 1} align="center">
                        <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                          No data available
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.map((row, index) => {
                      const primaryKey = getPrimaryKey();
                      const rowKey = row[primaryKey] ?? index;

                      return (
                        <TableRow key={String(rowKey)} hover>
                          {columns.map((col) => (
                            <TableCell key={col}>
                              {typeof row[col] === 'object' && row[col] !== null
                                ? JSON.stringify(row[col])
                                : String(row[col] ?? '')}
                            </TableCell>
                          ))}
                          <TableCell>
                            <Stack direction="row" spacing={1}>
                              <IconButton size="small" color="primary" onClick={() => handleEdit(row)}>
                                <Edit fontSize="small" />
                              </IconButton>
                              <IconButton size="small" color="error" onClick={() => handleDelete(row)}>
                                <Delete fontSize="small" />
                              </IconButton>
                            </Stack>
                          </TableCell>
                        </TableRow>
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
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Record</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {columns.map((col) => {
              const primaryKey = getPrimaryKey();
              const isPrimaryKey = col === primaryKey;

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
                />
              );
            })}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={() => handleSave(true)} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Dialog */}
      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add New Record</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {columns.map((col) => {
              const primaryKey = getPrimaryKey();
              const isPrimaryKey = col === primaryKey;

              return (
                <TextField
                  key={col}
                  label={col}
                  value={formData[col] ?? ''}
                  onChange={(e) => setFormData({ ...formData, [col]: e.target.value })}
                  disabled={isPrimaryKey && selectedTable !== 'images'}
                  fullWidth
                  placeholder={isPrimaryKey ? 'Auto-generated' : `Enter ${col}`}
                />
              );
            })}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>Cancel</Button>
          <Button onClick={() => handleSave(false)} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
