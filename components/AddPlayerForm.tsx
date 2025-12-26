import React, { useState } from 'react';
import { Player } from '../types';
import Button from './Button';
import { Timer, Save, ArrowLeft, CheckCircle2, LogOut } from 'lucide-react';

interface AddPlayerFormProps {
  onAddPlayer: (player: Omit<Player, 'id' | 'rank'>) => void;
  onCancel: () => void;
  onLogout: () => void;
}

const AddPlayerForm: React.FC<AddPlayerFormProps> = ({ onAddPlayer, onCancel, onLogout }) => {
  const [name, setName] = useState('');
  const [lapTime, setLapTime] = useState('');
  const [game, setGame] = useState('RC Thunder Track'); // Default game
  const [showSuccess, setShowSuccess] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !lapTime) return;

    // Generate random avatar
    const randomId = Math.floor(Math.random() * 1000);
    const avatarUrl = `https://picsum.photos/seed/${name}${randomId}/200/200`;

    onAddPlayer({
      name: name.trim(),
      lapTime: parseFloat(lapTime), // Keep decimal precision for laps
      game: game.trim(),
      avatarUrl
    });

    // Show success feedback
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);

    // Reset fields for next entry, but keep Game Title (Batch Entry Workflow)
    setName('');
    setLapTime('');
  };

  return (
    <div className="bg-slate-800 rounded-xl p-8 border border-slate-700 shadow-xl max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-500/20 rounded-lg">
            <Timer className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
            <h2 className="text-xl font-bold text-white">Log Lap Time</h2>
            <p className="text-slate-400 text-sm">Coordinator Console</p>
            </div>
        </div>
        <div className="flex gap-2">
            <Button variant="ghost" onClick={onCancel} className="hidden sm:flex text-slate-400 hover:text-white" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
            </Button>
            <Button variant="danger" onClick={onLogout} size="sm" className="bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/20 shadow-none">
                <LogOut className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Logout</span>
            </Button>
        </div>
      </div>

      {showSuccess && (
          <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-3 animate-fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <p className="text-emerald-300 text-sm">Lap time recorded successfully! Ready for next racer.</p>
          </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium text-slate-300">Racer Name</label>
            <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. SpeedDemon"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                required
            />
            </div>

            <div className="space-y-2">
            <label htmlFor="lapTime" className="block text-sm font-medium text-slate-300">Lap Time (Seconds)</label>
            <input
                type="number"
                id="lapTime"
                value={lapTime}
                onChange={(e) => setLapTime(e.target.value)}
                placeholder="e.g. 24.53"
                step="0.001"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                required
            />
            </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="game" className="block text-sm font-medium text-slate-300">Race Event / Game</label>
          <input
            type="text"
            id="game"
            value={game}
            onChange={(e) => setGame(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
        </div>

        <div className="pt-4 flex items-center gap-3">
            <Button type="submit" className="flex-1 md:flex-none w-full md:w-auto">
                <Save className="w-4 h-4 mr-2" />
                Submit Time
            </Button>
             <Button variant="secondary" type="button" onClick={onCancel} className="sm:hidden flex-1">
                 Cancel
            </Button>
        </div>
      </form>
    </div>
  );
};

export default AddPlayerForm;