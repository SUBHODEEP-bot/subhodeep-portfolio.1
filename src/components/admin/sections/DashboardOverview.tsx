
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { LayoutDashboard, Users, Briefcase, Award, Globe } from 'lucide-react';

const DashboardOverview = () => {
  const [stats, setStats] = useState({
    projects: 0,
    skills: 0,
    totalViews: 1250, // Static for demo
    uptime: '99.9%' // Static for demo
  });

  useEffect(() => {
    const fetchStats = async () => {
      const [projectsResult, skillsResult] = await Promise.all([
        supabase.from('projects').select('id', { count: 'exact' }),
        supabase.from('skills').select('id', { count: 'exact' })
      ]);

      setStats(prev => ({
        ...prev,
        projects: projectsResult.count || 0,
        skills: skillsResult.count || 0
      }));
    };

    fetchStats();
  }, []);

  const statCards = [
    { icon: Briefcase, label: 'Projects', value: stats.projects, color: 'from-blue-500 to-blue-600' },
    { icon: Award, label: 'Skills', value: stats.skills, color: 'from-green-500 to-green-600' },
    { icon: Users, label: 'Total Views', value: stats.totalViews, color: 'from-purple-500 to-purple-600' },
    { icon: Globe, label: 'Uptime', value: stats.uptime, color: 'from-orange-500 to-orange-600' }
  ];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">Welcome to Admin Dashboard</h1>
        <p className="text-gray-300 text-lg">
          Manage your portfolio website content from here
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div
              key={index}
              className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20"
            >
              <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center mb-4`}>
                <IconComponent className="text-white" size={24} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
              <p className="text-gray-300">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
        <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg text-white hover:from-cyan-600 hover:to-blue-700 transition-all duration-300">
            <LayoutDashboard className="mx-auto mb-2" size={24} />
            <p className="font-medium">Update Hero Section</p>
          </button>
          <button className="p-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg text-white hover:from-green-600 hover:to-emerald-700 transition-all duration-300">
            <Briefcase className="mx-auto mb-2" size={24} />
            <p className="font-medium">Add New Project</p>
          </button>
          <button className="p-4 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg text-white hover:from-purple-600 hover:to-pink-700 transition-all duration-300">
            <Award className="mx-auto mb-2" size={24} />
            <p className="font-medium">Manage Skills</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
