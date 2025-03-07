import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Model3D from '../components/Model3D';  // 導入 3D 模型組件
import { getAIResponseWithEmotion, simulateAIResponse } from '../services/aiService';
import { speakText, stopSpeech } from '../services/ttsService';

export default function Chat() {
  const [messages, setMessages] = useState([
    { id: 1, text: 'Hi, my name is Sophia!', sender: 'ai', emotion: 'happy' },
    { id: 2, text: 'Nice to meet you!', sender: 'ai', emotion: 'happy' }
  ]);
  const [input, setInput] = useState('');
  const [currentEmotion, setCurrentEmotion] = useState('happy');  // 設置初始情緒
  const [isLoading, setIsLoading] = useState(false);
  
  const location = useLocation();
  const friend = location.state?.friend || 'sophia';

  // 用於處理發送消息的函數
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    // 停止任何正在進行的語音
    stopSpeech();
    
    // 添加用戶消息到聊天
    const userMessage = {
      id: Date.now(),
      text: input,
      sender: 'user'
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      // 使用 AI 服務獲取回應
      // 注意：如果你的 API 尚未準備好，可以使用 simulateAIResponse 進行測試
      let response;
      
      // 測試階段使用模擬回應
      // 當 API 準備好時，可以切換為 getAIResponseWithEmotion
      const useRealAPI = false; // 設置為 true 當你準備好使用實際 API
      
      if (useRealAPI) {
        response = await getAIResponseWithEmotion(input, friend);
      } else {
        // 使用模擬回應進行測試
        response = simulateAIResponse(input, friend);
      }
      
      // 添加 AI 回應到聊天
      const aiMessage = {
        id: Date.now() + 1,
        text: response.message,
        sender: 'ai',
        emotion: response.emotion
      };
      
      setMessages(prev => [...prev, aiMessage]);
      // 更新當前情緒，用於 3D 模型
      setCurrentEmotion(response.emotion);
      
      // 使用 TTS 服務朗讀回應
      speakText(response.message);
    } catch (error) {
      console.error("獲取 AI 回應時出錯:", error);
      
      // 發生錯誤時添加默認錯誤消息
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: "對不起，我現在無法回應。請稍後再試。",
        sender: 'ai',
        emotion: 'idle'
      }]);
      setCurrentEmotion('idle');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* 左側 3D 模型區域 - 替換原始的圖像 */}
      <div className="w-1/3 bg-gray-800 p-8">
        <h1 className="text-4xl text-white mb-4">{friend}</h1>
        <div className="relative h-[calc(100%-4rem)]">
          {/* 使用 Model3D 組件代替靜態圖像 */}
          <div className="w-full h-full rounded-lg overflow-hidden">
            <Model3D character={friend} emotion={currentEmotion} />
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gray-200 bg-opacity-80 rounded-b-lg">
            <p className="text-center italic">
              "Knowledge is my adventure; I love learning!"
            </p>
          </div>
        </div>
      </div>
      
      {/* 右側聊天區域 - 保持原有設計 */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 p-4 overflow-y-auto">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
            >
              {msg.sender === 'ai' && (
                <img 
                  src={`/api/placeholder/32/32`}
                  className="w-8 h-8 rounded-full mr-2"
                  alt={friend}
                />
              )}
              <div className={`max-w-[70%] p-3 rounded-2xl ${
                msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-white'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          
          {/* 添加載入指示器 */}
          {isLoading && (
            <div className="flex justify-start mb-4">
              <img 
                src={`/api/placeholder/32/32`}
                className="w-8 h-8 rounded-full mr-2"
                alt={friend}
              />
              <div className="max-w-[70%] p-3 rounded-2xl bg-white">
                <div className="flex space-x-1">
                  <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="p-4 bg-white">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleSend()}
              disabled={isLoading}
              className="flex-1 p-4 rounded-full border focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Type A Message..."
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className={`p-4 ${
                !input.trim() || isLoading ? 'text-gray-400' : 'text-blue-500 hover:text-blue-600'
              }`}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}