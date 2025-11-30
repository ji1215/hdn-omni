import { useEffect } from 'react';
import useStore from '@/store/useStore';

export type Theme = 'light' | 'dark' | 'system';

export function useTheme() {
  const theme = useStore((state) => state.theme);
  const toggleTheme = useStore((state) => state.toggleTheme);

  useEffect(() => {
    // Apply theme to document root
    const root = document.documentElement;

    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  return { theme, toggleTheme };
}

/**
 * Hook to detect system theme preference
 */
export function useSystemTheme() {
  useEffect(() => {
    // Check if user has a saved preference, if not use system preference
    const savedTheme = localStorage.getItem('hdn-omni-storage');

    if (!savedTheme) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const store = useStore.getState();

      if (prefersDark && store.theme === 'light') {
        store.toggleTheme();
      }
    }

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      const store = useStore.getState();
      const shouldBeDark = e.matches;

      if (shouldBeDark && store.theme === 'light') {
        store.toggleTheme();
      } else if (!shouldBeDark && store.theme === 'dark') {
        store.toggleTheme();
      }
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);
}
