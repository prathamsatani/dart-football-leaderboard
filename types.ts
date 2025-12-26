export interface Player {
  id: string;
  name: string;
  score: number; // Integer score (higher is better)
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