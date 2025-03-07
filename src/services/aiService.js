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

// 新增的函數，用於獲取帶有情緒的回應
export async function getAIResponseWithEmotion(prompt, character) {
  // 使用你現有的 AI 引擎設置
  if (config.aiEngine === "test") {
    return callGeminiAIWithEmotion(prompt, character);
  } else if (config.aiEngine === "prd") {
    return callOllamaAIWithEmotion(prompt, character);
  } else {
    return {
      message: "Invalid AI engine setting.",
      emotion: "idle"
    };
  }
}

// 修改後的 Gemini AI 調用，返回帶有情緒的回應
async function callGeminiAIWithEmotion(prompt, character) {
  try {
    const systemInstruction = `
      你現在是一個名為${character}的AI角色。
      請根據用戶的消息回覆，並表達相應的情緒。
      
      請以JSON格式回覆，格式如下：
      {
        "message": "你的回覆文字",
        "emotion": "情緒代碼"
      }
      
      情緒代碼只能是以下之一：
      - happy：當你感到開心、興奮或滿足時
      - angry：當你感到不滿、失望或憤怒時
      - surprised：當你感到驚訝或震驚時
      - idle：當你處於中性情緒時
      
      確保你的回覆是有趣且符合角色的！`;
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-exp-1206:generateContent?key=${config.geminiApiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: systemInstruction },
                { text: `用戶輸入：${prompt}` }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.9,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 800,
          }
        }),
      }
    );

    const data = await response.json();
    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || 
                  "Error with Gemini API";
    
    // 嘗試從回應中提取 JSON
    try {
      // 尋找 JSON 格式的部分
      const jsonMatch = aiText.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const parsedResponse = JSON.parse(jsonMatch[0]);
        return {
          message: parsedResponse.message || "我不確定該如何回應。",
          emotion: parsedResponse.emotion || "idle"
        };
      } else {
        // 如果找不到 JSON 格式，直接返回文本並使用默認情緒
        return {
          message: aiText,
          emotion: "idle"
        };
      }
    } catch (e) {
      console.error("解析 JSON 失敗:", e);
      return {
        message: aiText,
        emotion: "idle"
      };
    }
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return {
      message: "Error with Gemini API",
      emotion: "idle"
    };
  }
}

// 修改後的 Ollama AI 調用，返回帶有情緒的回應
async function callOllamaAIWithEmotion(prompt, character) {
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
            content: `你現在是一個名為${character}的AI角色。
            請根據用戶的消息回覆，並表達相應的情緒。
            
            請以JSON格式回覆，格式如下：
            {
              "message": "你的回覆文字",
              "emotion": "情緒代碼"
            }
            
            情緒代碼只能是以下之一：
            - happy：當你感到開心、興奮或滿足時
            - angry：當你感到不滿、失望或憤怒時
            - surprised：當你感到驚訝或震驚時
            - idle：當你處於中性情緒時`,
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
    const aiText = data.response || "No response from Ollama API";
    
    // 嘗試從回應中提取 JSON
    try {
      const jsonMatch = aiText.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const parsedResponse = JSON.parse(jsonMatch[0]);
        return {
          message: parsedResponse.message || "我不確定該如何回應。",
          emotion: parsedResponse.emotion || "idle"
        };
      } else {
        // 如果找不到 JSON 格式，直接返回文本並使用默認情緒
        return {
          message: aiText,
          emotion: "idle"
        };
      }
    } catch (e) {
      console.error("解析 JSON 失敗:", e);
      return {
        message: aiText,
        emotion: "idle"
      };
    }
  } catch (error) {
    console.error("Error calling Ollama API:", error);
    return {
      message: "Error with Ollama API",
      emotion: "idle"
    };
  }
}

// 用於測試的模擬 AI 回應函數
export function simulateAIResponse(prompt, character) {
  // 簡單的測試回應
  const responses = [
    { message: `我是${character}！很高興認識你！`, emotion: "happy" },
    { message: "這讓我有點困惑...", emotion: "surprised" },
    { message: "我不太同意這個觀點。", emotion: "angry" },
    { message: "我理解你的意思。", emotion: "idle" }
  ];
  
  // 根據輸入選擇適當的回應
  const promptLower = prompt.toLowerCase();
  
  if (promptLower.includes("你好") || promptLower.includes("嗨")) {
    return responses[0];
  } else if (promptLower.includes("?") || promptLower.includes("為什麼")) {
    return responses[1];
  } else if (promptLower.includes("不") || promptLower.includes("錯")) {
    return responses[2];
  } else {
    // 隨機選擇一個回應
    return responses[Math.floor(Math.random() * responses.length)];
  }
}