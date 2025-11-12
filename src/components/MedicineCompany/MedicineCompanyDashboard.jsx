import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../config/api';
import { Package, LogOut, CheckCircle } from 'lucide-react';

export const MedicineCompanyDashboard = () => {
  const { user, logout } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      const data = await api.get('/medicines/prescriptions');
      setPrescriptions(data);
    } catch (error) {
      console.error('Failed to fetch prescriptions:', error);
    }
  };

  const handleUpdateStatus = async (prescriptionId, status) => {
    try {
      await api.patch(`/medicines/requests/${prescriptionId}`, { status });
      fetchPrescriptions();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Medicine Company Dashboard</h1>
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
          <div className="border-b border-gray-200 px-6 py-4 bg-blue-50">
            <div className="flex items-center gap-2">
              <Package className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Approved Prescriptions</h2>
            </div>
          </div>

          <div className="p-6">
            <div className="space-y-4">
              {prescriptions.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No approved prescriptions yet</p>
              ) : (
                prescriptions.map((prescription) => (
                  <div key={prescription.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {prescription.medicine_name}
                          </h3>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              prescription.status
                            )}`}
                          >
                            {prescription.status.charAt(0).toUpperCase() +
                              prescription.status.slice(1)}
                          </span>
                        </div>

                        <div className="space-y-2 mb-4">
                          <div>
                            <p className="text-sm font-medium text-gray-700">Patient Information</p>
                            <p className="text-sm text-gray-600">
                              {prescription.patient.full_name} - {prescription.patient.email}
                            </p>
                            {prescription.patient.phone && (
                              <p className="text-sm text-gray-600">
                                Phone: {prescription.patient.phone}
                              </p>
                            )}
                          </div>

                          <div>
                            <p className="text-sm font-medium text-gray-700">Doctor</p>
                            <p className="text-sm text-gray-600">
                              Dr. {prescription.doctor.full_name}
                            </p>
                          </div>

                          <div>
                            <p className="text-sm font-medium text-gray-700">Medical Reason</p>
                            <p className="text-sm text-gray-600">{prescription.reason}</p>
                          </div>
                        </div>

                        {prescription.doctor_notes && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                            <p className="text-sm font-medium text-blue-900 mb-1">
                              Doctor's Notes:
                            </p>
                            <p className="text-sm text-blue-800">{prescription.doctor_notes}</p>
                          </div>
                        )}

                        <p className="text-xs text-gray-500">
                          Approved on {new Date(prescription.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {prescription.status === 'approved' && (
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleUpdateStatus(prescription.id, 'processing')}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Package className="w-4 h-4" />
                          Mark as Processing
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(prescription.id, 'delivered')}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Mark as Delivered
                        </button>
                      </div>
                    )}

                    {prescription.status === 'processing' && (
                      <button
                        onClick={() => handleUpdateStatus(prescription.id, 'delivered')}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Mark as Delivered
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

