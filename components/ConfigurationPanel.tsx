
import React, { useState, useEffect } from 'react';
import { AppState, GenreCategory, Theme } from '../types';
import { GENRE_DATA, YEARS, THEMES } from '../constants';
import { ChevronDown, Check, Clapperboard, Calendar, Sparkles, Palette, Settings, Key, X, Eye, EyeOff } from 'lucide-react';

interface ConfigurationPanelProps {
  state: AppState;
  onUpdate: (newState: Partial<AppState>) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  theme: Theme;
}

export const ConfigurationPanel: React.FC<ConfigurationPanelProps> = ({ state, onUpdate, onGenerate, isGenerating, theme }) => {
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [tmdbKey, setTmdbKey] = useState('');
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    const savedKey = localStorage.getItem('user_gemini_api_key') || '';
    const savedTmdb = localStorage.getItem('tmdb_api_key') || '';
    setApiKey(savedKey);
    setTmdbKey(savedTmdb);
  }, []);

  const handleSaveKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem('user_gemini_api_key', apiKey.trim());
    } else {
      localStorage.removeItem('user_gemini_api_key');
    }
    if (tmdbKey.trim()) {
      localStorage.setItem('tmdb_api_key', tmdbKey.trim());
    } else {
      localStorage.removeItem('tmdb_api_key');
    }
    setShowSettings(false);
  };

  const toggleGenre = (genreId: string) => {
    const newSelected = { ...state.selectedGenres };
    if (newSelected[genreId]) {
      delete newSelected[genreId];
      // Cleanup subgenres
      const newSubSelected = { ...state.selectedSubGenres };
      delete newSubSelected[genreId];
      onUpdate({ selectedGenres: newSelected, selectedSubGenres: newSubSelected });
    } else {
      newSelected[genreId] = true;
      onUpdate({ selectedGenres: newSelected });
    }
  };

  const toggleSubGenre = (genreId: string, subOption: string) => {
    const currentSubs = state.selectedSubGenres[genreId] || [];
    let newSubs;
    if (currentSubs.includes(subOption)) {
      newSubs = currentSubs.filter(s => s !== subOption);
    } else {
      newSubs = [...currentSubs, subOption];
    }
    onUpdate({
      selectedSubGenres: {
        ...state.selectedSubGenres,
        [genreId]: newSubs
      }
    });
  };

  return (
    <div className="flex flex-col h-full bg-black/20 backdrop-blur-md border-r border-white/10">
      <div className={`p-6 border-b border-white/10 bg-gradient-to-r ${theme.bgGradient} flex items-center justify-between`}>
        <div>
          <h1 className={`text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r ${theme.textGradient} flex items-center gap-3 drop-shadow-sm`}>
            <span className="text-3xl">🎬</span>
            Film Architect
          </h1>
          <p className={`text-xs text-${theme.primary}-200/70 mt-2 font-medium tracking-wide`}>✨ AI-Powered Cinematic Curation</p>
        </div>
        <button
          onClick={() => setShowSettings(true)}
          className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors shadow-md hover:scale-105 active:scale-95 duration-200"
          title="Configure API Key"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="bg-[#1e1b4b]/95 border border-white/15 rounded-3xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Key className={`w-5 h-5 text-${theme.primary}-400`} />
                🔑 API Configuration
              </h3>
              <button
                onClick={() => setShowSettings(false)}
                className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              Configure your personal Gemini API key here. It will be saved securely in your browser's local storage and used directly for requests. 🔒
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5 ml-1">
                  Gemini API Key
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full bg-black/45 border border-white/15 text-white text-sm rounded-xl py-2.5 pl-3 pr-10 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 text-slate-400 hover:text-white transition-colors"
                  >
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5 ml-1">
                  TMDB API Key <span className="text-indigo-400 normal-case">(for real movie posters)</span>
                </label>
                <input
                  type="password"
                  value={tmdbKey}
                  onChange={(e) => setTmdbKey(e.target.value)}
                  placeholder="Get free key at themoviedb.org/settings/api"
                  className="w-full bg-black/45 border border-white/15 text-white text-sm rounded-xl py-2.5 pl-3 pr-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none font-mono"
                />
                <a
                  href="https://www.themoviedb.org/settings/api"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-indigo-400 hover:underline mt-1 block"
                >
                  → Get your free TMDB API key here
                </a>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setApiKey('');
                  localStorage.removeItem('user_gemini_api_key');
                  setShowSettings(false);
                }}
                className="flex-1 py-2.5 rounded-xl border border-white/10 text-xs font-semibold text-slate-300 hover:bg-white/5 transition-colors"
              >
                🗑️ Clear Key
              </button>
              <button
                onClick={handleSaveKey}
                className={`flex-1 py-2.5 rounded-xl bg-gradient-to-r ${theme.buttonGradient} text-xs font-bold text-white hover:brightness-110 active:scale-[0.98] transition-all`}
              >
                💾 Save Key
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
        
        {/* Theme Selection */}
        <section className="glass-panel rounded-2xl p-4 shadow-lg shadow-black/20">
          <div className={`flex items-center gap-2 mb-3 text-${theme.primary}-300 uppercase text-xs font-bold tracking-widest`}>
            <Palette className="w-4 h-4" />
            🎨 Theme
          </div>
          <div className="grid grid-cols-5 gap-2">
            {Object.values(THEMES).map(t => (
              <button
                key={t.id}
                onClick={() => onUpdate({ themeId: t.id })}
                className={`group relative flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 ${
                  state.themeId === t.id 
                    ? `bg-white/10 border border-${theme.primary}-500/50 shadow-lg shadow-${theme.primary}-900/20` 
                    : 'hover:bg-white/5 border border-transparent'
                }`}
                title={t.name}
              >
                <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${t.buttonGradient} shadow-md mb-1 transform group-hover:scale-110 transition-transform ${state.themeId === t.id ? 'scale-110 ring-2 ring-white/20' : ''}`}></div>
                <span className={`text-[9px] font-medium ${state.themeId === t.id ? 'text-white' : 'text-slate-400'}`}>{t.name.split(' ')[1] || t.name}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Year Section */}
        <section className="glass-panel rounded-2xl p-5 shadow-lg shadow-black/20">
          <div className={`flex items-center gap-2 mb-4 text-${theme.primary}-300 uppercase text-xs font-bold tracking-widest`}>
            <Calendar className="w-4 h-4" />
            📅 Era Selection
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-[10px] uppercase text-${theme.accent}-300 mb-1.5 ml-1 font-bold`}>From</label>
              <div className="relative group">
                <select 
                  value={state.startYear}
                  onChange={(e) => onUpdate({ startYear: e.target.value })}
                  className={`w-full bg-black/40 border border-white/10 text-white text-sm rounded-xl focus:ring-2 focus:ring-${theme.primary}-500 focus:border-transparent block p-2.5 appearance-none cursor-pointer hover:bg-black/60 transition-colors`}
                >
                  {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                <ChevronDown className={`absolute right-3 top-3 w-4 h-4 text-${theme.primary}-400 pointer-events-none group-hover:scale-110 transition-transform`} />
              </div>
            </div>
            <div>
              <label className={`block text-[10px] uppercase text-${theme.accent}-300 mb-1.5 ml-1 font-bold`}>To</label>
              <div className="relative group">
                <select 
                  value={state.endYear}
                  onChange={(e) => onUpdate({ endYear: e.target.value })}
                  className={`w-full bg-black/40 border border-white/10 text-white text-sm rounded-xl focus:ring-2 focus:ring-${theme.primary}-500 focus:border-transparent block p-2.5 appearance-none cursor-pointer hover:bg-black/60 transition-colors`}
                >
                  {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                <ChevronDown className={`absolute right-3 top-3 w-4 h-4 text-${theme.primary}-400 pointer-events-none group-hover:scale-110 transition-transform`} />
              </div>
            </div>
          </div>
        </section>

        {/* Genres Section */}
        <section>
          <div className="flex items-center justify-between mb-4 px-1">
             <div className={`flex items-center gap-2 text-${theme.primary}-300 uppercase text-xs font-bold tracking-widest`}>
              <Clapperboard className="w-4 h-4" />
              🎭 Genre Mix
            </div>
            <span className={`text-[10px] font-bold bg-${theme.accent}-500/20 text-${theme.accent}-200 px-2 py-1 rounded-full border border-${theme.accent}-500/30`}>
              {Object.keys(state.selectedGenres).length} Selected
            </span>
          </div>
          
          <div className="space-y-3">
            {GENRE_DATA.map((genre) => {
              const isSelected = !!state.selectedGenres[genre.id];
              const selectedCount = (state.selectedSubGenres[genre.id] || []).length;

              return (
                <div key={genre.id} className={`rounded-xl border transition-all duration-300 ${isSelected ? `bg-gradient-to-r ${theme.bgGradient} border-${theme.primary}-500/50 shadow-lg shadow-${theme.primary}-900/20 scale-[1.02]` : 'bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/10'}`}>
                  {/* Genre Header */}
                  <button
                    onClick={() => toggleGenre(genre.id)}
                    className="w-full flex items-center justify-between p-3 text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all duration-300 ${isSelected ? `bg-gradient-to-br ${theme.buttonGradient} border-transparent text-white shadow-md transform rotate-3` : 'border-white/20 text-transparent bg-black/20'}`}>
                        <Check className="w-4 h-4" />
                      </div>
                      <span className={`text-sm font-semibold tracking-wide ${isSelected ? 'text-white' : 'text-slate-300'}`}>{genre.name}</span>
                    </div>
                    {isSelected && (genre.options || genre.subcategories) && (
                       <div className={`text-[10px] text-${theme.primary}-200 bg-black/40 px-2 py-0.5 rounded-full font-medium border border-white/10`}>
                         {selectedCount > 0 ? `✨ ${selectedCount}` : 'All'}
                       </div>
                    )}
                  </button>

                  {/* Subgenres Expansion */}
                  {isSelected && (
                    <div className="px-3 pb-3 pt-1 border-t border-white/10 animate-in fade-in slide-in-from-top-1 duration-200">
                      {/* Flat Options */}
                      {genre.options && (
                        <div className="grid grid-cols-1 gap-1 mt-2">
                          {genre.options.map(opt => (
                            <label key={opt} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg cursor-pointer group transition-colors">
                              <div className={`w-1.5 h-1.5 rounded-full transition-colors ${
                                (state.selectedSubGenres[genre.id] || []).includes(opt) ? `bg-${theme.secondary}-400 shadow-[0_0_8px_rgba(251,146,60,0.8)]` : 'bg-slate-600 group-hover:bg-slate-500'
                              }`} />
                              <input 
                                type="checkbox" 
                                className="hidden"
                                checked={(state.selectedSubGenres[genre.id] || []).includes(opt)}
                                onChange={() => toggleSubGenre(genre.id, opt)}
                              />
                              <span className={`text-xs font-medium transition-colors ${
                                (state.selectedSubGenres[genre.id] || []).includes(opt) ? `text-${theme.secondary}-200` : 'text-slate-400 group-hover:text-slate-200'
                              }`}>{opt}</span>
                            </label>
                          ))}
                        </div>
                      )}

                      {/* Grouped Options */}
                      {genre.subcategories && (
                        <div className="space-y-4 mt-2">
                          {genre.subcategories.map(sub => (
                            <div key={sub.name}>
                              <h4 className={`text-[10px] uppercase tracking-widest text-${theme.accent}-300 font-bold mb-2 pl-1 mt-2 flex items-center gap-1`}>
                                <span className={`w-1 h-3 bg-${theme.accent}-500 rounded-full inline-block`}></span>
                                {sub.name}
                              </h4>
                              <div className="grid grid-cols-1 gap-1">
                                {sub.options.map(opt => (
                                  <label key={opt} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg cursor-pointer group transition-colors">
                                    <div className={`w-1.5 h-1.5 rounded-full transition-colors ${
                                      (state.selectedSubGenres[genre.id] || []).includes(opt) ? `bg-${theme.secondary}-400 shadow-[0_0_8px_rgba(251,146,60,0.8)]` : 'bg-slate-600 group-hover:bg-slate-500'
                                    }`} />
                                    <input 
                                      type="checkbox" 
                                      className="hidden"
                                      checked={(state.selectedSubGenres[genre.id] || []).includes(opt)}
                                      onChange={() => toggleSubGenre(genre.id, opt)}
                                    />
                                    <span className={`text-xs font-medium transition-colors ${
                                      (state.selectedSubGenres[genre.id] || []).includes(opt) ? `text-${theme.secondary}-200` : 'text-slate-400 group-hover:text-slate-200'
                                    }`}>{opt}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <div className="p-6 border-t border-white/10 bg-black/40 backdrop-blur-xl">
        <button
          onClick={onGenerate}
          disabled={isGenerating || Object.keys(state.selectedGenres).length === 0}
          className={`w-full py-4 px-6 rounded-2xl font-bold text-sm uppercase tracking-widest transition-all duration-300 shadow-xl
            ${isGenerating || Object.keys(state.selectedGenres).length === 0
              ? 'bg-slate-800/50 text-slate-500 cursor-not-allowed border border-white/5' 
              : `bg-gradient-to-r ${theme.buttonGradient} text-white hover:brightness-110 active:scale-[0.98] shadow-${theme.secondary}-900/40 border border-white/10 ring-2 ring-transparent hover:ring-${theme.primary}-500/30`
            }
          `}
        >
          {isGenerating ? (
            <span className="flex items-center justify-center gap-3">
              <Sparkles className="w-4 h-4 animate-spin text-yellow-300" />
              <span className="animate-pulse">Curating Magic...</span>
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
               🚀 Generate Analysis
            </span>
          )}
        </button>
      </div>
    </div>
  );
};
