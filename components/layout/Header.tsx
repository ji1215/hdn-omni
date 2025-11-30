'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useStore from '@/store/useStore';
import {
  Bell,
  Search,
  Sun,
  Moon,
  User,
  LogOut,
  Settings,
  ChevronDown,
  Menu,
  Plus,
  Printer,
  X,
  Calendar,
  MessageSquare,
  HelpCircle,
  MapPin,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/common';

export default function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  const router = useRouter();
  const { theme, toggleTheme, sidebarCollapsed, toggleMobileDrawer } = useStore();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [theme, mounted]);

  const handleLogout = () => {
    router.push('/auth/login');
  };

  if (!mounted) {
    return null;
  }

  return (
    <header className="h-16 bg-white dark:bg-gray-800 border-b border-border-color dark:border-gray-700 transition-colors shadow-sm">
      <div className="h-full px-6 flex items-center justify-between gap-4">
        {/* 왼쪽: 메뉴 버튼 + 검색바 */}
        <div className="flex items-center gap-3 flex-1 max-w-xl">
          <Button
            variant="icon"
            onClick={() => {
              toggleMobileDrawer();
              onMenuClick?.();
            }}
            className="md:hidden hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 min-w-touch min-h-touch"
            aria-label="메뉴 열기"
          >
            <Menu className="w-5 h-5" />
          </Button>

          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search Database"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-10 py-2 border border-border-color dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/20 focus:border-primary dark:focus:border-primary focus:bg-white dark:focus:bg-gray-700 dark:text-gray-200 transition-all placeholder-gray-400"
            />
            {searchQuery && (
              <Button
                variant="icon"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* 오른쪽: 액션 버튼들 */}
        <div className="flex items-center gap-1.5">
          {/* 아이콘 버튼들 */}
          <Button
            variant="icon"
            className="hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 hidden lg:flex p-2"
          >
            <HelpCircle className="w-4 h-4" />
          </Button>

          <Button
            variant="icon"
            className="hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 hidden lg:flex p-2 relative"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </Button>

          {/* 다크모드 토글 */}
          <Button
            variant="icon"
            onClick={toggleTheme}
            className="hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 p-2"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </Button>

          {/* 사용자 메뉴 */}
          <div className="relative ml-2">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg px-2 py-1.5 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xs font-semibold shadow-md">
                SR
              </div>
              <div className="hidden md:flex flex-col items-start">
                <span className="text-xs font-semibold text-gray-900 dark:text-white">Sajibur Rahman</span>
              </div>
              <ChevronDown className="w-3 h-3 text-gray-500 hidden md:block" />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-600 z-50 overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-gray-600">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    Jonathan Higgins
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    admin@hdnomni.com
                  </p>
                </div>
                <div className="p-2">
                  <Button
                    variant="ghost"
                    leftIcon={<User className="w-4 h-4" />}
                    className="w-full justify-start gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  >
                    프로필
                  </Button>
                  <Button
                    variant="ghost"
                    leftIcon={<Settings className="w-4 h-4" />}
                    className="w-full justify-start gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  >
                    설정
                  </Button>
                  <hr className="my-2 border-gray-200 dark:border-gray-600" />
                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    leftIcon={<LogOut className="w-4 h-4" />}
                    className="w-full justify-start gap-3 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                  >
                    로그아웃
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
