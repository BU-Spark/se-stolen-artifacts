'use client';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import LaunchIcon from '@mui/icons-material/Launch';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Pagination,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';

import type { StatueSearchRow } from '@/lib/db/statueSearch.types';

type StatueFolderListProps = {
  statues: StatueSearchRow[];
  isLoading: boolean;
  error: string | null;
  hasSearched: boolean;
  onRetry?: () => void;
};

type StatueImage = NonNullable<StatueSearchRow['images']>[number];

type SelectedImage = {
  statueId: number;
  statueTitle: string;
  image: StatueImage;
};

const PAGE_SIZE = 3;
const PLACEHOLDER_IMAGE = '/image-404-placeholder.avif';

const formatDate = (value: Date | string | null | undefined) => {
  if (!value) return 'Not documented';
  try {
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return 'Not documented';
    return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(date);
  } catch {
    return 'Not documented';
  }
};

const safeText = (value: string | null | undefined, fallback = 'Not documented') =>
  value && value.trim().length > 0 ? value.trim() : fallback;

const ChipGroup = ({ label, values }: { label: string; values?: string[] | null }) => {
  if (!values || values.length === 0) {
    return null;
  }

  return (
    <Stack spacing={1.5}>
      <Typography variant="subtitle2" color="text.secondary">
        {label}
      </Typography>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        {values.map((value) => (
          <Chip
            key={`${label}-${value}`}
            label={value}
            size="small"
            sx={{ textTransform: 'capitalize' }}
            variant="outlined"
          />
        ))}
      </Stack>
    </Stack>
  );
};

const InfoItem = ({ label, value }: { label: string; value: string }) => (
  <Stack spacing={0.25}>
    <Typography variant="caption" color="text.secondary" textTransform="uppercase">
      {label}
    </Typography>
    <Typography variant="body2" color="text.primary" fontWeight={500}>
      {value}
    </Typography>
  </Stack>
);

export default function StatueFolderList({ statues, isLoading, error, hasSearched, onRetry }: StatueFolderListProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(null);

  useEffect(() => {
    setPageIndex(0);
    setExpandedId(null);
  }, [statues]);

  const totalPages = Math.max(1, Math.ceil(statues.length / PAGE_SIZE));

  useEffect(() => {
    setPageIndex((prev) => Math.min(prev, totalPages - 1));
  }, [totalPages]);

  const paginatedStatues = useMemo(
    () => statues.slice(pageIndex * PAGE_SIZE, pageIndex * PAGE_SIZE + PAGE_SIZE),
    [pageIndex, statues]
  );

  const handleToggle = (statueId: number) => {
    setExpandedId((prev) => (prev === statueId ? null : statueId));
  };

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPageIndex(value - 1);
    setExpandedId(null);
  };

  const renderState = () => {
    if (isLoading) {
      return (
        <Stack alignItems="center" justifyContent="center" sx={{ flex: 1 }} spacing={2}>
          <CircularProgress size={32} />
          <Typography variant="body2" color="text.secondary">
            Searching the artifact archive…
          </Typography>
        </Stack>
      );
    }

    if (error) {
      return (
        <Stack spacing={2} sx={{ flex: 1 }}>
          <Alert severity="error" action={onRetry ? <Button onClick={onRetry}>Retry</Button> : undefined}>
            {error}
          </Alert>
        </Stack>
      );
    }

    if (!statues.length) {
      return (
        <Stack spacing={1.5} sx={{ flex: 1 }} alignItems="flex-start" justifyContent="center">
          <Typography variant="h5" fontWeight={600}>
            {hasSearched ? 'No matches yet' : 'Search for potential matches'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {hasSearched
              ? 'Adjust your filters or try a broader query to discover related statues.'
              : 'Run a search to see statues grouped with their image evidence and metadata snippets.'}
          </Typography>
        </Stack>
      );
    }

    return null;
  };

  const stateView = renderState();

  if (stateView) {
    return (
      <Stack sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Header count={statues.length} />
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{stateView}</Box>
      </Stack>
    );
  }

  return (
    <Stack sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Header count={statues.length} />
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Showing {pageIndex * PAGE_SIZE + 1}-{Math.min((pageIndex + 1) * PAGE_SIZE, statues.length)} of{' '}
          {statues.length} matches
        </Typography>
        <Pagination count={totalPages} page={pageIndex + 1} onChange={handlePageChange} size="small" color="primary" />
      </Stack>
      <Box sx={{ flex: 1, overflowY: 'auto', pr: 1 }}>
        <Stack spacing={2}>
          {paginatedStatues.map((statue) => {
            const imageCount = statue.images?.length ?? 0;
            const previewImage = statue.images?.[0];
            const displayTitle = safeText(statue.title, `Untitled Artifact #${statue.statue_id}`);

            return (
              <Box
                key={statue.statue_id}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  overflow: 'hidden',
                  bgcolor: 'background.paper',
                }}
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={2}
                  sx={{ p: 2, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                  onClick={() => handleToggle(statue.statue_id)}
                >
                  <Stack spacing={0.25} sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="subtitle1" fontWeight={600} noWrap>
                      {displayTitle}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {safeText(statue.original_location, 'Original location unknown')} • {imageCount}{' '}
                      {imageCount === 1 ? 'image' : 'images'}
                    </Typography>
                  </Stack>
                  <Box
                    sx={{
                      width: 120,
                      height: 140,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      overflow: 'hidden',
                      bgcolor: 'grey.50',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      flexShrink: 0,
                    }}
                  >
                    <Box
                      component="img"
                      src={previewImage?.url ?? PLACEHOLDER_IMAGE}
                      alt={previewImage?.source ?? displayTitle}
                      sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    {imageCount === 0 && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          position: 'absolute',
                          inset: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          textAlign: 'center',
                          px: 1,
                        }}
                      >
                        No imagery yet
                      </Typography>
                    )}
                  </Box>
                  <IconButton
                    size="small"
                    sx={{ transform: expandedId === statue.statue_id ? 'rotate(180deg)' : 'none', transition: '0.2s' }}
                  >
                    <ExpandMoreIcon />
                  </IconButton>
                </Stack>
                <Collapse in={expandedId === statue.statue_id} timeout="auto" unmountOnExit>
                  <Stack spacing={3} sx={{ p: 2, pt: 0 }}>
                    <Stack spacing={3} divider={<Divider flexItem />}>
                      <Stack spacing={1.5}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Timeline & Physical Details
                        </Typography>
                        <Box
                          sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
                            gap: 2,
                          }}
                        >
                          <Box>
                            <InfoItem label="Material" value={safeText(statue.material, 'Unknown material')} />
                          </Box>
                          <Box>
                            <InfoItem
                              label="Number of arms"
                              value={statue.arm_number != null ? String(statue.arm_number) : 'Not listed'}
                            />
                          </Box>
                          <Box>
                            <InfoItem
                              label="First appearance"
                              value={
                                statue.first_known_appearance_year
                                  ? String(statue.first_known_appearance_year)
                                  : 'Unrecorded'
                              }
                            />
                          </Box>
                          <Box>
                            <InfoItem
                              label="First outside Cambodia"
                              value={
                                statue.first_known_appearance_outside_cambodia_year
                                  ? String(statue.first_known_appearance_outside_cambodia_year)
                                  : 'Unrecorded'
                              }
                            />
                          </Box>
                          <Box sx={{ gridColumn: '1 / -1' }}>
                            <InfoItem label="Last mentioned" value={formatDate(statue.last_mentioned_date)} />
                          </Box>
                        </Box>
                      </Stack>
                      <Stack spacing={1.5}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Locations & Holdings
                        </Typography>
                        <Stack spacing={2}>
                          <InfoItem label="Original location" value={safeText(statue.original_location, 'Unknown')} />
                          <Stack spacing={0.5}>
                            <InfoItem label="Current location" value={safeText(statue.current_location, 'Unknown')} />
                            {statue.current_location_link ? (
                              <Button
                                size="small"
                                variant="text"
                                color="secondary"
                                endIcon={<LaunchIcon fontSize="small" />}
                                component="a"
                                href={statue.current_location_link}
                                target="_blank"
                                rel="noreferrer"
                                sx={{ alignSelf: 'flex-start', pl: 0 }}
                              >
                                Open institution page
                              </Button>
                            ) : null}
                          </Stack>
                        </Stack>
                      </Stack>
                    </Stack>
                    <Stack spacing={2}>
                      <ChipGroup label="Subjects" values={statue.subjects ?? []} />
                      <ChipGroup label="Attributes" values={statue.attributes ?? []} />
                    </Stack>
                    <Divider />
                    <Stack spacing={1}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Provenance Summary
                      </Typography>
                      <Typography variant="body2" color="text.primary">
                        {safeText(statue.provenance_history, 'No provenance narrative has been digitized yet.')}
                      </Typography>
                    </Stack>
                    <DealerHistory dealerHistory={statue.dealer_history} />
                    <ImagesSection
                      statue={statue}
                      displayTitle={displayTitle}
                      onImageSelect={(image) =>
                        setSelectedImage({ statueId: statue.statue_id, statueTitle: displayTitle, image })
                      }
                    />
                  </Stack>
                </Collapse>
              </Box>
            );
          })}
        </Stack>
      </Box>
      <ImageMetadataDialog selectedImage={selectedImage} onClose={() => setSelectedImage(null)} />
    </Stack>
  );
}

const Header = ({ count }: { count: number }) => (
  <Stack spacing={0} sx={{ flexShrink: 0, pb: 2 }}>
    <Stack spacing={0.5} sx={{ mb: 2 }}>
      <Typography component="h1" variant="h4" fontWeight={600}>
        Potential Matches
      </Typography>
      <Typography color="text.secondary" variant="body2">
        Review statues grouped with their images, attributes, and dealer history. {count} total match
        {count === 1 ? '' : 'es'}.
      </Typography>
    </Stack>
    <Divider />
  </Stack>
);

const DealerHistory = ({ dealerHistory }: { dealerHistory: StatueSearchRow['dealer_history'] }) => {
  if (!dealerHistory || dealerHistory.length === 0) {
    return (
      <Stack spacing={1}>
        <Divider />
        <Typography variant="subtitle2" color="text.secondary">
          Dealer & Auction History
        </Typography>
        <Typography variant="body2" color="text.secondary">
          No dealer records are associated with this statue yet.
        </Typography>
      </Stack>
    );
  }

  return (
    <Stack spacing={1.5}>
      <Divider />
      <Typography variant="subtitle2" color="text.secondary">
        Dealer & Auction History
      </Typography>
      <Stack spacing={1.25}>
        {dealerHistory.map((entry, index) => (
          <Box
            key={`${entry.dealer ?? index}-${entry.lotNumber ?? index}`}
            sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1.5, p: 1.5 }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
              <Stack spacing={0.5}>
                <Typography variant="body2" fontWeight={600}>
                  {safeText(entry.dealer, 'Unknown dealer')}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {safeText(entry.auctionName, 'Auction name unavailable')}
                </Typography>
              </Stack>
              <Stack spacing={0.25} textAlign="right">
                <Typography variant="caption" color="text.secondary">
                  Lot
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {safeText(entry.lotNumber, '—')}
                </Typography>
              </Stack>
            </Stack>
            <Typography variant="caption" color="text.secondary">
              {entry.auctionDate ? formatDate(entry.auctionDate) : 'Date not recorded'}
            </Typography>
          </Box>
        ))}
      </Stack>
    </Stack>
  );
};

const ImagesSection = ({
  statue,
  displayTitle,
  onImageSelect,
}: {
  statue: StatueSearchRow;
  displayTitle: string;
  onImageSelect: (image: StatueImage) => void;
}) => {
  const images = statue.images ?? [];

  return (
    <Stack spacing={1.5}>
      <Stack direction="row" alignItems="center" spacing={1}>
        <Typography variant="subtitle2" color="text.secondary">
          Image Evidence
        </Typography>
        <Tooltip title="Each capture reveals when and where the statue was documented.">
          <InfoOutlinedIcon fontSize="small" color="action" />
        </Tooltip>
      </Stack>
      {images.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No imagery has been linked to this statue yet.
        </Typography>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            gap: 2,
          }}
        >
          {images.map((image) => (
            <Stack
              key={image.id}
              spacing={1.25}
              sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1.5, p: 1.25 }}
            >
              <Box
                component="img"
                src={image.url ?? PLACEHOLDER_IMAGE}
                alt={image.source ?? displayTitle}
                sx={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 1 }}
              />
              <Stack spacing={0.25}>
                <Typography variant="body2" fontWeight={600} noWrap>
                  {safeText(image.source, 'Untitled capture')}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {safeText(image.photographLocation, 'Location unknown')}
                </Typography>
              </Stack>
              <Button size="small" variant="outlined" onClick={() => onImageSelect(image)}>
                View metadata
              </Button>
            </Stack>
          ))}
        </Box>
      )}
    </Stack>
  );
};

const ImageMetadataDialog = ({
  selectedImage,
  onClose,
}: {
  selectedImage: SelectedImage | null;
  onClose: () => void;
}) => (
  <Dialog open={Boolean(selectedImage)} onClose={onClose} maxWidth="sm" fullWidth>
    {selectedImage ? (
      <>
        <DialogTitle>Image metadata for {selectedImage.statueTitle}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <Box
              component="img"
              src={selectedImage.image.url ?? PLACEHOLDER_IMAGE}
              alt={selectedImage.image.source ?? selectedImage.statueTitle}
              sx={{ width: '100%', height: 320, objectFit: 'cover', borderRadius: 1 }}
            />
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip label={`Image #${selectedImage.image.id ?? '—'}`} size="small" />
              {selectedImage.image.photographLocation ? (
                <Chip
                  label={selectedImage.image.photographLocation}
                  size="small"
                  color="secondary"
                  variant="outlined"
                />
              ) : null}
              {selectedImage.image.photographCountry ? (
                <Chip label={selectedImage.image.photographCountry} size="small" variant="outlined" />
              ) : null}
            </Stack>
            <Stack spacing={0.75}>
              <InfoItem label="Source" value={safeText(selectedImage.image.source, 'Not documented')} />
              <InfoItem
                label="Photograph location"
                value={safeText(selectedImage.image.photographLocation, 'Unknown site')}
              />
              <InfoItem
                label="Photograph country"
                value={safeText(selectedImage.image.photographCountry, 'Unknown country')}
              />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
          {selectedImage.image.url ? (
            <Button
              variant="contained"
              component="a"
              href={selectedImage.image.url}
              target="_blank"
              rel="noreferrer"
              endIcon={<LaunchIcon fontSize="small" />}
            >
              Open image
            </Button>
          ) : null}
        </DialogActions>
      </>
    ) : null}
  </Dialog>
);
