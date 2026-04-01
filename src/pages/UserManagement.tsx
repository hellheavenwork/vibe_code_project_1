import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  Users, Plus, Pencil, Trash2, Shield, User as UserIcon,
  Search, Check, X, KeyRound, AlertCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User } from '../types';
import { getUsers, updateUser, deleteUser } from '../api/users';
import { register } from '../api/auth';
import { useApp } from '../context/AppContext';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { cn } from '../lib/utils';

// ─── Role badge ───────────────────────────────────────────────────────────────
const RoleBadge = ({ role }: { role?: string }) => {
  const isAdmin = role === 'admin';
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
      isAdmin
        ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
        : 'bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-zinc-400'
    )}>
      {isAdmin ? <Shield className="h-3 w-3" /> : <UserIcon className="h-3 w-3" />}
      {isAdmin ? 'Admin' : 'Member'}
    </span>
  );
};

// ─── Stat card ────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, color }: { label: string; value: number; color: string }) => (
  <div className={cn('rounded-xl border p-5', color)}>
    <p className="text-2xl font-extrabold">{value}</p>
    <p className="mt-0.5 text-sm font-medium opacity-80">{label}</p>
  </div>
);

// ─── Main page ────────────────────────────────────────────────────────────────
export default function UserManagement() {
  const { currentUser, refreshUsers } = useApp();

  const [users,   setUsers]   = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [error,   setError]   = useState<string | null>(null);

  // ── Add user modal ──
  const [showAdd,    setShowAdd]    = useState(false);
  const [addName,    setAddName]    = useState('');
  const [addUser,    setAddUsername] = useState('');
  const [addEmail,   setAddEmail]   = useState('');
  const [addPass,    setAddPass]    = useState('');
  const [addRole,    setAddRole]    = useState<'admin' | 'member'>('member');
  const [addError,   setAddError]   = useState('');
  const [addLoading, setAddLoading] = useState(false);

  // ── Edit user modal ──
  const [editTarget,   setEditTarget]   = useState<User | null>(null);
  const [editName,     setEditName]     = useState('');
  const [editEmail,    setEditEmail]    = useState('');
  const [editRole,     setEditRole]     = useState<'admin' | 'member'>('member');
  const [editPass,     setEditPass]     = useState('');
  const [editError,    setEditError]    = useState('');
  const [editLoading,  setEditLoading]  = useState(false);

  // ── Delete confirm modal ──
  const [deleteTarget,  setDeleteTarget]  = useState<User | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // ── Load users ──
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Helpers ──
  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    (u.username ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (u.email ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const admins  = users.filter(u => u.role === 'admin').length;
  const members = users.filter(u => u.role === 'member').length;

  // ── Add user ──
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError('');
    if (!addName || !addUser || !addPass) { setAddError('Name, username and password are required'); return; }
    if (addPass.length < 6) { setAddError('Password must be at least 6 characters'); return; }
    setAddLoading(true);
    try {
      await register(addUser, addPass, addName, addEmail || undefined);
      // update role if member
      if (addRole === 'member') {
        const all = await getUsers();
        const created = all.find(u => u.username === addUser);
        if (created) await updateUser(created.id, { role: 'member' });
      }
      await loadUsers();
      await refreshUsers();
      setShowAdd(false);
      setAddName(''); setAddUsername(''); setAddEmail(''); setAddPass(''); setAddRole('member');
    } catch (e: any) {
      setAddError(e.message || 'Failed to create user');
    } finally {
      setAddLoading(false);
    }
  };

  // ── Edit user ──
  const openEdit = (u: User) => {
    setEditTarget(u);
    setEditName(u.name);
    setEditEmail(u.email ?? '');
    setEditRole((u.role ?? 'member') as 'admin' | 'member');
    setEditPass('');
    setEditError('');
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;
    setEditError('');
    if (editPass && editPass.length < 6) { setEditError('Password must be at least 6 characters'); return; }
    setEditLoading(true);
    try {
      const body: Partial<User> & { password?: string } = {
        name: editName,
        email: editEmail || undefined,
        role: editRole,
      };
      if (editPass) body.password = editPass;
      const updated = await updateUser(editTarget.id, body);
      setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
      await refreshUsers();
      setEditTarget(null);
    } catch (e: any) {
      setEditError(e.message || 'Failed to update user');
    } finally {
      setEditLoading(false);
    }
  };

  // ── Delete user ──
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteUser(deleteTarget.id);
      setUsers(prev => prev.filter(u => u.id !== deleteTarget.id));
      await refreshUsers();
      setDeleteTarget(null);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  // ── Quick role toggle ──
  const handleRoleToggle = async (u: User) => {
    const newRole = u.role === 'admin' ? 'member' : 'admin';
    try {
      const updated = await updateUser(u.id, { role: newRole });
      setUsers(prev => prev.map(x => x.id === updated.id ? updated : x));
      await refreshUsers();
    } catch (e: any) {
      setError(e.message);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-zinc-100">User Management</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
            Manage team members and their roles
          </p>
        </div>
        <Button onClick={() => setShowAdd(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add User
        </Button>
      </div>

      {/* ── Error banner ── */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
          <AlertCircle className="h-4 w-4" /> {error}
          <button onClick={() => setError(null)} className="ml-auto cursor-pointer"><X className="h-4 w-4" /></button>
        </div>
      )}

      {/* ── Stats ── */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Total Users"    value={users.length} color="border-gray-200 bg-white text-gray-900 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-100" />
        <StatCard label="Admins"         value={admins}       color="border-blue-100 bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:border-blue-900/30 dark:text-blue-300" />
        <StatCard label="Members"        value={members}      color="border-gray-200 bg-gray-50 text-gray-700 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300" />
      </div>

      {/* ── Search ── */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, username or email…"
          className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-700 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        />
      </div>

      {/* ── User table ── */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/80 dark:border-zinc-800 dark:bg-zinc-800/50">
              <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">User</th>
              <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">Username</th>
              <th className="hidden px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-gray-500 md:table-cell dark:text-zinc-400">Email</th>
              <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">Role</th>
              <th className="hidden px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-gray-500 lg:table-cell dark:text-zinc-400">Joined</th>
              <th className="px-5 py-3.5 text-right text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
            <AnimatePresence>
              {filtered.map(u => (
                <motion.tr
                  key={u.id}
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="group transition-colors hover:bg-gray-50/80 dark:hover:bg-zinc-800/50"
                >
                  {/* Avatar + name */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={u.avatarUrl}
                        alt={u.name}
                        className="h-9 w-9 rounded-full border border-gray-200 bg-gray-100 dark:border-zinc-700"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900 dark:text-zinc-100">{u.name}</span>
                          {u.id === currentUser?.id && (
                            <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700 dark:bg-green-900/20 dark:text-green-400">
                              You
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Username */}
                  <td className="px-5 py-4">
                    <span className="font-mono text-xs text-gray-500 dark:text-zinc-400">@{u.username}</span>
                  </td>

                  {/* Email */}
                  <td className="hidden px-5 py-4 md:table-cell">
                    <span className="text-gray-600 dark:text-zinc-400">{u.email ?? '—'}</span>
                  </td>

                  {/* Role — click to toggle */}
                  <td className="px-5 py-4">
                    <button
                      onClick={() => u.id !== currentUser?.id && handleRoleToggle(u)}
                      title={u.id === currentUser?.id ? 'Cannot change own role' : 'Click to toggle role'}
                      className={cn('cursor-pointer transition-transform hover:scale-105', u.id === currentUser?.id && 'cursor-not-allowed opacity-70')}
                    >
                      <RoleBadge role={u.role} />
                    </button>
                  </td>

                  {/* Joined */}
                  <td className="hidden px-5 py-4 lg:table-cell">
                    <span className="text-xs text-gray-400 dark:text-zinc-500">
                      {u.createdAt
                        ? new Date(u.createdAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })
                        : '—'}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEdit(u)}
                        className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600 cursor-pointer dark:hover:bg-blue-900/20 dark:hover:text-blue-400"
                        title="Edit user"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => u.id !== currentUser?.id && setDeleteTarget(u)}
                        disabled={u.id === currentUser?.id}
                        className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 cursor-pointer disabled:cursor-not-allowed disabled:opacity-30 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                        title={u.id === currentUser?.id ? 'Cannot delete yourself' : 'Delete user'}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>

            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="py-12 text-center text-sm text-gray-400 dark:text-zinc-600">
                  No users match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ══════════════════ ADD USER MODAL ══════════════════ */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add New User">
        <form onSubmit={handleAdd} className="space-y-5">
          {addError && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" /> {addError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Input label="Full Name" placeholder="Somsak Dev"
                value={addName} onChange={e => setAddName(e.target.value)} autoFocus />
            </div>
            <Input label="Username" placeholder="somsak"
              value={addUser} onChange={e => setAddUsername(e.target.value.toLowerCase().replace(/\s/g, ''))} />
            <Input label="Email (optional)" type="email" placeholder="somsak@example.com"
              value={addEmail} onChange={e => setAddEmail(e.target.value)} />
            <div className="col-span-2">
              <Input label="Password" type="password" placeholder="Min. 6 characters"
                value={addPass} onChange={e => setAddPass(e.target.value)} />
            </div>
          </div>

          {/* Role */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-zinc-300">Role</label>
            <div className="flex gap-3">
              {(['admin', 'member'] as const).map(r => (
                <button
                  key={r} type="button"
                  onClick={() => setAddRole(r)}
                  className={cn(
                    'flex flex-1 items-center justify-center gap-2 rounded-xl border-2 py-3 text-sm font-semibold transition-all cursor-pointer',
                    addRole === r
                      ? r === 'admin'
                        ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                        : 'border-gray-400 bg-gray-100 text-gray-700 dark:bg-zinc-700 dark:text-zinc-300'
                      : 'border-gray-200 text-gray-400 hover:border-gray-300 dark:border-zinc-700 dark:text-zinc-500'
                  )}
                >
                  {r === 'admin' ? <Shield className="h-4 w-4" /> : <UserIcon className="h-4 w-4" />}
                  {r === 'admin' ? 'Admin' : 'Member'}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 dark:text-zinc-500">
              {addRole === 'admin' ? 'Admin can manage users, projects and tasks.' : 'Member can view and work on assigned tasks.'}
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button type="submit" isLoading={addLoading}>Create User</Button>
          </div>
        </form>
      </Modal>

      {/* ══════════════════ EDIT USER MODAL ══════════════════ */}
      <Modal isOpen={!!editTarget} onClose={() => setEditTarget(null)} title="Edit User">
        {editTarget && (
          <form onSubmit={handleEdit} className="space-y-5">
            {editError && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0" /> {editError}
              </div>
            )}

            {/* Avatar preview */}
            <div className="flex items-center gap-4 rounded-xl bg-gray-50 p-4 dark:bg-zinc-800">
              <img src={editTarget.avatarUrl} alt="" className="h-12 w-12 rounded-full border border-gray-200 dark:border-zinc-600" referrerPolicy="no-referrer" />
              <div>
                <p className="font-semibold text-gray-900 dark:text-zinc-100">{editTarget.name}</p>
                <p className="text-xs text-gray-500 dark:text-zinc-400">@{editTarget.username}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Input label="Full Name" value={editName} onChange={e => setEditName(e.target.value)} autoFocus />
              </div>
              <div className="col-span-2">
                <Input label="Email" type="email" placeholder="optional" value={editEmail} onChange={e => setEditEmail(e.target.value)} />
              </div>
              <div className="col-span-2">
                <Input
                  label="New Password (leave blank to keep current)"
                  type="password"
                  placeholder="Min. 6 characters"
                  value={editPass}
                  onChange={e => setEditPass(e.target.value)}
                />
              </div>
            </div>

            {/* Role selector */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-zinc-300">Role</label>
              <div className="flex gap-3">
                {(['admin', 'member'] as const).map(r => (
                  <button
                    key={r} type="button"
                    onClick={() => setEditRole(r)}
                    disabled={editTarget.id === currentUser?.id}
                    className={cn(
                      'flex flex-1 items-center justify-center gap-2 rounded-xl border-2 py-3 text-sm font-semibold transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-50',
                      editRole === r
                        ? r === 'admin'
                          ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                          : 'border-gray-400 bg-gray-100 text-gray-700 dark:bg-zinc-700 dark:text-zinc-300'
                        : 'border-gray-200 text-gray-400 hover:border-gray-300 dark:border-zinc-700 dark:text-zinc-500'
                    )}
                  >
                    {r === 'admin' ? <Shield className="h-4 w-4" /> : <UserIcon className="h-4 w-4" />}
                    {r === 'admin' ? 'Admin' : 'Member'}
                  </button>
                ))}
              </div>
              {editTarget.id === currentUser?.id && (
                <p className="text-xs text-amber-500 dark:text-amber-400">You cannot change your own role.</p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" type="button" onClick={() => setEditTarget(null)}>Cancel</Button>
              <Button type="submit" isLoading={editLoading}>Save Changes</Button>
            </div>
          </form>
        )}
      </Modal>

      {/* ══════════════════ DELETE CONFIRM MODAL ══════════════════ */}
      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete User">
        {deleteTarget && (
          <div className="space-y-5">
            <div className="flex items-center gap-4 rounded-xl bg-red-50 p-4 dark:bg-red-900/10">
              <img src={deleteTarget.avatarUrl} alt="" className="h-12 w-12 rounded-full border border-red-200 dark:border-red-900/30" referrerPolicy="no-referrer" />
              <div>
                <p className="font-semibold text-gray-900 dark:text-zinc-100">{deleteTarget.name}</p>
                <p className="text-xs text-gray-500 dark:text-zinc-400">@{deleteTarget.username}</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-zinc-400">
              Are you sure you want to delete <strong>{deleteTarget.name}</strong>? This will also remove them from all projects and their tasks will remain unassigned.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
              <Button variant="danger" onClick={handleDelete} isLoading={deleteLoading}>Delete User</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
