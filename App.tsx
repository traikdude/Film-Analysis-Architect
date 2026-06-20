import React, { useState, useEffect } from 'react';
import { ConfigurationPanel } from './components/ConfigurationPanel';
import { SwipeDeck } from './components/SwipeDeck';
import { MovieLibrary } from './components/MovieLibrary';
import { AppState, AnalysisStatus, Movie } from './types';
import { generateFilmAnalysis } from './services/geminiService';
import { parseFilmAnalysis } from './services/parser';
import { enrichMoviesWithPosters } from './services/tmdbService';
import { ALL_WATCHLIST, WatchlistMovie } from './data/erikMovieData';
import { YEARS, THEMES } from './constants';
import { Popcorn, Clapperboard, Heart, Sparkles, Flame, Loader2, AlertTriangle, BookOpen, Bookmark, Eye } from 'lucide-react';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    startYear: YEARS[0],
    endYear: YEARS[YEARS.length - 1],
    selectedGenres: {},
    selectedSubGenres: {},
    themeId: 'joyful' // Default theme
  });

  const [status, setStatus] = useState<AnalysisStatus>('idle');
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string | undefined>(undefined);

  const [parsedMovies, setParsedMovies] = useState<Movie[]>([]);
  const [likedMovies, setLikedMovies] = useState<Movie[]>([]);
  const [maybeMovies, setMaybeMovies] = useState<Movie[]>([]);
  const [seenMovies, setSeenMovies] = useState<Movie[]>([]);
  const [activeView, setActiveView] = useState<'curate' | 'swipe' | 'library' | 'maybe' | 'seen'>('curate');

  const activeTheme = THEMES[state.themeId] || THEMES['joyful'];

  // Load liked + maybe + seen movies from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('liked_movies');
      if (saved) setLikedMovies(JSON.parse(saved));
      const savedMaybe = localStorage.getItem('maybe_movies');
      if (savedMaybe) setMaybeMovies(JSON.parse(savedMaybe));
      const savedSeen = localStorage.getItem('seen_movies');
      if (savedSeen) setSeenMovies(JSON.parse(savedSeen));
    } catch (e) {
      console.error('Failed to load saved movies from localStorage', e);
    }
  }, []);

  const handleUpdate = (newState: Partial<AppState>) => {
    setState(prev => ({ ...prev, ...newState }));
  };

  const handleGenerate = async () => {
    setStatus('generating');
    setError(undefined);
    setParsedMovies([]);
    try {
      const analysisText = await generateFilmAnalysis(state);
      setResult(analysisText);
      
      let movies = parseFilmAnalysis(analysisText);
      if (movies.length === 0) {
        throw new Error("No films could be parsed from the AI curation response. This can happen if the AI model fails to output XML. Please try again.");
      }
      
      // Enrich with real posters (TMDB v4 Bearer → Wikipedia → Cinematic Art)
      movies = await enrichMoviesWithPosters(movies);
      
      setParsedMovies(movies);
      setStatus('completed');
      setActiveView('swipe');
    } catch (e: any) {
      setError(e.message || "An unexpected error occurred.");
      setStatus('error');
    }
  };

  const handleLoadWatchlist = async () => {
    setStatus('generating');
    setError(undefined);
    setParsedMovies([]);
    try {
      // Shuffle the watchlist and take 20 random ones for the swipe deck
      const shuffled = [...ALL_WATCHLIST].sort(() => Math.random() - 0.5);
      const selection = shuffled.slice(0, 20);

      // Convert WatchlistMovie → Movie shape
      let movies: Movie[] = selection.map((m: WatchlistMovie, i: number) => ({
        id: `watchlist-${i}-${m.title.replace(/\s+/g, '-').toLowerCase()}`,
        rank: String(i + 1),
        title: m.title,
        year: m.year,
        director: m.director,
        classification: m.genre,
        runtime: '—',
        image: '',
        trailer: `https://www.youtube.com/results?search_query=${encodeURIComponent(m.title + ' ' + m.year + ' trailer')}`,
        critical_overview: m.synopsis,
        synopsis: m.synopsis,
        artistic_merit: '',
        genre_analysis: m.genre,
        cultural_impact: '',
        key_themes: '',
        technical_elements: '',
      }));

      // Enrich with real posters (TMDB v4 Bearer → Wikipedia → Cinematic Art)
      movies = await enrichMoviesWithPosters(movies);

      setParsedMovies(movies);
      setStatus('completed');
      setActiveView('swipe');
    } catch (e: any) {
      setError(e.message || "Failed to load watchlist.");
      setStatus('error');
    }
  };

  const handleLike = (movie: Movie) => {
    setLikedMovies(prev => {
      if (prev.some(m => m.title.toLowerCase() === movie.title.toLowerCase())) return prev;
      const updated = [...prev, movie];
      localStorage.setItem('liked_movies', JSON.stringify(updated));
      return updated;
    });
  };

  const handleMaybe = (movie: Movie) => {
    setMaybeMovies(prev => {
      if (prev.some(m => m.title.toLowerCase() === movie.title.toLowerCase())) return prev;
      const updated = [...prev, movie];
      localStorage.setItem('maybe_movies', JSON.stringify(updated));
      return updated;
    });
  };

  const handleRemoveMaybe = (movie: Movie) => {
    setMaybeMovies(prev => {
      const updated = prev.filter(m => m.title.toLowerCase() !== movie.title.toLowerCase());
      localStorage.setItem('maybe_movies', JSON.stringify(updated));
      return updated;
    });
  };

  const handleSeen = (movie: Movie) => {
    setSeenMovies(prev => {
      if (prev.some(m => m.title.toLowerCase() === movie.title.toLowerCase())) return prev;
      const updated = [...prev, movie];
      localStorage.setItem('seen_movies', JSON.stringify(updated));
      return updated;
    });
  };

  const handleRemoveSeen = (movie: Movie) => {
    setSeenMovies(prev => {
      const updated = prev.filter(m => m.title.toLowerCase() !== movie.title.toLowerCase());
      localStorage.setItem('seen_movies', JSON.stringify(updated));
      return updated;
    });
  };

  const handleDislike = (_movie: Movie) => {};

  const handleRemoveLiked = (movie: Movie) => {
    setLikedMovies(prev => {
      const updated = prev.filter(m => m.title.toLowerCase() !== movie.title.toLowerCase());
      localStorage.setItem('liked_movies', JSON.stringify(updated));
      return updated;
    });
  };

  // Custom shiver shaper styles for cooking screen
  const loadingStyles = `
    @keyframes shiver {
      0%, 100% { transform: scale(1) rotate(0deg); }
      25% { transform: scale(1.05) rotate(-3deg); }
      50% { transform: scale(1.05) rotate(3deg); }
      75% { transform: scale(1.02) rotate(-1.5deg); }
    }
    .animate-shiver {
      animation: shiver 0.5s infinite;
    }
  `;

  return (
    <div className={`flex flex-col h-screen w-full overflow-hidden font-sans bg-gradient-to-br ${activeTheme.appBg}`}>
      <style>{loadingStyles}</style>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Side: Curation Dashboard Config (only visible in 'curate' tab on mobile/tablet) */}
        <aside className={`w-80 md:w-96 flex-shrink-0 z-30 shadow-2xl relative transition-all duration-500 
          ${activeView === 'curate' ? 'block' : 'hidden md:block'}`}
        >
          <ConfigurationPanel 
            state={state} 
            onUpdate={handleUpdate} 
            onGenerate={handleGenerate}
            onLoadWatchlist={handleLoadWatchlist}
            isGenerating={status === 'generating'}
            theme={activeTheme}
          />
        </aside>

        {/* Right Side: Primary Display */}
        <main className="flex-1 relative p-4 md:p-8 overflow-hidden bg-transparent flex flex-col">
          {/* Decorative glows */}
          <div className={`absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-gradient-to-b from-${activeTheme.primary}-600/20 to-${activeTheme.secondary}-600/20 rounded-full blur-[120px] pointer-events-none`} />
          <div className={`absolute bottom-[-20%] left-[10%] w-[600px] h-[600px] bg-gradient-to-t from-${activeTheme.secondary}-600/10 to-${activeTheme.accent}-600/10 rounded-full blur-[100px] pointer-events-none`} />

          <div className="relative z-10 flex-1 max-w-5xl mx-auto w-full flex flex-col justify-center">
            {/* 1. Loading View */}
            {status === 'generating' && (
              <div className="flex flex-col items-center justify-center text-center p-8 relative overflow-hidden">
                <div className="relative mb-8">
                  <div className={`absolute inset-0 bg-gradient-to-r from-${activeTheme.secondary}-500 to-${activeTheme.accent}-500 blur-2xl opacity-40 animate-pulse rounded-full`}></div>
                  <div className={`relative bg-black/60 p-6 rounded-full border border-${activeTheme.secondary}-500/30 backdrop-blur-xl animate-shiver`}>
                    <Popcorn className={`w-20 h-20 text-${activeTheme.secondary}-400`} />
                  </div>
                </div>
                <h3 className={`text-3xl font-extrabold mb-3 text-transparent bg-clip-text bg-gradient-to-r ${activeTheme.textGradient}`}>
                  Curating Cinema...
                </h3>
                <p className="text-indigo-300/70 max-w-sm font-medium">
                  Popping fresh movie recommendations tailored for you. 🍿
                </p>
              </div>
            )}

            {/* 2. Error View */}
            {status === 'error' && (
              <div className="flex flex-col items-center justify-center p-8 text-center rounded-3xl border border-red-500/30 bg-red-950/20 backdrop-blur-md">
                <div className="bg-red-500/20 p-5 rounded-full mb-4 animate-bounce">
                  <AlertTriangle className="w-12 h-12 text-red-400" />
                </div>
                <h3 className="text-2xl font-bold mb-2 text-white">Curation Error</h3>
                <p className="max-w-md text-red-200/70 mb-4">{error}</p>
                <button
                  onClick={() => setStatus('idle')}
                  className="px-6 py-2 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10"
                >
                  Go Back
                </button>
              </div>
            )}

            {/* 3. Idle / Standby View */}
            {status === 'idle' && activeView !== 'library' && (
              <div className="flex flex-col items-center justify-center p-8 text-center rounded-3xl border-2 border-dashed border-white/10 bg-white/5 backdrop-blur-sm">
                <div className={`bg-gradient-to-br from-${activeTheme.primary}-500/20 to-${activeTheme.secondary}-500/20 p-6 rounded-full mb-6`}>
                  <Clapperboard className={`w-16 h-16 text-${activeTheme.primary}-400`} />
                </div>
                <h3 className={`text-2xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r ${activeTheme.textGradient}`}>Cinema Selection</h3>
                <p className="max-w-md text-indigo-200/60 leading-relaxed text-sm">
                  Configure your preferences in the dashboard on the left and tap **Generate Analysis** to kick off recommendations!
                </p>
              </div>
            )}

            {/* 4. Tinder Swipe View */}
            {status === 'completed' && activeView === 'swipe' && (
              <SwipeDeck 
                movies={parsedMovies}
                theme={activeTheme}
                onLike={handleLike}
                onDislike={handleDislike}
                onMaybe={handleMaybe}
                onSeen={handleSeen}
                onComplete={() => setActiveView('library')}
              />
            )}

            {/* 5. Saved Shelf View */}
            {activeView === 'library' && (
              <MovieLibrary 
                likedMovies={likedMovies}
                theme={activeTheme}
                onRemove={handleRemoveLiked}
              />
            )}

            {/* 7. Already Seen View */}
            {activeView === 'seen' && (
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
                    <Eye className="w-6 h-6 text-sky-400" />
                    Movies I've Already Seen
                  </h2>
                  <span className="text-xs font-bold text-sky-400 bg-sky-400/10 border border-sky-400/20 px-3 py-1 rounded-full">
                    {seenMovies.length} Watched
                  </span>
                </div>
                {seenMovies.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-8 rounded-3xl border-2 border-dashed border-sky-500/20 bg-sky-950/10">
                    <Eye className="w-12 h-12 text-sky-400/40 mb-4" />
                    <p className="text-sky-200/50 font-medium">No films logged yet.</p>
                    <p className="text-sky-200/30 text-sm mt-1">Tap the 👁 eye on any card to mark it as watched.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 overflow-y-auto custom-scrollbar pb-4">
                    {seenMovies.map((movie) => (
                      <div key={movie.title} className="relative rounded-2xl overflow-hidden border border-sky-500/20 bg-black/40 shadow-lg group">
                        {movie.image ? (
                          <img src={movie.image} alt={movie.title} className="w-full h-40 object-cover" />
                        ) : (
                          <img
                            src={`/genre-art/${(movie.classification||'').toLowerCase().includes('horror')?'horror':(movie.classification||'').toLowerCase().includes('sci')?'scifi':(movie.classification||'').toLowerCase().includes('thriller')?'thriller':'default'}.png`}
                            alt={movie.classification || 'Cinema'}
                            className="w-full h-40 object-cover"
                          />
                        )}
                        {/* Star rating row — Phase 2: will be interactive */}
                        <div className="absolute top-2 left-2 flex gap-0.5">
                          {[1,2,3,4,5].map(star => (
                            <span key={star} className="text-amber-300/60 text-xs" title={`${star} star${star > 1 ? 's' : ''}`}>★</span>
                          ))}
                        </div>
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-3">
                          <p className="text-white font-bold text-xs leading-tight">{movie.title}</p>
                          <p className="text-sky-300/70 text-[10px]">{movie.year} · {movie.director}</p>
                        </div>
                        <button
                          onClick={() => handleRemoveSeen(movie)}
                          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 border border-white/10 flex items-center justify-center text-sky-400 opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold"
                          title="Remove"
                        >✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {activeView === 'maybe' && (
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
                    <Bookmark className="w-6 h-6 text-amber-400" />
                    Consider Later
                  </h2>
                  <span className="text-xs font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-3 py-1 rounded-full">
                    {maybeMovies.length} Bookmarked
                  </span>
                </div>
                {maybeMovies.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-8 rounded-3xl border-2 border-dashed border-amber-500/20 bg-amber-950/10">
                    <Bookmark className="w-12 h-12 text-amber-400/40 mb-4" />
                    <p className="text-amber-200/50 font-medium">No maybes yet.</p>
                    <p className="text-amber-200/30 text-sm mt-1">Tap the 🔖 bookmark on any card to save it here.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 overflow-y-auto custom-scrollbar pb-4">
                    {maybeMovies.map((movie) => (
                      <div key={movie.title} className="relative rounded-2xl overflow-hidden border border-amber-500/20 bg-black/40 shadow-lg group">
                        {movie.image ? (
                          <img src={movie.image} alt={movie.title} className="w-full h-40 object-cover" />
                        ) : (
                          <img
                            src={`/genre-art/${(movie.classification||'').toLowerCase().includes('horror')?'horror':(movie.classification||'').toLowerCase().includes('sci')?'scifi':(movie.classification||'').toLowerCase().includes('thriller')?'thriller':'default'}.png`}
                            alt={movie.classification || 'Cinema'}
                            className="w-full h-40 object-cover"
                          />
                        )}
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-3">
                          <p className="text-white font-bold text-xs leading-tight">{movie.title}</p>
                          <p className="text-amber-300/70 text-[10px]">{movie.year}</p>
                        </div>
                        <button
                          onClick={() => handleRemoveMaybe(movie)}
                          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 border border-white/10 flex items-center justify-center text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold"
                          title="Remove"
                        >✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Bottom Nav Bar — 5 tabs */}
      <nav className="bg-black/80 backdrop-blur-xl border-t border-white/10 py-2 px-2 flex justify-around items-center z-40">
        <button
          onClick={() => setActiveView('curate')}
          className={`flex flex-col items-center gap-0.5 px-2 transition-all ${
            activeView === 'curate' ? `text-${activeTheme.primary}-400 font-bold scale-105` : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Clapperboard className="w-5 h-5" />
          <span className="text-[9px] tracking-wide">Curate</span>
        </button>

        <button
          onClick={() => { if (status === 'completed' && parsedMovies.length > 0) setActiveView('swipe'); }}
          disabled={status !== 'completed' || parsedMovies.length === 0}
          className={`flex flex-col items-center gap-0.5 px-2 transition-all ${
            status !== 'completed' || parsedMovies.length === 0 ? 'opacity-30 cursor-not-allowed text-slate-700' :
            activeView === 'swipe' ? `text-${activeTheme.primary}-400 font-bold scale-105` : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Flame className="w-5 h-5 animate-pulse" />
          <span className="text-[9px] tracking-wide">Swipe</span>
        </button>

        <button
          onClick={() => setActiveView('maybe')}
          className={`flex flex-col items-center gap-0.5 px-2 transition-all relative ${
            activeView === 'maybe' ? 'text-amber-400 font-bold scale-105' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Bookmark className="w-5 h-5" />
          <span className="text-[9px] tracking-wide">Maybe</span>
          {maybeMovies.length > 0 && (
            <span className="absolute -top-1 -right-0 w-4 h-4 rounded-full bg-amber-500 text-[8px] font-black text-black flex items-center justify-center">
              {maybeMovies.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveView('seen')}
          className={`flex flex-col items-center gap-0.5 px-2 transition-all relative ${
            activeView === 'seen' ? 'text-sky-400 font-bold scale-105' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Eye className="w-5 h-5" />
          <span className="text-[9px] tracking-wide">Seen</span>
          {seenMovies.length > 0 && (
            <span className="absolute -top-1 -right-0 w-4 h-4 rounded-full bg-sky-500 text-[8px] font-black text-black flex items-center justify-center">
              {seenMovies.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveView('library')}
          className={`flex flex-col items-center gap-0.5 px-2 transition-all ${
            activeView === 'library' ? `text-${activeTheme.primary}-400 font-bold scale-105` : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Heart className="w-5 h-5 fill-current" />
          <span className="text-[9px] tracking-wide">Saved</span>
        </button>
      </nav>
    </div>
  );
};

export default App;
