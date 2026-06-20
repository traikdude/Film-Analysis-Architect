
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

export interface Movie {
  rank: string;
  title: string;
  year: string;
  director: string;
  classification: string;
  runtime: string;
  image: string;
  trailer: string;
  criticalOverview: string;
  synopsis: string;
  artisticMerit: string;
  genreAnalysis: string;
  culturalImpact: string;
  keyThemes: string[];
  technicalElements: string[];
}

export interface CurationSession {
  id: string;            // crypto UUID
  createdAt: string;     // ISO 8601 timestamp
  label: string;         // e.g. "Horror · Sci-Fi · 2018–2025"
  genres: string[];      // human-readable genre names
  yearRange: string;     // e.g. "2018 – 2025"
  movieCount: number;
  movies: Movie[];
}
