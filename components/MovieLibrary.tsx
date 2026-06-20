import React, { useState } from 'react';
import { Movie, Theme } from '../types';
import { Trash2, Youtube, Search, Info, SlidersHorizontal, Popcorn, Film, X } from 'lucide-react';

interface MovieLibraryProps {
  likedMovies: Movie[];
  theme: Theme;
  onRemove: (movie: Movie) => void;
}

export const MovieLibrary: React.FC<MovieLibraryProps> = ({ likedMovies, theme, onRemove }) => {
  const [search, setSearch] = useState('');
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  const filteredMovies = likedMovies.filter(movie => 
    movie.title.toLowerCase().includes(search.toLowerCase()) ||
    movie.director.toLowerCase().includes(search.toLowerCase()) ||
    movie.classification.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col justify-between">
      {/* Header and Search */}
      <div className="mb-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-3">
            <Popcorn className={`w-6 h-6 text-${theme.primary}-400`} />
            <span className={`bg-clip-text text-transparent bg-gradient-to-r ${theme.textGradient}`}>Saved Shelf</span>
          </h2>
          <span className={`text-xs font-bold bg-${theme.accent}-500/20 text-${theme.accent}-200 px-3 py-1 rounded-full border border-${theme.accent}-500/30`}>
            {likedMovies.length} Curated
          </span>
        </div>

        {likedMovies.length > 0 && (
          <div className="relative group">
            <input 
              type="text"
              placeholder="Search by title, director, genre..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-black/40 border border-white/10 hover:border-white/20 focus:border-transparent rounded-2xl text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-violet-500 focus:outline-none transition-colors"
            />
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500 group-focus-within:text-violet-400 transition-colors" />
          </div>
        )}
      </div>

      {/* Library Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
        {likedMovies.length === 0 ? (
          <div className="h-96 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-white/10 rounded-3xl bg-white/5 backdrop-blur-sm">
            <div className="bg-slate-800/50 p-6 rounded-full mb-4">
              <Film className="w-12 h-12 text-slate-500" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-white">Shelf Empty</h3>
            <p className="text-indigo-200/50 max-w-xs leading-relaxed text-sm">
              Your curated movie shelf is empty. Go to Curate to generate movies, then swipe right to save them here!
            </p>
          </div>
        ) : filteredMovies.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center text-indigo-200/50">
            <SlidersHorizontal className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-sm">No matches found for your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {filteredMovies.map(movie => (
              <div 
                key={movie.title}
                onClick={() => setSelectedMovie(movie)}
                className="group relative rounded-2xl overflow-hidden bg-slate-950 border border-white/5 hover:border-white/10 shadow-lg cursor-pointer transform hover:-translate-y-1 transition-all duration-300 flex flex-col"
              >
                {/* Image and Overlay */}
                <div className="relative aspect-[2/3] w-full bg-slate-900 overflow-hidden">
                  {movie.image ? (
                    <img 
                      src={movie.image} 
                      alt={movie.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${theme.bgGradient} flex items-center justify-center p-4`}>
                      <Film className="w-8 h-8 text-white/30" />
                    </div>
                  )}

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                  {/* Actions buttons overlay */}
                  <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemove(movie);
                      }}
                      className="p-1.5 rounded-full bg-black/60 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all shadow"
                      title="Remove from Shelf"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  
                  {/* Title overlay */}
                  <div className="absolute inset-x-0 bottom-0 p-3 flex flex-col justify-end">
                    <h3 className="text-xs font-black tracking-widest text-slate-400 uppercase">RANK {movie.rank}</h3>
                    <h4 className="text-sm font-extrabold text-white leading-snug line-clamp-2 mt-0.5">{movie.title}</h4>
                    <p className="text-[10px] text-indigo-300 font-bold mt-0.5">{movie.year}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Full Details Modal */}
      {selectedMovie && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div 
            className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-slate-950 border border-white/10 rounded-3xl p-6 md:p-8 flex flex-col justify-between shadow-2xl custom-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button 
              onClick={() => setSelectedMovie(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/5 border border-white/10 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Poster + Meta Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {/* Poster */}
              <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-white/10 aspect-[2/3] max-w-[200px] mx-auto md:mx-0 shadow-lg">
                {selectedMovie.image ? (
                  <img 
                    src={selectedMovie.image} 
                    alt={selectedMovie.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className={`w-full h-full bg-gradient-to-br ${theme.bgGradient} flex items-center justify-center`}>
                    <Film className="w-12 h-12 text-white/30" />
                  </div>
                )}
              </div>

              {/* Meta */}
              <div className="md:col-span-2 flex flex-col justify-center space-y-4">
                <span className={`text-xs font-black tracking-widest uppercase bg-gradient-to-r ${theme.textGradient} px-3 py-0.5 rounded-full border border-white/10 inline-block w-fit`}>
                  Rank {selectedMovie.rank}
                </span>
                <h2 className="text-3xl font-extrabold text-white leading-tight">{selectedMovie.title}</h2>
                <div className="space-y-1.5 text-sm text-indigo-300 font-bold">
                  <p>Year: <span className="text-white font-medium">{selectedMovie.year}</span></p>
                  <p>Director: <span className="text-white font-medium">{selectedMovie.director}</span></p>
                  <p>Classification: <span className="text-white font-medium">{selectedMovie.classification}</span></p>
                  <p>Runtime: <span className="text-white font-medium">{selectedMovie.runtime}</span></p>
                </div>
              </div>
            </div>

            {/* In-depth Review */}
            <div className="space-y-6 text-sm leading-relaxed text-indigo-100/80 border-t border-white/10 pt-6">
              <section>
                <h4 className={`text-[10px] uppercase font-bold tracking-widest text-${theme.primary}-300 mb-1`}>Synopsis</h4>
                <p>{selectedMovie.synopsis}</p>
              </section>

              {selectedMovie.criticalOverview && (
                <section>
                  <h4 className={`text-[10px] uppercase font-bold tracking-widest text-${theme.primary}-300 mb-1`}>Critical & Technical Overview</h4>
                  <p className="whitespace-pre-line">{selectedMovie.criticalOverview}</p>
                </section>
              )}

              {selectedMovie.artisticMerit && (
                <section>
                  <h4 className={`text-[10px] uppercase font-bold tracking-widest text-${theme.primary}-300 mb-1`}>Artistic Vision</h4>
                  <p>{selectedMovie.artisticMerit}</p>
                </section>
              )}

              {selectedMovie.genreAnalysis && (
                <section>
                  <h4 className={`text-[10px] uppercase font-bold tracking-widest text-${theme.primary}-300 mb-1`}>Genre Conventions & Evolution</h4>
                  <p>{selectedMovie.genreAnalysis}</p>
                </section>
              )}

              {selectedMovie.culturalImpact && (
                <section>
                  <h4 className={`text-[10px] uppercase font-bold tracking-widest text-${theme.primary}-300 mb-1`}>Cultural Significance</h4>
                  <p>{selectedMovie.culturalImpact}</p>
                </section>
              )}

              {selectedMovie.keyThemes && selectedMovie.keyThemes.length > 0 && (
                <section>
                  <h4 className={`text-[10px] uppercase font-bold tracking-widest text-${theme.primary}-300 mb-2`}>Key Themes</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedMovie.keyThemes.map(t => (
                      <span key={t} className="text-[10px] font-semibold bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full text-indigo-200">
                        {t}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {selectedMovie.technicalElements && selectedMovie.technicalElements.length > 0 && (
                <section>
                  <h4 className={`text-[10px] uppercase font-bold tracking-widest text-${theme.primary}-300 mb-2`}>Technical Elements</h4>
                  <ul className="list-disc pl-4 space-y-1">
                    {selectedMovie.technicalElements.map((te, index) => (
                      <li key={index} className="text-indigo-200/90">{te}</li>
                    ))}
                  </ul>
                </section>
              )}
            </div>

            {/* Footer / Actions */}
            <div className="mt-8 pt-4 border-t border-white/10 flex justify-between items-center">
              {selectedMovie.trailer && (
                <a
                  href={selectedMovie.trailer}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 px-5 py-2.5 rounded-full"
                >
                  <Youtube className="w-4.5 h-4.5 fill-current" />
                  Watch Trailer
                </a>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    onRemove(selectedMovie);
                    setSelectedMovie(null);
                  }}
                  className="inline-flex items-center gap-2 text-xs font-bold text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 px-4 py-2.5 rounded-full"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
                <button
                  onClick={() => setSelectedMovie(null)}
                  className="text-xs text-indigo-300 font-bold bg-white/5 border border-white/10 hover:bg-white/10 px-4 py-2.5 rounded-full"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
