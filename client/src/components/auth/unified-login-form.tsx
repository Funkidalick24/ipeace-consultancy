import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface UnifiedLoginFormProps {
  onSuccess: (user: any, token: string, userType: 'admin' | 'client' | 'employee') => void;
  onSwitchToRegister: () => void;
}

interface LoginData {
  username: string;
  password: string;
}

export function UnifiedLoginForm({ onSuccess, onSwitchToRegister }: UnifiedLoginFormProps) {
  const { t } = useTranslation();
  const [loginData, setLoginData] = useState<LoginData>({
    username: '',
    password: ''
  });
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [verificationRequired, setVerificationRequired] = useState<{
    email: string;
    message: string;
  } | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setVerificationRequired(null);

    if (!loginData.username || !loginData.password) {
      setLoginError('Please enter both username and password');
      return;
    }

    setIsLoading(true);

    try {
      // Try client/employee login first
      let response = await fetch('/api/client/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: loginData.username,
          password: loginData.password
        })
      });

      let data = await response.json();

      // If client login fails, try admin login
      if (!response.ok) {
        response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            username: loginData.username,
            password: loginData.password
          })
        });

        data = await response.json();
      }

      if (response.ok) {
        // Login successful - determine user type and redirect accordingly
        const userType = data.user.role === 'admin' ? 'admin' : (data.user.role === 'employee' ? 'employee' : 'client');

        // Store in appropriate localStorage keys
        if (userType === 'admin') {
          localStorage.setItem('adminToken', data.token);
          localStorage.setItem('adminUser', JSON.stringify(data.user));
        } else {
          localStorage.setItem('clientToken', data.token);
          localStorage.setItem('clientUser', JSON.stringify(data.user));
        }

        onSuccess(data.user, data.token, userType);
      } else {
        if (data.requiresVerification) {
          setVerificationRequired({
            email: data.email,
            message: data.message || 'Please verify your email address before logging in.'
          });
          setLoginError('');
        } else {
          setLoginError(data.error || 'Login failed');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoginError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto border-t-4 border-primary-blue">
      <div className="text-center mb-6">
        <img
          src="/logo.png"
          alt="IPEACE Logo"
          className="h-12 w-auto mx-auto mb-4"
        />
        <h1 className="text-2xl font-bold text-primary-blue">IPEACE Portal Login</h1>
        <p className="text-gray-600 text-sm mt-2">Access your dashboard or client portal</p>
      </div>
      <form onSubmit={handleLogin}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2 font-medium">Email or Username</label>
          <input
            type="text"
            value={loginData.username}
            onChange={(e) => setLoginData({...loginData, username: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-primary-blue transition-colors"
            required
            autoComplete="username"
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 mb-2 font-medium">Password</label>
          <input
            type="password"
            value={loginData.password}
            onChange={(e) => setLoginData({...loginData, password: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-primary-blue transition-colors"
            required
            autoComplete="current-password"
          />
        </div>

        {loginError && (
          <div className="text-red-600 mb-4 bg-red-50 p-3 rounded-md border border-red-200">{loginError}</div>
        )}

        {verificationRequired && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-yellow-800 mb-1">Email Verification Required</h3>
                <p className="text-sm text-yellow-700 mb-3">{verificationRequired.message}</p>
                <button
                  onClick={() => {
                    // For now, just show an alert. In a real app, you'd navigate to verification page
                    alert(`Please check your email (${verificationRequired.email}) for the verification code and try logging in again after verification.`);
                  }}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Verify Email
                </button>
              </div>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full btn-primary py-3 px-4 rounded-md font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isLoading ? 'Signing In...' : 'Sign In to Portal'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-gray-600">
          Don't have an account?{' '}
          <button
            onClick={onSwitchToRegister}
            className="text-primary-blue hover:text-secondary-blue font-medium transition-colors"
          >
            Create Client Account
          </button>
        </p>
      </div>

      <div className="mt-4 text-center">
        <p className="text-sm text-gray-500">
          Access your dashboard or client portal
        </p>
      </div>
    </div>
  );
}