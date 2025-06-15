import React, { createContext, useContext, useEffect } from 'react';
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
  const themes = ['dark', 'theme-light-blue', 'theme-purple', 'theme-sunset', 'theme-green'];
  root.classList.remove(...themes);

  if (theme === 'dark') {
    root.classList.add('dark');
  } else if (theme && theme !== 'light') {
    root.classList.add(`theme-${theme}`);
  }
};

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const queryClient = useQueryClient();
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
        selected_themes: ['dark'],
        active_theme: 'dark',
      };
      
      return data ? (data.content_value as ThemeSettings) : defaults;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  useEffect(() => {
    if (isLoading || !settings) return;

    let intervalId: number | undefined;

    console.log('THEME PROVIDER: New settings received, applying theme.', settings);

    if (settings.enabled && settings.selected_themes && settings.selected_themes.length > 0) {
      const initialTheme = settings.selected_themes.includes(settings.active_theme)
        ? settings.active_theme
        : settings.selected_themes[0];

      let currentThemeIndex = settings.selected_themes.indexOf(initialTheme);
      if (currentThemeIndex === -1) currentThemeIndex = 0;

      applyTheme(settings.selected_themes[currentThemeIndex]);

      intervalId = window.setInterval(() => {
        currentThemeIndex = (currentThemeIndex + 1) % settings.selected_themes.length;
        const newTheme = settings.selected_themes[currentThemeIndex];
        applyTheme(newTheme);
      }, (settings.interval || 30) * 1000);

    } else {
      applyTheme(settings.active_theme || 'dark');
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
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
