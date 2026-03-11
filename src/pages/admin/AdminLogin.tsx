import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Lock, HelpCircle, ArrowLeft, ChevronDown, AlertCircle } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { motion, AnimatePresence } from 'motion/react';

interface SecurityQuestion {
  id: number;
  question: string;
}

export const AdminLogin = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAdminAuth();

  const [mode, setMode] = useState<'password' | 'question'>('password');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [questions, setQuestions] = useState<SecurityQuestion[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<number | ''>('');
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated) navigate('/admin', { replace: true });
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    fetch('/api/admin/security-questions-public')
      .then(r => r.json())
      .then(data => {
        setQuestions(data);
        if (data.length > 0) setSelectedQuestion(data[0].id);
      })
      .catch(() => {});
  }, []);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        login(data.token);
        navigate('/admin', { replace: true });
      } else {
        setError(data.error || 'Incorrect password');
      }
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!selectedQuestion) { setError('Please select a question'); return; }
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/verify-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question_id: selectedQuestion, answer }),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        login(data.token);
        navigate('/admin', { replace: true });
      } else {
        setError(data.error || 'Incorrect answer');
      }
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = (next: 'password' | 'question') => {
    setMode(next);
    setError('');
    setPassword('');
    setAnswer('');
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#d4ff00] rounded-2xl mb-6">
            <Lock size={28} className="text-black" />
          </div>
          <h1 className="text-3xl font-display font-bold uppercase tracking-tight text-white">Admin Access</h1>
          <p className="text-neutral-500 font-mono text-xs uppercase tracking-widest mt-2">KS Kashif Sports</p>
        </div>

        {/* Mode Toggle */}
        <div className="flex gap-1 bg-neutral-900 p-1 rounded-xl mb-8">
          <button
            onClick={() => switchMode('password')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
              mode === 'password' ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Lock size={14} /> Password
          </button>
          <button
            onClick={() => switchMode('question')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
              mode === 'question' ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <HelpCircle size={14} /> Recovery
          </button>
        </div>

        <AnimatePresence mode="wait">
          {mode === 'password' ? (
            <motion.form
              key="password"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              onSubmit={handlePasswordSubmit}
              className="space-y-4"
            >
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 font-mono">
                  Admin Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 text-white rounded-xl px-4 py-3 pr-12 font-mono text-sm focus:outline-none focus:border-[#d4ff00] transition-colors placeholder:text-neutral-600"
                    placeholder="Enter password"
                    required
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors p-1"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-2 text-red-400 text-xs font-mono bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2"
                  >
                    <AlertCircle size={14} className="flex-shrink-0" />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                type="submit"
                disabled={isLoading || !password}
                className="w-full py-3.5 bg-[#d4ff00] text-black font-mono font-bold uppercase tracking-widest text-xs rounded-xl hover:bg-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Verifying...' : 'Enter Admin Panel'}
              </button>

              <p className="text-center text-neutral-600 text-[10px] font-mono uppercase tracking-widest">
                Forgot your password?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('question')}
                  className="text-neutral-400 hover:text-[#d4ff00] transition-colors underline"
                >
                  Use recovery question
                </button>
              </p>
            </motion.form>
          ) : (
            <motion.form
              key="question"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              onSubmit={handleQuestionSubmit}
              className="space-y-4"
            >
              {questions.length === 0 ? (
                <div className="text-center py-8 text-neutral-500 font-mono text-xs">
                  No security questions have been set up yet.
                </div>
              ) : (
                <>
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 font-mono">
                      Security Question
                    </label>
                    <div className="relative">
                      <select
                        value={selectedQuestion}
                        onChange={e => setSelectedQuestion(Number(e.target.value))}
                        className="w-full appearance-none bg-neutral-900 border border-neutral-800 text-white rounded-xl px-4 py-3 pr-10 font-mono text-sm focus:outline-none focus:border-[#d4ff00] transition-colors"
                      >
                        {questions.map(q => (
                          <option key={q.id} value={q.id}>{q.question}</option>
                        ))}
                      </select>
                      <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 font-mono">
                      Your Answer
                    </label>
                    <input
                      type="text"
                      value={answer}
                      onChange={e => setAnswer(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-800 text-white rounded-xl px-4 py-3 font-mono text-sm focus:outline-none focus:border-[#d4ff00] transition-colors placeholder:text-neutral-600"
                      placeholder="Type your answer..."
                      required
                      autoFocus
                    />
                    <p className="text-[10px] text-neutral-600 font-mono">Answers are not case-sensitive</p>
                  </div>

                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-center gap-2 text-red-400 text-xs font-mono bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2"
                      >
                        <AlertCircle size={14} className="flex-shrink-0" />
                        {error}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button
                    type="submit"
                    disabled={isLoading || !answer}
                    className="w-full py-3.5 bg-[#d4ff00] text-black font-mono font-bold uppercase tracking-widest text-xs rounded-xl hover:bg-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Verifying...' : 'Verify & Enter'}
                  </button>

                  <p className="text-center text-neutral-600 text-[10px] font-mono uppercase tracking-widest">
                    Remember your password?{' '}
                    <button
                      type="button"
                      onClick={() => switchMode('password')}
                      className="text-neutral-400 hover:text-[#d4ff00] transition-colors underline"
                    >
                      Use password instead
                    </button>
                  </p>
                </>
              )}
            </motion.form>
          )}
        </AnimatePresence>

        <div className="mt-10 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-neutral-600 hover:text-neutral-400 transition-colors text-[10px] font-mono uppercase tracking-widest"
          >
            <ArrowLeft size={12} /> Back to Store
          </Link>
        </div>
      </div>
    </div>
  );
};
