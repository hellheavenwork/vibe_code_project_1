import { User, Mail, Bell, Shield, Palette, Check } from 'lucide-react';
import { useState, FormEvent, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { cn } from '../lib/utils';
import { useApp } from '../context/AppContext';
import { updateMe } from '../api/users';

interface ToggleItemProps {
  title: string;
  desc: string;
  initialValue?: boolean;
  key?: string | number;
}

const ToggleItem = ({ title, desc, initialValue = true }: ToggleItemProps) => {
  const [enabled, setEnabled] = useState(initialValue);
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <p className="text-sm font-semibold text-gray-900 dark:text-zinc-100">{title}</p>
        <p className="text-xs text-gray-500 dark:text-zinc-400">{desc}</p>
      </div>
      <button 
        onClick={() => setEnabled(!enabled)}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2",
          enabled ? "bg-blue-600" : "bg-gray-200 dark:bg-zinc-800"
        )}
      >
        <span 
          className={cn(
            "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
            enabled ? "translate-x-5" : "translate-x-0"
          )} 
        />
      </button>
    </div>
  );
};

export default function Settings() {
  const { currentUser, setCurrentUser } = useApp();
  const [name, setName] = useState(currentUser?.name ?? '');
  const [email, setEmail] = useState(currentUser?.email ?? '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatarUrl ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const avatars = [
    'https://picsum.photos/seed/avatar1/200',
    'https://picsum.photos/seed/avatar2/200',
    'https://picsum.photos/seed/avatar3/200',
    'https://picsum.photos/seed/avatar4/200',
    'https://picsum.photos/seed/avatar5/200',
    'https://picsum.photos/seed/avatar6/200',
    'https://picsum.photos/seed/avatar7/200',
    'https://picsum.photos/seed/avatar8/200',
    'https://picsum.photos/seed/avatar9/200',
    'https://picsum.photos/seed/avatar10/200',
  ];

  const handleRandomAvatar = () => {
    const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)];
    setAvatarUrl(randomAvatar);
  };

  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark';
    }
    return false;
  });

  const handleThemeToggle = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    window.dispatchEvent(new CustomEvent('theme-updated', { detail: { isDarkMode: newMode } }));
  };

  useEffect(() => {
    const handleThemeUpdate = (e: any) => setIsDarkMode(e.detail.isDarkMode);
    window.addEventListener('theme-updated', handleThemeUpdate as any);
    return () => window.removeEventListener('theme-updated', handleThemeUpdate as any);
  }, []);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updated = await updateMe({ name, email: email || undefined, avatarUrl });
      setCurrentUser(updated);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-zinc-100">Settings</h1>
        <p className="text-gray-500 dark:text-zinc-400">Manage your account settings and preferences.</p>
      </div>

      {showSuccess && (
        <div className="flex items-center gap-2 rounded-lg bg-green-50 p-4 text-green-700 border border-green-100 animate-in fade-in slide-in-from-top-2 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/30">
          <Check className="h-5 w-5" />
          <p className="text-sm font-medium">Changes saved successfully! (Note: Refresh may be needed for some UI parts to update)</p>
        </div>
      )}

      <div className="space-y-6">
        {/* Profile Section */}
        <section className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
          <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4 dark:bg-zinc-800/50 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-gray-500 dark:text-zinc-400" />
              <h2 className="font-bold text-gray-900 dark:text-zinc-100">Profile Information</h2>
            </div>
          </div>
          <form onSubmit={handleSave} className="p-6 space-y-6">
            <div className="flex items-center gap-6">
              <img
                src={avatarUrl}
                alt={name}
                className="h-20 w-20 rounded-2xl border border-gray-200 bg-gray-50 dark:border-zinc-800 dark:bg-zinc-800"
                referrerPolicy="no-referrer"
              />
              <div className="space-y-2">
                <Button variant="outline" size="sm" type="button" onClick={handleRandomAvatar} className="dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300">Random Avatar</Button>
                <p className="text-xs text-gray-500 dark:text-zinc-400">Pick a random avatar from our collection</p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Input 
                label="Full Name" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
              />
              <Input 
                label="Email Address" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit" isLoading={isSaving}>Save Changes</Button>
            </div>
          </form>
        </section>

        {/* Theme Section */}
        <section className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
          <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4 dark:bg-zinc-800/50 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-gray-500 dark:text-zinc-400" />
              <h2 className="font-bold text-gray-900 dark:text-zinc-100">Appearance</h2>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-zinc-100">Dark Mode</p>
                <p className="text-xs text-gray-500 dark:text-zinc-400">Switch between light and dark themes.</p>
              </div>
              <button 
                onClick={handleThemeToggle}
                className={cn(
                  "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2",
                  isDarkMode ? "bg-blue-600" : "bg-gray-200 dark:bg-zinc-800"
                )}
              >
                <span 
                  className={cn(
                    "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                    isDarkMode ? "translate-x-5" : "translate-x-0"
                  )} 
                />
              </button>
            </div>
          </div>
        </section>

        {/* Notifications Section */}
        <section className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
          <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4 dark:bg-zinc-800/50 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-gray-500 dark:text-zinc-400" />
              <h2 className="font-bold text-gray-900 dark:text-zinc-100">Notifications</h2>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {[
              { id: 'email', title: 'Email Notifications', desc: 'Receive daily summary of your tasks via email.' },
              { id: 'push', title: 'Desktop Push', desc: 'Get real-time updates on your desktop.' },
              { id: 'reminders', title: 'Task Reminders', desc: 'Notify me when a task is approaching its deadline.' }
            ].map((item) => (
              <ToggleItem 
                key={item.id} 
                title={item.title} 
                desc={item.desc} 
              />
            ))}
          </div>
        </section>

        {/* Security Section */}
        <section className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
          <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4 dark:bg-zinc-800/50 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-gray-500 dark:text-zinc-400" />
              <h2 className="font-bold text-gray-900 dark:text-zinc-100">Security</h2>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <Button variant="outline">Change Password</Button>
            <Button variant="outline" className="ml-4">Enable Two-Factor Authentication</Button>
          </div>
        </section>
      </div>
    </div>
  );
}
