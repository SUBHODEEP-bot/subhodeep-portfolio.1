
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

type Theme = 'dark' | 'blue' | 'purple' | 'green' | 'sunset';

export interface ThemeSettings {
  static_theme: Theme;
  auto_cycle_enabled: boolean;
  cycle_interval: number;
  cycle_themes: Theme[];
}

interface ThemeContextType {
  theme: Theme;
  settings: ThemeSettings | null;
}

const defaultSettings: ThemeSettings = {
    static_theme: 'dark',
    auto_cycle_enabled: false,
    cycle_interval: 30000,
    cycle_themes: ['dark', 'blue'],
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const themes: Record<Theme, string> = {
  dark: 'theme-dark',
  blue: 'theme-blue',
  purple: 'theme-purple',
  green: 'theme-green',
  sunset: 'theme-sunset',
};

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [settings, setSettings] = useState<ThemeSettings | null>(null);
  const [currentTheme, setCurrentTheme] = useState<Theme>('dark');

  useEffect(() => {
    const fetchThemeSettings = async () => {
      const { data, error } = await supabase
        .from('website_content')
        .select('content_value')
        .eq('section', 'settings')
        .eq('content_key', 'theme_settings')
        .single();

      if (error || !data) {
        console.warn('Theme settings not found, using default. Error:', error?.message);
        setSettings(defaultSettings);
      } else {
        setSettings(data.content_value as ThemeSettings);
      }
    };
    fetchThemeSettings();

    const channel = supabase
      .channel('theme-settings-channel')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'website_content',
          filter: 'content_key=eq.theme_settings',
        },
        (payload) => {
          if (payload.new && 'content_value' in payload.new) {
            setSettings(payload.new.content_value as ThemeSettings);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    let themeCycleInterval: NodeJS.Timeout;

    if (settings) {
      if (settings.auto_cycle_enabled && settings.cycle_themes.length > 0) {
        let currentIndex = settings.cycle_themes.indexOf(currentTheme);
        if (currentIndex === -1) currentIndex = 0;
        
        setCurrentTheme(settings.cycle_themes[currentIndex]);

        themeCycleInterval = setInterval(() => {
          currentIndex = (currentIndex + 1) % settings.cycle_themes.length;
          setCurrentTheme(settings.cycle_themes[currentIndex]);
        }, settings.cycle_interval);
      } else {
        setCurrentTheme(settings.static_theme);
      }
    }

    return () => {
      if (themeCycleInterval) {
        clearInterval(themeCycleInterval);
      }
    };
  }, [settings]);

  useEffect(() => {
    document.body.className = '';
    document.body.classList.add(themes[currentTheme] || themes.dark);
  }, [currentTheme]);

  return (
    <ThemeContext.Provider value={{ theme: currentTheme, settings }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
