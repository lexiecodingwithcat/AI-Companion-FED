import { useNavigate } from 'react-router-dom';

export default function RoleSelection() {
    const navigate = useNavigate();
    
    const roles = [
      { id: 'student', title: 'Sophia', icon: '👨‍🎓' },
      { id: 'teacher', title: 'Oliver', icon: '👨‍🏫' }
    ];
  
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-3xl font-bold mb-8">Choose Your Friend</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {roles.map(role => (
            <button
              key={role.id}
              onClick={() => navigate('/chat', { state: { role: role.id } })}
              className="flex flex-col items-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <span className="text-4xl mb-2">{role.icon}</span>
              <span className="text-xl font-medium">{role.title}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }