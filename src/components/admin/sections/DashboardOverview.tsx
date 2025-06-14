
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  Award, 
  Globe,
  TrendingUp,
  Clock,
  Activity,
  Eye,
  Calendar
} from 'lucide-react';

const DashboardOverview = () => {
  const [stats, setStats] = useState({
    projects: 0,
    skills: 0,
    totalViews: 1250,
    uptime: '99.9%',
    lastUpdated: new Date().toLocaleDateString()
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
    { 
      icon: Briefcase, 
      label: 'Projects', 
      value: stats.projects, 
      color: 'from-blue-500 to-blue-600',
      bgColor: 'from-blue-50 to-blue-100',
      change: '+2 this month'
    },
    { 
      icon: Award, 
      label: 'Skills', 
      value: stats.skills, 
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'from-emerald-50 to-emerald-100',
      change: '+5 new skills'
    },
    { 
      icon: Eye, 
      label: 'Profile Views', 
      value: stats.totalViews, 
      color: 'from-purple-500 to-purple-600',
      bgColor: 'from-purple-50 to-purple-100',
      change: '+12% this week'
    },
    { 
      icon: Globe, 
      label: 'Uptime', 
      value: stats.uptime, 
      color: 'from-orange-500 to-orange-600',
      bgColor: 'from-orange-50 to-orange-100',
      change: 'Excellent'
    }
  ];

  const quickActions = [
    {
      title: 'Update Hero Section',
      description: 'Modify your main profile intro',
      icon: LayoutDashboard,
      color: 'from-cyan-500 to-blue-600',
      action: 'hero'
    },
    {
      title: 'Add New Project',
      description: 'Showcase your latest work',
      icon: Briefcase,
      color: 'from-green-500 to-emerald-600',
      action: 'projects'
    },
    {
      title: 'Manage Skills',
      description: 'Update your tech stack',
      icon: Award,
      color: 'from-purple-500 to-pink-600',
      action: 'skills'
    },
    {
      title: 'Upload Media',
      description: 'Add photos to gallery',
      icon: Users,
      color: 'from-indigo-500 to-purple-600',
      action: 'gallery'
    }
  ];

  const recentActivity = [
    { action: 'Updated About section', time: '2 hours ago', icon: Activity },
    { action: 'Added new project "Portfolio Website"', time: '1 day ago', icon: Briefcase },
    { action: 'Modified skills section', time: '3 days ago', icon: Award },
    { action: 'Uploaded gallery images', time: '1 week ago', icon: Users }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-2">Welcome back, Subhodeep! 👋</h1>
          <p className="text-blue-200 text-lg">
            Manage your portfolio and track your progress from here
          </p>
          <div className="flex items-center mt-4 text-sm text-blue-300">
            <Calendar className="mr-2" size={16} />
            Last updated: {stats.lastUpdated}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div
              key={index}
              className={`bg-gradient-to-br ${stat.bgColor} rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-white/50`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}>
                  <IconComponent className="text-white" size={24} />
                </div>
                <TrendingUp className="text-green-500" size={16} />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-1">{stat.value}</h3>
              <p className="text-gray-600 text-sm font-medium mb-2">{stat.label}</p>
              <p className="text-xs text-green-600 font-medium">{stat.change}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
            <Activity className="mr-3 text-blue-500" size={24} />
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickActions.map((action, index) => {
              const IconComponent = action.icon;
              return (
                <button
                  key={index}
                  className={`p-4 bg-gradient-to-r ${action.color} rounded-xl text-white hover:shadow-lg transition-all duration-300 transform hover:scale-105 text-left`}
                >
                  <IconComponent className="mb-3" size={24} />
                  <p className="font-semibold text-sm mb-1">{action.title}</p>
                  <p className="text-xs opacity-90">{action.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
            <Clock className="mr-3 text-purple-500" size={24} />
            Recent Activity
          </h2>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => {
              const IconComponent = activity.icon;
              return (
                <div key={index} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <IconComponent className="text-gray-600" size={16} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{activity.action}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
