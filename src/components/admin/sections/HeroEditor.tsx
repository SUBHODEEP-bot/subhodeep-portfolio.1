
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Save, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const HeroEditor = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [heroData, setHeroData] = useState({
    name: '',
    title: '',
    description: ''
  });

  useEffect(() => {
    fetchHeroData();
  }, []);

  const fetchHeroData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('website_content')
        .select('content_key, content_value')
        .eq('section', 'hero');

      if (error) throw error;

      const heroContent = data.reduce((acc, item) => {
        // Parse the JSON string to get the actual value
        acc[item.content_key] = typeof item.content_value === 'string' 
          ? JSON.parse(item.content_value) 
          : item.content_value;
        return acc;
      }, {} as any);

      setHeroData({
        name: heroContent.name || '',
        title: heroContent.title || '',
        description: heroContent.description || ''
      });
    } catch (error) {
      console.error('Error fetching hero data:', error);
      toast({
        title: "Error",
        description: "Failed to load hero content",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveHeroData = async () => {
    setSaving(true);
    try {
      const updates = Object.entries(heroData).map(([key, value]) => ({
        section: 'hero',
        content_key: key,
        content_value: JSON.stringify(value)
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('website_content')
          .upsert(update, { onConflict: 'section,content_key' });

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "Hero section updated successfully!"
      });
    } catch (error) {
      console.error('Error saving hero data:', error);
      toast({
        title: "Error",
        description: "Failed to save hero content",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="animate-spin text-white" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">Hero Section Editor</h1>
        <p className="text-gray-300">Edit the main banner content of your website</p>
      </div>

      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={heroData.name}
              onChange={(e) => setHeroData({ ...heroData, name: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors"
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Title/Roles
            </label>
            <input
              type="text"
              value={heroData.title}
              onChange={(e) => setHeroData({ ...heroData, title: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors"
              placeholder="e.g., Engineering Student | Innovator | Future Technologist"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={heroData.description}
              onChange={(e) => setHeroData({ ...heroData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors resize-none"
              placeholder="Enter a brief description about yourself"
            />
          </div>

          <button
            onClick={saveHeroData}
            disabled={saving}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={20} />
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeroEditor;
