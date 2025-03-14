import { useState, useEffect, useRef } from 'react';
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
  
  // 倒數焚燒功能相關狀態
  const [isIdle, setIsIdle] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [showCountdown, setShowCountdown] = useState(false);
  const IDLE_TIMEOUT = 10000; // 10秒閒置時間（毫秒）
  
  const idleTimerRef = useRef(null);
  const countdownTimerRef = useRef(null);
  const lastActivityRef = useRef(Date.now());
  
  const location = useLocation();
  const friend = location.state?.friend || 'sophia';

  // 添加useEffect來監聽倒數變化
  useEffect(() => {
    console.log(`Countdown changed to: ${countdown}`);
    
    // 當倒數為0時清空訊息
    if (countdown === 0 && showCountdown) {
      console.log("Countdown reached zero via useEffect, clearing messages");
      
      // 稍微延遲清除以確保用戶看到0
      setTimeout(() => {
        setMessages([]);
        setShowCountdown(false);
        
        if (countdownTimerRef.current) {
          clearTimeout(countdownTimerRef.current);
          countdownTimerRef.current = null;
        }
      }, 200);
    }
  }, [countdown, showCountdown]); // 依賴於countdown和showCountdown的變化

  // 重置用戶活動計時器
  const resetIdleTimer = () => {
    // 只有當未顯示倒數視窗時，才重置活動時間
    if (!showCountdown) {
      console.log("Resetting idle timer due to user activity");
      lastActivityRef.current = Date.now();
      
      // 如果已經在閒置狀態，則重置
      if (isIdle) {
        setIsIdle(false);
      }
    }
  };
  
  // 繼續對話，重置所有計時器
  const continueConversation = () => {
    console.log("Continuing conversation, resetting timers");
    
    // 明確更新活動時間
    lastActivityRef.current = Date.now();
    
    // 清理倒數計時器
    if (countdownTimerRef.current) {
      console.log("Clearing countdown timer:", countdownTimerRef.current);
      clearTimeout(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    
    // 重置狀態
    setShowCountdown(false);
    setCountdown(10);
    setIsIdle(false);
  };

  // 改進的倒數計時器函數
  const startCountdown = () => {
    console.log("Starting countdown from 10");
    
    // 強制立即更新UI
    setShowCountdown(true);
    setCountdown(10);
    
    // 清除任何現有的倒數計時器
    if (countdownTimerRef.current) {
      clearTimeout(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    
    // 使用setTimeout而不是setInterval，以確保更精確的倒數
    const runCountdown = (currentCount) => {
      console.log(`Countdown running: ${currentCount}`);
      
      if (currentCount <= 0) {
        console.log("Countdown reached zero, clearing messages");
        setMessages([]);
        setShowCountdown(false);
        return;
      }
      
      // 設置下一秒的計時器
      countdownTimerRef.current = setTimeout(() => {
        // 更新倒數值並強制重新渲染
        setCountdown(currentCount - 1);
        // 遞迴調用自身以繼續倒數
        runCountdown(currentCount - 1);
      }, 1000);
    };
    
    // 啟動倒數計時
    setTimeout(() => runCountdown(10), 0);
    
    console.log("Countdown timer set");
  };

  // 用於檢查用戶是否閒置
  useEffect(() => {
    console.log("Setting up idle timer");
    
    // 重要：保存最後活動時間的初始值
    lastActivityRef.current = Date.now();
    
    // 清除任何現有的計時器
    if (idleTimerRef.current) {
      clearInterval(idleTimerRef.current);
      idleTimerRef.current = null;
    }
    
    // 設置檢查閒置狀態的間隔
    idleTimerRef.current = setInterval(() => {
      const currentTime = Date.now();
      const idleTime = currentTime - lastActivityRef.current;
      console.log(`Idle check: ${idleTime}ms, Threshold: ${IDLE_TIMEOUT}ms, ShowCountdown: ${showCountdown}`);
      
      // 只有在有消息且未顯示倒數時檢查閒置狀態
      if (idleTime > IDLE_TIMEOUT && !showCountdown && messages.length > 0) {
        console.log("User is idle, starting countdown");
        setIsIdle(true);
        startCountdown();
      }
    }, 1000);
    
    // 設置用戶活動事件監聽器
    const handleUserActivity = () => {
      // 重要：直接更新 ref 而不是依賴狀態
      if (!showCountdown) {
        console.log("User activity detected, resetting timer");
        lastActivityRef.current = Date.now();
        
        if (isIdle) {
          setIsIdle(false);
        }
      }
    };
    
    // 添加所有活動事件監聽
    window.addEventListener('mousemove', handleUserActivity);
    window.addEventListener('keypress', handleUserActivity);
    window.addEventListener('click', handleUserActivity);
    window.addEventListener('touchstart', handleUserActivity); // 添加觸控支持
    window.addEventListener('scroll', handleUserActivity);
    
    // 清理函數
    return () => {
      if (idleTimerRef.current) {
        clearInterval(idleTimerRef.current);
      }
      if (countdownTimerRef.current) {
        clearTimeout(countdownTimerRef.current);
      }
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('keypress', handleUserActivity);
      window.removeEventListener('click', handleUserActivity);
      window.removeEventListener('touchstart', handleUserActivity);
      window.removeEventListener('scroll', handleUserActivity);
    };
  }, [showCountdown, messages.length, IDLE_TIMEOUT]); // 確保依賴項都正確列出

  // 用於處理發送消息的函數
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    // 重置閒置計時器
    lastActivityRef.current = Date.now();
    
    // 如果倒數計時器正在顯示，則取消它
    if (showCountdown) {
      setShowCountdown(false);
      setCountdown(10);
      if (countdownTimerRef.current) {
        clearTimeout(countdownTimerRef.current);
        countdownTimerRef.current = null;
      }
    }
    
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
      
      {/* 倒數計時器視窗 - 修改後的版本 */}
      {showCountdown && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4 text-red-600">AUTO-DESTRUCT WARNING</h2>
            <p className="mb-6">
              Due to inactivity, this conversation will be automatically deleted.
              <br />
              Countdown: <span 
                className="text-2xl font-bold text-red-600 inline-block min-w-8 text-center" 
                id={`countdown-number-${countdown}`} // 使用唯一ID強制更新
              >
                {countdown}
              </span> seconds
            </p>
            <div className="flex justify-between">
              <button
                onClick={continueConversation}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Continue Conversation
              </button>
              <button
                onClick={() => {
                  console.log("Delete now button clicked");
                  if (countdownTimerRef.current) {
                    clearTimeout(countdownTimerRef.current);
                    countdownTimerRef.current = null;
                  }
                  setMessages([]);
                  setShowCountdown(false);
                }}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Delete Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}