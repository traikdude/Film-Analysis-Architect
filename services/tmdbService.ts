const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w780';
const WIKI_API = 'https://en.wikipedia.org/api/rest_v1/page/summary';

// Key chain: localStorage key → VITE env var → hardcoded fallback
const DEFAULT_TMDB_KEY = import.meta.env.VITE_TMDB_API_KEY || 'd6fe5f56f5f9bd2d72dcd5ff3a4a46bd';

// ─── Source 1: TMDB ───────────────────────────────────────────────────────────
const fetchFromTMDB = async (title: string, year: string, userKey?: string): Promise<string> => {
  const key = userKey || DEFAULT_TMDB_KEY;
  if (!key || !title) return '';
  try {
    const yearParam = year ? `&year=${year}` : '';
    const url = `${TMDB_BASE}/search/movie?api_key=${key}&query=${encodeURIComponent(title)}${yearParam}&language=en-US&page=1`;
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`TMDB ${res.status} for "${title}"`);
      return '';
    }
    const data = await res.json();
    const movie = data.results?.[0];
    if (movie?.poster_path) {
      const url = `${TMDB_IMAGE_BASE}${movie.poster_path}`;
      console.log(`✅ TMDB poster: "${title}" → ${url}`);
      return url;
    }
  } catch (e) {
    console.warn(`TMDB lookup failed for "${title}":`, e);
  }
  return '';
};

// ─── Source 2: Wikipedia REST API (no key, CORS-open) ────────────────────────
// Wikipedia articles about films typically use the theatrical poster as main image.
const fetchFromWikipedia = async (title: string, year: string): Promise<string> => {
  // Try the most common Wikipedia title patterns for films
  const candidates = [
    `${title} (${year} film)`,
    `${title} (film)`,
    title,
  ];
  for (const slug of candidates) {
    try {
      const res = await fetch(
        `${WIKI_API}/${encodeURIComponent(slug)}`,
        { headers: { Accept: 'application/json' } }
      );
      if (!res.ok) continue;
      const data = await res.json();
      // Require it to actually be about a film (basic sanity check)
      const desc = (data.description || data.extract || '').toLowerCase();
      const isFilm = desc.includes('film') || desc.includes('movie') || desc.includes('directed');
      if (data.thumbnail?.source && isFilm) {
        // Upgrade to a larger version — Wikipedia thumbnails use /NNpx- pattern
        const posterUrl = data.thumbnail.source.replace(/\/\d+px-/, '/500px-');
        console.log(`✅ Wikipedia poster: "${title}" (${slug}) → ${posterUrl}`);
        return posterUrl;
      }
    } catch (e) {
      // try next candidate
    }
  }
  console.warn(`Wikipedia: no poster found for "${title}"`);
  return '';
};

// ─── Public API ───────────────────────────────────────────────────────────────
export const fetchMoviePoster = async (title: string, year: string, userKey?: string): Promise<string> => {
  if (!title) return '';

  // 1. Try TMDB first (highest quality, official posters)
  const tmdbUrl = await fetchFromTMDB(title, year, userKey);
  if (tmdbUrl) return tmdbUrl;

  // 2. Fall back to Wikipedia (no auth, works everywhere)
  const wikiUrl = await fetchFromWikipedia(title, year);
  if (wikiUrl) return wikiUrl;

  // 3. Give up — SwipeDeck will render the cinematic art fallback
  return '';
};

export const enrichMoviesWithPosters = async (movies: any[], userKey?: string): Promise<any[]> => {
  console.log(`🎬 Enriching ${movies.length} movies (TMDB → Wikipedia → Cinematic Art)...`);
  const enriched = await Promise.all(
    movies.map(async (movie) => {
      if (movie.image?.startsWith('http')) return movie; // already has real image
      const poster = await fetchMoviePoster(movie.title, movie.year, userKey);
      return poster ? { ...movie, image: poster } : movie;
    })
  );
  const withPosters = enriched.filter(m => m.image?.startsWith('http')).length;
  console.log(`🎬 Enrichment done: ${withPosters}/${movies.length} movies got real posters.`);
  return enriched;
};
