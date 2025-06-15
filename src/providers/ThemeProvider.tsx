
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

type ThemeSettings = {
  enabled: boolean;
  interval: number;
  selected_themes: string[];
  active_theme: string;
};

const ThemeContext = createContext<ThemeSettings | null>(null);

export const useThemeSettings = () => useContext(ThemeContext);

const applyTheme = (theme: string) => {
  const root = document.documentElement;
  const themes = ['dark', 'midnight', 'forest', 'crimson', 'ocean', 'graphite', 'rose', 'solarized-dark', 'dracula', 'nord-dark', 'obsidian'].map(t => t === 'dark' ? 'dark' : `theme-${t}`);
  root.classList.remove(...themes);

  if (!theme) { // Default to dark if theme is null/undefined
    console.warn("ThemeProvider: Applying default 'dark' theme because provided theme is empty.");
    root.classList.add('dark');
    return;
  }

  if (theme === 'dark') {
    root.classList.add('dark');
  } else if (theme !== 'light') {
    root.classList.add(`theme-${theme}`);
  }
};

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const queryClient = useQueryClient();
  const [currentTheme, setCurrentTheme] = useState('dark');

  const { data: settings, isLoading } = useQuery({
    queryKey: ['theme_settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('website_content')
        .select('content_value')
        .eq('section', 'theme_settings')
        .eq('content_key', 'config')
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      
      const defaults = {
        enabled: false,
        interval: 30,
        selected_themes: ['dark', 'midnight'],
        active_theme: 'dark',
      };
      
      return data ? (data.content_value as ThemeSettings) : defaults;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  useEffect(() => {
    applyTheme(currentTheme);
  }, [currentTheme]);

  useEffect(() => {
    if (isLoading || !settings) {
      return;
    }

    let intervalId: number | undefined;

    console.log('THEME PROVIDER: Settings updated.', settings);

    if (settings.enabled && settings.selected_themes && settings.selected_themes.length > 0) {
      console.log(`THEME PROVIDER: Auto-cycling is ON. Interval: ${settings.interval}s. Themes:`, settings.selected_themes);
      
      const themes = settings.selected_themes;
      let currentIndex = themes.indexOf(settings.active_theme);
      if (currentIndex === -1) {
        currentIndex = 0;
      }
      
      if (currentTheme !== themes[currentIndex]) {
        setCurrentTheme(themes[currentIndex]);
      }

      intervalId = window.setInterval(() => {
        currentIndex = (currentIndex + 1) % themes.length;
        const newTheme = themes[currentIndex];
        setCurrentTheme(newTheme);
      }, (settings.interval || 30) * 1000);

    } else {
      console.log('THEME PROVIDER: Auto-cycling is OFF. Applying static theme:', settings.active_theme);
      if (currentTheme !== settings.active_theme) {
        setCurrentTheme(settings.active_theme || 'dark');
      }
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [settings, isLoading]);

  useEffect(() => {
    const channel = supabase
      .channel('website_content_theme_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'website_content',
          filter: 'section=eq.theme_settings',
        },
        (payload) => {
          console.log('THEME PROVIDER: Realtime update received!', payload);
          queryClient.invalidateQueries({ queryKey: ['theme_settings'] });
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log('THEME PROVIDER: Successfully subscribed to realtime theme changes!');
        }
        if (status === 'CHANNEL_ERROR') {
          console.error('THEME PROVIDER: Realtime channel error.', err);
        }
        if (status === 'TIMED_OUT') {
          console.warn('THEME PROVIDER: Realtime connection timed out.');
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return (
    <ThemeContext.Provider value={settings || null}>
      {children}
    </ThemeContext.Provider>
  );
};
