import { GoogleGenAI } from "@google/genai";
import { Player } from '../types';

// Initialize the Gemini AI client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateLeaderboardCommentary = async (players: Player[]): Promise<string> => {
  try {
    const topPlayers = players.slice(0, 5).map(p => ({ name: p.name, score: p.score, game: p.game }));
    
    if (topPlayers.length === 0) {
      return "Leaderboard is empty! Start playing to get on the board.";
    }

    const prompt = `
      You are an energetic game commentator. 
      Here is the current leaderboard for highest scores (Higher is better):
      ${JSON.stringify(topPlayers)}
      
      Write a short, high-energy commentary (max 3 sentences) summarizing the current standings. 
      Highlight the player with the highest score and how close the competition is.
      Use exciting gaming terminology.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "Commentary unavailable at this moment.";
  } catch (error) {
    console.error("Error generating commentary:", error);
    return "The commentator is currently taking a break. (Error connecting to Gemini)";
  }
};

export const analyzePlayerPerformance = async (player: Player, allPlayers: Player[]): Promise<string> => {
    try {
        const rank = allPlayers.findIndex(p => p.id === player.id) + 1;
        const total = allPlayers.length;
        const topScore = allPlayers[0].score;
        const diff = topScore - player.score;
        
        const prompt = `
            Analyze the performance of player "${player.name}" who scored ${player.score} in "${player.game}".
            They are currently ranked ${rank} out of ${total} players.
            The top score is ${topScore} (they are ${diff} points behind).
            Give them specific gameplay advice on how to improve their score.
            Keep it under 30 words.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
        });

        return response.text || "Analysis unavailable.";
    } catch (error) {
        console.error("Error analyzing player:", error);
        return "Analysis unavailable.";
    }
}