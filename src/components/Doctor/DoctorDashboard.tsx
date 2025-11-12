import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../config/api';
import { Chat } from '../Chat/Chat';
import { Users, Pill, LogOut, MessageSquare } from 'lucide-react';

interface Patient {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
}

interface MedicineRequestType {
  id: string;
  medicine_name: string;
  reason: string;
  status: string;
  doctor_notes?: string;
  created_at: string;
  patient: {
    id: string;
    full_name: string;
    email: string;
    phone?: string;
  };
}

export const DoctorDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'patients' | 'requests'>('patients');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [requests, setRequests] = useState<MedicineRequestType[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  useEffect(() => {
    fetchPatients();
    fetchRequests();
  }, []);

  useEffect(() => {
    const loadChatForSelectedPatient = async () => {
      if (!selectedPatient) {
        setSelectedChatId(null);
        return;
      }
      try {
        const chats = await api.get('/chats');
        const chatForPatient = (chats as any[]).find((c) => String(c.patient?.id) === String(selectedPatient.id));
        
        if (chatForPatient) {
          setSelectedChatId(chatForPatient.id);
        } else {
          // If no chat exists, create one for the doctor
          try {
            const newChat = await api.post('/chats', { patient_id: selectedPatient.id });
            setSelectedChatId(newChat.id);
          } catch (createError) {
            console.error('Failed to create chat:', createError);
            setSelectedChatId(null);
          }
        }
      } catch (error) {
        console.error('Failed to fetch chats:', error);
        setSelectedChatId(null);
      }
    };
    loadChatForSelectedPatient();
  }, [selectedPatient]);

  const fetchPatients = async () => {
    try {
      const data = await api.get('/users/patients');
      setPatients(data);
    } catch (error) {
      console.error('Failed to fetch patients:', error);
    }
  };

  const fetchRequests = async () => {
    try {
      const data = await api.get('/medicines/requests');
      setRequests(data);
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    }
  };

  const handleUpdateRequest = async (requestId: string, status: string, notes?: string) => {
    try {
      await api.patch(`/medicines/requests/${requestId}`, {
        status,
        doctor_notes: notes,
      });
      fetchRequests();
    } catch (error) {
      console.error('Failed to update request:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Doctor Dashboard</h1>
              <p className="text-sm text-gray-600">Welcome, Dr. {user?.full_name}</p>
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
              onClick={() => setActiveTab('patients')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                activeTab === 'patients'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Users className="w-5 h-5" />
              Patients
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                activeTab === 'requests'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Pill className="w-5 h-5" />
              Medicine Requests
              {requests.filter((r) => r.status === 'pending').length > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {requests.filter((r) => r.status === 'pending').length}
                </span>
              )}
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'patients' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Patients</h2>
                {selectedPatient ? (
                  <div>
                    <button
                      onClick={() => setSelectedPatient(null)}
                      className="mb-4 text-blue-600 hover:text-blue-700"
                    >
                      ← Back to patients list
                    </button>
                    <div className="bg-gray-50 p-4 rounded-lg mb-4">
                      <h3 className="font-semibold text-gray-900">{selectedPatient.full_name}</h3>
                      <p className="text-sm text-gray-600">{selectedPatient.email}</p>
                      {selectedPatient.phone && (
                        <p className="text-sm text-gray-600">{selectedPatient.phone}</p>
                      )}
                    </div>
                    {selectedChatId ? (
                      <Chat chatId={selectedChatId} />
                    ) : (
                      <div className="text-center text-gray-500 py-8 border border-dashed border-gray-300 rounded-lg">
                        No chat found with this patient yet. Ask the patient to start a chat.
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {patients.map((patient) => (
                      <div
                        key={patient.id}
                        className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-semibold text-gray-900">{patient.full_name}</h3>
                            <p className="text-sm text-gray-600">{patient.email}</p>
                            {patient.phone && (
                              <p className="text-sm text-gray-600">{patient.phone}</p>
                            )}
                          </div>
                          <button
                            onClick={() => setSelectedPatient(patient)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <MessageSquare className="w-4 h-4" />
                            Chat
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'requests' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Medicine Requests</h2>
                <div className="space-y-4">
                  {requests.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No medicine requests yet</p>
                  ) : (
                    requests.map((request) => (
                      <div key={request.id} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {request.medicine_name}
                            </h3>
                            <p className="text-sm text-gray-600 mb-2">
                              Patient: {request.patient.full_name} ({request.patient.email})
                            </p>
                            <p className="text-gray-700 mb-2">{request.reason}</p>
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                                request.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : request.status === 'approved'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                            </span>
                          </div>
                        </div>

                        {request.status === 'pending' && (
                          <div className="flex gap-3 mt-4">
                            <button
                              onClick={() =>
                                handleUpdateRequest(
                                  request.id,
                                  'approved',
                                  'Prescription approved by doctor'
                                )
                              }
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() =>
                                handleUpdateRequest(
                                  request.id,
                                  'rejected',
                                  'Unable to prescribe this medication at this time'
                                )
                              }
                              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                              Reject
                            </button>
                          </div>
                        )}

                        {request.doctor_notes && (
                          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <p className="text-sm font-medium text-blue-900 mb-1">Notes:</p>
                            <p className="text-sm text-blue-800">{request.doctor_notes}</p>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
