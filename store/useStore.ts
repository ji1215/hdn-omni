import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'network_admin' | 'monitoring_user' | 'guest';
}

interface GlobalState {
  // User state
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;

  // Theme state
  theme: 'light' | 'dark';
  toggleTheme: () => void;

  // Language state
  language: 'ko' | 'en';
  setLanguage: (lang: 'ko' | 'en') => void;

  // Sidebar state
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;

  // Sidebar layout state
  sidebarLayout: 'vertical' | 'horizontal' | 'two-column';
  setSidebarLayout: (layout: 'vertical' | 'horizontal' | 'two-column') => void;

  // Mobile drawer state
  mobileDrawerOpen: boolean;
  setMobileDrawerOpen: (open: boolean) => void;
  toggleMobileDrawer: () => void;
}

const useStore = create<GlobalState>()(
  devtools(
    persist(
      (set) => ({
        // User state
        user: null,
        isAuthenticated: false,
        setUser: (user) => set({ user, isAuthenticated: !!user }),

        // Theme state
        theme: 'light',
        toggleTheme: () => set((state) => ({
          theme: state.theme === 'light' ? 'dark' : 'light'
        })),

        // Language state
        language: 'ko',
        setLanguage: (language) => set({ language }),

        // Sidebar state
        sidebarCollapsed: false,
        toggleSidebar: () => set((state) => ({
          sidebarCollapsed: !state.sidebarCollapsed
        })),
        setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

        // Sidebar layout state
        sidebarLayout: 'vertical',
        setSidebarLayout: (layout) => set({ sidebarLayout: layout }),

        // Mobile drawer state
        mobileDrawerOpen: false,
        setMobileDrawerOpen: (open) => set({ mobileDrawerOpen: open }),
        toggleMobileDrawer: () => set((state) => ({
          mobileDrawerOpen: !state.mobileDrawerOpen
        })),
      }),
      {
        name: 'hdn-omni-storage',
        partialize: (state) => ({
          theme: state.theme,
          language: state.language,
          sidebarCollapsed: state.sidebarCollapsed,
          sidebarLayout: state.sidebarLayout
        }),
      }
    )
  )
);

export default useStore;