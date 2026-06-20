const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w780';
const WIKI_API = 'https://en.wikipedia.org/api/rest_v1/page/summary';

// v4 Bearer token (preferred) — read at call time so Settings panel saves take effect immediately
const getBearerToken = (): string =>
  localStorage.getItem('tmdb_bearer_token') ||
  import.meta.env.VITE_TMDB_BEARER_TOKEN ||
  '';

// v3 API key fallback (legacy — used only if no bearer token found)
const getApiKey = (): string =>
  localStorage.getItem('tmdb_api_key') ||
  import.meta.env.VITE_TMDB_API_KEY ||
  'd6fe5f56f5f9bd2d72dcd5ff3a4a46bd';

// ─── Source 1: TMDB (v4 Bearer OR v3 API key) ────────────────────────────────
const fetchFromTMDB = async (title: string, year: string): Promise<string> => {
  if (!title) return '';
  try {
    const bearer = getBearerToken();
    const yearParam = year ? `&year=${year}` : '';

    let url: string;
    let headers: Record<string, string> = { 'Content-Type': 'application/json' };

    if (bearer) {
      // ✅ v4 OAuth — Bearer token in Authorization header (no key in URL)
      url = `${TMDB_BASE}/search/movie?query=${encodeURIComponent(title)}${yearParam}&language=en-US&page=1`;
      headers['Authorization'] = `Bearer ${bearer}`;
      console.log(`🔑 TMDB v4 Bearer fetch for "${title}"`);
    } else {
      // ⚠️ v3 fallback — API key in URL param
      const key = getApiKey();
      url = `${TMDB_BASE}/search/movie?api_key=${key}&query=${encodeURIComponent(title)}${yearParam}&language=en-US&page=1`;
      console.log(`🔑 TMDB v3 key fetch for "${title}"`);
    }

    const res = await fetch(url, { headers });
    if (!res.ok) {
      console.warn(`TMDB ${res.status} for "${title}"`);
      return '';
    }
    const data = await res.json();
    const movie = data.results?.[0];
    if (movie?.poster_path) {
      const posterUrl = `${TMDB_IMAGE_BASE}${movie.poster_path}`;
      console.log(`✅ TMDB poster: "${title}" → ${posterUrl}`);
      return posterUrl;
    }
    console.warn(`TMDB: no poster_path for "${title}"`);
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
export const fetchMoviePoster = async (title: string, year: string): Promise<string> => {
  if (!title) return '';

  // 1. Try TMDB (v4 Bearer → v3 key → skip if neither available)
  const tmdbUrl = await fetchFromTMDB(title, year);
  if (tmdbUrl) return tmdbUrl;

  // 2. Wikipedia fallback (zero auth, works everywhere)
  const wikiUrl = await fetchFromWikipedia(title, year);
  if (wikiUrl) return wikiUrl;

  // 3. Give up — SwipeDeck renders genre-keyed cinematic art
  return '';
};

export const enrichMoviesWithPosters = async (movies: any[]): Promise<any[]> => {
  console.log(`🎬 Enriching ${movies.length} movies (TMDB v4 → Wikipedia → Cinematic Art)...`);
  const enriched = await Promise.all(
    movies.map(async (movie) => {
      if (movie.image?.startsWith('http')) return movie;
      const poster = await fetchMoviePoster(movie.title, movie.year);
      return poster ? { ...movie, image: poster } : movie;
    })
  );
  const withPosters = enriched.filter(m => m.image?.startsWith('http')).length;
  console.log(`🎬 Done: ${withPosters}/${movies.length} movies got real posters.`);
  return enriched;
};
