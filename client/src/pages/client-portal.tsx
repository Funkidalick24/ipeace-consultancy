import { useState, useEffect } from 'react';
import { UnifiedLoginForm } from '../components/auth/unified-login-form';
import { UnifiedRegisterForm } from '../components/auth/unified-register-form';
import { useLocation } from 'wouter';

type AuthMode = 'login' | 'register';

export default function ClientPortal() {
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [, navigate] = useLocation();

  useEffect(() => {
    // Check if user is already logged in (either admin or client)
    const adminToken = localStorage.getItem('adminToken');
    const adminUser = localStorage.getItem('adminUser');
    const clientToken = localStorage.getItem('clientToken');
    const clientUser = localStorage.getItem('clientUser');

    if (adminToken && adminUser) {
      const userData = JSON.parse(adminUser);
      setUser(userData);
      setIsAuthenticated(true);
      navigate('/admin');
    } else if (clientToken && clientUser) {
      const userData = JSON.parse(clientUser);
      setUser(userData);
      setIsAuthenticated(true);
      navigate('/client/dashboard');
    }
  }, [navigate]);

  const handleLoginSuccess = (userData: any, token: string, userType: 'admin' | 'client' | 'employee') => {
    setUser(userData);
    setIsAuthenticated(true);

    // Redirect based on user type
    if (userType === 'admin') {
      navigate('/admin');
    } else {
      navigate('/client/dashboard');
    }
  };

  const handleRegisterSuccess = (userData: any, token: string, userType: 'client' | 'employee') => {
    if (userData && token) {
      // User is logged in after verification
      setUser(userData);
      setIsAuthenticated(true);

      // Store in localStorage
      localStorage.setItem('clientToken', token);
      localStorage.setItem('clientUser', JSON.stringify(userData));

      // Redirect to client dashboard
      navigate('/client/dashboard');
    } else {
      // Registration completed, switch to login mode
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
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">IPEACE Portal</h1>
          <p className="text-lg text-gray-600">Access your admin dashboard or client portal</p>
        </div>

        <div className="flex justify-center">
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

        {/* Features Preview */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4v10a2 2 0 002 2h4a2 2 0 002-2V11M9 11h6" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Consultation Management</h3>
            <p className="text-gray-600 text-sm">Schedule, reschedule, and track your legal consultations</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Document Library</h3>
            <p className="text-gray-600 text-sm">Access shared documents and legal resources</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Direct Communication</h3>
            <p className="text-gray-600 text-sm">Message your legal team and receive updates</p>
          </div>
        </div>
      </div>
    </div>
  );
}