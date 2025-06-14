
import React, { useState } from 'react';
import AdminNav from './AdminNav';
import DashboardOverview from './sections/DashboardOverview';
import HeroEditor from './sections/HeroEditor';
import AboutEditor from './sections/AboutEditor';
import SkillsEditor from './sections/SkillsEditor';
import ProjectsEditor from './sections/ProjectsEditor';
import EducationEditor from './sections/EducationEditor';
import GalleryEditor from './sections/GalleryEditor';
import BlogEditor from './sections/BlogEditor';
import ContactEditor from './sections/ContactEditor';
import SettingsEditor from './sections/SettingsEditor';

interface AdminDashboardProps {
  onLogout?: () => void;
}

const AdminDashboard = ({ onLogout }: AdminDashboardProps) => {
  const [activeSection, setActiveSection] = useState('dashboard');

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardOverview />;
      case 'hero':
        return <HeroEditor />;
      case 'about':
        return <AboutEditor />;
      case 'skills':
        return <SkillsEditor />;
      case 'projects':
        return <ProjectsEditor />;
      case 'education':
        return <EducationEditor />;
      case 'gallery':
        return <GalleryEditor />;
      case 'blog':
        return <BlogEditor />;
      case 'contact':
        return <ContactEditor />;
      case 'settings':
        return <SettingsEditor />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <AdminNav 
        activeSection={activeSection} 
        setActiveSection={setActiveSection}
        onLogout={onLogout}
      />
      <main className="ml-72 p-6">
        <div className="max-w-7xl mx-auto">
          {renderSection()}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
