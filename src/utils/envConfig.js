export const config = {
    aiEngine: process.env.REACT_APP_AI_ENGINE || "test",
    geminiApiKey: process.env.REACT_APP_GEMINI_API_KEY || "",
    ollamaNgrokUrl: process.env.REACT_APP_OLLAMA_NGROK_URL || "",
    ollamaApiPath: process.env.REACT_APP_OLLAMA_API_PATH || "",
    ttsEngine: process.env.REACT_APP_TTS_ENGINE || "simple",
    ngrokUsername: process.env.REACT_APP_NGROK_USERNAME || "",
    ngrokPassword: process.env.REACT_APP_NGROK_PASSWORD || "",  
};