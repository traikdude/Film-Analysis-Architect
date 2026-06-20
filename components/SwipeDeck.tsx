import React, { useState, useRef, useEffect } from 'react';
import { Movie, Theme } from '../types';
import { Heart, X, Info, Youtube, Flame, Check, AlertCircle } from 'lucide-react';

interface SwipeDeckProps {
  movies: Movie[];
  theme: Theme;
  onLike: (movie: Movie) => void;
  onDislike: (movie: Movie) => void;
  onComplete: () => void;
}

export const SwipeDeck: React.FC<SwipeDeckProps> = ({ movies, theme, onLike, onDislike, onComplete }) => {
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

              {/* ─── Cinematic Fallback Poster Art ─────────────────────────── */}
              <div
                className="w-full h-full flex-col items-center justify-center relative overflow-hidden"
                style={{ display: activeMovie.image ? 'none' : 'flex' }}
              >
                {/* Film grain texture overlay */}
                <div className="absolute inset-0 opacity-[0.07]" style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'repeat'
                }} />

                {/* Genre-keyed gradient background */}
                {(() => {
                  const genre = (activeMovie.classification || activeMovie.genre_analysis || '').toLowerCase();
                  let grad = 'from-[#0a0a1a] via-[#0d1128] to-[#070714]'; // default deep blue-black
                  let accentColor = '#6366f1';
                  let accentColorDim = '#312e81';
                  if (genre.includes('horror') || genre.includes('supernatural')) {
                    grad = 'from-[#1a0005] via-[#0d0008] to-[#000005]';
                    accentColor = '#dc2626'; accentColorDim = '#450a0a';
                  } else if (genre.includes('thriller') || genre.includes('noir')) {
                    grad = 'from-[#0a0a0a] via-[#111115] to-[#05050f]';
                    accentColor = '#94a3b8'; accentColorDim = '#1e293b';
                  } else if (genre.includes('sci-fi') || genre.includes('science fiction')) {
                    grad = 'from-[#020c1b] via-[#061428] to-[#010a18]';
                    accentColor = '#38bdf8'; accentColorDim = '#0c4a6e';
                  } else if (genre.includes('comedy') || genre.includes('dark comedy')) {
                    grad = 'from-[#1a0e00] via-[#120900] to-[#080400]';
                    accentColor = '#f59e0b'; accentColorDim = '#451a03';
                  }
                  return (
                    <>
                      <div className={`absolute inset-0 bg-gradient-to-b ${grad}`} />
                      {/* Cinematic vignette */}
                      <div className="absolute inset-0" style={{
                        background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.75) 100%)'
                      }} />
                      {/* Atmospheric glow orb */}
                      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full blur-3xl opacity-20"
                        style={{ background: accentColor }} />
                      {/* Horizontal scan lines */}
                      <div className="absolute inset-0 opacity-[0.025]" style={{
                        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,1) 2px, rgba(255,255,255,1) 3px)',
                        backgroundSize: '100% 4px'
                      }} />
                      {/* Corner accent lines — cinematic frame */}
                      {[['top-5 left-5','top-5 left-5'],['top-5 right-5','top-5 right-5'],['bottom-5 left-5','bottom-5 left-5'],['bottom-5 right-5','bottom-5 right-5']].map((_,i) => (
                        <div key={i} className={`absolute ${i===0?'top-5 left-5':i===1?'top-5 right-5':i===2?'bottom-5 left-5':'bottom-5 right-5'} w-8 h-8 opacity-40`}
                          style={{
                            borderTop: i < 2 ? `2px solid ${accentColor}` : 'none',
                            borderBottom: i >= 2 ? `2px solid ${accentColor}` : 'none',
                            borderLeft: i % 2 === 0 ? `2px solid ${accentColor}` : 'none',
                            borderRight: i % 2 === 1 ? `2px solid ${accentColor}` : 'none',
                          }}
                        />
                      ))}
                      {/* Central title composition */}
                      <div className="relative z-10 flex flex-col items-center justify-center text-center px-8 gap-4">
                        {/* Genre pill */}
                        <span className="text-[9px] font-black tracking-[0.3em] uppercase px-3 py-1 rounded-full border opacity-70"
                          style={{ borderColor: accentColor, color: accentColor }}>
                          {(activeMovie.classification || 'Cinema').split('|')[0].trim()}
                        </span>
                        {/* Large typographic title */}
                        <h1 className="text-3xl font-black text-white leading-tight drop-shadow-2xl text-center"
                          style={{ textShadow: `0 0 40px ${accentColor}60, 0 2px 4px rgba(0,0,0,0.9)` }}>
                          {activeMovie.title}
                        </h1>
                        {/* Divider line */}
                        <div className="w-12 h-px opacity-50" style={{ background: accentColor }} />
                        {/* Year */}
                        <span className="text-xs font-semibold tracking-widest opacity-50 text-white uppercase">
                          {activeMovie.year}
                        </span>
                      </div>
                      {/* Letterbox bars — cinematic feel */}
                      <div className="absolute top-0 inset-x-0 h-[5%] bg-black opacity-70" />
                      <div className="absolute bottom-0 inset-x-0 h-[5%] bg-black opacity-70" />
                    </>
                  );
                })()}
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

      {/* Manual Actions buttons */}
      <div className="flex items-center justify-center gap-6 mt-4 z-20">
        <button
          onClick={() => triggerSwipe('left')}
          className="w-14 h-14 rounded-full bg-black/40 hover:bg-black/60 border border-red-500/20 hover:border-red-500/50 flex items-center justify-center text-red-400 active:scale-90 transition-all shadow-lg hover:shadow-red-900/20"
          title="Skip/Dislike"
        >
          <X className="w-6 h-6" />
        </button>

        <button
          onClick={() => setShowDetails(true)}
          className="w-12 h-12 rounded-full bg-black/40 hover:bg-black/60 border border-indigo-500/20 hover:border-indigo-500/50 flex items-center justify-center text-indigo-300 active:scale-90 transition-all shadow-lg hover:shadow-indigo-900/20"
          title="View Details"
        >
          <Info className="w-5 h-5" />
        </button>

        <button
          onClick={() => triggerSwipe('right')}
          className="w-14 h-14 rounded-full bg-black/40 hover:bg-black/60 border border-green-500/20 hover:border-green-500/50 flex items-center justify-center text-green-400 active:scale-90 transition-all shadow-lg hover:shadow-green-900/20"
          title="Save/Like"
        >
          <Heart className="w-6 h-6 fill-current" />
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
