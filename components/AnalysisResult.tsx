
import React, { useState, useEffect } from 'react';
import { AnalysisStatus, Theme } from '../types';
import { Loader2, AlertTriangle, Sparkles, Youtube, Film, Popcorn, Flame } from 'lucide-react';

interface AnalysisResultProps {
  status: AnalysisStatus;
  result: string;
  error?: string;
  theme: Theme;
}

const PosterImage: React.FC<{ src: string, alt: string, theme: Theme }> = ({ src, alt, theme }) => {
  const [error, setError] = React.useState(false);

  if (error || !src) return null;

  return (
    <div className="my-8 relative group inline-block">
      {/* Glow Effect */}
      <div className={`absolute -inset-1 bg-gradient-to-br from-${theme.primary}-500 to-${theme.secondary}-500 rounded-xl blur opacity-30 group-hover:opacity-75 transition duration-1000 group-hover:duration-200 animate-tilt`}></div>
      
      <img 
        src={src} 
        alt={alt}
        onError={() => setError(true)}
        className="relative z-10 w-full max-w-[250px] md:max-w-[280px] rounded-lg shadow-2xl border border-white/10 bg-slate-900 object-cover aspect-[2/3] transition-transform duration-500 group-hover:scale-[1.01]"
        loading="lazy"
      />
      <div className={`absolute bottom-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-bold text-white border border-white/10 flex items-center gap-1`}>
        <Film className={`w-3 h-3 text-${theme.primary}-400`} />
        POSTER
      </div>
    </div>
  );
};

// Particle component for the explosion
const PopcornParticle: React.FC<{ delay: number; x: number; y: number; rotate: number; scale: number }> = ({ delay, x, y, rotate, scale }) => (
  <div 
    className="absolute top-1/2 left-1/2 text-2xl pointer-events-none"
    style={{
      '--tx': `${x}px`,
      '--ty': `${y}px`,
      '--rot': `${rotate}deg`,
      '--s': scale,
      animation: `popcorn-explode 1.5s cubic-bezier(0.1, 0.7, 1.0, 0.1) forwards ${delay}s`
    } as React.CSSProperties}
  >
    🍿
  </div>
);

export const AnalysisResult: React.FC<AnalysisResultProps> = ({ status, result, error, theme }) => {
  // Internal state to manage the explosion transition sequence
  const [internalStage, setInternalStage] = useState<'idle' | 'generating' | 'exploding' | 'results' | 'error'>('idle');
  const [particles, setParticles] = useState<any[]>([]);

  // Sync prop status with internal animation stage
  useEffect(() => {
    if (status === 'idle') setInternalStage('idle');
    if (status === 'error') setInternalStage('error');
    
    if (status === 'generating') {
      setInternalStage('generating');
    }
    
    if (status === 'completed') {
      // Only trigger explosion if we are coming from generating state
      if (internalStage === 'generating') {
        setInternalStage('exploding');
        // Generate random particles
        const newParticles = Array.from({ length: 40 }).map((_, i) => ({
          id: i,
          x: (Math.random() - 0.5) * 800, // Wide spread
          y: (Math.random() - 0.5) * 800,
          rotate: Math.random() * 720,
          scale: 0.5 + Math.random(),
          delay: Math.random() * 0.2
        }));
        setParticles(newParticles);

        // Transition to results after animation
        const timer = setTimeout(() => {
          setInternalStage('results');
        }, 1800);
        return () => clearTimeout(timer);
      } else if (internalStage !== 'results') {
         // If we missed the generating state (e.g. fast load), just go to results
         setInternalStage('results');
      }
    }
  }, [status, internalStage]);

  // Inject Custom Keyframes for the animation
  const animationStyles = `
    @keyframes pop-shiver {
      0%, 100% { transform: scale(1) rotate(0deg); }
      25% { transform: scale(1.1) rotate(-10deg); }
      50% { transform: scale(1.1) rotate(10deg); }
      75% { transform: scale(1.05) rotate(-5deg); }
    }
    @keyframes popcorn-explode {
      0% { transform: translate(-50%, -50%) scale(0) rotate(0deg); opacity: 1; }
      10% { opacity: 1; transform: translate(-50%, -50%) scale(1.2) rotate(0deg); }
      100% { transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) rotate(var(--rot)) scale(var(--s)); opacity: 0; }
    }
    .animate-pop-shiver {
      animation: pop-shiver 0.4s infinite;
    }
  `;

  // --- RENDER STATES ---

  if (internalStage === 'idle') {
    return (
      <div className={`h-full flex flex-col items-center justify-center p-8 text-center rounded-3xl border-2 border-dashed border-white/10 bg-white/5 backdrop-blur-sm group hover:border-${theme.primary}-500/30 transition-colors relative overflow-hidden`}>
        <div className={`bg-gradient-to-br from-${theme.primary}-500/20 to-${theme.secondary}-500/20 p-8 rounded-full mb-6 group-hover:scale-110 transition-transform duration-500 relative z-10`}>
           <Popcorn className={`w-20 h-20 text-${theme.primary}-400 opacity-90`} />
        </div>
        <h3 className={`text-3xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r ${theme.textGradient} relative z-10`}>Ready to Analyze</h3>
        <p className="max-w-md text-indigo-200/60 leading-relaxed text-sm relative z-10">
          Select your favorite genres and eras from the sidebar to begin your cinematic journey. 
          <br/><span className={`text-${theme.primary}-400 mt-2 block font-medium`}>✨ Magic awaits!</span>
        </p>
      </div>
    );
  }

  if (internalStage === 'generating') {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 relative overflow-hidden">
        <style>{animationStyles}</style>
        
        <div className="relative mb-10">
          {/* Heat Waves / Sparkles */}
          <div className={`absolute inset-0 bg-gradient-to-r from-${theme.secondary}-500 to-${theme.accent}-500 blur-2xl opacity-40 animate-pulse rounded-full`}></div>
          <div className={`absolute -inset-4 border-2 border-${theme.secondary}-500/30 rounded-full animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]`}></div>
          <div className={`absolute -inset-8 border border-${theme.primary}-500/20 rounded-full animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite_0.5s]`}></div>
          
          {/* Popping Icon */}
          <div className={`relative bg-black/60 p-6 rounded-full border border-${theme.secondary}-500/30 backdrop-blur-xl animate-pop-shiver`}>
             <Popcorn className={`w-20 h-20 text-${theme.secondary}-400 fill-${theme.secondary}-400/20`} />
             <div className="absolute -top-2 -right-2">
                <Sparkles className="w-6 h-6 text-yellow-300 animate-bounce" />
             </div>
             <div className="absolute -bottom-1 -left-2">
                <Flame className="w-5 h-5 text-red-400 animate-pulse" />
             </div>
          </div>
        </div>

        <h3 className={`text-3xl font-extrabold mb-3 text-transparent bg-clip-text bg-gradient-to-r ${theme.textGradient} animate-gradient-x`}>
          Cooking up Analysis...
        </h3>
        <p className="text-indigo-300/70 max-w-sm text-center font-medium">
          Popping kernels of wisdom, synthesizing reviews, and buttering the data for the perfect take. 🍿
        </p>
      </div>
    );
  }

  if (internalStage === 'exploding') {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 relative overflow-hidden bg-black/20">
        <style>{animationStyles}</style>
        {particles.map(p => <PopcornParticle key={p.id} {...p} />)}
        <div className="scale-150 transition-all duration-300 opacity-0">
           <Popcorn className="w-32 h-32 text-white" />
        </div>
      </div>
    );
  }

  if (internalStage === 'error') {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center rounded-3xl border border-red-500/30 bg-red-950/20 backdrop-blur-md">
        <div className="bg-red-500/20 p-5 rounded-full mb-4 animate-bounce">
           <AlertTriangle className="w-12 h-12 text-red-400" />
        </div>
        <h3 className="text-2xl font-bold mb-2 text-white">Oops! Burnt Popcorn</h3>
        <p className="max-w-md mb-6 text-red-200/70">{error}</p>
        <p className="text-xs text-red-400/50 uppercase tracking-widest font-bold">Please try again</p>
      </div>
    );
  }

  // Helper to extract film title for alt text (rough heuristic)
  let currentTitle = "Movie Poster";
  
  // Clean result: strip markdown code blocks if present
  const cleanResult = result ? result.replace(/```xml/g, '').replace(/```/g, '').trim() : '';

  return (
    <div className="bg-black/40 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/10 overflow-hidden flex flex-col h-full ring-1 ring-white/5 animate-in fade-in zoom-in-95 duration-700 slide-in-from-bottom-4">
      <div className={`bg-gradient-to-r ${theme.bgGradient} p-5 border-b border-white/10 flex justify-between items-center backdrop-blur-xl`}>
        <h2 className="text-xl font-bold text-white flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-yellow-400 fill-yellow-400" />
          <span className={`bg-clip-text text-transparent bg-gradient-to-r ${theme.textGradient}`}>Analysis Report</span>
        </h2>
        <div className="px-3 py-1 rounded-full bg-black/30 border border-white/10 flex items-center gap-2">
          <Popcorn className={`w-3 h-3 text-${theme.secondary}-400`} />
          <span className={`text-[10px] text-${theme.primary}-300 font-bold tracking-widest uppercase`}>Freshly Popped</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-8 md:p-12 font-sans leading-loose text-indigo-100/90 space-y-6 custom-scrollbar">
         {cleanResult ? cleanResult.split('\n').map((line, i) => {
            const trimmed = line.trim();
            if (!trimmed) return <div key={i} className="h-2"></div>; // Preserve some spacing

            // Check for headers
            if (line.startsWith('# ')) return <h1 key={i} className={`text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r ${theme.textGradient} mt-10 mb-6 pb-4 border-b border-white/10`}>{line.replace('# ', '')}</h1>;
            if (line.startsWith('## ')) return <h2 key={i} className={`text-2xl md:text-3xl font-bold text-white mt-12 mb-6 flex items-center gap-3`}><span className={`text-${theme.primary}-500`}>✨</span> {line.replace('## ', '')}</h2>;
            if (line.startsWith('### ')) return <h3 key={i} className={`text-xl font-bold text-${theme.primary}-200 mt-8 mb-4 border-l-4 border-${theme.primary}-500 pl-4`}>{line.replace('### ', '')}</h3>;
            
            // Capture Title for Alt Text
            if (trimmed.startsWith('Title:')) {
               currentTitle = trimmed.replace('Title:', '').trim();
            }

            // Image Link (Poster)
            if (trimmed.startsWith('Image:')) {
              const url = trimmed.replace('Image:', '').trim();
              if (!url || url.includes('found via Google Search') || url.includes('URL of')) return null; // Skip placeholders
              return <PosterImage key={i} src={url} alt={`${currentTitle} Poster`} theme={theme} />;
            }

            // Trailer Link
            if (trimmed.startsWith('Trailer:')) {
               const url = trimmed.replace('Trailer:', '').trim();
               // Ensure valid URL or construct search query fallback
               const href = url.startsWith('http') ? url : `https://www.youtube.com/results?search_query=${encodeURIComponent(url)}`;
               
               return (
                 <div key={i} className="mb-8 mt-4">
                   <a 
                     href={href}
                     target="_blank"
                     rel="noopener noreferrer"
                     className={`group inline-flex items-center gap-3 text-white font-bold bg-[#FF0000] hover:bg-[#CC0000] px-5 py-2.5 rounded-full shadow-lg shadow-red-900/40 transition-all transform hover:scale-105 hover:-translate-y-1`}
                   >
                     <Youtube className="w-5 h-5 fill-white" />
                     <span>Watch Trailer</span>
                   </a>
                 </div>
               );
            }

            // Check for list items
            if (trimmed.startsWith('- ')) return (
              <li key={i} className="ml-4 mb-2 flex items-start gap-3 text-indigo-100/80">
                <span className={`mt-1.5 w-1.5 h-1.5 rounded-full bg-${theme.primary}-500 flex-shrink-0`} />
                <span>{line.replace('- ', '')}</span>
              </li>
            );
            
            // Rank Badge
            if (trimmed.startsWith('<rank>')) {
              const rankNum = line.replace(/<[^>]*>/g, '').trim();
              return (
                <div key={i} className="inline-block mb-4 mt-12">
                   <div className={`bg-gradient-to-r from-${theme.primary}-600 to-${theme.secondary}-500 text-white px-4 py-1 rounded-full text-xs font-black tracking-widest shadow-lg shadow-${theme.secondary}-900/30 uppercase flex items-center gap-2`}>
                     <span>🏆</span> RANK {rankNum}
                   </div>
                </div>
              );
            }
            
             // Check for XML-like tags from prompt structure and style them lightly
            if (trimmed.startsWith('<') && trimmed.endsWith('>')) return null; // Hide raw tags if any remain

            // Bold key terms
            const parts = line.split(/(\*\*.*?\*\*)/g);
            return (
              <p key={i} className="mb-4 text-lg">
                {parts.map((part, j) => {
                  if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={j} className={`text-${theme.primary}-300 font-bold`}>{part.slice(2, -2)}</strong>;
                  }
                  return part;
                })}
              </p>
            );
         }) : (
           <div className="flex flex-col items-center justify-center h-64 text-center">
             <AlertTriangle className="w-12 h-12 text-yellow-400 mb-4 opacity-50" />
             <p className="text-indigo-200/60">No content available to display.</p>
           </div>
         )}
      </div>
    </div>
  );
};
