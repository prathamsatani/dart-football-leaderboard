import React, { useState, useEffect } from 'react';
import { Player } from '../types';
import { generateLeaderboardCommentary } from '../services/geminiService';
import { Bot, Sparkles, RefreshCw } from 'lucide-react';
import Button from './Button';

interface AICommentaryProps {
  players: Player[];
}

const AICommentary: React.FC<AICommentaryProps> = ({ players }) => {
  const [commentary, setCommentary] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<number>(0);

  const handleGenerate = async () => {
    setLoading(true);
    const text = await generateLeaderboardCommentary(players);
    setCommentary(text);
    setLoading(false);
    setLastUpdate(Date.now());
  };

  // Initial generation on mount if players exist and no commentary
  useEffect(() => {
    if (players.length > 0 && !commentary && !loading) {
       handleGenerate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [players.length]); // Only auto-run if player count changes significantly

  if (players.length === 0) return null;

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-indigo-500/30 shadow-lg relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <Bot className="w-32 h-32 text-indigo-400 rotate-12" />
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
            <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
              AI Match Analyst
            </h3>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleGenerate} 
            isLoading={loading}
            className="text-xs"
          >
            <RefreshCw className="w-3 h-3 mr-2" />
            Refresh
          </Button>
        </div>

        <div className="bg-slate-950/50 rounded-lg p-4 border border-slate-800 min-h-[80px]">
           {loading ? (
             <div className="flex flex-col gap-2 animate-pulse">
                <div className="h-2 bg-slate-800 rounded w-3/4"></div>
                <div className="h-2 bg-slate-800 rounded w-full"></div>
                <div className="h-2 bg-slate-800 rounded w-5/6"></div>
             </div>
           ) : (
             <p className="text-slate-300 leading-relaxed text-sm italic">
               "{commentary}"
             </p>
           )}
        </div>
        
        <div className="mt-2 text-right">
             <span className="text-[10px] text-slate-500 uppercase tracking-widest">Powered by Gemini 3 Flash</span>
        </div>
      </div>
    </div>
  );
};

export default AICommentary;