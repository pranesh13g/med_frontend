import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../config/api';
import { Chat } from '../Chat/Chat';
import { MedicineRequest } from './MedicineRequest';
import { MessageSquare, Pill, LogOut } from 'lucide-react';

interface Doctor {
  id: string;
  full_name: string;
  email: string;
}

export const PatientDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'chat' | 'medicines'>('chat');
  const [doctor, setDoctor] = useState<Doctor | null>(null);

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const doctorData = await api.get('/users/doctor');
        setDoctor(doctorData);
      } catch (error) {
        console.error('Failed to fetch doctor:', error);
      }
    };

    fetchDoctor();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Patient Dashboard</h1>
              <p className="text-sm text-gray-600">Welcome, {user?.full_name}</p>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                activeTab === 'chat'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <MessageSquare className="w-5 h-5" />
              Chat with Doctor
            </button>
            <button
              onClick={() => setActiveTab('medicines')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                activeTab === 'medicines'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Pill className="w-5 h-5" />
              Medicine Requests
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'chat' && doctor && <Chat doctorId={doctor.id} />}
            {activeTab === 'medicines' && doctor && <MedicineRequest doctorId={doctor.id} />}
            {!doctor && (
              <div className="text-center py-12">
                <p className="text-gray-500">Loading...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
