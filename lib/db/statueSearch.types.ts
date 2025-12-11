export type YearRange = {
  start?: number | null;
  end?: number | null;
};

export interface MainSearchFilters {
  subject?: string | null;
  dealer?: string | null;
  suspectedCurrentLocation?: string | null;
  titleOfObject?: string | null;
  photographLocation?: string | null;
  yearFirstKnownAppearance?: YearRange | null;
  yearFirstKnownAppearanceOutsideCambodia?: YearRange | null;
  repatriated?: boolean | null;
}

export interface AdvancedSearchFilters {
  imageSource?: string | null;
  material?: string | null;
  basePresent?: boolean | null;
  inscription?: boolean | null;
  multipleHeads?: boolean | null;
  fragmentary?: boolean | null;
  numberOfArms?: number | null;
  limbsPresent?: string[];
  partsFragmented?: string[];
}

export interface StatueSearchFilters {
  main?: MainSearchFilters | null;
  advanced?: AdvancedSearchFilters | null;
}

export type StatueSearchRow = {
  statue_id: number;
  title: string | null;
  description: string | null;
  provenance_history: string | null;
  first_known_appearance_year: number | null;
  first_known_appearance_outside_cambodia_year: number | null;
  arm_number: number | null;
  material: string | null;
  original_location: string | null;
  original_country: string | null;
  current_location: string | null;
  current_country: string | null;
  last_mentioned_date: Date | null;
  current_location_link: string | null;
  subjects: string[] | null;
  attributes: string[] | null;
  images: Array<{
    id: string;
    url: string | null;
    source: string | null;
    photographLocation: string | null;
    photographCountry: string | null;
    gcsPath?: string | null;
  }> | null;
  dealer_history: Array<{
    dealer: string | null;
    auctionName: string | null;
    auctionDate: Date | null;
    lotNumber: string | null;
  }> | null;
};
