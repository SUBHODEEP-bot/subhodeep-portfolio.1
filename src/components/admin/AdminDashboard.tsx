
import React from 'react';
import HeroEditor from './sections/HeroEditor';
import AboutEditor from './sections/AboutEditor';
import SkillsEditor from './sections/SkillsEditor';
import ProjectsEditor from './sections/ProjectsEditor';
import ContactEditor from './sections/ContactEditor';
import DashboardOverview from './sections/DashboardOverview';

interface AdminDashboardProps {
  activeSection: string;
}

const AdminDashboard = ({ activeSection }: AdminDashboardProps) => {
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
      case 'contact':
        return <ContactEditor />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {renderSection()}
    </div>
  );
};

export default AdminDashboard;
