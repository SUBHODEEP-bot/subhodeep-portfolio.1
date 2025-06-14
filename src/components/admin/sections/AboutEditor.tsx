
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Save, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AboutEditor = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [aboutData, setAboutData] = useState({
    bio: '',
    quote: ''
  });

  useEffect(() => {
    fetchAboutData();
  }, []);

  const fetchAboutData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('website_content')
        .select('content_key, content_value')
        .eq('section', 'about');

      if (error) throw error;

      const aboutContent = data.reduce((acc, item) => {
        acc[item.content_key] = JSON.parse(item.content_value);
        return acc;
      }, {} as any);

      setAboutData({
        bio: aboutContent.bio || '',
        quote: aboutContent.quote || ''
      });
    } catch (error) {
      console.error('Error fetching about data:', error);
      toast({
        title: "Error",
        description: "Failed to load about content",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveAboutData = async () => {
    setSaving(true);
    try {
      const updates = Object.entries(aboutData).map(([key, value]) => ({
        section: 'about',
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
        description: "About section updated successfully!"
      });
    } catch (error) {
      console.error('Error saving about data:', error);
      toast({
        title: "Error",
        description: "Failed to save about content",
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
        <h1 className="text-4xl font-bold text-white mb-4">About Section Editor</h1>
        <p className="text-gray-300">Edit your personal information and bio</p>
      </div>

      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Biography
            </label>
            <textarea
              value={aboutData.bio}
              onChange={(e) => setAboutData({ ...aboutData, bio: e.target.value })}
              rows={6}
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors resize-none"
              placeholder="Write your personal biography here..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Personal Quote
            </label>
            <textarea
              value={aboutData.quote}
              onChange={(e) => setAboutData({ ...aboutData, quote: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors resize-none"
              placeholder="Enter your favorite quote or personal motto..."
            />
          </div>

          <button
            onClick={saveAboutData}
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

export default AboutEditor;
