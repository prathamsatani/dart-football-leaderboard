import React from 'react';
import { Player } from '../types';
import { Trophy, Medal, Crown, Timer } from 'lucide-react';

interface PodiumProps {
  topThree: Player[];
}

const Podium: React.FC<PodiumProps> = ({ topThree }) => {
  const [first, second, third] = topThree;

  // Helper to safely render a podium spot
  const renderSpot = (player: Player | undefined, rank: number) => {
    if (!player) return <div className="flex-1"></div>;

    let height = "h-32";
    let color = "bg-slate-700";
    let icon = <Medal className="w-8 h-8 text-slate-400" />;
    let rankColor = "text-slate-400";
    let glow = "";
    
    if (rank === 1) {
      height = "h-48";
      color = "bg-gradient-to-t from-yellow-600 to-yellow-400";
      icon = <Crown className="w-10 h-10 text-yellow-900" />;
      rankColor = "text-yellow-400";
      glow = "shadow-[0_0_30px_rgba(234,179,8,0.3)]";
    } else if (rank === 2) {
      height = "h-40";
      color = "bg-gradient-to-t from-slate-400 to-slate-200";
      icon = <Trophy className="w-8 h-8 text-slate-700" />;
      rankColor = "text-slate-200";
    } else if (rank === 3) {
      height = "h-36";
      color = "bg-gradient-to-t from-orange-700 to-orange-400";
      icon = <Medal className="w-8 h-8 text-orange-900" />;
      rankColor = "text-orange-400";
    }

    return (
      <div className={`flex flex-col items-center justify-end flex-1 max-w-[150px] mx-2 transition-all duration-500 hover:scale-105`}>
        <div className="flex flex-col items-center mb-4">
            <div className={`w-16 h-16 rounded-full border-4 border-slate-800 overflow-hidden mb-2 ${glow}`}>
               <img src={player.avatarUrl} alt={player.name} className="w-full h-full object-cover" />
            </div>
            <span className={`font-bold text-lg truncate w-full text-center ${rankColor}`}>{player.name}</span>
            <div className="flex items-center gap-1 text-slate-400 font-mono text-sm">
                <Timer className="w-3 h-3" />
                <span>{player.lapTime.toFixed(3)}s</span>
            </div>
        </div>
        <div className={`w-full ${height} ${color} rounded-t-lg flex items-start justify-center pt-4 relative shadow-lg`}>
            {icon}
            <span className="absolute bottom-4 text-slate-900/50 font-black text-4xl">{rank}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="flex items-end justify-center w-full py-12 px-4 mb-8 bg-slate-800/30 rounded-2xl border border-slate-700/50">
      {/* Order: 2, 1, 3 for visual pyramid */}
      {renderSpot(second, 2)}
      {renderSpot(first, 1)}
      {renderSpot(third, 3)}
    </div>
  );
};

export default Podium;