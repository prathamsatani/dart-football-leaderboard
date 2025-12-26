import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Player, ViewMode } from './types';
import Podium from './components/Podium';
import AddPlayerForm from './components/AddPlayerForm';
import LoginForm from './components/LoginForm';
import Button from './components/Button';
import StatCard from './components/StatCard';
import ScoreChart from './components/ScoreChart';
import { Trophy, Users, TrendingUp, PlusCircle, LayoutDashboard, Timer, Search, Trash2, Database, Wifi, WifiOff } from 'lucide-react';
import { analyzePlayerPerformance } from './services/geminiService';
import { db } from './services/db';

function App() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoadingDB, setIsLoadingDB] = useState(true);
  
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.LEADERBOARD);
  const [searchQuery, setSearchQuery] = useState('');
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const hasCheckedSeed = useRef(false);

  // Subscribe to DB updates (Real-time)
  useEffect(() => {
    let isMounted = true;
    
    // Subscribe returns an unsubscribe function
    const unsubscribe = db.subscribe((data) => {
        if (!isMounted) return;
        
        setPlayers(data);
        setIsLoadingDB(false);
    });

    return () => {
        isMounted = false;
        if (unsubscribe) unsubscribe();
    };
  }, []);

  // Derived state: Sorted players by Score (Descending - Higher is better)
  const sortedPlayers = useMemo(() => {
    return [...players]
      .sort((a, b) => b.score - a.score)
      .map((p, index) => ({ ...p, rank: index + 1 }));
  }, [players]);

  const filteredPlayers = useMemo(() => {
    return sortedPlayers.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [sortedPlayers, searchQuery]);

  const topThree = sortedPlayers.slice(0, 3);
  
  // Stats
  const averageScore = players.length > 0 ? Math.round(players.reduce((acc, curr) => acc + curr.score, 0) / players.length) : 0;
  const topScore = sortedPlayers.length > 0 ? sortedPlayers[0].score : 0;

  const handleAddPlayer = async (newPlayer: Omit<Player, 'id' | 'rank'>) => {
    const player: Player = {
      ...newPlayer,
      id: Date.now().toString(),
    };
    
    // Optimistic updates are handled by the subscription callback in real-time
    // But we can add a loading state if needed. For now, we just push to DB.
    try {
      await db.addPlayer(player);
    } catch (err) {
      console.error("Failed to save to DB", err);
      alert("Failed to save score. Check connection.");
    }
  };

  const handleDelete = async (id: string) => {
      if (window.confirm("Are you sure you want to remove this player?")) {
          try {
            await db.deletePlayer(id);
          } catch (err) {
             console.error("Failed to delete from DB", err);
          }
      }
  }

  const handleAnalyzePlayer = async (player: Player) => {
      setAnalyzingId(player.id);
      const advice = await analyzePlayerPerformance(player, sortedPlayers);
      alert(`${player.name} Performance Analysis:\n\n${advice}`); 
      setAnalyzingId(null);
  }

  const handleLogout = () => {
    setIsAuthenticated(false);
    setViewMode(ViewMode.LEADERBOARD);
  };

  if (isLoadingDB) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-slate-400">
        <div className="flex flex-col items-center gap-4">
          <Database className="w-12 h-12 animate-bounce text-indigo-500" />
          <p>Connecting to Server...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 font-sans selection:bg-indigo-500/30">
      {/* Navigation / Header */}
      <header className="fixed top-0 w-full z-50 bg-[#0f172a]/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
                <Trophy className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white">
              GAME <span className="text-indigo-500">LEADERBOARD</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Sync Status Indicator */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700">
                {db.isConfigured() ? (
                    <>
                        <Wifi className="w-3 h-3 text-emerald-400" />
                        <span className="text-xs text-emerald-400 font-medium">Live Sync</span>
                    </>
                ) : (
                    <>
                        <WifiOff className="w-3 h-3 text-amber-400" />
                        <span className="text-xs text-amber-400 font-medium">Local Mode</span>
                    </>
                )}
            </div>

            <nav className="flex items-center gap-1 sm:gap-2">
                <Button 
                variant={viewMode === ViewMode.LEADERBOARD ? 'primary' : 'ghost'} 
                onClick={() => setViewMode(ViewMode.LEADERBOARD)}
                className="text-sm px-2 sm:px-4"
                >
                <LayoutDashboard className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Leaderboard</span>
                </Button>
                <Button 
                variant={viewMode === ViewMode.ADMIN ? 'primary' : 'ghost'} 
                onClick={() => setViewMode(ViewMode.ADMIN)}
                className="text-sm px-2 sm:px-4"
                >
                <PlusCircle className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Log Score</span>
                </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        
        {/* Stats Row */}
        {viewMode === ViewMode.LEADERBOARD && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
             <StatCard 
                label="Total Players" 
                value={players.length} 
                icon={<Users className="w-6 h-6 text-indigo-400"/>} 
                color="indigo"
             />
             <StatCard 
                label="Top Score" 
                value={`${topScore}`} 
                icon={<Trophy className="w-6 h-6 text-amber-400"/>} 
                color="amber"
             />
             <StatCard 
                label="Avg Score" 
                value={`${averageScore}`} 
                icon={<TrendingUp className="w-6 h-6 text-emerald-400"/>} 
                color="emerald"
             />
          </div>
        )}

        {viewMode === ViewMode.LEADERBOARD ? (
          <div className="space-y-8 animate-fade-in">
            
            {/* Top 3 Podium */}
            {sortedPlayers.length >= 3 && <Podium topThree={topThree} />}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* List View */}
                <div className="lg:col-span-2 bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden backdrop-blur-sm">
                    <div className="p-6 border-b border-slate-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Users className="w-5 h-5 text-indigo-400" />
                            Live Standings
                        </h2>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input 
                                type="text" 
                                placeholder="Find player..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none w-full sm:w-64"
                            />
                        </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-900/50 text-slate-400 text-sm uppercase tracking-wider">
                                    <th className="p-2 sm:p-4 font-medium w-10 sm:w-16 text-center text-xs sm:text-sm">Pos</th>
                                    <th className="p-2 sm:p-4 font-medium text-xs sm:text-sm">Player</th>
                                    <th className="p-2 sm:p-4 font-medium text-right text-xs sm:text-sm">Score</th>
                                    <th className="p-2 sm:p-4 font-medium text-center hidden sm:table-cell text-xs sm:text-sm">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700/50">
                                {filteredPlayers.map((player) => (
                                    <tr key={player.id} className="hover:bg-slate-700/30 transition-colors group">
                                        <td className="p-2 sm:p-4 text-center">
                                            <span className={`inline-flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full font-bold text-xs sm:text-base ${
                                                player.rank === 1 ? 'bg-yellow-500/20 text-yellow-400' :
                                                player.rank === 2 ? 'bg-slate-400/20 text-slate-300' :
                                                player.rank === 3 ? 'bg-orange-500/20 text-orange-400' :
                                                'text-slate-500'
                                            }`}>
                                                {player.rank}
                                            </span>
                                        </td>
                                        <td className="p-2 sm:p-4">
                                            <div className="flex items-center gap-2 sm:gap-3">
                                                <img 
                                                    src={player.avatarUrl} 
                                                    alt={player.name} 
                                                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-800 object-cover border border-slate-700 flex-shrink-0" 
                                                />
                                                <div className="min-w-0">
                                                    <div className="font-semibold text-white truncate text-sm sm:text-base max-w-[100px] xs:max-w-[140px] sm:max-w-none">{player.name}</div>
                                                    <div className="text-xs text-slate-500 truncate hidden sm:block">{player.game}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-2 sm:p-4 text-right font-mono text-indigo-300 font-medium whitespace-nowrap text-sm sm:text-base">
                                            {player.score}
                                        </td>
                                        <td className="p-2 sm:p-4 text-center hidden sm:table-cell">
                                            <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={() => handleAnalyzePlayer(player)}
                                                    className="p-2 hover:bg-indigo-500/20 text-indigo-400 rounded-lg transition-colors"
                                                    title="Performance Analysis"
                                                    disabled={analyzingId === player.id}
                                                >
                                                    {analyzingId === player.id ? (
                                                        <span className="animate-spin text-xs">⏳</span>
                                                    ) : (
                                                        <TrendingUp className="w-4 h-4" />
                                                    )}
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(player.id)}
                                                    className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                                                    title="Remove Player"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredPlayers.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="p-8 text-center text-slate-500">
                                            No players found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Right Column: Chart */}
                <div className="lg:col-span-1 space-y-6">
                    <ScoreChart players={players} />
                </div>
            </div>
          </div>
        ) : (
          <div className="animate-fade-in">
             {!isAuthenticated ? (
                <LoginForm 
                    onLogin={() => setIsAuthenticated(true)} 
                    onCancel={() => setViewMode(ViewMode.LEADERBOARD)} 
                />
             ) : (
                <AddPlayerForm 
                    onAddPlayer={handleAddPlayer} 
                    onCancel={() => setViewMode(ViewMode.LEADERBOARD)} 
                    onLogout={handleLogout}
                />
             )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;