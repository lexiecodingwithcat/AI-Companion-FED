import { useState } from 'react';
import { useLocation } from 'react-router-dom';

export default function Chat() {
  const [messages, setMessages] = useState([
    { id: 1, text: 'Hi, my name is Sophia!', sender: 'ai' },
    { id: 2, text: 'Nice to meet you!', sender: 'ai' }
  ]);
  const [input, setInput] = useState('');
  const location = useLocation();
  const friend = location.state?.friend || 'sophia';

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, {
      id: Date.now(),
      text: input,
      sender: 'user'
    }]);
    setInput('');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-1/3 bg-gray-800 p-8">
        <h1 className="text-4xl text-white mb-4">{friend}</h1>
        <div className="relative">
          <img 
            src="/images/3d-character.avif"
            alt={friend}
            className="w-full rounded-lg"
          />
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gray-200 bg-opacity-80 rounded-b-lg">
            <p className="text-center italic">
              "Knowledge is my adventure; I love learning!"
            </p>
          </div>
        </div>
      </div>
      
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
        </div>
        
        <div className="p-4 bg-white">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleSend()}
              className="flex-1 p-4 rounded-full border focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Type A Message..."
            />
            <button
              onClick={handleSend}
              className="p-4 text-blue-500 hover:text-blue-600"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}