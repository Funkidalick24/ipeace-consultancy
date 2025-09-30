import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import EmailVerification from './email-verification';

interface UnifiedRegisterFormProps {
  onSuccess: (user: any, token: string, userType: 'client' | 'employee') => void;
  onSwitchToLogin: () => void;
}

interface RegisterData {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  company: string;
  password: string;
  confirmPassword: string;
  userType: 'client' | 'employee';
  // Client-specific fields
  businessType?: string;
  industry?: string;
  companySize?: string;
  legalNeeds?: string[];
  preferredContactMethod?: 'email' | 'phone' | 'both';
}

export function UnifiedRegisterForm({ onSuccess, onSwitchToLogin }: UnifiedRegisterFormProps) {
  const { t } = useTranslation();
  const [registerData, setRegisterData] = useState<RegisterData>({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    company: '',
    password: '',
    confirmPassword: '',
    userType: 'client',
    businessType: '',
    industry: '',
    companySize: '',
    legalNeeds: [],
    preferredContactMethod: 'email'
  });
  const [registerError, setRegisterError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showVerification, setShowVerification] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError('');

    // Validate passwords match
    if (registerData.password !== registerData.confirmPassword) {
      setRegisterError('Passwords do not match');
      return;
    }

    // Validate password strength
    if (registerData.password.length < 8) {
      setRegisterError('Password must be at least 8 characters long');
      return;
    }

    // Validate required fields
    if (!registerData.email || !registerData.firstName || !registerData.lastName) {
      setRegisterError('Please fill in all required fields');
      return;
    }

    setIsLoading(true);

    try {
      const endpoint = '/api/client/auth/register';

      const requestData = {
        username: registerData.username,
        email: registerData.email,
        firstName: registerData.firstName,
        lastName: registerData.lastName,
        phone: registerData.phone,
        company: registerData.company,
        password: registerData.password,
        role: registerData.userType,
        businessType: registerData.businessType,
        industry: registerData.industry,
        companySize: registerData.companySize,
        legalNeeds: registerData.legalNeeds,
        preferredContactMethod: registerData.preferredContactMethod,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      const data = await response.json();

      if (response.ok) {
        // Registration successful - show email verification for clients and employees
        if (registerData.userType === 'client' || registerData.userType === 'employee') {
          setShowVerification(true);
        }
      } else {
        setRegisterError(data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setRegisterError('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLegalNeedsChange = (need: string, checked: boolean) => {
    setRegisterData(prev => ({
      ...prev,
      legalNeeds: checked
        ? [...(prev.legalNeeds || []), need]
        : (prev.legalNeeds || []).filter(n => n !== need)
    }));
  };

  const handleVerificationComplete = () => {
    // After email verification, redirect to client portal
    // Note: In a real app, you'd want to get the token from the verification process
    onSuccess(null, '', 'client');
  };

  const handleBackToRegistration = () => {
    setShowVerification(false);
  };

  // Show email verification if registration was successful for clients
  if (showVerification) {
    return (
      <EmailVerification
        email={registerData.email}
        firstName={registerData.firstName}
        onVerificationComplete={handleVerificationComplete}
        onBack={handleBackToRegistration}
      />
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto border-t-4 border-primary-blue">
      <div className="text-center mb-6">
        <img
          src="/logo.png"
          alt="IPEACE Logo"
          className="h-12 w-auto mx-auto mb-4"
        />
        <h1 className="text-2xl font-bold text-primary-blue">Create IPEACE Account</h1>
        <p className="text-gray-600 text-sm mt-2">Join IPEACE Consultancy for professional legal services</p>
      </div>

      <form onSubmit={handleRegister} className="space-y-6">
        {/* Account Type Selection */}
        <div className="border-b pb-6">
          <h3 className="text-lg font-semibold mb-4">Account Type</h3>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="client"
                checked={registerData.userType === 'client'}
                onChange={(e) => setRegisterData({...registerData, userType: e.target.value as 'client'})}
                className="mr-2"
              />
              <span className="font-medium">Client Account</span>
              <span className="text-sm text-gray-500 ml-2">Access client portal</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="employee"
                checked={registerData.userType === 'employee'}
                onChange={(e) => setRegisterData({...registerData, userType: e.target.value as 'employee'})}
                className="mr-2"
              />
              <span className="font-medium">Employee Account</span>
              <span className="text-sm text-gray-500 ml-2">Staff access</span>
            </label>
          </div>
        </div>

        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 mb-2 font-medium">First Name *</label>
            <input
              type="text"
              value={registerData.firstName}
              onChange={(e) => setRegisterData({...registerData, firstName: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-primary-blue transition-colors"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2 font-medium">Last Name *</label>
            <input
              type="text"
              value={registerData.lastName}
              onChange={(e) => setRegisterData({...registerData, lastName: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-primary-blue transition-colors"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 mb-2 font-medium">Email *</label>
            <input
              type="email"
              value={registerData.email}
              onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-primary-blue transition-colors"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2 font-medium">Phone</label>
            <input
              type="tel"
              value={registerData.phone}
              onChange={(e) => setRegisterData({...registerData, phone: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-primary-blue transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 mb-2 font-medium">Username *</label>
            <input
              type="text"
              value={registerData.username}
              onChange={(e) => setRegisterData({...registerData, username: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-primary-blue transition-colors"
              required
              minLength={3}
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2 font-medium">Company</label>
            <input
              type="text"
              value={registerData.company}
              onChange={(e) => setRegisterData({...registerData, company: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-primary-blue transition-colors"
            />
          </div>
        </div>

        {/* Client-specific fields */}
        {registerData.userType === 'client' && (
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Business Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-2 font-medium">Business Type</label>
                <select
                  value={registerData.businessType}
                  onChange={(e) => setRegisterData({...registerData, businessType: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-primary-blue transition-colors"
                >
                  <option value="">Select business type</option>
                  <option value="sole-proprietorship">Sole Proprietorship</option>
                  <option value="partnership">Partnership</option>
                  <option value="corporation">Corporation</option>
                  <option value="llc">LLC</option>
                  <option value="non-profit">Non-Profit</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-2 font-medium">Industry</label>
                <select
                  value={registerData.industry}
                  onChange={(e) => setRegisterData({...registerData, industry: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-primary-blue transition-colors"
                >
                  <option value="">Select industry</option>
                  <option value="technology">Technology</option>
                  <option value="finance">Finance</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="retail">Retail</option>
                  <option value="manufacturing">Manufacturing</option>
                  <option value="real-estate">Real Estate</option>
                  <option value="legal">Legal</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-gray-700 mb-2 font-medium">Company Size</label>
              <select
                value={registerData.companySize}
                onChange={(e) => setRegisterData({...registerData, companySize: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-primary-blue transition-colors"
              >
                <option value="">Select company size</option>
                <option value="1-10">1-10 employees</option>
                <option value="11-50">11-50 employees</option>
                <option value="51-200">51-200 employees</option>
                <option value="201-1000">201-1000 employees</option>
                <option value="1000+">1000+ employees</option>
              </select>
            </div>

            <div className="mt-4">
              <label className="block text-gray-700 mb-2">Legal Services Needed</label>
              <div className="grid grid-cols-2 gap-2">
                {['Regulatory Compliance', 'Business Strategy', 'Contract Drafting', 'Intellectual Property', 'Tax Services', 'Employment Law'].map((need) => (
                  <label key={need} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={registerData.legalNeeds?.includes(need) || false}
                      onChange={(e) => handleLegalNeedsChange(need, e.target.checked)}
                      className="mr-2"
                    />
                    {need}
                  </label>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-gray-700 mb-2 font-medium">Preferred Contact Method</label>
              <select
                value={registerData.preferredContactMethod}
                onChange={(e) => setRegisterData({...registerData, preferredContactMethod: e.target.value as 'email' | 'phone' | 'both'})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-primary-blue transition-colors"
              >
                <option value="email">Email</option>
                <option value="phone">Phone</option>
                <option value="both">Both</option>
              </select>
            </div>
          </div>
        )}

        {/* Password */}
        <div className="border-t pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-2 font-medium">Password *</label>
              <input
                type="password"
                value={registerData.password}
                onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-primary-blue transition-colors"
                required
                minLength={8}
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2 font-medium">Confirm Password *</label>
              <input
                type="password"
                value={registerData.confirmPassword}
                onChange={(e) => setRegisterData({...registerData, confirmPassword: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-primary-blue transition-colors"
                required
                minLength={8}
              />
            </div>
          </div>
        </div>

        {registerError && (
          <div className="text-red-600 bg-red-50 p-3 rounded-md">{registerError}</div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full btn-primary py-3 px-4 rounded-md font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isLoading ? 'Creating Account...' : `Create ${registerData.userType === 'employee' ? 'Employee' : 'Client'} Account`}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-gray-600">
          Already have an account?{' '}
          <button
            onClick={onSwitchToLogin}
            className="text-primary-blue hover:text-secondary-blue font-medium transition-colors"
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
}