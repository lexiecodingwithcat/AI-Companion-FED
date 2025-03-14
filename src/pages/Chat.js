以下是修正後的完整代碼：
javascriptCopyimport { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// SVG Icons Components
const MicIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
    <line x1="12" y1="19" x2="12" y2="23"/>
    <line x1="8" y1="23" x2="16" y2="23"/>
  </svg>
);

const StopIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
  </svg>
);

const SendIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/>
    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);

// 焚燒模式圖標
const BurnIcon = ({ active }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? "#ff4500" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
  </svg>
);

// 返回圖標
const BackIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"></line>
    <polyline points="12 19 5 12 12 5"></polyline>
  </svg>
);

export default function Chat() {
  const location = useLocation();
  const navigate = useNavigate();
  const friendData = location.state?.friend || { 
    id: 'sophia', 
    name: 'Sophia', 
    desc: 'Intelligent learner with analytical skills'
  };

  const [messages, setMessages] = useState([
    { id: 1, text: `Hi, my name is ${friendData.name}!`, sender: 'ai' },
    { id: 2, text: 'Nice to meet you!', sender: 'ai' }
  ]);
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [permissionError, setPermissionError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [burnModeActive, setBurnModeActive] = useState(false);
  const [showBurnConfirmation, setShowBurnConfirmation] = useState(false);
  const [showExitConfirmation, setShowExitConfirmation] = useState(false);
  const [countdownSeconds, setCountdownSeconds] = useState(10);
  
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const recordingStartTimeRef = useRef(null);
  const recordingIntervalRef = useRef(null);
  const inactivityTimerRef = useRef(null);
  const countdownTimerRef = useRef(null);
  const lastActivityTimeRef = useRef(Date.now());
  
  // 監控用戶不活動的情況
  useEffect(() => {
    if (!burnModeActive) return;
    
    // 清除任何現有的不活動計時器
    if (inactivityTimerRef.current) {
      clearInterval(inactivityTimerRef.current);
    }
    
    // 如果焚燒確認已顯示，則不需要檢測不活動
    if (!showBurnConfirmation) {
      // 設置不活動檢測
      inactivityTimerRef.current = setInterval(() => {
        const now = Date.now();
        const timeElapsed = now - lastActivityTimeRef.current;
        
        // 如果超過10秒無活動，則顯示確認並開始倒計時
        if (timeElapsed >= 10000) {
          setShowBurnConfirmation(true);
          startCountdown();
          // 一旦顯示確認，停止檢測不活動
          clearInterval(inactivityTimerRef.current);
        }
      }, 1000);
    }
    
    return () => {
      if (inactivityTimerRef.current) {
        clearInterval(inactivityTimerRef.current);
      }
    };
  }, [burnModeActive, showBurnConfirmation]);
  
  // 開始10秒倒計時
  const startCountdown = () => {
    setCountdownSeconds(10);
    
    // 清除任何現有的倒計時
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
    }
    
    // 設置新的倒計時，每秒減少1
    countdownTimerRef.current = setInterval(() => {
      setCountdownSeconds((prev) => {
        if (prev <= 1) {
          // 時間到，執行焚燒
          executeBurn();
          clearInterval(countdownTimerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };
  
  // 用戶活動處理函數
  const handleUserActivity = () => {
    // 只有在焚燒模式開啟且焚燒確認未顯示時才更新最後活動時間
    if (burnModeActive && !showBurnConfirmation) {
      lastActivityTimeRef.current = Date.now();
    }
  };
  
  // 設置用戶活動監聽器
  useEffect(() => {
    const activityEvents = ['mousedown', 'keypress', 'mousemove', 'scroll', 'touchstart'];
    
    const activityHandler = () => handleUserActivity();
    
    activityEvents.forEach(event => {
      window.addEventListener(event, activityHandler);
    });
    
    return () => {
      activityEvents.forEach(event => {
        window.removeEventListener(event, activityHandler);
      });
    };
  }, [burnModeActive, showBurnConfirmation]);
  
  // 焚燒模式切換
  const toggleBurnMode = () => {
    const newBurnModeActive = !burnModeActive;
    setBurnModeActive(newBurnModeActive);
    
    // 如果關閉焚燒模式，關閉確認視窗和停止所有計時器
    if (!newBurnModeActive) {
      setShowBurnConfirmation(false);
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }
      if (inactivityTimerRef.current) {
        clearInterval(inactivityTimerRef.current);
      }
    } else {
      // 開啟焚燒模式時，重置最後活動時間
      lastActivityTimeRef.current = Date.now();
    }
  };
  
  // 執行焚燒
  const executeBurn = () => {
    // 重置消息為初始問候語
    setMessages([
      { id: 1, text: `Hi, my name is ${friendData.name}!`, sender: 'ai' },
      { id: 2, text: 'Nice to meet you!', sender: 'ai' }
    ]);
    
    // 關閉焚燒確認
    setShowBurnConfirmation(false);
    
    // 重置最後活動時間
    lastActivityTimeRef.current = Date.now();
    
    // 停止倒計時
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
    }
  };
  
  // 繼續對話（取消焚燒）
  const continueChatting = () => {
    // 關閉焚燒確認
    setShowBurnConfirmation(false);
    
    // 更新活動時間戳
    lastActivityTimeRef.current = Date.now();
    
    // 停止倒計時
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
    }
  };
  
  // 在組件卸載時清除所有計時器
  useEffect(() => {
    return () => {
      if (inactivityTimerRef.current) {
        clearInterval(inactivityTimerRef.current);
      }
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
  }, []);
  
  // 返回選擇頁面
  const handleBack = () => {
    if (messages.length > 2 && !showExitConfirmation) {
      setShowExitConfirmation(true);
    } else {
      navigate('/');
    }
  };
  
  // 確認返回
  const confirmExit = () => {
    navigate('/');
  };
  
  // 取消返回
  const cancelExit = () => {
    setShowExitConfirmation(false);
  };

  const startRecording = async () => {
    // 記錄用戶活動
    if (burnModeActive && !showBurnConfirmation) {
      lastActivityTimeRef.current = Date.now();
    }
    
    try {
      setPermissionError(false);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/wav' });
        setAudioBlob(blob);
        chunksRef.current = [];
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      recordingStartTimeRef.current = Date.now();
      
      // Start duration counter
      recordingIntervalRef.current = setInterval(() => {
        const duration = Math.floor((Date.now() - recordingStartTimeRef.current) / 1000);
        setRecordingDuration(duration);
      }, 1000);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      setPermissionError(true);
      alert('Unable to access microphone. Please check your permissions.');
    }
  };

  const stopRecording = () => {
    // 記錄用戶活動
    if (burnModeActive && !showBurnConfirmation) {
      lastActivityTimeRef.current = Date.now();
    }
    
    if (mediaRecorderRef.current && isRecording) {
      clearInterval(recordingIntervalRef.current);
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getMessageWidth = (duration) => {
    // Calculate width based on recording duration, with min and max limits
    const minWidth = 200; // Minimum width (pixels)
    const maxWidth = 400; // Maximum width (pixels)
    const widthPerSecond = 10; // Width increase per second (pixels)
    
    const calculatedWidth = Math.min(maxWidth, Math.max(minWidth, duration * widthPerSecond));
    // Convert to tailwind width classes
    if (calculatedWidth <= 200) return 'w-52';
    if (calculatedWidth <= 250) return 'w-64';
    if (calculatedWidth <= 300) return 'w-72';
    if (calculatedWidth <= 350) return 'w-80';
    return 'w-96';
  };

  // Simulate AI response
  const simulateAIResponse = () => {
    // 記錄用戶活動
    if (burnModeActive && !showBurnConfirmation) {
      lastActivityTimeRef.current = Date.now();
    }
    
    setIsLoading(true);
    // Simulate delay for a more realistic experience
    setTimeout(() => {
      const responses = [
        "That's interesting! Tell me more.",
        "I understand what you mean.",
        "How are you feeling about that?",
        "Thanks for sharing that with me!",
        "I'm here to listen whenever you need me."
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: randomResponse,
        sender: 'ai'
      }]);
      setIsLoading(false);
    }, 1000);
  };

  const handleSend = () => {
    // 記錄用戶活動
    if (burnModeActive && !showBurnConfirmation) {
      lastActivityTimeRef.current = Date.now();
    }
    
    if (!input.trim() && !audioBlob) return;
    
    if (input.trim()) {
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: input,
        sender: 'user'
      }]);
      setInput('');
      
      // Simulate AI response after user message
      simulateAIResponse();
    }
    
    if (audioBlob) {
      const messageId = Date.now();
      setMessages(prev => [...prev, {
        id: messageId,
        text: '🎤 Voice message',
        sender: 'user',
        isAudio: true,
        audioUrl: URL.createObjectURL(audioBlob),
        duration: recordingDuration
      }]);
      setAudioBlob(null);
      setRecordingDuration(0);
      
      // Simulate AI response after voice message
      simulateAIResponse();
    }
  };

  const handleInputChange = (e) => {
    // 記錄用戶活動
    if (burnModeActive && !showBurnConfirmation) {
      lastActivityTimeRef.current = Date.now();
    }
    
    setInput(e.target.value);
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100 relative">
      {/* 頭部導航欄 - 移動設備上顯示 */}
      <div className="md:hidden flex items-center justify-between bg-gray-800 p-2 text-white">
        <button onClick={handleBack} className="p-2">
          <BackIcon />
        </button>
        <h2 className="text-xl">{friendData.name}</h2>
        <button 
          onClick={toggleBurnMode} 
          className={`p-2 ${burnModeActive ? 'text-red-500' : ''}`}
        >
          <BurnIcon active={burnModeActive} />
        </button>
      </div>
      
      {/* 側邊個人資料 */}
      <div className="w-full md:w-1/3 bg-gray-800 p-4 md:p-8 hidden md:block">
        <div className="flex justify-between items-center mb-4">
          <button 
            onClick={handleBack}
            className="text-white hover:bg-gray-700 p-2 rounded-full"
          >
            <BackIcon />
          </button>
          <h1 className="text-3xl md:text-4xl text-white">{friendData.name}</h1>
          <button 
            onClick={toggleBurnMode}
            className={`p-2 rounded-full ${burnModeActive ? 'bg-red-500/20 text-red-500' : 'text-white hover:bg-gray-700'}`}
            title={burnModeActive ? "Burn mode active" : "Enable burn mode"}
          >
            <BurnIcon active={burnModeActive} />
          </button>
        </div>
        
        <div className="relative">
          <img
            src="/images/3d-character.avif"
            alt={friendData.name}
            className="w-full rounded-lg"
          />
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gray-200 bg-opacity-80 rounded-b-lg">
            <p className="text-center italic">
              "{friendData.desc}"
            </p>
          </div>
        </div>
        
        {burnModeActive && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-red-400 text-sm">
              <strong>Burn Mode Active:</strong> Messages will be automatically cleared after 10 seconds of inactivity.
            </p>
          </div>
        )}
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
                  src="/images/3d-character.avif"
                  className="w-8 h-8 rounded-full mr-2"
                  alt={friendData.name}
                />
              )}
              <div 
                className={`p-3 rounded-2xl ${
                  msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-white'
                } ${msg.isAudio ? getMessageWidth(msg.duration) : 'max-w-[70%]'}`}
              >
                {msg.isAudio ? (
                  <div>
                    <audio controls src={msg.audioUrl} className="w-full mb-1" />
                    <div className="text-xs opacity-75 text-right">
                      {formatDuration(msg.duration)}
                    </div>
                  </div>
                ) : (
                  msg.text
                )}
              </div>
            </div>
          ))}
          
          {/* 添加載入指示器 */}
          {isLoading && (
            <div className="flex justify-start mb-4">
              <img 
                src={`/api/placeholder/32/32`}
                className="w-8 h-8 rounded-full mr-2"
                alt={friendData.name}
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
          {permissionError && (
            <div className="text-red-500 text-sm mb-2">
              Microphone access denied. Please check your browser permissions.
            </div>
          )}
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              onKeyPress={e => e.key === 'Enter' && handleSend()}
              className="flex-1 p-4 rounded-full border focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Type A Message..."
              disabled={isLoading}
            />
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isLoading}
              className={`p-4 ${
                isRecording ? 'text-red-500 hover:text-red-600' : 'text-gray-500 hover:text-gray-600'
              }`}
            >
              {isRecording ? (
                <div className="flex items-center">
                  <StopIcon />
                  <span className="ml-2 text-sm">{formatDuration(recordingDuration)}</span>
                </div>
              ) : (
                <MicIcon />
              )}
            </button>
            <button
              onClick={handleSend}
              className={`p-4 ${(!input.trim() && !audioBlob) || isLoading ? 'text-gray-300' : 'text-blue-500 hover:text-blue-600'}`}
              disabled={(!input.trim() && !audioBlob) || isLoading}
            >
              <SendIcon />
            </button>
          </div>
        </div>
      </div>
      
      {/* 焚燒確認彈窗 */}
      {showBurnConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="text-center mb-4">
              <div className="inline-block p-3 bg-red-100 rounded-full mb-2">
                <BurnIcon active={true} />
              </div>
              <h3 className="text-xl font-bold">Inactivity Detected</h3>
              <p className="text-gray-600 mt-2">
                Would you like to continue chatting or clear this conversation?
              </p>
              <div className="text-center mt-3">
                <span className="w-12 h-12 rounded-full bg-red-100 text-red-600 font-bold text-xl flex items-center justify-center">
                  {countdownSeconds}
                </span>
                <p className="text-sm text-gray-500 mt-1">
                  Auto-clearing in {countdownSeconds} seconds
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button 
                onClick={continueChatting}
                className="flex-1 p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Continue Chatting
              </button>
              <button 
                onClick={executeBurn}
                className="flex-1 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Clear Now
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* 退出確認彈窗 */}
      {showExitConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-2">Exit Chat?</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to exit this chat? Any unsaved conversation will be lost.
            </p>
            <div className="flex space-x-3">
              <button 
                onClick={cancelExit}
                className="flex-1 p-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button 
                onClick={confirmExit}
                className="flex-1 p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}