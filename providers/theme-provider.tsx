'use client';

import { useEffect } from 'react';
import useStore from '@/store/useStore';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useStore((state) => state.theme);

  useEffect(() => {
    // Apply theme to document root
    const root = document.documentElement;

    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    // Detect system theme preference on initial load
    const savedStorage = localStorage.getItem('hdn-omni-storage');

    if (!savedStorage) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

      if (prefersDark && theme === 'light') {
        useStore.getState().toggleTheme();
      }
    }

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      const currentTheme = useStore.getState().theme;
      const shouldBeDark = e.matches;

      // Only auto-switch if user hasn't manually set a preference
      const hasManualPreference = localStorage.getItem('hdn-omni-storage');
      if (!hasManualPreference) {
        if (shouldBeDark && currentTheme === 'light') {
          useStore.getState().toggleTheme();
        } else if (!shouldBeDark && currentTheme === 'dark') {
          useStore.getState().toggleTheme();
        }
      }
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [theme]);

  return <>{children}</>;
}
