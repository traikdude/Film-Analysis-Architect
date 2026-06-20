import React, { useState, useEffect } from 'react';
import { ConfigurationPanel } from './components/ConfigurationPanel';
import { SwipeDeck } from './components/SwipeDeck';
import { MovieLibrary } from './components/MovieLibrary';
import { AppState, AnalysisStatus, Movie } from './types';
import { generateFilmAnalysis } from './services/geminiService';
import { parseFilmAnalysis } from './services/parser';
import { enrichMoviesWithPosters } from './services/tmdbService';
import { YEARS, THEMES } from './constants';
import { Popcorn, Clapperboard, Heart, Sparkles, Flame, Loader2, AlertTriangle } from 'lucide-react';

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
  const [activeView, setActiveView] = useState<'curate' | 'swipe' | 'library'>('curate');

  const activeTheme = THEMES[state.themeId] || THEMES['joyful'];

  // Load liked movies from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('liked_movies');
      if (saved) {
        setLikedMovies(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load saved movies from localStorage", e);
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
      
      // Enrich with real TMDB poster images (uses built-in key as fallback)
      const tmdbKey = localStorage.getItem('tmdb_api_key') || '';
      movies = await enrichMoviesWithPosters(movies, tmdbKey);
      
      setParsedMovies(movies);
      setStatus('completed');
      setActiveView('swipe');
    } catch (e: any) {
      setError(e.message || "An unexpected error occurred.");
      setStatus('error');
    }
  };

  const handleLike = (movie: Movie) => {
    setLikedMovies(prev => {
      if (prev.some(m => m.title.toLowerCase() === movie.title.toLowerCase())) {
        return prev;
      }
      const updated = [...prev, movie];
      localStorage.setItem('liked_movies', JSON.stringify(updated));
      return updated;
    });
  };

  const handleDislike = (movie: Movie) => {
    // Left swipe ignores the film
  };

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
                onComplete={() => setActiveView('library')}
              />
            )}

            {/* 5. Library Shelf View */}
            {activeView === 'library' && (
              <MovieLibrary 
                likedMovies={likedMovies}
                theme={activeTheme}
                onRemove={handleRemoveLiked}
              />
            )}
          </div>
        </main>
      </div>

      {/* Bottom Nav Bar (Mobile & Quick-toggle) */}
      <nav className="bg-black/80 backdrop-blur-xl border-t border-white/10 py-3 px-6 flex justify-around items-center z-40">
        <button
          onClick={() => setActiveView('curate')}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeView === 'curate' ? `text-${activeTheme.primary}-400 font-bold scale-105` : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Clapperboard className="w-5 h-5" />
          <span className="text-[10px] tracking-wide">Curate</span>
        </button>

        <button
          onClick={() => {
            if (status === 'completed' && parsedMovies.length > 0) {
              setActiveView('swipe');
            }
          }}
          disabled={status !== 'completed' || parsedMovies.length === 0}
          className={`flex flex-col items-center gap-1 transition-all ${
            status !== 'completed' || parsedMovies.length === 0 ? 'opacity-30 cursor-not-allowed text-slate-700' :
            activeView === 'swipe' ? `text-${activeTheme.primary}-400 font-bold scale-105` : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Flame className="w-5 h-5 animate-pulse" />
          <span className="text-[10px] tracking-wide">Swipe Deck</span>
        </button>

        <button
          onClick={() => setActiveView('library')}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeView === 'library' ? `text-${activeTheme.primary}-400 font-bold scale-105` : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Heart className="w-5 h-5 fill-current" />
          <span className="text-[10px] tracking-wide">Saved Shelf</span>
        </button>
      </nav>
    </div>
  );
};

export default App;
