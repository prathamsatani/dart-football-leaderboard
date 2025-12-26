export interface Player {
  id: string;
  name: string;
  lapTime: number; // Time in seconds (lower is better)
  game: string;
  avatarUrl?: string;
  rank?: number; 
  trend?: 'up' | 'down' | 'same'; 
}

export enum ViewMode {
  LEADERBOARD = 'LEADERBOARD',
  ADMIN = 'ADMIN',
  INSIGHTS = 'INSIGHTS'
}

export interface GameStats {
  totalPlayers: number;
  averageScore: number;
  topScore: number;
}