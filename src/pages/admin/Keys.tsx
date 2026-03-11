import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Edit2, Key, HelpCircle, X, Eye, EyeOff, AlertTriangle, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

interface AdminKey {
  id: number;
  label: string;
  created_at: string;
}

interface SecurityQuestion {
  id: number;
  question: string;
  created_at: string;
}

type KeyModalMode = 'add' | 'edit';

interface KeyModalState {
  open: boolean;
  mode: KeyModalMode;
  id?: number;
  label: string;
  password: string;
  confirmPassword: string;
  showPassword: boolean;
}

interface QuestionModalState {
  open: boolean;
  mode: KeyModalMode;
  id?: number;
  question: string;
  answer: string;
}

const initialKeyModal: KeyModalState = {
  open: false, mode: 'add', label: '', password: '', confirmPassword: '', showPassword: false,
};

const initialQModal: QuestionModalState = {
  open: false, mode: 'add', question: '', answer: '',
};

export const AdminKeys = () => {
  const [keys, setKeys] = useState<AdminKey[]>([]);
  const [questions, setQuestions] = useState<SecurityQuestion[]>([]);
  const [loadingKeys, setLoadingKeys] = useState(true);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [keyModal, setKeyModal] = useState<KeyModalState>(initialKeyModal);
  const [qModal, setQModal] = useState<QuestionModalState>(initialQModal);
  const [deletingKeyId, setDeletingKeyId] = useState<number | null>(null);
  const [deletingQId, setDeletingQId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchKeys = () => {
    setLoadingKeys(true);
    fetch('/api/admin/keys')
      .then(r => r.json())
      .then(data => { setKeys(Array.isArray(data) ? data : []); setLoadingKeys(false); })
      .catch(() => setLoadingKeys(false));
  };

  const fetchQuestions = () => {
    setLoadingQuestions(true);
    fetch('/api/admin/security-questions')
      .then(r => r.json())
      .then(data => { setQuestions(Array.isArray(data) ? data : []); setLoadingQuestions(false); })
      .catch(() => setLoadingQuestions(false));
  };

  useEffect(() => { fetchKeys(); fetchQuestions(); }, []);

  // ── Key Handlers ────────────────────────────────────────────────────────

  const openAddKey = () => setKeyModal({ ...initialKeyModal, open: true, mode: 'add' });
  const openEditKey = (k: AdminKey) => setKeyModal({ ...initialKeyModal, open: true, mode: 'edit', id: k.id, label: k.label });
  const closeKeyModal = () => setKeyModal(initialKeyModal);

  const handleKeySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (keyModal.mode === 'add' && !keyModal.password) { toast.error('Password is required'); return; }
    if (keyModal.mode === 'add' && keyModal.password !== keyModal.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (keyModal.password && keyModal.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setSubmitting(true);
    try {
      const body: Record<string, string> = { label: keyModal.label };
      if (keyModal.password) body.password = keyModal.password;
      const url = keyModal.mode === 'add' ? '/api/admin/keys' : `/api/admin/keys/${keyModal.id}`;
      const method = keyModal.mode === 'add' ? 'POST' : 'PUT';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json();
      if (res.ok) {
        toast.success(keyModal.mode === 'add' ? 'Password added successfully' : 'Password updated successfully');
        closeKeyModal();
        fetchKeys();
      } else {
        toast.error(data.error || 'Failed to save password');
      }
    } catch { toast.error('Connection error'); } finally { setSubmitting(false); }
  };

  const handleDeleteKey = async (id: number) => {
    if (keys.length <= 1) { toast.error('Cannot delete the last password. At least one must always exist.'); return; }
    setDeletingKeyId(id);
    try {
      const res = await fetch(`/api/admin/keys/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) { toast.success('Password deleted'); fetchKeys(); }
      else toast.error(data.error || 'Failed to delete');
    } catch { toast.error('Connection error'); } finally { setDeletingKeyId(null); }
  };

  // ── Question Handlers ────────────────────────────────────────────────────

  const openAddQ = () => setQModal({ ...initialQModal, open: true, mode: 'add' });
  const openEditQ = (q: SecurityQuestion) => setQModal({ ...initialQModal, open: true, mode: 'edit', id: q.id, question: q.question });
  const closeQModal = () => setQModal(initialQModal);

  const handleQSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (qModal.mode === 'add' && !qModal.answer.trim()) { toast.error('Answer is required'); return; }
    setSubmitting(true);
    try {
      const body: Record<string, string> = { question: qModal.question };
      if (qModal.answer) body.answer = qModal.answer;
      const url = qModal.mode === 'add' ? '/api/admin/security-questions' : `/api/admin/security-questions/${qModal.id}`;
      const method = qModal.mode === 'add' ? 'POST' : 'PUT';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json();
      if (res.ok) {
        toast.success(qModal.mode === 'add' ? 'Question added' : 'Question updated');
        closeQModal();
        fetchQuestions();
      } else {
        toast.error(data.error || 'Failed to save question');
      }
    } catch { toast.error('Connection error'); } finally { setSubmitting(false); }
  };

  const handleDeleteQ = async (id: number) => {
    setDeletingQId(id);
    try {
      const res = await fetch(`/api/admin/security-questions/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) { toast.success('Question deleted'); fetchQuestions(); }
      else toast.error(data.error || 'Failed to delete');
    } catch { toast.error('Connection error'); } finally { setDeletingQId(null); }
  };

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl md:text-4xl font-display font-bold uppercase italic">Keys</h1>
        <p className="text-neutral-500 text-sm mt-1">Manage admin passwords and security recovery questions.</p>
      </div>

      {/* Security Notice */}
      <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4">
        <AlertTriangle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-amber-800">Security Notice</p>
          <p className="text-xs text-amber-700 mt-1">Passwords and answers are stored with one-way encryption. There is no way to view existing values — only replace them. At least one password must always remain active.</p>
        </div>
      </div>

      {/* ── Passwords Section ─────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-black/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
              <Key size={18} className="text-[#d4ff00]" />
            </div>
            <div>
              <h2 className="font-display font-bold uppercase text-lg">Passwords</h2>
              <p className="text-xs text-neutral-500">{keys.length} active password{keys.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <button
            onClick={openAddKey}
            className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-neutral-800 transition-colors"
          >
            <Plus size={16} /> Add Password
          </button>
        </div>

        {loadingKeys ? (
          <div className="p-8 text-center text-neutral-400 text-sm">Loading...</div>
        ) : keys.length === 0 ? (
          <div className="p-8 text-center text-neutral-400 text-sm">No passwords found.</div>
        ) : (
          <div className="divide-y divide-black/5">
            {keys.map(k => (
              <div key={k.id} className="flex items-center justify-between px-6 py-4 hover:bg-neutral-50 transition-colors">
                <div>
                  <p className="font-bold text-sm">{k.label}</p>
                  <p className="text-[10px] text-neutral-400 font-mono mt-0.5">
                    Created {format(new Date(k.created_at), 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditKey(k)}
                    className="p-2 rounded-lg text-neutral-400 hover:text-black hover:bg-neutral-100 transition-colors"
                    title="Edit"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteKey(k.id)}
                    disabled={deletingKeyId === k.id || keys.length <= 1}
                    className="p-2 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    title={keys.length <= 1 ? 'Cannot delete the last password' : 'Delete'}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Security Questions Section ────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-black/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
              <HelpCircle size={18} className="text-[#d4ff00]" />
            </div>
            <div>
              <h2 className="font-display font-bold uppercase text-lg">Security Questions</h2>
              <p className="text-xs text-neutral-500">{questions.length} question{questions.length !== 1 ? 's' : ''} configured</p>
            </div>
          </div>
          <button
            onClick={openAddQ}
            className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-neutral-800 transition-colors"
          >
            <Plus size={16} /> Add Question
          </button>
        </div>

        {loadingQuestions ? (
          <div className="p-8 text-center text-neutral-400 text-sm">Loading...</div>
        ) : questions.length === 0 ? (
          <div className="p-8 text-center text-neutral-400 text-sm">No security questions configured.</div>
        ) : (
          <div className="divide-y divide-black/5">
            {questions.map(q => (
              <div key={q.id} className="flex items-start justify-between px-6 py-4 hover:bg-neutral-50 transition-colors gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm leading-snug">{q.question}</p>
                  <p className="text-[10px] text-neutral-400 font-mono mt-1">
                    Created {format(new Date(q.created_at), 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => openEditQ(q)}
                    className="p-2 rounded-lg text-neutral-400 hover:text-black hover:bg-neutral-100 transition-colors"
                    title="Edit"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteQ(q.id)}
                    disabled={deletingQId === q.id}
                    className="p-2 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-30"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Password Modal ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {keyModal.open && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={closeKeyModal}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 flex items-center justify-center z-50 px-4 pointer-events-none"
            >
              <form
                onSubmit={handleKeySubmit}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 pointer-events-auto"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-display font-bold uppercase text-xl">
                    {keyModal.mode === 'add' ? 'Add Password' : 'Edit Password'}
                  </h3>
                  <button type="button" onClick={closeKeyModal} className="p-2 text-neutral-400 hover:text-black rounded-lg hover:bg-neutral-100 transition-colors">
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1.5">Label / Name</label>
                    <input
                      type="text"
                      value={keyModal.label}
                      onChange={e => setKeyModal(m => ({ ...m, label: e.target.value }))}
                      className="input-field"
                      placeholder="e.g. Main Password, Backup Key"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1.5">
                      {keyModal.mode === 'edit' ? 'New Password (leave blank to keep current)' : 'Password'}
                    </label>
                    <div className="relative">
                      <input
                        type={keyModal.showPassword ? 'text' : 'password'}
                        value={keyModal.password}
                        onChange={e => setKeyModal(m => ({ ...m, password: e.target.value }))}
                        className="input-field pr-12"
                        placeholder={keyModal.mode === 'edit' ? 'Leave blank to keep unchanged' : 'Enter password (min 6 chars)'}
                        required={keyModal.mode === 'add'}
                        minLength={keyModal.password ? 6 : undefined}
                      />
                      <button type="button" onClick={() => setKeyModal(m => ({ ...m, showPassword: !m.showPassword }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black p-1">
                        {keyModal.showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {(keyModal.mode === 'add' || keyModal.password) && (
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1.5">Confirm Password</label>
                      <div className="relative">
                        <input
                          type={keyModal.showPassword ? 'text' : 'password'}
                          value={keyModal.confirmPassword}
                          onChange={e => setKeyModal(m => ({ ...m, confirmPassword: e.target.value }))}
                          className={`input-field pr-10 ${keyModal.confirmPassword && keyModal.password !== keyModal.confirmPassword ? 'border-red-400' : keyModal.confirmPassword && keyModal.password === keyModal.confirmPassword ? 'border-green-400' : ''}`}
                          placeholder="Repeat password"
                          required={keyModal.mode === 'add' || !!keyModal.password}
                        />
                        {keyModal.confirmPassword && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            {keyModal.password === keyModal.confirmPassword
                              ? <Check size={16} className="text-green-500" />
                              : <X size={16} className="text-red-400" />}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 mt-6">
                  <button type="button" onClick={closeKeyModal} className="flex-1 py-2.5 border border-black/10 rounded-xl text-sm font-bold uppercase tracking-widest hover:bg-neutral-50 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting} className="flex-1 py-2.5 bg-black text-white rounded-xl text-sm font-bold uppercase tracking-widest hover:bg-neutral-800 transition-colors disabled:opacity-50">
                    {submitting ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Security Question Modal ────────────────────────────────────── */}
      <AnimatePresence>
        {qModal.open && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={closeQModal}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 flex items-center justify-center z-50 px-4 pointer-events-none"
            >
              <form
                onSubmit={handleQSubmit}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 pointer-events-auto"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-display font-bold uppercase text-xl">
                    {qModal.mode === 'add' ? 'Add Security Question' : 'Edit Question'}
                  </h3>
                  <button type="button" onClick={closeQModal} className="p-2 text-neutral-400 hover:text-black rounded-lg hover:bg-neutral-100 transition-colors">
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1.5">Question</label>
                    <textarea
                      value={qModal.question}
                      onChange={e => setQModal(m => ({ ...m, question: e.target.value }))}
                      className="input-field resize-none"
                      rows={2}
                      placeholder="e.g. What is the store's secret code?"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1.5">
                      {qModal.mode === 'edit' ? 'New Answer (leave blank to keep current)' : 'Answer'}
                    </label>
                    <input
                      type="text"
                      value={qModal.answer}
                      onChange={e => setQModal(m => ({ ...m, answer: e.target.value }))}
                      className="input-field"
                      placeholder={qModal.mode === 'edit' ? 'Leave blank to keep unchanged' : 'Type your answer...'}
                      required={qModal.mode === 'add'}
                    />
                    <p className="text-[10px] text-neutral-400 mt-1 font-mono">Answers are compared case-insensitively</p>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button type="button" onClick={closeQModal} className="flex-1 py-2.5 border border-black/10 rounded-xl text-sm font-bold uppercase tracking-widest hover:bg-neutral-50 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting} className="flex-1 py-2.5 bg-black text-white rounded-xl text-sm font-bold uppercase tracking-widest hover:bg-neutral-800 transition-colors disabled:opacity-50">
                    {submitting ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
