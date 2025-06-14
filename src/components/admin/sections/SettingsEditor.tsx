
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Save, Upload, Download, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const SettingsEditor = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    resume_url: '',
    dark_mode: false,
    show_education: true,
    show_gallery: true,
    show_blog: true
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('website_content')
        .select('content_key, content_value')
        .eq('section', 'settings');

      if (error) throw error;

      const settingsData = data.reduce((acc, item) => {
        // Parse the JSON string to get the actual value
        acc[item.content_key] = typeof item.content_value === 'string' 
          ? JSON.parse(item.content_value) 
          : item.content_value;
        return acc;
      }, {} as any);

      setSettings(prev => ({
        ...prev,
        ...settingsData
      }));
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast({
        title: "Error",
        description: "Failed to load settings",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const updates = Object.entries(settings).map(([key, value]) => ({
        section: 'settings',
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
        description: "Settings updated successfully!"
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
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
        <h1 className="text-4xl font-bold text-white mb-4">Settings</h1>
        <p className="text-gray-300">Configure your website preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Resume Management */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
          <h2 className="text-2xl font-semibold text-white mb-6">Resume Management</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Resume URL
              </label>
              <input
                type="url"
                value={settings.resume_url}
                onChange={(e) => updateSetting('resume_url', e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors"
                placeholder="https://example.com/resume.pdf"
              />
              <p className="text-gray-400 text-sm mt-2">
                URL to your resume PDF file
              </p>
            </div>

            {settings.resume_url && (
              <div className="flex items-center space-x-4">
                <a
                  href={settings.resume_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-300"
                >
                  <Download size={16} />
                  <span>Preview Resume</span>
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Section Visibility */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
          <h2 className="text-2xl font-semibold text-white mb-6">Section Visibility</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-white font-medium">Education Timeline</label>
                <p className="text-gray-400 text-sm">Show education section on website</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.show_education}
                  onChange={(e) => updateSetting('show_education', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-white font-medium">Media Gallery</label>
                <p className="text-gray-400 text-sm">Show gallery section on website</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.show_gallery}
                  onChange={(e) => updateSetting('show_gallery', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-white font-medium">Blog/Thoughts</label>
                <p className="text-gray-400 text-sm">Show blog section on website</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.show_blog}
                  onChange={(e) => updateSetting('show_blog', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Theme Settings */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
          <h2 className="text-2xl font-semibold text-white mb-6">Theme Settings</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-white font-medium">Dark Mode</label>
                <p className="text-gray-400 text-sm">Enable dark theme (coming soon)</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.dark_mode}
                  onChange={(e) => updateSetting('dark_mode', e.target.checked)}
                  className="sr-only peer"
                  disabled
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500 opacity-50"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
          <h2 className="text-2xl font-semibold text-white mb-6">Quick Stats</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-400">5</div>
              <div className="text-gray-300 text-sm">Active Sections</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">100%</div>
              <div className="text-gray-300 text-sm">Uptime</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <button
          onClick={saveSettings}
          disabled={saving}
          className="flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save size={20} />
          <span>{saving ? 'Saving...' : 'Save All Settings'}</span>
        </button>
      </div>
    </div>
  );
};

export default SettingsEditor;
