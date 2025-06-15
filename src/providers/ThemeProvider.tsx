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

  const { data: settings, isLoading, isError } = useQuery({
    queryKey: ['theme_settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('website_content')
        .select('content_value')
        .eq('section', 'theme_settings')
        .eq('content_key', 'config')
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      
      const defaults: ThemeSettings = {
        enabled: false,
        interval: 30,
        selected_themes: ['dark', 'midnight'],
        active_theme: 'dark',
      };
      
      return data ? (data.content_value as ThemeSettings) : defaults;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Effect to apply the theme whenever the active_theme from settings changes.
  useEffect(() => {
    if (settings) {
      console.log(`THEME PROVIDER: Applying theme from settings: ${settings.active_theme}`);
      applyTheme(settings.active_theme);
    } else {
      console.log("THEME PROVIDER: No settings found, applying default 'dark' theme.");
      applyTheme('dark');
    }
  }, [settings?.active_theme]);

  // Effect to handle the auto-cycling logic.
  useEffect(() => {
    if (isLoading || !settings || isError) {
      return;
    }

    let intervalId: number | undefined;

    if (settings.enabled && settings.selected_themes && settings.selected_themes.length > 0) {
      console.log(`THEME PROVIDER: Auto-cycling is ON. Interval: ${settings.interval}s. Themes:`, settings.selected_themes);
      
      const themes = settings.selected_themes;

      intervalId = window.setInterval(async () => {
        const currentSettings = queryClient.getQueryData<ThemeSettings>(['theme_settings']);
        if (!currentSettings || !currentSettings.enabled) return;

        const currentThemeIndex = themes.indexOf(currentSettings.active_theme);
        const nextThemeIndex = (currentThemeIndex + 1) % themes.length;
        const newTheme = themes[nextThemeIndex];

        console.log(`THEME PROVIDER: Cycling theme from ${currentSettings.active_theme} to ${newTheme}`);
        
        const { error } = await supabase.from('website_content').upsert(
          {
            section: 'theme_settings',
            content_key: 'config',
            content_value: { ...currentSettings, active_theme: newTheme },
          },
          { onConflict: 'section,content_key' }
        );

        if (error) {
          console.error("THEME PROVIDER: Error updating theme in DB during auto-cycle", error);
        }
      }, (settings.interval || 30) * 1000);

    } else {
      console.log('THEME PROVIDER: Auto-cycling is OFF.');
    }

    return () => {
      if (intervalId) {
        console.log("THEME PROVIDER: Clearing auto-cycle interval.");
        clearInterval(intervalId);
      }
    };
  }, [settings, isLoading, isError, queryClient]);

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
