
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Save, RefreshCw, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Theme, ThemeSettings } from '@/providers/ThemeProvider';
import { themeGradients } from '@/providers/ThemeProvider';
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";

const defaultThemeSettings: ThemeSettings = {
  static_theme: 'dark',
  auto_cycle_enabled: false,
  cycle_interval: 30000,
  cycle_themes: ['dark', 'blue'],
};

const SettingsEditor = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    resume_url: '',
    dark_mode: false,
    show_education: true,
    show_gallery: true,
    show_blog: true,
    theme_settings: defaultThemeSettings,
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
        let value = item.content_value;
        
        // Handle theme_settings specially to ensure proper parsing
        if (item.content_key === 'theme_settings') {
          try {
            if (typeof value === 'string') {
              if (value.trim() === '') {
                value = defaultThemeSettings;
              } else {
                value = JSON.parse(value);
              }
            } else if (typeof value === 'object' && value !== null) {
              // Already an object, use as is
            } else {
              value = defaultThemeSettings;
            }
            
            // Validate the theme settings structure
            if (!value.static_theme || !Array.isArray(value.cycle_themes)) {
              value = defaultThemeSettings;
            }
          } catch (parseError) {
            console.error('Error parsing theme_settings:', parseError);
            value = defaultThemeSettings;
          }
        } else {
          // Handle other settings
          try {
            acc[item.content_key] = typeof value === 'string' ? JSON.parse(value) : value;
          } catch {
            acc[item.content_key] = value;
          }
        }
        
        acc[item.content_key] = value;
        return acc;
      }, {} as any);

      setSettings(prev => ({
        ...prev,
        ...settingsData,
        theme_settings: settingsData.theme_settings || defaultThemeSettings
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
      console.log('Saving settings:', settings);
      
      const updates = Object.entries(settings).map(([key, value]) => {
        let contentValue;
        
        if (key === 'theme_settings') {
          // Ensure theme_settings is properly stringified
          contentValue = JSON.stringify(value);
          console.log('Saving theme_settings as:', contentValue);
        } else {
          contentValue = typeof value === 'string' ? value : JSON.stringify(value);
        }
        
        return {
          section: 'settings',
          content_key: key,
          content_value: contentValue
        };
      });

      for (const update of updates) {
        console.log('Upserting:', update);
        const { error } = await supabase
          .from('website_content')
          .upsert(update, { onConflict: 'section,content_key' });

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "Settings updated successfully! Theme changes will apply immediately."
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

  const updateThemeSetting = (key: keyof ThemeSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      theme_settings: {
        ...prev.theme_settings,
        [key]: value
      }
    }));
  };

  const handleThemeCycleChange = (theme: Theme) => {
    const currentThemes = settings.theme_settings.cycle_themes;
    let newThemes;
    if (currentThemes.includes(theme)) {
      newThemes = currentThemes.filter(t => t !== theme);
    } else {
      newThemes = [...currentThemes, theme];
    }
    updateThemeSetting('cycle_themes', newThemes);
  };

  const getVisibleSectionsCount = () => {
    let count = 2; // Hero and About are always visible
    if (settings.show_education) count++;
    if (settings.show_gallery) count++;
    if (settings.show_blog) count++;
    count += 3; // Skills, Projects, Contact are always visible
    return count;
  };

  const availableThemes: Theme[] = ['dark', 'blue', 'purple', 'green', 'sunset', 'onyx', 'charcoal', 'midnight', 'graphite', 'ebony', 'noir', 'obsidian', 'sable', 'jet', 'gunmetal'];
  const availableIntervals = [
    { label: '10 seconds', value: 10000 },
    { label: '30 seconds', value: 30000 },
    { label: '1 minute', value: 60000 },
    { label: '5 minutes', value: 300000 },
  ];

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

      {/* Theme Customization */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
        <h2 className="text-2xl font-semibold text-white mb-6">Theme Customization</h2>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-white font-medium">Auto Theme Background Switching</label>
              <p className="text-gray-400 text-sm">Automatically cycle through selected themes.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.theme_settings.auto_cycle_enabled}
                onChange={(e) => updateThemeSetting('auto_cycle_enabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
            </label>
          </div>

          {!settings.theme_settings.auto_cycle_enabled ? (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Static Theme</label>
              <Select
                value={settings.theme_settings.static_theme}
                onValueChange={(value) => updateThemeSetting('static_theme', value as Theme)}
              >
                <SelectTrigger className="w-full capitalize px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors h-auto">
                    <div className="flex items-center gap-3">
                        <div 
                            className="w-6 h-6 rounded-md border border-white/20" 
                            style={{ background: themeGradients[settings.theme_settings.static_theme] }}
                        ></div>
                        <span>{settings.theme_settings.static_theme}</span>
                    </div>
                </SelectTrigger>
                <SelectContent className="capitalize bg-slate-900 border-slate-700 text-white">
                    {availableThemes.map(theme => (
                    <SelectItem key={theme} value={theme} className="hover:bg-slate-800 focus:bg-slate-700 cursor-pointer">
                        <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-md border border-white/20" style={{ background: themeGradients[theme] }}></div>
                            <span>{theme}</span>
                        </div>
                    </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Theme Cycle Interval</label>
                <select
                  value={settings.theme_settings.cycle_interval}
                  onChange={(e) => updateThemeSetting('cycle_interval', Number(e.target.value))}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors"
                >
                  {availableIntervals.map(interval => <option key={interval.value} value={interval.value}>{interval.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Themes to Cycle</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                  {availableThemes.map(theme => (
                    <label key={theme} className="flex items-center space-x-3 cursor-pointer capitalize bg-white/5 border border-white/20 rounded-lg p-3 text-white hover:bg-white/10 transition-colors">
                      <input
                        type="checkbox"
                        checked={settings.theme_settings.cycle_themes.includes(theme)}
                        onChange={() => handleThemeCycleChange(theme)}
                        className="form-checkbox h-5 w-5 rounded text-cyan-500 bg-gray-700 border-gray-600 focus:ring-cyan-600 flex-shrink-0"
                      />
                      <div className="w-6 h-6 rounded-md border border-white/20 flex-shrink-0" style={{ background: themeGradients[theme] }}></div>
                      <span className="truncate">{theme}</span>
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
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

        {/* Website Stats */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
          <h2 className="text-2xl font-semibold text-white mb-6">Website Stats</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-400">{getVisibleSectionsCount()}</div>
              <div className="text-gray-300 text-sm">Active Sections</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">Online</div>
              <div className="text-gray-300 text-sm">Status</div>
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
