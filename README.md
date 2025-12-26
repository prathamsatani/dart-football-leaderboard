# Nexus Leaderboard �

Nexus Leaderboard is a dynamic, interactive leaderboard application designed for gaming events. Built with React, Vite, and TypeScript, it features real-time rankings, AI-powered commentary, and performance insights to elevate the gaming experience.

## 🚀 Features

-   **Live Leaderboard**: Real-time ranking of players based on scores (higher is better).
-   **🏆 Podium View**: Visually celebrates the top 3 players.
-   **🤖 AI Commentary**: Generates dynamic, high-energy game commentary using Google Gemini AI.
-   **📊 Performance Insights**: Provides personalized AI-driven advice for players to improve their scores.
-   **Admin Dashboard**: Secure interface to add new players and manage existing entries.
-   **Data Persistence**: Uses IndexedDB for robust client-side data storage.
-   **Interactive Charts**: Visualizes score distribution and trends.
-   **Search & Filter**: Quickly find players by name.

## 🛠️ Tech Stack

-   **Frontend**: React 19, TypeScript, Vite
-   **Styling**: Lucide React (Icons)
-   **Charts**: Recharts
-   **AI**: Google Gemini AI SDK (`@google/genai`)
-   **Database**: IndexedDB (Browser-native storage)

## 📦 Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/nexus-leaderboard.git
    cd nexus-leaderboard
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables**
    Create a `.env` file in the root directory and add your Google Gemini API Key:
    ```env
    API_KEY=your_google_gemini_api_key
    ```
    *Note: You can get an API key from [Google AI Studio](https://aistudio.google.com/).*

4.  **Start the Development Server**
    ```bash
    npm run dev
    ```

## 🏗️ Build

To create a production build:

```bash
npm run build
```

## 📂 Project Structure

```
nexus-leaderboard/
├── components/          # React components (Podium, Forms, Charts, etc.)
├── services/            # Business logic & API services
│   ├── db.ts            # IndexedDB wrapper for local storage
│   └── geminiService.ts # Google Gemini AI integration
├── types.ts             # TypeScript interfaces and types
├── App.tsx              # Main application logic
└── index.tsx            # Entry point
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.
