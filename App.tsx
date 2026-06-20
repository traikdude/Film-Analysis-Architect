import React, { useState, useEffect } from 'react';
import { ConfigurationPanel } from './components/ConfigurationPanel';
import { SwipeDeck } from './components/SwipeDeck';
import { MovieLibrary } from './components/MovieLibrary';
import { AppState, AnalysisStatus, Movie, CurationSession } from './types';
import { generateFilmAnalysis } from './services/geminiService';
import { parseFilmAnalysis } from './services/parser';
import { enrichMoviesWithPosters } from './services/tmdbService';
import { saveToHistory, loadHistory, deleteFromHistory, downloadSessionMarkdown, copySessionToClipboard, sessionToMarkdown } from './services/exportService';
import { uploadMarkdownToDrive, DRIVE_FOLDER_ID } from './services/driveService';
import { ALL_WATCHLIST, WatchlistMovie } from './data/erikMovieData';
import { YEARS, THEMES } from './constants';
import { Clapperboard, Heart, Flame, BookOpen, Bookmark, Eye, History, Download, Copy, Trash2, Play, CloudUpload, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';

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
  const [curationHistory, setCurationHistory] = useState<CurationSession[]>([]);
  const [copiedSessionId, setCopiedSessionId] = useState<string | null>(null);
  // Drive upload state per session: id -> 'idle' | 'uploading' | { link } | 'error'
  const [driveState, setDriveState] = useState<Record<string, 'uploading' | { link: string } | 'error'>>({});
  const [activeView, setActiveView] = useState<'curate' | 'swipe' | 'library' | 'maybe' | 'seen' | 'history'>('curate');

  const activeTheme = THEMES[state.themeId] || THEMES['joyful'];

  // Load liked + maybe + seen movies + curation history from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('liked_movies');
      if (saved) setLikedMovies(JSON.parse(saved));
      const savedMaybe = localStorage.getItem('maybe_movies');
      if (savedMaybe) setMaybeMovies(JSON.parse(savedMaybe));
      const savedSeen = localStorage.getItem('seen_movies');
      if (savedSeen) setSeenMovies(JSON.parse(savedSeen));
      setCurationHistory(loadHistory());
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
      
      // ── Save to curation history ─────────────────────────────────────
      const genreNames = Object.keys(state.selectedGenres).map(id =>
        id.charAt(0).toUpperCase() + id.slice(1)
      );
      const session: CurationSession = {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        label: `${genreNames.join(' · ')} · ${state.startYear}–${state.endYear}`,
        genres: genreNames,
        yearRange: `${state.startYear} – ${state.endYear}`,
        movieCount: movies.length,
        movies,
      };
      saveToHistory(session);
      setCurationHistory(loadHistory());
      // ────────────────────────────────────────────────────────────────

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

      // ── Save to curation history ─────────────────────────────────────
      const session: CurationSession = {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        label: `My Watchlist (Random 20) · ${state.startYear}–${state.endYear}`,
        genres: ['My Watchlist'],
        yearRange: 'Various',
        movieCount: movies.length,
        movies,
      };
      saveToHistory(session);
      setCurationHistory(loadHistory());
      // ────────────────────────────────────────────────────────────────

      setParsedMovies(movies);
      setStatus('completed');
      setActiveView('swipe');
    } catch (e: any) {
      setError(e.message || "Failed to load watchlist.");
      setStatus('error');
    }
  };

  /** Load a past session back into the swipe deck (no API call) */
  const handleLoadSession = (session: CurationSession) => {
    setParsedMovies(session.movies);
    setStatus('completed');
    setActiveView('swipe');
  };

  /** Delete a session from history */
  const handleDeleteSession = (id: string) => {
    const updated = deleteFromHistory(id);
    setCurationHistory(updated);
  };

  /** Download or copy a session */
  const handleExportSession = (session: CurationSession) => {
    downloadSessionMarkdown(session);
  };

  const handleCopySession = async (session: CurationSession) => {
    const ok = await copySessionToClipboard(session);
    if (ok) {
      setCopiedSessionId(session.id);
      setTimeout(() => setCopiedSessionId(null), 2000);
    }
  };

  /** Save session directly to Google Drive (NotebookLM folder) */
  const handleDriveSave = async (session: CurationSession) => {
    const clientId = localStorage.getItem('google_oauth_client_id') || '';
    if (!clientId) {
      alert('⚙️ Please add your Google OAuth Client ID in Settings → Google Drive first.');
      return;
    }

    setDriveState(prev => ({ ...prev, [session.id]: 'uploading' }));
    try {
      const dateTag = new Date(session.createdAt).toISOString().slice(0, 10);
      const genreTag = session.genres.slice(0, 3).join('-').toLowerCase().replace(/\s+/g, '_');
      const fileName = `film-curator_${dateTag}_${genreTag}.md`;
      const markdown = sessionToMarkdown(session);
      const result = await uploadMarkdownToDrive(markdown, fileName, clientId);
      setDriveState(prev => ({ ...prev, [session.id]: { link: result.webViewLink } }));
    } catch (e: any) {
      console.error('Drive upload error:', e);
      setDriveState(prev => ({ ...prev, [session.id]: 'error' }));
      // Auto-clear error after 5 seconds
      setTimeout(() => setDriveState(prev => {
        const n = { ...prev };
        delete n[session.id];
        return n;
      }), 5000);
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

            {/* 8. Curation History View */}
            {activeView === 'history' && (
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
                    <History className="w-6 h-6 text-violet-400" />
                    Curation History
                  </h2>
                  <span className="text-xs font-bold text-violet-400 bg-violet-400/10 border border-violet-400/20 px-3 py-1 rounded-full">
                    {curationHistory.length} Sessions
                  </span>
                </div>

                {curationHistory.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-8 rounded-3xl border-2 border-dashed border-violet-500/20 bg-violet-950/10">
                    <History className="w-12 h-12 text-violet-400/40 mb-4" />
                    <p className="text-violet-200/50 font-medium">No sessions yet.</p>
                    <p className="text-violet-200/30 text-sm mt-1">Generate or load a watchlist to start building your history.</p>
                  </div>
                ) : (
                  <div className="space-y-3 overflow-y-auto custom-scrollbar pb-4">
                    {curationHistory.map((session) => {
                      const d = new Date(session.createdAt);
                      const dateStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
                      const timeStr = `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
                      return (
                        <div key={session.id} className="rounded-2xl border border-violet-500/20 bg-black/40 p-4 shadow-lg group">
                          {/* Header row */}
                          <div className="flex items-start justify-between gap-2 mb-3">
                            <div className="flex-1 min-w-0">
                              <p className="text-white font-bold text-sm leading-tight truncate">{session.label}</p>
                              <p className="text-violet-300/60 text-[10px] mt-0.5">{dateStr} at {timeStr} · {session.movieCount} films</p>
                            </div>
                            <button
                              onClick={() => handleDeleteSession(session.id)}
                              className="w-7 h-7 rounded-full bg-black/40 border border-white/10 flex items-center justify-center text-slate-500 hover:text-red-400 hover:border-red-500/30 transition-colors flex-shrink-0"
                              title="Delete session"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Genre chips */}
                          <div className="flex flex-wrap gap-1 mb-3">
                            {session.genres.map(g => (
                              <span key={g} className="text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/20">
                                {g}
                              </span>
                            ))}
                            <span className="text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-white/5 text-slate-400 border border-white/10">
                              {session.yearRange}
                            </span>
                          </div>

                          {/* Action buttons */}
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleLoadSession(session)}
                              className="flex-1 py-2 rounded-xl bg-violet-600/20 hover:bg-violet-600/35 border border-violet-500/30 hover:border-violet-500/50 text-violet-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95"
                            >
                              <Play className="w-3 h-3" />
                              Load into Swipe Deck
                            </button>
                            <button
                              onClick={() => handleExportSession(session)}
                              className="py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95"
                              title="Download as Markdown (NotebookLM ready)"
                            >
                              <Download className="w-3 h-3" />
                              .md
                            </button>
                            <button
                              onClick={() => handleCopySession(session)}
                              className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 ${
                                copiedSessionId === session.id
                                  ? 'bg-green-500/20 border-green-500/40 text-green-300'
                                  : 'bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/20 text-slate-300'
                              }`}
                              title="Copy to clipboard"
                            >
                              <Copy className="w-3 h-3" />
                              {copiedSessionId === session.id ? '✓' : 'Copy'}
                            </button>
                          </div>

                          {/* Google Drive button — full width row */}
                          {(() => {
                            const ds = driveState[session.id];
                            if (ds === 'uploading') {
                              return (
                                <button disabled className="w-full mt-2 py-2 rounded-xl bg-blue-600/15 border border-blue-500/30 text-blue-300 text-xs font-bold flex items-center justify-center gap-2 opacity-80 cursor-wait">
                                  <span className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                                  Uploading to Google Drive…
                                </button>
                              );
                            }
                            if (ds && typeof ds === 'object' && 'link' in ds) {
                              return (
                                <a
                                  href={ds.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="w-full mt-2 py-2 rounded-xl bg-green-600/15 border border-green-500/30 text-green-300 text-xs font-bold flex items-center justify-center gap-2 hover:bg-green-600/25 transition-all"
                                >
                                  <CheckCircle className="w-3 h-3" />
                                  Saved to Drive — Open File
                                  <ExternalLink className="w-3 h-3 opacity-60" />
                                </a>
                              );
                            }
                            if (ds === 'error') {
                              return (
                                <button
                                  onClick={() => handleDriveSave(session)}
                                  className="w-full mt-2 py-2 rounded-xl bg-red-600/15 border border-red-500/30 text-red-300 text-xs font-bold flex items-center justify-center gap-2 hover:bg-red-600/25 transition-all"
                                >
                                  <AlertCircle className="w-3 h-3" />
                                  Upload Failed — Retry
                                </button>
                              );
                            }
                            return (
                              <button
                                onClick={() => handleDriveSave(session)}
                                className="w-full mt-2 py-2 rounded-xl bg-blue-600/15 hover:bg-blue-600/28 border border-blue-500/25 hover:border-blue-500/45 text-blue-300 text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
                                title="Save directly to your NotebookLM Google Drive folder"
                              >
                                <CloudUpload className="w-3 h-3" />
                                Save to Google Drive (NotebookLM Folder)
                              </button>
                            );
                          })()}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Footer: NotebookLM tip + OAuth Client ID settings */}
                {curationHistory.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <div className="p-3 rounded-xl border border-violet-500/10 bg-violet-950/20">
                      <p className="text-[10px] text-violet-300/60 leading-relaxed">
                        💡 <strong className="text-violet-300/80">NotebookLM:</strong> Hit <strong className="text-blue-300/80">Save to Drive</strong> → file lands in your <a href={`https://drive.google.com/drive/folders/${DRIVE_FOLDER_ID}`} target="_blank" rel="noopener noreferrer" className="underline hover:text-violet-200">movie folder</a> → open <a href="https://notebooklm.google.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-violet-200">NotebookLM</a> → your Movies notebook → ＋ Add source → Google Drive → done.
                      </p>
                    </div>
                    {/* Google OAuth Client ID setup */}
                    <details className="rounded-xl border border-white/5 bg-black/20">
                      <summary className="px-3 py-2 text-[10px] text-slate-500 hover:text-slate-300 cursor-pointer transition-colors select-none">
                        ⚙️ Google Drive Setup (OAuth Client ID)
                      </summary>
                      <div className="px-3 pb-3 pt-1 space-y-2">
                        <p className="text-[10px] text-slate-400 leading-relaxed">
                          To enable Drive uploads, paste your <strong>Google OAuth 2.0 Client ID</strong> below.<br />
                          Get one at <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline hover:text-blue-300">console.cloud.google.com/apis/credentials</a> → Create → Web app → add <code className="font-mono text-violet-300">https://film-architect-curator.web.app</code> as an Authorized JavaScript origin.
                        </p>
                        <div className="flex gap-2">
                          <input
                            id="oauth-client-id"
                            type="text"
                            placeholder="Paste your Client ID here (ends in .apps.googleusercontent.com)"
                            defaultValue={localStorage.getItem('google_oauth_client_id') || ''}
                            className="flex-1 px-2 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 text-[10px] font-mono placeholder-slate-600 focus:outline-none focus:border-violet-500/50"
                          />
                          <button
                            onClick={() => {
                              const val = (document.getElementById('oauth-client-id') as HTMLInputElement)?.value?.trim();
                              if (val) { localStorage.setItem('google_oauth_client_id', val); alert('✅ Client ID saved!'); }
                            }}
                            className="px-3 py-1.5 rounded-lg bg-violet-600/25 hover:bg-violet-600/40 border border-violet-500/30 text-violet-200 text-[10px] font-bold transition-all"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    </details>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Bottom Nav Bar — 6 tabs */}
      <nav className="bg-black/80 backdrop-blur-xl border-t border-white/10 py-2 px-1 flex justify-around items-center z-40">
        <button
          onClick={() => setActiveView('curate')}
          className={`flex flex-col items-center gap-0.5 px-1.5 transition-all ${
            activeView === 'curate' ? `text-${activeTheme.primary}-400 font-bold scale-105` : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Clapperboard className="w-5 h-5" />
          <span className="text-[8px] tracking-wide">Curate</span>
        </button>

        <button
          onClick={() => { if (status === 'completed' && parsedMovies.length > 0) setActiveView('swipe'); }}
          disabled={status !== 'completed' || parsedMovies.length === 0}
          className={`flex flex-col items-center gap-0.5 px-1.5 transition-all ${
            status !== 'completed' || parsedMovies.length === 0 ? 'opacity-30 cursor-not-allowed text-slate-700' :
            activeView === 'swipe' ? `text-${activeTheme.primary}-400 font-bold scale-105` : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Flame className="w-5 h-5 animate-pulse" />
          <span className="text-[8px] tracking-wide">Swipe</span>
        </button>

        <button
          onClick={() => setActiveView('maybe')}
          className={`flex flex-col items-center gap-0.5 px-1.5 transition-all relative ${
            activeView === 'maybe' ? 'text-amber-400 font-bold scale-105' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Bookmark className="w-5 h-5" />
          <span className="text-[8px] tracking-wide">Maybe</span>
          {maybeMovies.length > 0 && (
            <span className="absolute -top-1 -right-0 w-4 h-4 rounded-full bg-amber-500 text-[7px] font-black text-black flex items-center justify-center">
              {maybeMovies.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveView('seen')}
          className={`flex flex-col items-center gap-0.5 px-1.5 transition-all relative ${
            activeView === 'seen' ? 'text-sky-400 font-bold scale-105' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Eye className="w-5 h-5" />
          <span className="text-[8px] tracking-wide">Seen</span>
          {seenMovies.length > 0 && (
            <span className="absolute -top-1 -right-0 w-4 h-4 rounded-full bg-sky-500 text-[7px] font-black text-black flex items-center justify-center">
              {seenMovies.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveView('history')}
          className={`flex flex-col items-center gap-0.5 px-1.5 transition-all relative ${
            activeView === 'history' ? 'text-violet-400 font-bold scale-105' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <History className="w-5 h-5" />
          <span className="text-[8px] tracking-wide">History</span>
          {curationHistory.length > 0 && (
            <span className="absolute -top-1 -right-0 w-4 h-4 rounded-full bg-violet-500 text-[7px] font-black text-black flex items-center justify-center">
              {curationHistory.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveView('library')}
          className={`flex flex-col items-center gap-0.5 px-1.5 transition-all ${
            activeView === 'library' ? `text-${activeTheme.primary}-400 font-bold scale-105` : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Heart className="w-5 h-5 fill-current" />
          <span className="text-[8px] tracking-wide">Saved</span>
        </button>
      </nav>
    </div>
  );
};

export default App;
