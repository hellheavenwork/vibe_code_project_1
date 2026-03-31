import { Search, Bell, Menu, Settings, LogOut, User } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { mockData } from '../../data/mockData';
import { cn } from '../../lib/utils';

interface NavbarProps {
  onMenuClick?: () => void;
}

export const Navbar = ({ onMenuClick }: NavbarProps) => {
  const { currentUser } = mockData;
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const [, forceUpdate] = useState({});
  const navigate = useNavigate();

  const notifications = [
    { id: 1, title: 'Task Deadline', message: 'Design System update is due in 2 hours', time: '2h ago', read: false },
    { id: 2, title: 'New Assignment', message: 'You were assigned to "API Integration"', time: '5h ago', read: true },
    { id: 3, title: 'Project Update', message: 'Marketing Campaign members updated', time: '1d ago', read: true },
  ];

  useEffect(() => {
    const handleProfileUpdate = () => forceUpdate({});
    window.addEventListener('user-profile-updated', handleProfileUpdate);
    
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('user-profile-updated', handleProfileUpdate);
    };
  }, []);

  const handleSignOut = () => {
    setIsProfileOpen(false);
    navigate('/login');
  };

  return (
    <header className="h-16 border-b border-gray-200 bg-white px-4 md:px-8">
      <div className="flex h-full items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={onMenuClick}
            className="md:hidden rounded-md p-2 text-gray-500 hover:bg-gray-100 cursor-pointer"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks, projects..."
              className="h-9 w-64 rounded-full border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 md:gap-6">
          <div className="relative" ref={notificationsRef}>
            <button 
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="relative rounded-full p-2 text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <Bell className="h-5 w-5" />
              {notifications.some(n => !n.read) && (
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
              )}
            </button>

            {isNotificationsOpen && (
              <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-xl border border-gray-200 bg-white p-2 shadow-xl">
                <div className="px-3 py-2 border-b border-gray-100 mb-1 flex justify-between items-center">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Notifications</p>
                  <button className="text-[10px] text-blue-600 font-bold hover:underline cursor-pointer">Mark all as read</button>
                </div>
                <div className="max-h-96 overflow-y-auto space-y-1">
                  {notifications.map((n) => (
                    <div 
                      key={n.id} 
                      className={cn(
                        "p-3 rounded-lg transition-colors cursor-pointer",
                        n.read ? "hover:bg-gray-50" : "bg-blue-50/50 hover:bg-blue-50"
                      )}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <p className="text-sm font-bold text-gray-900">{n.title}</p>
                        <span className="text-[10px] text-gray-400">{n.time}</span>
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-2">{n.message}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-1 pt-2 border-t border-gray-100 text-center">
                  <button className="text-xs text-gray-500 hover:text-blue-600 font-medium cursor-pointer">View all notifications</button>
                </div>
              </div>
            )}
          </div>
          
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-3 hover:bg-gray-50 p-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <div className="hidden text-right md:block">
                <p className="text-sm font-semibold text-gray-900">{currentUser.name}</p>
                <p className="text-xs text-gray-500">Member</p>
              </div>
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="h-9 w-9 rounded-full border border-gray-200 bg-gray-50"
                referrerPolicy="no-referrer"
              />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-xl border border-gray-200 bg-white p-2 shadow-xl">
                <div className="px-3 py-2 border-b border-gray-100 mb-1">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Account</p>
                </div>
                <Link 
                  to="/settings" 
                  className="flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-blue-600 rounded-lg transition-colors"
                  onClick={() => setIsProfileOpen(false)}
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </Link>
                <div className="my-1 border-t border-gray-100" />
                <button 
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
