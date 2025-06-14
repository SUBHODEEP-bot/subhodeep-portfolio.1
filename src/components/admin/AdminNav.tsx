
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
  Code
} from 'lucide-react';

interface AdminNavProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

const AdminNav = ({ activeSection, setActiveSection }: AdminNavProps) => {
  const navigate = useNavigate();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'hero', label: 'Hero Section', icon: Home },
    { id: 'about', label: 'About', icon: User },
    { id: 'skills', label: 'Skills', icon: Code },
    { id: 'projects', label: 'Projects', icon: Briefcase },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'gallery', label: 'Gallery', icon: Image },
    { id: 'blog', label: 'Blog', icon: FileText },
    { id: 'contact', label: 'Contact', icon: Mail },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg border-r border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-800">Admin Panel</h1>
        <p className="text-sm text-gray-600 mt-1">Website Management</p>
      </div>

      <div className="py-6">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center px-6 py-3 text-left transition-colors ${
                activeSection === item.id
                  ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className="mr-3 h-5 w-5" />
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="absolute bottom-6 left-6 right-6">
        <button
          onClick={() => navigate('/')}
          className="w-full px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          ← Back to Website
        </button>
      </div>
    </nav>
  );
};

export default AdminNav;
