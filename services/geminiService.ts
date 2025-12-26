import { GoogleGenAI } from "@google/genai";
import { Player } from '../types';

// Initialize the Gemini AI client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateLeaderboardCommentary = async (players: Player[]): Promise<string> => {
  try {
    const topPlayers = players.slice(0, 5).map(p => ({ name: p.name, time: p.lapTime + 's', car: p.game }));
    
    if (topPlayers.length === 0) {
      return "Track is empty! Get those RC cars on the starting line.";
    }

    const prompt = `
      You are an adrenaline-fueled RC Car Racing commentator at a track side. 
      Here is the current leaderboard for fastest lap times (Lower is better):
      ${JSON.stringify(topPlayers)}
      
      Write a short, high-energy commentary (max 3 sentences) summarizing the current standings. 
      Highlight the driver with the fastest lap and how tight the gaps are between cars.
      Use terms like "apex", "grip", "shaving off milliseconds", and "top speed".
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "Commentary unavailable at this moment.";
  } catch (error) {
    console.error("Error generating commentary:", error);
    return "The commentator is currently changing batteries. (Error connecting to Gemini)";
  }
};

export const analyzePlayerPerformance = async (player: Player, allPlayers: Player[]): Promise<string> => {
    try {
        const rank = allPlayers.findIndex(p => p.id === player.id) + 1;
        const total = allPlayers.length;
        const bestTime = allPlayers[0].lapTime;
        const diff = (player.lapTime - bestTime).toFixed(3);
        
        const prompt = `
            Analyze the performance of RC driver "${player.name}" who clocked a lap time of ${player.lapTime}s in "${player.game}".
            They are currently ranked ${rank} out of ${total} drivers.
            The best lap time is ${bestTime}s (they are +${diff}s behind).
            Give them specific racing advice on how to improve their line or setup.
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