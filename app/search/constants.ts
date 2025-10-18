const currentYear = new Date().getFullYear();
const YEAR_SLIDER_MIN = 1900;

export const BASIC_FIELDS = [
  {
    id: 'subject',
    label: 'Subject',
    type: 'text',
    placeholder: 'e.g. Vishnu',
  },
  {
    id: 'dealerName',
    label: 'Dealer',
    type: 'text',
    placeholder: 'e.g. John Dwyer Oriental Art',
  },
  {
    id: 'suspectedCurrentColation',
    label: 'Suspected Current Location',
    type: 'text',
    placehlder: 'e.g. Getty Museum',
  },
  {
    id: 'artifactTitle',
    label: 'Title of Object',
    type: 'text',
    placeholder: 'e.g. Head of Buddha',
  },
  {
    id: 'photographLocation',
    label: 'Photograph Location',
    type: 'text',
    placeholder: 'e.g. New York',
  },
  {
    id: 'firstAppearanceYear',
    label: 'Year of First Known Appearance',
    type: 'slider',
    helperText: 'Year the artifact was first documented.',
    min: YEAR_SLIDER_MIN,
    max: currentYear,
    defaultValue: [YEAR_SLIDER_MIN, currentYear],
  },
  {
    id: 'firstAppearanceYearOutsideCambodia',
    label: 'Year of First Known Appearance Outside Cambodia',
    type: 'slider',
    helperText: 'Year the artifact was first documented.',
    min: YEAR_SLIDER_MIN,
    max: currentYear,
    defaultValue: [YEAR_SLIDER_MIN, currentYear],
  },
  {
    id: 'repatriated',
    label: 'Repatriated',
    type: 'checkbox',
  },
];

export const ADVANCED_PARAMS = [
  {
    id: 'imageSource',
    label: 'Image Source',
    type: 'text',
    helperText: 'Origin of the artifact image.',
    placeholder: 'e.g. Getty Museum',
  },
  {
    id: 'material',
    label: 'Material',
    type: 'text',
    helperText: 'Primary material composing the artifact.',
    placeholder: 'e.g. Sandstone',
  },
  {
    id: 'basePresent',
    label: 'Base Present',
    type: 'binary',
    helperText: 'Toggle to filter by artifacts that have a base present.',
  },
  {
    id: 'hasInscription',
    label: 'Inscription',
    type: 'binary',
    helperText: 'Toggle to filter by artifacts with inscriptions.',
  },
  {
    id: 'hasMultipleHeads',
    label: 'Multiple Heads',
    type: 'binary',
    helperText: 'Toggle to filter by artifacts with multiple heads.',
  },
  {
    id: 'fragmentary',
    label: 'Fragmentary',
    type: 'binary',
    helperText: 'Toggle to filter by artifacts that are fragmentary.',
  },
  {
    id: 'armNumber',
    label: 'Number of Arms',
    type: 'number',
    helperText: 'Provide the numeric arm identifier.',
    placeholder: 'e.g. 4, 8, 10...',
  },
  {
    id: 'limbsPresent',
    label: 'Limbs Present',
    type: 'text',
    helperText: 'Comma-separated list of limbs present.',
    placeholder: 'e.g. head, torso, hip-knee',
  },
  {
    id: 'partsFragmented',
    label: 'Parts Fragmented',
    type: 'text',
    helperText: 'Comma-separated list of fragmented parts. Describes exactly where the artifact has fragmented.',
    placeholder: 'e.g. neck, shoulder, upper leg',
  },
];
