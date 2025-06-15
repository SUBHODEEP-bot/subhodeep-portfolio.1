import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type Theme = 'dark' | 'blue' | 'purple' | 'green' | 'sunset' | 'onyx' | 'charcoal' | 'midnight' | 'graphite' | 'ebony' | 'noir' | 'obsidian' | 'sable' | 'jet' | 'gunmetal';

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

const allThemes: Theme[] = ['dark', 'blue', 'purple', 'green', 'sunset', 'onyx', 'charcoal', 'midnight', 'graphite', 'ebony', 'noir', 'obsidian', 'sable', 'jet', 'gunmetal'];

function isThemeSettings(settings: any): settings is ThemeSettings {
  return (
    settings &&
    typeof settings.static_theme === 'string' &&
    allThemes.includes(settings.static_theme as Theme) &&
    typeof settings.auto_cycle_enabled === 'boolean' &&
    typeof settings.cycle_interval === 'number' &&
    Array.isArray(settings.cycle_themes) &&
    settings.cycle_themes.every((t: any) => typeof t === 'string' && allThemes.includes(t as Theme))
  );
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const themes: Record<Theme, string> = {
  dark: 'theme-dark',
  blue: 'theme-blue',
  purple: 'theme-purple',
  green: 'theme-green',
  sunset: 'theme-sunset',
  onyx: 'theme-onyx',
  charcoal: 'theme-charcoal',
  midnight: 'theme-midnight',
  graphite: 'theme-graphite',
  ebony: 'theme-ebony',
  noir: 'theme-noir',
  obsidian: 'theme-obsidian',
  sable: 'theme-sable',
  jet: 'theme-jet',
  gunmetal: 'theme-gunmetal',
};

export const themeGradients: Record<Theme, string> = {
    dark: 'linear-gradient(to bottom right, #0F172A, #111827, #0F172A)',
    blue: 'linear-gradient(to bottom right, #0F172A, #1E3A8A, #312E81)',
    purple: 'linear-gradient(to bottom right, #1E1B4B, #4C1D95, #5B21B6)',
    green: 'linear-gradient(to bottom right, #064E3B, #047857, #059669)',
    sunset: 'linear-gradient(to bottom right, #7F1D1D, #B91C1C, #F97316)',
    onyx: 'linear-gradient(to bottom right, #0f0f0f, #2d3436, #0f0f0f)',
    charcoal: 'linear-gradient(to bottom right, #36454F, #2C3E50, #36454F)',
    midnight: 'linear-gradient(to bottom right, #000033, #000066, #191970)',
    graphite: 'linear-gradient(to bottom right, #484848, #282828, #484848)',
    ebony: 'linear-gradient(to bottom right, #555d50, #3c443c, #555d50)',
    noir: 'linear-gradient(to bottom right, #252525, #000000, #252525)',
    obsidian: 'linear-gradient(to bottom right, #0B1D2A, #122B3E, #0B1D2A)',
    sable: 'linear-gradient(to bottom right, #40322c, #261e1a, #40322c)',
    jet: 'linear-gradient(to bottom right, #343434, #1b1b1b, #343434)',
    gunmetal: 'linear-gradient(to bottom right, #2a3439, #2c3539, #2a3439)',
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
        const fetchedSettings = data.content_value as unknown;
        if (isThemeSettings(fetchedSettings)) {
            setSettings(fetchedSettings);
        } else {
            console.warn('Fetched theme settings are invalid, using default.');
            setSettings(defaultSettings);
        }
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
            const newSettings = payload.new.content_value as unknown;
            if (isThemeSettings(newSettings)) {
                setSettings(newSettings);
            } else {
                console.warn('Received invalid theme settings from subscription.');
            }
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
