
import React, { useState } from 'react';
import { ConfigurationPanel } from './components/ConfigurationPanel';
import { AnalysisResult } from './components/AnalysisResult';
import { AppState, AnalysisStatus } from './types';
import { generateFilmAnalysis } from './services/geminiService';
import { YEARS, THEMES } from './constants';

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

  const activeTheme = THEMES[state.themeId] || THEMES['joyful'];

  const handleUpdate = (newState: Partial<AppState>) => {
    setState(prev => ({ ...prev, ...newState }));
  };

  const handleGenerate = async () => {
    setStatus('generating');
    setError(undefined);
    try {
      const analysisText = await generateFilmAnalysis(state);
      setResult(analysisText);
      setStatus('completed');
    } catch (e: any) {
      setError(e.message || "An unexpected error occurred.");
      setStatus('error');
    }
  };

  return (
    <div className={`flex h-screen w-full overflow-hidden font-sans bg-gradient-to-br ${activeTheme.appBg}`}>
      {/* Sidebar - Configuration */}
      <aside className="w-80 md:w-96 flex-shrink-0 z-30 shadow-2xl relative transition-all duration-500">
        <ConfigurationPanel 
          state={state} 
          onUpdate={handleUpdate} 
          onGenerate={handleGenerate}
          isGenerating={status === 'generating'}
          theme={activeTheme}
        />
      </aside>

      {/* Main Content - Result */}
      <main className="flex-1 relative p-4 md:p-8 overflow-hidden bg-transparent">
        {/* Decorative Background Elements - Dynamic based on theme colors roughly */}
        <div className={`absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-gradient-to-b from-${activeTheme.primary}-600/20 to-${activeTheme.secondary}-600/20 rounded-full blur-[120px] pointer-events-none animate-pulse duration-[5000ms]`} />
        <div className={`absolute bottom-[-20%] left-[10%] w-[600px] h-[600px] bg-gradient-to-t from-${activeTheme.secondary}-600/10 to-${activeTheme.accent}-600/10 rounded-full blur-[100px] pointer-events-none`} />
        
        <div className="relative z-10 h-full max-w-5xl mx-auto">
          <AnalysisResult 
            status={status} 
            result={result} 
            error={error} 
            theme={activeTheme}
          />
        </div>
      </main>
    </div>
  );
};

export default App;
