import { useState, useEffect } from 'react';
import { UnifiedLoginForm } from '../components/auth/unified-login-form';
import { UnifiedRegisterForm } from '../components/auth/unified-register-form';
import { useLocation } from 'wouter';
import { getAuthUser, setAuthUser } from '@/lib/auth';

type AuthMode = 'login' | 'register';

export default function ClientPortal() {
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [, navigate] = useLocation();

  useEffect(() => {
    const authUser = getAuthUser();

    if (authUser) {
      setUser(authUser);
      setIsAuthenticated(true);
      if (authUser.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/client/dashboard');
      }
    }
  }, [navigate]);

  const handleLoginSuccess = (userData: any, userType: 'admin' | 'client' | 'employee') => {
    setUser(userData);
    setIsAuthenticated(true);

    // Redirect based on user type
    if (userType === 'admin') {
      navigate('/admin');
    } else {
      navigate('/client/dashboard');
    }
  };

  const handleRegisterSuccess = (userData: any, userType: 'client' | 'employee') => {
    if (userData) {
      setUser(userData);
      setIsAuthenticated(true);

      setAuthUser(userData);

      navigate('/client/dashboard');
    } else {
      setAuthMode('login');
    }
  };

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-secondary-blue/10 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full flex justify-center">
        {authMode === 'login' ? (
          <UnifiedLoginForm
            onSuccess={handleLoginSuccess}
            onSwitchToRegister={() => setAuthMode('register')}
          />
        ) : (
          <UnifiedRegisterForm
            onSuccess={handleRegisterSuccess}
            onSwitchToLogin={() => setAuthMode('login')}
          />
        )}
      </div>
    </div>
  );
}