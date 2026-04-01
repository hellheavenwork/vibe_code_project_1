import * as React from 'react';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Briefcase, User, Lock, Mail, AtSign, ArrowRight, AlertCircle, Check } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { motion } from 'motion/react';
import { register } from '../api/auth';

export default function Register() {
  const navigate = useNavigate();
  const [name,     setName]     = useState('');
  const [username, setUsername] = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [error,    setError]    = useState<string | null>(null);
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name || !username || !password) {
      setError('Name, username and password are required');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await register(username, password, name, email || undefined);
      navigate('/app');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const strength = (() => {
    if (!password) return 0;
    let s = 0;
    if (password.length >= 6)                      s++;
    if (password.length >= 10)                     s++;
    if (/[A-Z]/.test(password))                   s++;
    if (/[0-9]/.test(password))                   s++;
    if (/[^A-Za-z0-9]/.test(password))            s++;
    return s;
  })();

  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'][strength];
  const strengthColor = ['', 'bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-400', 'bg-green-500'][strength];

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 dark:bg-zinc-950">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-xl dark:bg-zinc-900 dark:border dark:border-zinc-800"
      >
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-500/30">
            <Briefcase className="h-7 w-7" />
          </div>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Create an account
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-zinc-400">
            Join TaskFlow and start managing your team
          </p>
        </div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400"
          >
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </motion.div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          {/* Full name */}
          <div className="relative">
            <User className="absolute left-3 top-9 h-4 w-4 text-gray-400" />
            <Input
              label="Full Name"
              placeholder="Somsak Dev"
              className="pl-9"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>

          {/* Username */}
          <div className="relative">
            <AtSign className="absolute left-3 top-9 h-4 w-4 text-gray-400" />
            <Input
              label="Username"
              placeholder="somsak"
              className="pl-9"
              value={username}
              onChange={e => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
            />
          </div>

          {/* Email */}
          <div className="relative">
            <Mail className="absolute left-3 top-9 h-4 w-4 text-gray-400" />
            <Input
              label="Email (optional)"
              type="email"
              placeholder="somsak@example.com"
              className="pl-9"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock className="absolute left-3 top-9 h-4 w-4 text-gray-400" />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              className="pl-9"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            {password && (
              <div className="mt-2 space-y-1">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-colors ${i <= strength ? strengthColor : 'bg-gray-200 dark:bg-zinc-700'}`}
                    />
                  ))}
                </div>
                <p className="text-xs text-gray-500 dark:text-zinc-400">{strengthLabel}</p>
              </div>
            )}
          </div>

          {/* Confirm password */}
          <div className="relative">
            <Lock className="absolute left-3 top-9 h-4 w-4 text-gray-400" />
            <Input
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              className="pl-9"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              error={confirm && confirm !== password ? 'Passwords do not match' : undefined}
            />
            {confirm && confirm === password && password && (
              <div className="mt-1 flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                <Check className="h-3.5 w-3.5" /> Passwords match
              </div>
            )}
          </div>

          <Button type="submit" className="w-full" isLoading={loading}>
            Create Account <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 dark:text-zinc-400">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
