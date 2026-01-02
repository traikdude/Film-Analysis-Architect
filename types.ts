
export interface SubGenre {
  id: string;
  name: string;
}

export interface GenreCategory {
  id: string;
  name: string;
  subcategories?: {
    name: string; // e.g., "Supernatural Horror", "Psychological Horror"
    options: string[];
  }[];
  // For categories without nested groups (like Action in the prompt implies a flat list under Action)
  options?: string[];
}

export interface Theme {
  id: string;
  name: string;
  primary: string; // e.g. 'pink'
  secondary: string; // e.g. 'orange'
  accent: string; // e.g. 'violet'
  bgGradient: string; // for panels
  appBg: string; // for main background
  buttonGradient: string;
  textGradient: string;
}

export interface AppState {
  startYear: string;
  endYear: string;
  selectedGenres: Record<string, boolean>; // Category ID -> boolean
  selectedSubGenres: Record<string, string[]>; // Category ID -> list of selected subgenre strings
  themeId: string;
}

export type AnalysisStatus = 'idle' | 'generating' | 'completed' | 'error';
