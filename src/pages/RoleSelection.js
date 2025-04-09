import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function RoleSelection() {
  const navigate = useNavigate();
  const [selectedFriend, setSelectedFriend] = useState(null);
  
  const friends = [
    { id: 'sophia', name: 'Sophia', desc: 'Intelligent learner with analytical skills' },
    { id: 'oliver', name: 'Oliver', desc: 'Humorous socializer bringing joy' }
  ];

  const handleConfirm = () => {
    if (selectedFriend) {
      navigate('/chat', { state: { friend: selectedFriend } });
    }
  };

  return (
    <div className="min-h-screen bg-gray-800 p-8">
      <h1 className="text-3xl text-white text-center mb-8">Choose Your Friend</h1>
      <div className="grid grid-cols-2 gap-8 max-w-6xl mx-auto">
        {friends.map(friend => (
          <div 
            key={friend.id}
            className={`bg-gray-700 rounded-lg p-4 cursor-pointer transition-all 
              ${selectedFriend === friend.id 
                ? 'ring-2 ring-orange-400 transform scale-105' 
                : 'hover:ring-2 hover:ring-orange-400'}`}
            onClick={() => setSelectedFriend(friend.id)}
          >
            <img 
              src="/images/3d-character.avif"
              alt={friend.name}
              className="w-20 h-20 rounded-full mx-auto mb-2"
            />
            <h3 className="text-white text-center font-medium">{friend.name}</h3>
            <p className="text-gray-300 text-sm text-center">{friend.desc}</p>
          </div>
        ))}
      </div>
      <button 
        onClick={handleConfirm}
        disabled={!selectedFriend}
        className={`block mx-auto mt-8 px-8 py-2 rounded-full transition-all
          ${selectedFriend 
            ? 'bg-orange-400 hover:bg-orange-500 text-white cursor-pointer' 
            : 'bg-gray-500 text-gray-300 cursor-not-allowed'}`}
      >
        Confirm
      </button>
    </div>
  );
}