
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  LayoutDashboard, 
  User, 
  Briefcase, 
  Award, 
  Mail, 
  Home,
  LogOut
} from 'lucide-react';

interface AdminNavProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

const AdminNav = ({ activeSection, setActiveSection }: AdminNavProps) => {
  const { signOut } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'hero', label: 'Hero Section', icon: Home },
    { id: 'about', label: 'About Me', icon: User },
    { id: 'skills', label: 'Skills', icon: Award },
    { id: 'projects', label: 'Projects', icon: Briefcase },
    { id: 'contact', label: 'Contact', icon: Mail },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/10 backdrop-blur-md border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="text-2xl font-bold text-white">
            Admin Panel
          </div>

          <div className="hidden md:flex space-x-4">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    activeSection === item.id
                      ? 'bg-cyan-500 text-white'
                      : 'text-white hover:text-cyan-300'
                  }`}
                >
                  <IconComponent size={16} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <button
            onClick={signOut}
            className="flex items-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default AdminNav;
