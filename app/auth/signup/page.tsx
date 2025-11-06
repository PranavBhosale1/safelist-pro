'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { motion } from 'framer-motion';

export default function SignUpPage() {
  const router = useRouter();
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullname || !email || !password || !confirm) {
      setError('Please fill all fields.');
      return;
    }

    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

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
        return;
      }

      router.push('/login'); // Redirect to login after successful signup
    } catch  {
      setError('Signup error');
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/dashboard' });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50 px-6">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-md w-full bg-white rounded-2xl p-10 shadow-lg text-gray-900 border-2 border-green-200"
      >
        <h1 className="text-4xl font-black mb-8 text-center text-gray-900">Sign Up</h1>

        {error && <p className="mb-4 text-red-600 text-center font-semibold">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-7">
          <input
            type="text"
            placeholder="Full Name"
            className="w-full rounded-lg bg-white border-2 border-green-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-600 text-gray-900 placeholder:text-gray-400 transition-all duration-200"
            value={fullname}
            onChange={(e) => setFullname(e.target.value)}
            required
            disabled={loading}
          />

          <input
            type="email"
            placeholder="Email"
            className="w-full rounded-lg bg-white border-2 border-green-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-600 text-gray-900 placeholder:text-gray-400 transition-all duration-200"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full rounded-lg bg-white border-2 border-green-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-600 text-gray-900 placeholder:text-gray-400 transition-all duration-200"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />

          <input
            type="password"
            placeholder="Confirm Password"
            className="w-full rounded-lg bg-white border-2 border-green-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-600 text-gray-900 placeholder:text-gray-400 transition-all duration-200"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            disabled={loading}
          />

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="w-full bg-green-600 hover:bg-green-700 transition-all py-3 rounded-lg font-bold text-lg border-2 border-green-600 mt-2 text-white"
          >
            {loading ? 'Signing Up...' : 'Sign Up'}
          </motion.button>
        </form>

        <div className="my-8 flex items-center gap-3">
          <hr className="flex-grow border-green-300" />
          <span className="text-green-600 font-semibold">OR</span>
          <hr className="flex-grow border-green-300" />
        </div>

        <motion.button
          onClick={handleGoogleSignIn}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          className="w-full flex items-center justify-center gap-3 bg-white text-gray-900 font-bold rounded-lg py-3 border-2 border-green-600 hover:bg-green-50 transition-all text-lg"
          disabled={loading}
        >
          <svg
            className="w-6 h-6"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
          >
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

        <p className="mt-8 text-center text-gray-600">
          Already have an account?{' '}
          <a href="/auth/signin" className="text-green-600 hover:underline font-semibold">
            Sign In
          </a>
        </p>
      </motion.div>
    </div>
  );
}
