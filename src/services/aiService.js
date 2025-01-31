import { config } from "../utils/envConfig";

// Function to call the selected AI model
export async function getAIResponse(prompt) {
  if (config.aiEngine === "test") {
    return callGeminiAI(prompt);
  } else if (config.aiEngine === "prd") {
    return callOllamaAI(prompt);
  } else {
    return "Invalid AI engine setting.";
  }
}

// Ollama AI (Option: "test")
async function callGeminiAI(prompt) {

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-exp-1206:generateContent?key=${config.geminiApiKey}`,
    {

      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      systemInstruction: {
        parts: [{ text: "Always provide short answers." }],
      },      
    }
  );
  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "Error with Gemini API";
}

// Ollama AI (Option: "prd")
async function callOllamaAI(prompt) {
  try {
    // Encode the username and password for Basic Auth
    const authString = `${config.ngrokUsername}:${config.ngrokPassword}`;
    const encodedAuth = btoa(authString); // Base64 encode

    const response = await fetch(`${config.ollamaNgrokUrl}${config.ollamaApiPath}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${encodedAuth}`, // Add Basic Auth header
      },
      body: JSON.stringify({
        model: "llama2", // Specify the model (if required)
        messages: [
          {
            role: "system", // System instruction
            content: "You are a helpful assistant. Keep your answers concise and clear.",
          },
          {
            role: "user", // User prompt
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.response || "No response from Ollama API";
  } catch (error) {
    console.error("Error calling Ollama API:", error);
    return "Error with Ollama API";
  }
}