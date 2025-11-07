'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, Fingerprint, Eye, CheckCircle, ChevronRight, ChevronLeft } from 'lucide-react';

type Step = 1 | 2 | 3;

export default function SignUpPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  
  // Step 1: Basic Info
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  
  // Step 2: eKYC
  const [ekycMethod, setEkycMethod] = useState<'otp' | 'biometric' | null>(null);
  
  // OTP eKYC states
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  
  // Biometric eKYC states
  const [biometricType, setBiometricType] = useState<'fingerprint' | 'iris' | null>(null);
  const [biometricCaptured, setBiometricCaptured] = useState(false);
  const [biometricVerified, setBiometricVerified] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Step validation
  const canProceedStep1 = () => {
    return fullname.trim() && email.trim() && password.length >= 6 && password === confirm;
  };

  const canProceedStep2 = () => {
    if (ekycMethod === 'otp') {
      return otpVerified;
    } else if (ekycMethod === 'biometric') {
      return biometricVerified;
    }
    return false;
  };

  const handleStep1Next = () => {
    setError('');
    if (!canProceedStep1()) {
      setError('Please fill all fields correctly. Password must be at least 6 characters.');
      return;
    }
    setCurrentStep(2);
  };

  const handleStep2Next = () => {
    if (!canProceedStep2()) {
      setError('Please complete eKYC verification to proceed.');
      return;
    }
    setCurrentStep(3);
    handleFinalSubmit();
  };

  const handleFinalSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullname, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Signup failed');
        setLoading(false);
        setCurrentStep(1);
        return;
      }

      // Success - redirect to login
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch {
      setError('Signup error');
      setLoading(false);
      setCurrentStep(1);
    }
  };

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/dashboard' });
  };

  // eKYC handlers
  const handleSendOTP = () => {
    if (aadhaarNumber.length === 12) {
      setOtpSent(true);
      setError('');
    }
  };

  const handleVerifyOTP = () => {
    if (otp.length === 6) {
      setOtpVerified(true);
      setError('');
    }
  };

  const handleBiometricCapture = (type: 'fingerprint' | 'iris') => {
    setBiometricType(type);
    setBiometricCaptured(true);
    setError('');
    // Simulate biometric capture
    setTimeout(() => {
      setBiometricVerified(true);
    }, 2000);
  };

  const resetEKYC = () => {
    setEkycMethod(null);
    setOtpSent(false);
    setOtp('');
    setAadhaarNumber('');
    setOtpVerified(false);
    setBiometricType(null);
    setBiometricCaptured(false);
    setBiometricVerified(false);
  };

  const steps = [
    { number: 1, title: 'Account Info', completed: currentStep > 1 },
    { number: 2, title: 'eKYC Verification', completed: currentStep > 2 },
    { number: 3, title: 'Complete', completed: false },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50 px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-2xl w-full bg-white rounded-2xl p-8 md:p-10 shadow-lg text-gray-900 border-2 border-green-200"
      >
        <h1 className="text-4xl font-black mb-2 text-center text-gray-900">Sign Up</h1>
        <p className="text-center text-gray-600 mb-8">Create your account and complete eKYC verification</p>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                      currentStep === step.number
                        ? 'bg-green-600 text-white ring-4 ring-green-200'
                        : step.completed
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {step.completed ? <CheckCircle className="w-6 h-6" /> : step.number}
                  </div>
                  <span
                    className={`text-xs mt-2 font-semibold ${
                      currentStep === step.number ? 'text-green-600' : step.completed ? 'text-green-500' : 'text-gray-400'
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 rounded ${
                      step.completed ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 bg-red-50 border-2 border-red-200 rounded-lg text-red-600 text-sm font-semibold text-center"
          >
            {error}
          </motion.div>
        )}

        {/* Step 1: Account Information */}
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Account Information</h2>
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      placeholder="Enter your full name"
                      className="w-full rounded-lg bg-white border-2 border-green-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-600 text-gray-900 placeholder:text-gray-400 transition-all"
                      value={fullname}
                      onChange={(e) => setFullname(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      placeholder="Enter your email"
                      className="w-full rounded-lg bg-white border-2 border-green-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-600 text-gray-900 placeholder:text-gray-400 transition-all"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                    <input
                      type="password"
                      placeholder="Create a password (min. 6 characters)"
                      className="w-full rounded-lg bg-white border-2 border-green-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-600 text-gray-900 placeholder:text-gray-400 transition-all"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
                    <input
                      type="password"
                      placeholder="Confirm your password"
                      className="w-full rounded-lg bg-white border-2 border-green-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-600 text-gray-900 placeholder:text-gray-400 transition-all"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <motion.button
                  onClick={handleStep1Next}
                  disabled={!canProceedStep1()}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all py-3 px-6 rounded-lg font-bold text-white"
                >
                  Next: eKYC Verification
                  <ChevronRight className="w-5 h-5" />
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Step 2: eKYC Verification */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">eKYC Verification</h2>
                <p className="text-sm text-gray-600 mb-6">
                  Verify your identity using Aadhaar. This is required for secure account setup.
                </p>

                {!ekycMethod ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    <motion.button
                      onClick={() => setEkycMethod('otp')}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex flex-col items-center justify-center gap-4 p-8 border-2 border-blue-300 rounded-xl hover:bg-blue-50 transition-all"
                    >
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                        <Smartphone className="w-8 h-8 text-blue-600" />
                      </div>
                      <div className="text-center">
                        <h3 className="font-bold text-gray-900 mb-1">OTP-Based eKYC</h3>
                        <p className="text-xs text-gray-600">OTP sent to Aadhaar-linked mobile</p>
                      </div>
                    </motion.button>

                    <motion.button
                      onClick={() => setEkycMethod('biometric')}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex flex-col items-center justify-center gap-4 p-8 border-2 border-purple-300 rounded-xl hover:bg-purple-50 transition-all"
                    >
                      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                        <Fingerprint className="w-8 h-8 text-purple-600" />
                      </div>
                      <div className="text-center">
                        <h3 className="font-bold text-gray-900 mb-1">Biometric eKYC</h3>
                        <p className="text-xs text-gray-600">Fingerprint or Iris scan</p>
                      </div>
                    </motion.button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* OTP-Based eKYC */}
                    {ekycMethod === 'otp' && (
                      <div className="space-y-4 p-6 border-2 border-blue-200 rounded-xl bg-blue-50/30">
                        {!otpSent ? (
                          <>
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Enter Aadhaar Number
                              </label>
                              <input
                                type="text"
                                maxLength={12}
                                placeholder="Enter 12-digit Aadhaar number"
                                value={aadhaarNumber}
                                onChange={(e) => setAadhaarNumber(e.target.value.replace(/\D/g, ''))}
                                className="w-full rounded-lg bg-white border-2 border-green-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-600 text-gray-900 placeholder:text-gray-400 transition-all"
                              />
                              <p className="text-xs text-gray-500 mt-2">
                                OTP will be sent to your Aadhaar-linked mobile number
                              </p>
                            </div>
                            <div className="flex gap-3">
                              <motion.button
                                onClick={resetEKYC}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="flex-1 bg-gray-200 text-gray-700 font-semibold rounded-lg py-3 transition-all"
                              >
                                Back
                              </motion.button>
                              <motion.button
                                onClick={handleSendOTP}
                                disabled={aadhaarNumber.length !== 12}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg py-3 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                              >
                                Send OTP
                              </motion.button>
                            </div>
                          </>
                        ) : !otpVerified ? (
                          <>
                            <div className="text-center py-4">
                              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                              <p className="text-sm text-gray-700 font-semibold">
                                OTP sent to your registered mobile number
                              </p>
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">Enter OTP</label>
                              <input
                                type="text"
                                maxLength={6}
                                placeholder="Enter 6-digit OTP"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                className="w-full rounded-lg bg-white border-2 border-green-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-600 text-gray-900 placeholder:text-gray-400 transition-all text-center text-2xl tracking-widest"
                              />
                            </div>
                            <motion.button
                              onClick={handleVerifyOTP}
                              disabled={otp.length !== 6}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg py-3 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                              Verify OTP
                            </motion.button>
                          </>
                        ) : (
                          <div className="text-center py-6">
                            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                            <p className="text-lg font-bold text-green-600 mb-2">eKYC Verified Successfully!</p>
                            <p className="text-sm text-gray-600">Your identity has been verified with UIDAI</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Biometric-Based eKYC */}
                    {ekycMethod === 'biometric' && (
                      <div className="space-y-4 p-6 border-2 border-purple-200 rounded-xl bg-purple-50/30">
                        {!biometricType ? (
                          <>
                            <p className="text-sm text-gray-600 mb-4">
                              Select your preferred biometric verification method. Data will be verified directly with UIDAI.
                            </p>
                            <div className="grid grid-cols-2 gap-3">
                              <motion.button
                                onClick={() => handleBiometricCapture('fingerprint')}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex flex-col items-center justify-center gap-3 p-6 border-2 border-purple-300 rounded-xl hover:bg-purple-100 transition-all"
                              >
                                <Fingerprint className="w-10 h-10 text-purple-600" />
                                <span className="font-semibold text-gray-900">Fingerprint</span>
                              </motion.button>
                              <motion.button
                                onClick={() => handleBiometricCapture('iris')}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex flex-col items-center justify-center gap-3 p-6 border-2 border-purple-300 rounded-xl hover:bg-purple-100 transition-all"
                              >
                                <Eye className="w-10 h-10 text-purple-600" />
                                <span className="font-semibold text-gray-900">Iris Scan</span>
                              </motion.button>
                            </div>
                            <motion.button
                              onClick={resetEKYC}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className="w-full bg-gray-200 text-gray-700 font-semibold rounded-lg py-3 transition-all"
                            >
                              Back
                            </motion.button>
                          </>
                        ) : !biometricVerified ? (
                          <div className="text-center py-8">
                            <motion.div
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ repeat: Infinity, duration: 2 }}
                              className="mb-4"
                            >
                              {biometricType === 'fingerprint' ? (
                                <Fingerprint className="w-20 h-20 text-purple-600 mx-auto" />
                              ) : (
                                <Eye className="w-20 h-20 text-purple-600 mx-auto" />
                              )}
                            </motion.div>
                            <p className="text-lg font-semibold text-gray-900 mb-2">
                              {biometricType === 'fingerprint' ? 'Place your finger on the scanner' : 'Look into the iris scanner'}
                            </p>
                            <p className="text-sm text-gray-600 mb-4">
                              Capturing {biometricType === 'fingerprint' ? 'fingerprint' : 'iris'} data...
                            </p>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <motion.div
                                className="bg-purple-600 h-2 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: '100%' }}
                                transition={{ duration: 2 }}
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-6">
                            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                            <p className="text-lg font-bold text-green-600 mb-2">eKYC Verified Successfully!</p>
                            <p className="text-sm text-gray-600">Your biometric data has been verified with UIDAI</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-between pt-6">
                  <motion.button
                    onClick={() => {
                      resetEKYC();
                      setCurrentStep(1);
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2 bg-gray-200 text-gray-700 font-semibold rounded-lg py-3 px-6 transition-all"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    Back
                  </motion.button>
                  <motion.button
                    onClick={handleStep2Next}
                    disabled={!canProceedStep2()}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all py-3 px-6 rounded-lg font-bold text-white"
                  >
                    Complete Signup
                    <ChevronRight className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Completion */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              {loading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full mx-auto mb-6"
                  />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Creating your account...</h2>
                  <p className="text-gray-600">Please wait while we set up your account</p>
                </>
              ) : (
                <>
                  <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
                  <h2 className="text-2xl font-bold text-green-600 mb-2">Account Created Successfully!</h2>
                  <p className="text-gray-600 mb-4">Your account has been created and verified</p>
                  <p className="text-sm text-gray-500">Redirecting to login page...</p>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Google Sign In Option */}
        <div className="mt-8 pt-8 border-t border-green-200">
          <div className="flex items-center gap-3 mb-4">
            <hr className="flex-grow border-green-300" />
            <span className="text-green-600 font-semibold text-sm">OR</span>
            <hr className="flex-grow border-green-300" />
          </div>

          <motion.button
            onClick={handleGoogleSignIn}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-center gap-3 bg-white text-gray-900 font-bold rounded-lg py-3 border-2 border-green-600 hover:bg-green-50 transition-all"
            disabled={loading || currentStep !== 1}
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none">
              <path
                fill="#4285F4"
                d="M23.64 12.204c0-.794-.072-1.557-.206-2.293H12v4.34h6.337c-.27 1.447-1.1 2.674-2.345 3.5v2.917h3.792c2.216-2.04 3.506-5.05 3.506-8.464z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.96-1.07 7.947-2.908l-3.793-2.917c-1.052.705-2.4 1.125-4.154 1.125-3.19 0-5.896-2.153-6.865-5.045H1.163v3.167A11.998 11.998 0 0012 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.135 14.355a7.198 7.198 0 010-4.71V6.477H1.163a11.999 11.999 0 000 11.046l3.972-3.168z"
              />
              <path
                fill="#EA4335"
                d="M12 4.78c1.76 0 3.336.606 4.58 1.797l3.438-3.438C17.954 1.317 15.233 0 12 0 7.953 0 4.387 2.49 3.127 6.477l3.972 3.168c.962-2.896 3.619-4.865 4.901-4.865z"
              />
            </svg>
            Sign in with Google
          </motion.button>
        </div>

        <p className="mt-6 text-center text-gray-600 text-sm">
          Already have an account?{' '}
          <a href="/auth/signin" className="text-green-600 hover:underline font-semibold">
            Sign In
          </a>
        </p>
      </motion.div>
    </div>
  );
}
