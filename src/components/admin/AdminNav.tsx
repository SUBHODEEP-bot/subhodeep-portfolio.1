
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  Briefcase,
  GraduationCap,
  Image,
  FileText,
  Mail,
  Settings,
  Home,
  Code,
  LogOut,
  Crown,
  Award
} from 'lucide-react';

interface AdminNavProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  onLogout?: () => void;
}

const AdminNav = ({ activeSection, setActiveSection, onLogout }: AdminNavProps) => {
  const navigate = useNavigate();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'from-blue-500 to-blue-600' },
    { id: 'hero', label: 'Hero Section', icon: Home, color: 'from-purple-500 to-purple-600' },
    { id: 'about', label: 'About', icon: User, color: 'from-green-500 to-green-600' },
    { id: 'skills', label: 'Skills', icon: Code, color: 'from-orange-500 to-orange-600' },
    { id: 'projects', label: 'Projects', icon: Briefcase, color: 'from-cyan-500 to-cyan-600' },
    { id: 'awards', label: 'Awards', icon: Award, color: 'from-yellow-500 to-amber-500' },
    { id: 'education', label: 'Education', icon: GraduationCap, color: 'from-indigo-500 to-indigo-600' },
    { id: 'gallery', label: 'Gallery', icon: Image, color: 'from-pink-500 to-pink-600' },
    { id: 'blog', label: 'Blog', icon: FileText, color: 'from-emerald-500 to-emerald-600' },
    { id: 'contact', label: 'Contact', icon: Mail, color: 'from-red-500 to-red-600' },
    { id: 'settings', label: 'Settings', icon: Settings, color: 'from-gray-500 to-gray-600' },
  ];

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <nav className="fixed left-0 top-0 h-full w-72 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 shadow-2xl border-r border-slate-700/50 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-slate-700/50 flex-shrink-0">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Crown className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Admin Panel</h1>
            <p className="text-xs text-slate-400">Subhodeep Pal's Profile</p>
          </div>
        </div>
        <div className="w-full h-px bg-gradient-to-r from-blue-500 to-purple-600"></div>
      </div>

      {/* Menu Items - Scrollable */}
      <div className="flex-1 overflow-y-auto py-4 px-3">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full group relative overflow-hidden rounded-xl transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-500/20 to-purple-600/20 text-white shadow-lg'
                    : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                }`}
              >
                <div className="flex items-center px-4 py-3 relative z-10">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${
                    isActive 
                      ? `bg-gradient-to-r ${item.color}` 
                      : 'bg-slate-700/50 group-hover:bg-slate-600/50'
                  }`}>
                    <Icon size={16} className="text-white" />
                  </div>
                  <span className="font-medium text-sm">{item.label}</span>
                </div>
                {isActive && (
                  <div className="absolute right-0 top-0 h-full w-1 bg-gradient-to-b from-blue-500 to-purple-600 rounded-l-full"></div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer - Fixed at bottom */}
      <div className="flex-shrink-0 p-3 space-y-3 border-t border-slate-700/50">
        <button
          onClick={() => navigate('/')}
          className="w-full px-4 py-3 text-sm text-slate-300 hover:text-white bg-slate-800/50 hover:bg-slate-700/50 rounded-xl transition-all duration-300 border border-slate-700/50 hover:border-slate-600"
        >
          ← Back to Website
        </button>
        
        {onLogout && (
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-sm text-red-400 hover:text-white bg-red-500/10 hover:bg-red-500/20 rounded-xl transition-all duration-300 border border-red-500/30 hover:border-red-500/50"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        )}
      </div>
    </nav>
  );
};

export default AdminNav;
