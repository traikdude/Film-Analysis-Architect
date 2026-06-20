const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

// Built-in key baked at build time — always available as fallback
const DEFAULT_TMDB_KEY = import.meta.env.VITE_TMDB_API_KEY || '';

export const fetchMoviePoster = async (title: string, year: string, userKey?: string): Promise<string> => {
  const key = userKey || DEFAULT_TMDB_KEY;
  if (!key || !title) return '';
  try {
    const yearParam = year ? `&year=${year}` : '';
    const url = `${TMDB_BASE}/search/movie?api_key=${key}&query=${encodeURIComponent(title)}${yearParam}&language=en-US&page=1`;
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`TMDB API error ${res.status} for "${title}"`);
      return '';
    }
    const data = await res.json();
    const movie = data.results?.[0];
    if (movie?.poster_path) {
      const posterUrl = `${TMDB_IMAGE_BASE}${movie.poster_path}`;
      console.log(`✅ TMDB poster found for "${title}": ${posterUrl}`);
      return posterUrl;
    }
    console.warn(`TMDB: no poster_path for "${title}"`);
  } catch (e) {
    console.warn(`TMDB lookup failed for "${title}":`, e);
  }
  return '';
};

export const enrichMoviesWithPosters = async (movies: any[], userKey?: string): Promise<any[]> => {
  // No early bail — DEFAULT_TMDB_KEY handles the case when userKey is empty
  console.log(`Enriching ${movies.length} movies with TMDB posters...`);
  const enriched = await Promise.all(
    movies.map(async (movie) => {
      if (movie.image && movie.image.startsWith('http')) return movie; // already has real image
      const poster = await fetchMoviePoster(movie.title, movie.year, userKey);
      return poster ? { ...movie, image: poster } : movie;
    })
  );
  const withPosters = enriched.filter(m => m.image?.startsWith('http')).length;
  console.log(`TMDB enrichment complete: ${withPosters}/${movies.length} movies got posters.`);
  return enriched;
};
