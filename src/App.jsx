import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Login } from './components/Auth/Login';
import { Register } from './components/Auth/Register';
import { PatientDashboard } from './components/Patient/PatientDashboard';
import { DoctorDashboard } from './components/Doctor/DoctorDashboard';
import { MedicineCompanyDashboard } from './components/MedicineCompany/MedicineCompanyDashboard';

const AppContent = () => {
  const [showLogin, setShowLogin] = useState(true);
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return showLogin ? (
      <Login onToggle={() => setShowLogin(false)} />
    ) : (
      <Register onToggle={() => setShowLogin(true)} />
    );
  }

  if (user.role === 'patient') {
    return <PatientDashboard />;
  }

  if (user.role === 'doctor') {
    return <DoctorDashboard />;
  }

  if (user.role === 'medicine_company') {
    return <MedicineCompanyDashboard />;
  }

  return null;
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;

