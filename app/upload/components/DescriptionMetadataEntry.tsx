import React from 'react';
import { Stack, Tabs, Tab, TextField, Tooltip, InputAdornment, Alert } from '@mui/material';
import ManualMetadataForm from './ManualMetadataForm';
import { themeTokens } from '@/app/theme';

import type { BasicSearchMetadata, AdvancedSearchMetadata } from '@/app/types/metadata.types';

type DescriptionMetadataEntryProps = {
  metadataMode: 'ai' | 'manual';
  setMetadataMode: (mode: 'ai' | 'manual') => void;
  shortDescription: string;
  setShortDescription: (desc: string) => void;
  longDescription: string;
  setLongDescription: (desc: string) => void;
  miscInformation: string;
  setMiscInformation: (value: string) => void;
  descriptionError: string | null;
  setDescriptionError: (err: string | null) => void;
  manualBasic: Partial<BasicSearchMetadata>;
  setManualBasic: React.Dispatch<React.SetStateAction<Partial<BasicSearchMetadata>>>;
  manualAdvanced: Partial<AdvancedSearchMetadata>;
  setManualAdvanced: React.Dispatch<React.SetStateAction<Partial<AdvancedSearchMetadata>>>;
};

export default function DescriptionMetadataEntry({
  metadataMode,
  setMetadataMode,
  shortDescription,
  setShortDescription,
  longDescription,
  setLongDescription,
  miscInformation,
  setMiscInformation,
  descriptionError,
  setDescriptionError,
  manualBasic,
  setManualBasic,
  manualAdvanced,
  setManualAdvanced,
}: DescriptionMetadataEntryProps) {
  return (
    <Stack spacing={2} sx={{ mt: 2 }}>
      {descriptionError && (
        <Alert severity="error" onClose={() => setDescriptionError(null)}>
          {descriptionError}
        </Alert>
      )}
      <Tabs
        value={metadataMode}
        onChange={(_, v) => setMetadataMode(v as 'ai' | 'manual')}
        aria-label="Metadata mode tabs"
        sx={{ mb: 1 }}
      >
        <Tab value="ai" label="Long Description Metadata Entry" />
        <Tab value="manual" label="Manual Metadata Entry" />
      </Tabs>
      <TextField
        label="Short Description"
        value={shortDescription}
        onChange={(e) => {
          setShortDescription(e.target.value);
          if (descriptionError) setDescriptionError(null);
        }}
        placeholder="Brief summary of the artifact"
        fullWidth
        size="small"
        variant="outlined"
        required
        error={!!descriptionError}
        sx={{ '& .MuiOutlinedInput-root': { height: '40px' } }}
      />
      {metadataMode === 'ai' && (
        <TextField
          label="Detailed Description"
          value={longDescription}
          onChange={(e) => {
            setLongDescription(e.target.value);
            if (descriptionError) setDescriptionError(null);
          }}
          placeholder="Please provide as much information as you can about this artifact (origin, history, condition, materials, provenance, etc.)"
          fullWidth
          multiline
          rows={4}
          variant="outlined"
          required
          error={!!descriptionError}
          helperText="The more details you provide, the better we can catalog and identify this artifact"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end" sx={{ pr: 3 }}>
                <Tooltip
                  title={
                    <div>
                      <strong style={{ fontSize: '1.15rem' }}>What to include in your description:</strong>
                      <ul style={{ margin: 0, paddingLeft: 22, fontSize: '1.05rem', lineHeight: 1.7 }}>
                        <li>
                          <b>Origin</b>: Where and when (gallery) was the artifact created? Suspected current location?
                        </li>
                        <li>
                          <b>History</b>: Notable events, ownership, or changes over time
                        </li>
                        <li>
                          <b>Condition</b>: Material, fragmentation points, missing limbs, original number of arms?
                        </li>
                        <li>
                          <b>Dates</b>: Year of first appearance? First appearance outside Cambodia?
                        </li>
                        <li>
                          <b>Provenance</b>: How did it leave its original location?
                        </li>
                        <li>
                          <b>Other Details</b>: Repatriated? Inscriptions? context, related artifacts
                        </li>
                      </ul>
                    </div>
                  }
                  placement="left"
                  arrow
                >
                  <span aria-label="Info" style={{ display: 'inline-flex', cursor: 'pointer' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="12" fill={themeTokens.secondaryBlue} />
                      <text
                        x="12"
                        y="16"
                        textAnchor="middle"
                        fontSize="14"
                        fill="#fff"
                        fontFamily="Arial"
                        fontWeight="bold"
                      >
                        i
                      </text>
                    </svg>
                  </span>
                </Tooltip>
              </InputAdornment>
            ),
          }}
        />
      )}
      {metadataMode === 'manual' && (
        <>
          <ManualMetadataForm
            manualBasic={manualBasic}
            setManualBasic={setManualBasic}
            manualAdvanced={manualAdvanced}
            setManualAdvanced={setManualAdvanced}
          />
          <TextField
            label="Additional Information for Reviewers"
            value={miscInformation}
            onChange={(e) => setMiscInformation(e.target.value)}
            placeholder="Optional notes that might help admins (e.g., provenance leads, contact info, storage details)"
            fullWidth
            multiline
            minRows={3}
            variant="outlined"
          />
        </>
      )}
    </Stack>
  );
}
