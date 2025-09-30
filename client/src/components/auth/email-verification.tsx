import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';

interface EmailVerificationProps {
  email: string;
  firstName: string;
  onVerificationComplete: () => void;
  onBack: () => void;
}

export default function EmailVerification({ email, firstName, onVerificationComplete, onBack }: EmailVerificationProps) {
  const [, navigate] = useLocation();
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    // Start countdown for resend button
    setCountdown(60); // 60 seconds cooldown
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!verificationCode.trim()) {
      setError('Please enter the verification code');
      return;
    }

    if (verificationCode.length !== 6) {
      setError('Verification code must be 6 digits');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/verify-email-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          code: verificationCode.trim(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Email verified successfully! Redirecting...');
        setTimeout(() => {
          onVerificationComplete();
        }, 2000);
      } else {
        setError(data.message || 'Verification failed');
      }
    } catch (error) {
      console.error('Verification error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (countdown > 0) return;

    setResendLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/resend-verification-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          firstName,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Verification code sent successfully!');
        setCountdown(60); // Reset countdown
      } else {
        setError(data.message || 'Failed to resend code');
      }
    } catch (error) {
      console.error('Resend error:', error);
      setError('Network error. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Only allow digits
    if (value.length <= 6) {
      setVerificationCode(value);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-secondary-blue/10 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-lg shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Email</h2>
            <p className="text-gray-600">
              We've sent a 6-digit verification code to <strong>{email}</strong>
            </p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-green-800 text-sm">{success}</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Verification Form */}
          <form onSubmit={handleVerifyCode} className="space-y-6">
            <div>
              <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700 mb-2">
                Verification Code
              </label>
              <input
                id="verificationCode"
                type="text"
                value={verificationCode}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-primary-blue text-center text-2xl font-mono tracking-widest"
                placeholder="000000"
                maxLength={6}
                disabled={loading}
                autoFocus
              />
              <p className="text-xs text-gray-500 mt-2 text-center">
                Enter the 6-digit code sent to your email
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || verificationCode.length !== 6}
              className="w-full btn-primary py-3 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? 'Verifying...' : 'Verify Email'}
            </button>
          </form>

          {/* Resend Code */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 mb-3">
              Didn't receive the code?
            </p>
            <button
              onClick={handleResendCode}
              disabled={countdown > 0 || resendLoading}
              className="text-primary-blue hover:text-secondary-blue font-medium disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              {resendLoading
                ? 'Sending...'
                : countdown > 0
                ? `Resend code in ${countdown}s`
                : 'Resend verification code'
              }
            </button>
          </div>

          {/* Back Button */}
          <div className="mt-8 text-center">
            <button
              onClick={onBack}
              className="text-gray-600 hover:text-gray-800 font-medium"
            >
              ← Back to registration
            </button>
          </div>

          {/* Help Text */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Need help?</p>
                <p>Check your spam/junk folder if you don't see the email. The code expires in 15 minutes.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}