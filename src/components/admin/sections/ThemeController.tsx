
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Save, RefreshCw, Eye } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';

const THEME_SETTINGS_KEY = 'theme_settings';

const availableThemes = [
  { id: 'dark', name: 'Dark' },
  { id: 'midnight', name: 'Midnight' },
  { id: 'forest', name: 'Forest' },
  { id: 'crimson', name: 'Crimson' },
  { id: 'ocean', name: 'Ocean' },
  { id: 'graphite', name: 'Graphite' },
  { id: 'rose', name: 'Rose' },
  { id: 'solarized-dark', name: 'Solarized Dark' },
  { id: 'dracula', name: 'Dracula' },
  { id: 'nord-dark', name: 'Nord Dark' },
  { id: 'obsidian', name: 'Obsidian' },
];

const availableIntervals = [
  { value: 10, label: '10 seconds' },
  { value: 30, label: '30 seconds' },
  { value: 60, label: '1 minute' },
  { value: 300, label: '5 minutes' },
  { value: 3600, label: '1 hour' },
];

type ThemeSettings = {
  enabled: boolean;
  interval: number;
  selected_themes: string[];
  active_theme: string;
};

const ThemeController = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState<ThemeSettings>({
    enabled: false,
    interval: 30,
    selected_themes: ['dark', 'midnight'],
    active_theme: 'dark',
  });
  
  const { data: initialSettings, isLoading } = useQuery({
    queryKey: [THEME_SETTINGS_KEY],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('website_content')
        .select('content_value')
        .eq('section', 'theme_settings')
        .eq('content_key', 'config')
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data?.content_value as ThemeSettings | null;
    },
  });

  useEffect(() => {
    if (initialSettings) {
      setSettings({
        enabled: initialSettings.enabled ?? false,
        interval: initialSettings.interval ?? 30,
        selected_themes: initialSettings.selected_themes ?? ['dark', 'midnight'],
        active_theme: initialSettings.active_theme ?? 'dark',
      });
    }
  }, [initialSettings]);

  const mutation = useMutation({
    mutationFn: async (newSettings: ThemeSettings) => {
      console.log('THEME CONTROLLER: Saving settings:', newSettings);
      const { error } = await supabase.from('website_content').upsert(
        {
          section: 'theme_settings',
          content_key: 'config',
          content_value: newSettings,
        },
        { onConflict: 'section,content_key' }
      );
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [THEME_SETTINGS_KEY] });
      toast({ title: 'Success', description: 'Theme settings saved!' });
    },
    onError: (error) => {
      toast({
        title: 'Error saving settings',
        description: (error as Error).message,
        variant: 'destructive',
      });
    },
  });

  const handleSave = () => {
    mutation.mutate(settings);
  };

  const handleThemeSelection = (themeId: string) => {
    const newSelectedThemes = settings.selected_themes.includes(themeId)
      ? settings.selected_themes.filter((id) => id !== themeId)
      : [...settings.selected_themes, themeId];
    setSettings({ ...settings, selected_themes: newSelectedThemes });
  };
  
  const applyPreviewTheme = (theme: string) => {
    const root = document.documentElement;
    availableThemes.forEach(t => {
        if(t.id === 'dark') root.classList.remove('dark');
        else root.classList.remove(`theme-${t.id}`);
    });
    
    if (theme === 'dark') {
        root.classList.add('dark');
    } else {
        root.classList.add(`theme-${theme}`);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><RefreshCw className="animate-spin text-white" size={32} /></div>;
  }
  
  return (
    <div className="space-y-8 text-white">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Theme Controller</h1>
        <p className="text-gray-300">Manage the website's automatic dynamic color themes.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
          <h2 className="text-2xl font-semibold mb-6">Auto-Cycling</h2>
          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium">Enable Auto Theme Changing</label>
              <p className="text-gray-400 text-sm">Automatically cycle through themes.</p>
            </div>
            <Switch
              checked={settings.enabled}
              onCheckedChange={(checked) => setSettings({ ...settings, enabled: checked })}
            />
          </div>
          {settings.enabled && (
            <div className="mt-6 space-y-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">Change Interval</label>
              <select
                value={settings.interval}
                onChange={(e) => setSettings({ ...settings, interval: parseInt(e.target.value) })}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
              >
                {availableIntervals.map(interval => (
                  <option key={interval.value} value={interval.value} className="bg-slate-800">{interval.label}</option>
                ))}
              </select>
            </div>
          )}
          {!settings.enabled && (
             <div className="mt-6 space-y-4">
               <label className="block text-sm font-medium text-gray-300 mb-2">Static Theme</label>
               <p className="text-gray-400 text-sm mb-2">Select a theme to be used permanently.</p>
               <select
                 value={settings.active_theme}
                 onChange={(e) => setSettings({ ...settings, active_theme: e.target.value })}
                 className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
               >
                 {availableThemes.map(theme => (
                   <option key={theme.id} value={theme.id} className="bg-slate-800">{theme.name}</option>
                 ))}
               </select>
             </div>
          )}
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
          <h2 className="text-2xl font-semibold mb-6">Theme Selection</h2>
          <p className="text-gray-400 text-sm mb-4">Select themes for the auto-cycle. This is disabled if auto-cycling is off.</p>
          <div className="space-y-4">
            {availableThemes.map(theme => (
              <div key={theme.id} className="flex items-center justify-between">
                <div className="flex items-center">
                    <input
                      type="checkbox"
                      id={`theme-${theme.id}`}
                      checked={settings.selected_themes.includes(theme.id)}
                      onChange={() => handleThemeSelection(theme.id)}
                      className="h-5 w-5 rounded bg-white/10 border-white/20 text-cyan-500 focus:ring-cyan-500 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={!settings.enabled}
                    />
                    <label htmlFor={`theme-${theme.id}`} className={`ml-3 text-white cursor-pointer ${!settings.enabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      {theme.name}
                    </label>
                </div>
                <Button variant="outline" size="sm" onClick={() => applyPreviewTheme(theme.id)} className="bg-transparent hover:bg-white/10 border-white/20">
                  <Eye className="mr-2 h-4 w-4"/>
                  Preview
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-center mt-8">
        <Button onClick={handleSave} disabled={mutation.isPending} size="lg">
          <Save className="mr-2" />
          {mutation.isPending ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
};

export default ThemeController;
