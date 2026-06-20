import React, { useState, useRef, useEffect } from 'react';
import { Movie, Theme } from '../types';
import { Heart, X, Info, Youtube, Check, Bookmark, Eye } from 'lucide-react';

interface SwipeDeckProps {
  movies: Movie[];
  theme: Theme;
  onLike: (movie: Movie) => void;
  onDislike: (movie: Movie) => void;
  onMaybe: (movie: Movie) => void;
  onSeen: (movie: Movie) => void;
  onComplete: () => void;
}

// Maps genre/subcategory text → illustrated poster background
const getGenreArt = (genre: string, title: string): string => {
  const g = (genre + ' ' + title).toLowerCase();
  // ── Horror subcategories (most specific first) ──────────────────────
  if (g.match(/lovecraft|cosmic|elder god|dimensional|space horror/)) return '/genre-art/horror-cosmic.png';
  if (g.match(/folk horror|pagan|ritual|rural horror|witch|cult horror|wicker/)) return '/genre-art/horror-folk.png';
  if (g.match(/slasher|masked killer|teen slasher|serial killer|giallo|splatter/)) return '/genre-art/horror-slasher.png';
  if (g.match(/body horror|transformation|medical horror|biological|parasitic|mutation/)) return '/genre-art/horror-body.png';
  if (g.match(/psychological horror|gaslighting|reality distort|isolation horror|dream|nightmare/)) return '/genre-art/horror-psychological.png';
  if (g.match(/ghost|demonic|haunted|paranormal|supernatural|spirit|angel|demon|curse|religious horror/)) return '/genre-art/horror-supernatural.png';
  if (g.match(/horror|zombie|vampire|werewolf|creature|monster/)) return '/genre-art/horror.png';
  // ── Sci-Fi subcategories ─────────────────────────────────────────────
  if (g.match(/cyberpunk|neon|hacker|cyborg|neural|megacorp/)) return '/genre-art/scifi-cyberpunk.png';
  if (g.match(/space opera|starship|galaxy|armada|empire|rebel|intergalactic/)) return '/genre-art/scifi-space-opera.png';
  if (g.match(/dystop|totalitarian|surveillance state|oppressive future|post-apocalyptic/)) return '/genre-art/scifi-dystopia.png';
  if (g.match(/time travel|time loop|temporal|alternate timeline|paradox/)) return '/genre-art/scifi-time-travel.png';
  if (g.match(/sci.?fi|science.?fiction|space|alien|robot|future|tech|apocalypse/)) return '/genre-art/scifi.png';
  // ── Thriller subcategories ───────────────────────────────────────────
  if (g.match(/conspiracy|cover.up|secret society|government cover|shadow organization/)) return '/genre-art/thriller-conspiracy.png';
  if (g.match(/psychological thriller|gaslighting|manipulation|unreliable narrator|mind game/)) return '/genre-art/thriller-psychological.png';
  if (g.match(/noir|film noir|detective|gangster|shadowy/)) return '/genre-art/crime-noir.png';
  if (g.match(/thriller|suspense|mystery|crime|paranoia/)) return '/genre-art/thriller.png';
  // ── Action ───────────────────────────────────────────────────────────
  if (g.match(/action|adventure|war|combat|explosion|survival/)) return '/genre-art/action.png';
  // ── Drama ────────────────────────────────────────────────────────────
  if (g.match(/drama|romance|indie|independent|art|emotion|family|period/)) return '/genre-art/drama.png';
  return '/genre-art/default.png';
};

export const SwipeDeck: React.FC<SwipeDeckProps> = ({ movies, theme, onLike, onDislike, onMaybe, onSeen, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  
  // 3D holographic variables state
  const [holoVars, setHoloVars] = useState<React.CSSProperties>({
    '--rx': '0deg',
    '--ry': '0deg',
    '--mx': '50%',
    '--my': '50%',
    '--posx': '50%',
    '--posy': '50%',
    '--hyp': '0',
    '--o': '0'
  } as React.CSSProperties);

  const cardRef = useRef<HTMLDivElement>(null);
  const activeMovie = movies[currentIndex];

  useEffect(() => {
    if (currentIndex >= movies.length && movies.length > 0) {
      onComplete();
    }
  }, [currentIndex, movies, onComplete]);

  if (!activeMovie || currentIndex >= movies.length) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center rounded-3xl border border-white/10 bg-black/30 backdrop-blur-md">
        <div className={`bg-gradient-to-br ${theme.bgGradient} p-6 rounded-full mb-6`}>
          <Check className="w-16 h-16 text-white" />
        </div>
        <h3 className="text-2xl font-bold mb-2 text-white">Deck Cleared!</h3>
        <p className="text-indigo-200/60 max-w-sm">
          You've swiped through all curated films. Head to your Saved Shelf to review your list.
        </p>
      </div>
    );
  }

  const nextMovie = currentIndex + 1 < movies.length ? movies[currentIndex + 1] : null;

  // Determine rarity from Rank
  const getRarity = (rankStr: string) => {
    const rank = parseInt(rankStr) || 999;
    if (rank <= 3) return 'rare secret'; // Gold Foil
    if (rank <= 5) return 'rare rainbow'; // Rainbow
    return 'rare holo'; // Classic Holo
  };

  // Calculate 3D card tilt & glare positions
  const updateHoloCoordinates = (clientX: number, clientY: number) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const absoluteX = clientX - rect.left;
    const absoluteY = clientY - rect.top;

    // Convert coordinates to percentages relative to card size
    const px = Math.max(0, Math.min(100, (absoluteX / rect.width) * 100));
    const py = Math.max(0, Math.min(100, (absoluteY / rect.height) * 100));

    // Tilt degrees (max 20deg rotation)
    const rx = ((px - 50) / 50) * 18;
    const ry = -((py - 50) / 50) * 18;

    // Glare brightness scaling (hypotenuse distance from center)
    const hyp = Math.sqrt(Math.pow((px - 50) / 50, 2) + Math.pow((py - 50) / 50, 2));

    setHoloVars({
      '--rx': `${rx}deg`,
      '--ry': `${ry}deg`,
      '--mx': `${px}%`,
      '--my': `${py}%`,
      '--posx': `${px}%`,
      '--posy': `${py}%`,
      '--hyp': String(hyp),
      '--o': '1' // Show shine/glare overlay
    } as React.CSSProperties);
  };

  const resetHoloCoordinates = () => {
    setHoloVars({
      '--rx': '0deg',
      '--ry': '0deg',
      '--mx': '50%',
      '--my': '50%',
      '--posx': '50%',
      '--posy': '50%',
      '--hyp': '0',
      '--o': '0' // Hide shine/glare overlay
    } as React.CSSProperties);
  };

  // Gesture Handlers
  const handleStart = (clientX: number, clientY: number) => {
    if (showDetails) return;
    setIsDragging(true);
    setDragStart({ x: clientX, y: clientY });
    updateHoloCoordinates(clientX, clientY);
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!isDragging) return;
    const deltaX = clientX - dragStart.x;
    const deltaY = clientY - dragStart.y;
    setDragOffset({ x: deltaX, y: deltaY });

    if (deltaX > 50) {
      setSwipeDirection('right');
    } else if (deltaX < -50) {
      setSwipeDirection('left');
    } else {
      setSwipeDirection(null);
    }

    updateHoloCoordinates(clientX, clientY);
  };

  const handleEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const threshold = 120;
    if (dragOffset.x > threshold) {
      triggerSwipe('right');
    } else if (dragOffset.x < -threshold) {
      triggerSwipe('left');
    } else {
      setDragOffset({ x: 0, y: 0 });
      setSwipeDirection(null);
      resetHoloCoordinates();
    }
  };

  const triggerSwipe = (dir: 'left' | 'right') => {
    setSwipeDirection(dir);
    const throwOffset = dir === 'right' ? window.innerWidth + 200 : -window.innerWidth - 200;
    setDragOffset({ x: throwOffset, y: dragOffset.y });

    setTimeout(() => {
      if (dir === 'right') {
        onLike(activeMovie);
      } else {
        onDislike(activeMovie);
      }
      setDragOffset({ x: 0, y: 0 });
      setSwipeDirection(null);
      setCurrentIndex(prev => prev + 1);
      setShowDetails(false);
      resetHoloCoordinates();
    }, 300);
  };

  // Desktop Hover Effects
  const handleMouseMove = (e: React.MouseEvent) => {
    if (showDetails) return;
    if (isDragging) {
      handleMove(e.clientX, e.clientY);
    } else {
      updateHoloCoordinates(e.clientX, e.clientY);
    }
  };

  const handleMouseLeave = () => {
    if (!isDragging) {
      resetHoloCoordinates();
    } else {
      handleEnd();
    }
  };

  return (
    <div className="relative w-full max-w-sm mx-auto h-[600px] flex flex-col justify-between select-none">
      <div className="relative flex-1 w-full flex items-center justify-center">
        
        {/* Next Card (Underneath Stack) */}
        {nextMovie && (
          <div className="absolute w-full h-[480px] rounded-3xl bg-slate-900/60 border border-white/5 shadow-2xl p-4 flex flex-col justify-between opacity-30 scale-[0.95] translate-y-4 pointer-events-none transition-all duration-300">
            <div className="w-full h-64 bg-slate-800 rounded-2xl animate-pulse" />
            <div className="space-y-2 mt-4">
              <div className="h-6 w-3/4 bg-slate-800 rounded animate-pulse" />
              <div className="h-4 w-1/2 bg-slate-800 rounded animate-pulse" />
            </div>
          </div>
        )}

        {/* Current Card (Translate and scale container) */}
        <div
          style={{
            transform: `translate3d(${dragOffset.x}px, ${dragOffset.y}px, 0) scale(${isDragging ? '1.02' : '1'})`,
            transition: isDragging ? 'none' : 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          }}
          className={`card card__translater absolute z-10 w-full h-[480px] ${isDragging ? 'interacting' : ''}`}
        >
          {/* Rotator Card (3D Tilt & Holographic glares inside) */}
          <div
            ref={cardRef}
            data-rarity={getRarity(activeMovie.rank)}
            style={holoVars}
            onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
            onMouseMove={handleMouseMove}
            onMouseUp={handleEnd}
            onMouseLeave={handleMouseLeave}
            onTouchStart={(e) => handleStart(e.touches[0].clientX, e.touches[0].clientY)}
            onTouchMove={(e) => {
              if (isDragging) {
                handleMove(e.touches[0].clientX, e.touches[0].clientY);
              }
            }}
            onTouchEnd={handleEnd}
            className="card__rotator bg-slate-950 border border-white/10 overflow-hidden flex flex-col justify-between select-none"
          >
            {/* Stamps */}
            {swipeDirection === 'right' && (
              <div className="absolute top-8 left-8 z-20 border-4 border-green-500 text-green-500 text-3xl font-black uppercase px-4 py-2 rounded-xl transform -rotate-12 tracking-widest pointer-events-none">
                SAVE
              </div>
            )}
            {swipeDirection === 'left' && (
              <div className="absolute top-8 right-8 z-20 border-4 border-red-500 text-red-500 text-3xl font-black uppercase px-4 py-2 rounded-xl transform rotate-12 tracking-widest pointer-events-none">
                SKIP
              </div>
            )}

            {/* Poster content */}
            <div className="relative w-full h-full">
              {activeMovie.image ? (
                <img 
                  src={activeMovie.image} 
                  alt={activeMovie.title} 
                  className="w-full h-full object-cover pointer-events-none"
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    img.style.display = 'none';
                    const fallback = img.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
              ) : null}

              {/* ─── Genre Art Fallback ─────────────────────────────────── */}
              <div
                className="w-full h-full flex-col items-center justify-center relative overflow-hidden"
                style={{ display: activeMovie.image ? 'none' : 'flex' }}
              >
                {/* AI-generated genre background image */}
                <img
                  src={getGenreArt(activeMovie.classification || '', activeMovie.title)}
                  alt={`${activeMovie.classification || 'Cinema'} atmosphere`}
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                />
                {/* Dark vignette overlay so text is readable */}
                <div className="absolute inset-0" style={{
                  background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.60) 100%)'
                }} />
                {/* Film grain */}
                <div className="absolute inset-0 opacity-[0.06]" style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'repeat'
                }} />
                {/* Letterbox bars */}
                <div className="absolute top-0 inset-x-0 h-[4%] bg-black opacity-80" />
                <div className="absolute bottom-0 inset-x-0 h-[4%] bg-black opacity-80" />
              </div>

              {/* Bottom Info Gradient */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/85 to-transparent p-6 pt-16 flex flex-col justify-end">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-black tracking-widest uppercase bg-gradient-to-r ${theme.textGradient} px-3 py-0.5 rounded-full border border-white/15`}>
                    Rank {activeMovie.rank}
                  </span>
                  <span className="text-xs text-indigo-200/60 font-semibold">{activeMovie.runtime}</span>
                </div>
                <h2 className="text-2xl font-extrabold text-white leading-tight drop-shadow-md">{activeMovie.title}</h2>
                <p className="text-xs font-bold text-indigo-300 mt-1">{activeMovie.year} • Directed by {activeMovie.director}</p>
                <p className="text-xs text-indigo-200/40 mt-1.5 font-medium">{activeMovie.classification}</p>
              </div>
            </div>

            {/* Holographic overlays */}
            <div className="card__shine" />
            <div className="card__glare" />
          </div>
        </div>
      </div>

      {/* Action Buttons: Skip | Info | Maybe | Seen | Save */}
      <div className="flex items-center justify-center gap-3 mt-4 z-20">
        <button
          onClick={() => triggerSwipe('left')}
          className="w-13 h-13 w-[52px] h-[52px] rounded-full bg-black/40 hover:bg-black/60 border border-red-500/20 hover:border-red-500/50 flex items-center justify-center text-red-400 active:scale-90 transition-all shadow-lg hover:shadow-red-900/20"
          title="Skip"
        >
          <X className="w-5 h-5" />
        </button>

        <button
          onClick={() => setShowDetails(true)}
          className="w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 border border-indigo-500/20 hover:border-indigo-500/50 flex items-center justify-center text-indigo-300 active:scale-90 transition-all shadow-lg hover:shadow-indigo-900/20"
          title="View Details"
        >
          <Info className="w-4 h-4" />
        </button>

        <button
          onClick={() => { onMaybe(activeMovie); setCurrentIndex(prev => prev + 1); setShowDetails(false); resetHoloCoordinates(); }}
          className="w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 border border-amber-500/20 hover:border-amber-500/50 flex items-center justify-center text-amber-400 active:scale-90 transition-all shadow-lg hover:shadow-amber-900/20"
          title="Maybe — save to Consider Later"
        >
          <Bookmark className="w-4 h-4" />
        </button>

        <button
          onClick={() => { onSeen(activeMovie); setCurrentIndex(prev => prev + 1); setShowDetails(false); resetHoloCoordinates(); }}
          className="w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 border border-sky-500/20 hover:border-sky-500/50 flex items-center justify-center text-sky-400 active:scale-90 transition-all shadow-lg hover:shadow-sky-900/20"
          title="Already Seen — mark as watched"
        >
          <Eye className="w-4 h-4" />
        </button>

        <button
          onClick={() => triggerSwipe('right')}
          className="w-[52px] h-[52px] rounded-full bg-black/40 hover:bg-black/60 border border-green-500/20 hover:border-green-500/50 flex items-center justify-center text-green-400 active:scale-90 transition-all shadow-lg hover:shadow-green-900/20"
          title="Save"
        >
          <Heart className="w-5 h-5 fill-current" />
        </button>
      </div>

      {/* Details drawer panel */}
      {showDetails && (
        <div className="absolute inset-0 z-30 bg-black/95 rounded-3xl p-6 overflow-y-auto flex flex-col justify-between animate-in slide-in-from-bottom duration-300 border border-white/10">
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-white">{activeMovie.title}</h3>
                <p className="text-xs text-indigo-300 font-bold">{activeMovie.year} • {activeMovie.director}</p>
              </div>
              <button 
                onClick={() => setShowDetails(false)}
                className="p-1.5 rounded-full bg-white/5 border border-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-sm leading-relaxed text-indigo-100/85">
              <section>
                <h4 className={`text-[10px] uppercase font-bold tracking-widest text-${theme.primary}-300 mb-1`}>Synopsis</h4>
                <p>{activeMovie.synopsis}</p>
              </section>

              {activeMovie.artisticMerit && (
                <section>
                  <h4 className={`text-[10px] uppercase font-bold tracking-widest text-${theme.primary}-300 mb-1`}>Artistic Vision</h4>
                  <p>{activeMovie.artisticMerit}</p>
                </section>
              )}

              {activeMovie.genreAnalysis && (
                <section>
                  <h4 className={`text-[10px] uppercase font-bold tracking-widest text-${theme.primary}-300 mb-1`}>Genre Insights</h4>
                  <p>{activeMovie.genreAnalysis}</p>
                </section>
              )}

              {activeMovie.keyThemes && activeMovie.keyThemes.length > 0 && (
                <section>
                  <h4 className={`text-[10px] uppercase font-bold tracking-widest text-${theme.primary}-300 mb-2`}>Key Themes</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {activeMovie.keyThemes.map(t => (
                      <span key={t} className="text-[10px] font-semibold bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full text-indigo-200">
                        {t}
                      </span>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center">
            {activeMovie.trailer && (
              <a
                href={activeMovie.trailer}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-full"
              >
                <Youtube className="w-4 h-4 fill-current" />
                Watch Trailer
              </a>
            )}
            <button
              onClick={() => setShowDetails(false)}
              className="text-xs text-indigo-300 font-bold hover:underline"
            >
              Back to Card
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
