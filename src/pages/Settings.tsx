import { User, Mail, Bell, Shield, Palette, Check } from 'lucide-react';
import { useState, FormEvent } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { mockData } from '../data/mockData';

export default function Settings() {
  const { currentUser } = mockData;
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatarUrl);
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

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      // Update mock data for real
      mockData.currentUser.name = name;
      mockData.currentUser.email = email;
      mockData.currentUser.avatarUrl = avatarUrl;
      
      // Also update in the users list
      const userInList = mockData.users.find(u => u.id === currentUser.id);
      if (userInList) {
        userInList.name = name;
        userInList.email = email;
        userInList.avatarUrl = avatarUrl;
      }

      // Notify other components (like Navbar) to re-render
      window.dispatchEvent(new CustomEvent('user-profile-updated'));

      setIsSaving(false);
      setShowSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => setShowSuccess(false), 3000);
    }, 800);
  };

  return (
    <div className="max-w-4xl space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500">Manage your account settings and preferences.</p>
      </div>

      {showSuccess && (
        <div className="flex items-center gap-2 rounded-lg bg-green-50 p-4 text-green-700 border border-green-100 animate-in fade-in slide-in-from-top-2">
          <Check className="h-5 w-5" />
          <p className="text-sm font-medium">Changes saved successfully! (Note: Refresh may be needed for some UI parts to update)</p>
        </div>
      )}

      <div className="space-y-6">
        {/* Profile Section */}
        <section className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
          <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-gray-500" />
              <h2 className="font-bold text-gray-900">Profile Information</h2>
            </div>
          </div>
          <form onSubmit={handleSave} className="p-6 space-y-6">
            <div className="flex items-center gap-6">
              <img
                src={avatarUrl}
                alt={name}
                className="h-20 w-20 rounded-2xl border border-gray-200 bg-gray-50"
                referrerPolicy="no-referrer"
              />
              <div className="space-y-2">
                <Button variant="outline" size="sm" type="button" onClick={handleRandomAvatar}>Random Avatar</Button>
                <p className="text-xs text-gray-500">Pick a random avatar from our collection</p>
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

        {/* Notifications Section */}
        <section className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
          <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-gray-500" />
              <h2 className="font-bold text-gray-900">Notifications</h2>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {[
              { title: 'Email Notifications', desc: 'Receive daily summary of your tasks via email.' },
              { title: 'Desktop Push', desc: 'Get real-time updates on your desktop.' },
              { title: 'Task Reminders', desc: 'Notify me when a task is approaching its deadline.' }
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
                <div className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-gray-200 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2">
                  <span className="translate-x-0 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Security Section */}
        <section className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
          <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-gray-500" />
              <h2 className="font-bold text-gray-900">Security</h2>
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
