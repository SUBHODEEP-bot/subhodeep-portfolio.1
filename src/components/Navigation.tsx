
import React, { useState, useEffect } from 'react';
import { Menu, X, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface NavigationProps {
  activeSection: string;
}

const Navigation = ({ activeSection }: NavigationProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [sectionVisibility, setSectionVisibility] = useState({
    show_education: true,
    show_gallery: true,
    show_blog: true
  });
  const { user, isAdmin, signOut } = useAuth();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('website_content')
          .select('content_key, content_value')
          .eq('section', 'settings');

        if (error) throw error;

        const settings = data.reduce((acc, item) => {
          acc[item.content_key] = typeof item.content_value === 'string' 
            ? JSON.parse(item.content_value) 
            : item.content_value;
          return acc;
        }, {} as any);

        setSectionVisibility(prev => ({
          ...prev,
          ...settings
        }));
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };

    fetchSettings();
  }, []);

  const baseNavItems = [
    { id: 'hero', label: 'Home' },
    { id: 'about', label: 'About' },
  ];

  const conditionalNavItems = [
    { id: 'education', label: 'Education', show: sectionVisibility.show_education },
    { id: 'skills', label: 'Skills', show: true },
    { id: 'projects', label: 'Projects', show: true },
    { id: 'gallery', label: 'Gallery', show: sectionVisibility.show_gallery },
    { id: 'blog', label: 'Blog', show: sectionVisibility.show_blog },
    { id: 'contact', label: 'Contact', show: true },
  ];

  const navItems = [
    ...baseNavItems,
    ...conditionalNavItems.filter(item => item.show)
  ];

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/10 backdrop-blur-md border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="text-2xl font-bold text-white">
            Subhodeep Pal
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`text-sm font-medium transition-colors duration-200 ${
                  activeSection === item.id
                    ? 'text-cyan-400'
                    : 'text-white hover:text-cyan-300'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all duration-300"
                  >
                    <Shield size={16} />
                    <span>Admin</span>
                  </Link>
                )}
                <button
                  onClick={signOut}
                  className="px-4 py-2 border border-white/20 text-white rounded-lg hover:bg-white/10 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/auth"
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-300"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile Navigation Toggle */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white hover:text-cyan-300 transition-colors"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isOpen && (
          <div className="md:hidden bg-white/10 backdrop-blur-md border-t border-white/20">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`block w-full text-left px-3 py-2 text-base font-medium transition-colors duration-200 ${
                    activeSection === item.id
                      ? 'text-cyan-400'
                      : 'text-white hover:text-cyan-300'
                  }`}
                >
                  {item.label}
                </button>
              ))}
              
              {/* Mobile Auth */}
              <div className="pt-4 border-t border-white/20">
                {user ? (
                  <>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="block w-full px-3 py-2 text-purple-400 hover:text-purple-300"
                      >
                        Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={signOut}
                      className="block w-full text-left px-3 py-2 text-white hover:text-cyan-300"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <Link
                    to="/auth"
                    className="block w-full px-3 py-2 text-cyan-400 hover:text-cyan-300"
                  >
                    Login
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
