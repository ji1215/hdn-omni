'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard,
  Monitor,
  Network,
  Shield,
  Settings,
  Users,
  Activity,
  Layers,
  Home,
  HelpCircle,
  Menu,
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  User,
  Calendar,
  FileText,
  DollarSign,
  Zap,
  Cpu,
  GitBranch,
  AlertTriangle,
  TrendingUp,
  Search,
  Plus,
  Building2,
  TestTube,
  Workflow,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import useStore from '@/store/useStore';
import { Button } from '@/components/common';

interface NavigationItem {
  name: string;
  href: string;
  icon: any;
  children?: NavigationItem[];
}

const navigation: NavigationItem[] = [
  {
    name: '대시보드',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: '모니터링',
    href: '/monitoring',
    icon: Monitor,
    children: [
      { name: '네트워크 토폴로지', href: '/monitoring', icon: GitBranch },
      { name: '리소스 모니터링', href: '/monitoring/resources', icon: Cpu },
      { name: '트래픽 분석', href: '/monitoring/traffic', icon: TrendingUp },
      { name: '경고 및 이벤트', href: '/monitoring/alerts', icon: AlertTriangle },
    ],
  },
  {
    name: '네트워크',
    href: '/network',
    icon: Network,
    children: [
      { name: '디바이스 관리', href: '/network/devices', icon: Layers },
      { name: '플로우 규칙', href: '/network/flows', icon: Activity },
      { name: '포트 관리', href: '/network/ports', icon: FileText },
      { name: 'QoS 정책', href: '/network/qos', icon: Zap },
    ],
  },
  {
    name: '보안',
    href: '/security',
    icon: Shield,
    children: [
      { name: '회원 관리', href: '/security/members', icon: Users },
      { name: '사용자 관리', href: '/security/users', icon: User },
      { name: '부서 관리', href: '/security/departments', icon: Building2 },
      { name: '역할 관리', href: '/security/roles', icon: Shield },
      { name: '로그', href: '/security/audit', icon: FileText },
    ],
  },
  {
    name: 'TEST',
    href: '/test/topology',
    icon: TestTube,
    children: [
      { name: '토폴로지', href: '/test/topology', icon: Workflow },
    ],
  },
  {
    name: '설정',
    href: '/settings',
    icon: Settings,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar, mobileDrawerOpen, setMobileDrawerOpen, sidebarLayout } = useStore();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number } | null>(
    null
  );
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // For two-column mode: track which menu item is selected in first column
  const [selectedMenuItem, setSelectedMenuItem] = useState<string>(navigation[0]?.name || '');

  // Auto-expand parent menu if child is active
  useEffect(() => {
    navigation.forEach((item) => {
      if (item.children) {
        const hasActiveChild = item.children.some((child) => {
          const isExactMatch = pathname === child.href;
          const isSubRoute =
            pathname.startsWith(child.href + '/') &&
            !item.children!.some(
              (sibling) => sibling.href !== child.href && pathname.startsWith(sibling.href)
            );
          return isExactMatch || isSubRoute;
        });
        if (hasActiveChild && !expandedItems.includes(item.name)) {
          setExpandedItems((prev) => [...prev, item.name]);
        }
      }
    });
  }, [pathname]);

  // Auto-select active parent menu item in two-column mode
  useEffect(() => {
    if (sidebarLayout === 'two-column') {
      const activeItem = navigation.find((item) => {
        if (pathname === item.href) return true;
        if (item.children) {
          return item.children.some((child) => {
            const isExactMatch = pathname === child.href;
            const isSubRoute =
              pathname.startsWith(child.href + '/') &&
              !item.children!.some(
                (sibling) => sibling.href !== child.href && pathname.startsWith(sibling.href)
              );
            return isExactMatch || isSubRoute;
          });
        }
        return pathname.startsWith(item.href + '/');
      });

      if (activeItem && activeItem.name !== selectedMenuItem) {
        setSelectedMenuItem(activeItem.name);
      }
    }
  }, [pathname, sidebarLayout]);

  // ESC 키로 모바일 드로어 닫기
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileDrawerOpen) {
        setMobileDrawerOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [mobileDrawerOpen, setMobileDrawerOpen]);

  // 모바일 드로어 열릴 때 body 스크롤 방지
  useEffect(() => {
    if (mobileDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileDrawerOpen]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  const toggleExpanded = (itemName: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemName) ? prev.filter((name) => name !== itemName) : [...prev, itemName]
    );
  };

  const isItemActive = (item: NavigationItem) => {
    if (pathname === item.href) return true;
    if (item.children) {
      return item.children.some((child) => {
        const isExactMatch = pathname === child.href;
        const isSubRoute =
          pathname.startsWith(child.href + '/') &&
          !item.children!.some(
            (sibling) => sibling.href !== child.href && pathname.startsWith(sibling.href)
          );
        return isExactMatch || isSubRoute;
      });
    }
    return pathname.startsWith(item.href + '/');
  };

  const handleLinkClick = () => {
    // 모바일에서 링크 클릭 시 드로어 닫기
    if (mobileDrawerOpen) {
      setMobileDrawerOpen(false);
    }
  };

  // Horizontal mode
  if (sidebarLayout === 'horizontal') {
    return (
      <>
        {/* 모바일 오버레이 */}
        {mobileDrawerOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden animate-fade-in"
            onClick={() => setMobileDrawerOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Horizontal Navbar */}
        <nav className={cn(
          'bg-sidebar-bg border-b border-sidebar-hover transition-all duration-300 shadow-lg',
          // 데스크톱 스타일
          'hidden md:block',
        )}>
          <div className="flex items-center h-14 px-4">
            {/* Logo */}
            <div className="flex items-center gap-2 mr-8">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-md">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-white font-bold text-lg tracking-wide">hdn-omni</span>
            </div>

            {/* Navigation Items */}
            <div className="flex items-center gap-1 flex-1">
              {navigation.map((item) => {
                const isActive = isItemActive(item);
                const hasChildren = item.children && item.children.length > 0;

                return (
                  <div key={item.name} className="relative group">
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm font-medium',
                        isActive
                          ? 'bg-primary text-white'
                          : 'text-gray-400 hover:bg-sidebar-hover hover:text-white'
                      )}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </Link>

                    {/* Dropdown for children */}
                    {hasChildren && (
                      <div className="absolute top-full left-0 mt-1 bg-sidebar-bg border border-sidebar-hover rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 min-w-[200px]">
                        <div className="py-2">
                          {item.children!.map((child) => {
                            // Check for exact match or if pathname starts with child.href + '/'
                            // but exclude cases where pathname matches a sibling route
                            const isExactMatch = pathname === child.href;
                            const isSubRoute =
                              pathname.startsWith(child.href + '/') &&
                              !item.children!.some(
                                (sibling) =>
                                  sibling.href !== child.href && pathname.startsWith(sibling.href)
                              );
                            const isChildActive = isExactMatch || isSubRoute;

                            return (
                              <Link
                                key={child.name}
                                href={child.href}
                                className={cn(
                                  'flex items-center gap-2 px-4 py-2 text-sm transition-colors',
                                  isChildActive
                                    ? 'bg-primary/20 text-white font-medium'
                                    : 'text-gray-400 hover:bg-sidebar-hover hover:text-white'
                                )}
                              >
                                <child.icon className="w-4 h-4" />
                                <span>{child.name}</span>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Help Button */}
            <Link
              href="/help"
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm font-medium',
                pathname === '/help'
                  ? 'bg-primary text-white'
                  : 'text-gray-400 hover:bg-sidebar-hover hover:text-white'
              )}
            >
              <HelpCircle className="w-4 h-4" />
              <span>도움말</span>
            </Link>
          </div>
        </nav>

        {/* Mobile Drawer (same as vertical) */}
        <div
          className={cn(
            'bg-sidebar-bg border-r border-sidebar-hover h-full flex flex-col transition-all duration-300 shadow-lg',
            'fixed inset-y-0 left-0 z-50 w-64 md:hidden',
            mobileDrawerOpen ? 'translate-x-0 animate-slide-in' : '-translate-x-full'
          )}
        >
          {/* Logo and Toggle */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-hover">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-md">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-white font-bold text-lg tracking-wide">hdn-omni</span>
            </div>
            <Button
              variant="icon"
              onClick={() => setMobileDrawerOpen(false)}
              className="hover:bg-sidebar-hover text-gray-400 hover:text-white"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto sidebar-scrollbar">
            {navigation.map((item) => {
              const isActive = isItemActive(item);
              const isExpanded = expandedItems.includes(item.name);
              const hasChildren = item.children && item.children.length > 0;

              return (
                <div key={item.name}>
                  <div>
                    <Link
                      href={item.href}
                      onClick={handleLinkClick}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all relative group',
                        hasChildren && 'pr-10',
                        isActive
                          ? 'bg-primary text-white font-medium shadow-md'
                          : 'text-gray-400 hover:bg-sidebar-hover hover:text-white'
                      )}
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      <span className="text-sm font-medium">{item.name}</span>
                    </Link>

                    {hasChildren && (
                      <Button
                        variant="icon"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleExpanded(item.name);
                        }}
                        className={cn(
                          'absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 p-0 flex items-center justify-center',
                          isActive
                            ? 'text-white hover:bg-primary-600'
                            : 'text-gray-400 hover:text-white hover:bg-sidebar-hover'
                        )}
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </Button>
                    )}
                  </div>

                  {hasChildren && isExpanded && (
                    <div className="mt-1 ml-4 space-y-1">
                      {item.children!.map((child) => {
                        const isChildActive = pathname === child.href || pathname.startsWith(child.href + '/');
                        return (
                          <Link
                            key={child.name}
                            href={child.href}
                            onClick={handleLinkClick}
                            className={cn(
                              'flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm',
                              isChildActive
                                ? 'bg-primary/20 text-white font-medium'
                                : 'text-gray-400 hover:bg-sidebar-hover hover:text-white'
                            )}
                          >
                            <child.icon className="w-4 h-4 flex-shrink-0" />
                            <span className="font-medium">{child.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Help Button */}
          <div className="p-3 border-t border-sidebar-hover">
            <Link
              href="/help"
              onClick={handleLinkClick}
              className={cn(
                'flex items-center w-full gap-3 px-3 py-2.5 rounded-lg bg-sidebar-hover text-gray-400 hover:text-white hover:bg-sidebar-active transition-colors',
                pathname === '/help' && 'bg-primary text-white'
              )}
            >
              <HelpCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-medium">도움말</span>
            </Link>
          </div>
        </div>
      </>
    );
  }

  // Two-column mode
  if (sidebarLayout === 'two-column') {
    const selectedItem = navigation.find(item => item.name === selectedMenuItem);
    const hasChildren = selectedItem?.children && selectedItem.children.length > 0;

    return (
      <>
        {/* 모바일 오버레이 */}
        {mobileDrawerOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden animate-fade-in"
            onClick={() => setMobileDrawerOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Two-column Sidebar */}
        <div className={cn(
          'bg-sidebar-bg border-r border-sidebar-hover h-full flex transition-all duration-300 shadow-lg',
          // 데스크톱 스타일
          'hidden md:flex',
        )}>
          {/* First Column - Icons Only */}
          <div className="w-20 border-r border-sidebar-hover flex flex-col">
            {/* Logo */}
            <div className="flex items-center justify-center h-16 px-4 border-b border-sidebar-hover">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-md">
                <Shield className="w-5 h-5 text-white" />
              </div>
            </div>

            {/* First Column Navigation - Icons Only */}
            <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto sidebar-scrollbar">
              {navigation.map((item) => {
                const isActive = isItemActive(item);
                const isSelected = selectedMenuItem === item.name;

                return (
                  <button
                    key={item.name}
                    onClick={() => setSelectedMenuItem(item.name)}
                    className={cn(
                      'w-full flex items-center justify-center p-3 rounded-lg transition-all relative group',
                      isSelected
                        ? 'bg-primary text-white shadow-md'
                        : isActive
                        ? 'bg-primary/20 text-white'
                        : 'text-gray-400 hover:bg-sidebar-hover hover:text-white'
                    )}
                    title={item.name}
                  >
                    <item.icon className="w-5 h-5" />

                    {/* Tooltip */}
                    <div className="absolute left-full ml-2 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg">
                      {item.name}
                    </div>
                  </button>
                );
              })}
            </nav>

            {/* Help Button */}
            <div className="p-3 border-t border-sidebar-hover">
              <button
                onClick={() => setSelectedMenuItem('도움말')}
                className={cn(
                  'w-full flex items-center justify-center p-3 rounded-lg transition-all relative group',
                  selectedMenuItem === '도움말' || pathname === '/help'
                    ? 'bg-primary text-white shadow-md'
                    : 'text-gray-400 hover:bg-sidebar-hover hover:text-white'
                )}
                title="도움말"
              >
                <HelpCircle className="w-5 h-5" />

                {/* Tooltip */}
                <div className="absolute left-full ml-2 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg">
                  도움말
                </div>
              </button>
            </div>
          </div>

          {/* Second Column - Selected Item Details */}
          <div className="w-64 flex flex-col">
            {/* Header with selected item name */}
            <div className="h-16 px-4 border-b border-sidebar-hover flex items-center">
              <span className="text-white text-base font-semibold">
                {selectedMenuItem}
              </span>
            </div>

            {/* Second Column Content */}
            <nav className="flex-1 py-4 px-3 overflow-y-auto sidebar-scrollbar">
              {selectedMenuItem === '도움말' ? (
                // Help section
                <Link
                  href="/help"
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all',
                    pathname === '/help'
                      ? 'bg-primary text-white font-medium shadow-md'
                      : 'text-gray-400 hover:bg-sidebar-hover hover:text-white'
                  )}
                >
                  <HelpCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm font-medium">도움말</span>
                </Link>
              ) : hasChildren ? (
                // Show children if selected item has them
                <div className="space-y-1">
                  {selectedItem!.children!.map((child) => {
                    // Check for exact match or if pathname starts with child.href + '/'
                    // but exclude cases where pathname matches a sibling route
                    const isExactMatch = pathname === child.href;
                    const isSubRoute =
                      pathname.startsWith(child.href + '/') &&
                      !selectedItem!.children!.some(
                        (sibling) =>
                          sibling.href !== child.href && pathname.startsWith(sibling.href)
                      );
                    const isChildActive = isExactMatch || isSubRoute;

                    return (
                      <Link
                        key={child.name}
                        href={child.href}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all',
                          isChildActive
                            ? 'bg-primary text-white font-medium shadow-md'
                            : 'text-gray-400 hover:bg-sidebar-hover hover:text-white'
                        )}
                      >
                        <child.icon className="w-5 h-5 flex-shrink-0" />
                        <span className="text-sm font-medium">{child.name}</span>
                      </Link>
                    );
                  })}
                </div>
              ) : selectedItem ? (
                // Show parent item itself if no children
                <Link
                  href={selectedItem.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all',
                    isItemActive(selectedItem)
                      ? 'bg-primary text-white font-medium shadow-md'
                      : 'text-gray-400 hover:bg-sidebar-hover hover:text-white'
                  )}
                >
                  <selectedItem.icon className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm font-medium">{selectedItem.name}</span>
                </Link>
              ) : null}
            </nav>
          </div>
        </div>

        {/* Mobile Drawer (same as vertical) */}
        <div
          className={cn(
            'bg-sidebar-bg border-r border-sidebar-hover h-full flex flex-col transition-all duration-300 shadow-lg',
            'fixed inset-y-0 left-0 z-50 w-64 md:hidden',
            mobileDrawerOpen ? 'translate-x-0 animate-slide-in' : '-translate-x-full'
          )}
        >
          {/* Logo and Toggle */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-hover">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-md">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-white font-bold text-lg tracking-wide">hdn-omni</span>
            </div>
            <Button
              variant="icon"
              onClick={() => setMobileDrawerOpen(false)}
              className="hover:bg-sidebar-hover text-gray-400 hover:text-white"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto sidebar-scrollbar">
            {navigation.map((item) => {
              const isActive = isItemActive(item);
              const isExpanded = expandedItems.includes(item.name);
              const hasChildren = item.children && item.children.length > 0;

              return (
                <div key={item.name}>
                  <div>
                    <Link
                      href={item.href}
                      onClick={handleLinkClick}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all relative group',
                        hasChildren && 'pr-10',
                        isActive
                          ? 'bg-primary text-white font-medium shadow-md'
                          : 'text-gray-400 hover:bg-sidebar-hover hover:text-white'
                      )}
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      <span className="text-sm font-medium">{item.name}</span>
                    </Link>

                    {hasChildren && (
                      <Button
                        variant="icon"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleExpanded(item.name);
                        }}
                        className={cn(
                          'absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 p-0 flex items-center justify-center',
                          isActive
                            ? 'text-white hover:bg-primary-600'
                            : 'text-gray-400 hover:text-white hover:bg-sidebar-hover'
                        )}
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </Button>
                    )}
                  </div>

                  {hasChildren && isExpanded && (
                    <div className="mt-1 ml-4 space-y-1">
                      {item.children!.map((child) => {
                        const isChildActive = pathname === child.href || pathname.startsWith(child.href + '/');
                        return (
                          <Link
                            key={child.name}
                            href={child.href}
                            onClick={handleLinkClick}
                            className={cn(
                              'flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm',
                              isChildActive
                                ? 'bg-primary/20 text-white font-medium'
                                : 'text-gray-400 hover:bg-sidebar-hover hover:text-white'
                            )}
                          >
                            <child.icon className="w-4 h-4 flex-shrink-0" />
                            <span className="font-medium">{child.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Help Button */}
          <div className="p-3 border-t border-sidebar-hover">
            <Link
              href="/help"
              onClick={handleLinkClick}
              className={cn(
                'flex items-center w-full gap-3 px-3 py-2.5 rounded-lg bg-sidebar-hover text-gray-400 hover:text-white hover:bg-sidebar-active transition-colors',
                pathname === '/help' && 'bg-primary text-white'
              )}
            >
              <HelpCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-medium">도움말</span>
            </Link>
          </div>
        </div>
      </>
    );
  }

  // Vertical mode (default)
  return (
    <>
      {/* 모바일 오버레이 */}
      {mobileDrawerOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden animate-fade-in"
          onClick={() => setMobileDrawerOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* 사이드바 */}
      <div
        className={cn(
          'bg-sidebar-bg border-r border-sidebar-hover h-full flex flex-col transition-all duration-300 shadow-lg',
          // 데스크톱 스타일
          'md:relative md:translate-x-0',
          sidebarCollapsed ? 'md:w-20' : 'md:w-64',
          // 모바일 스타일 (드로어)
          'fixed inset-y-0 left-0 z-50 w-64',
          'md:z-auto',
          mobileDrawerOpen ? 'translate-x-0 animate-slide-in' : '-translate-x-full md:translate-x-0'
        )}
      >
        {/* Logo and Toggle */}
        <div
          className={cn(
            'flex items-center h-16 px-4 border-b border-sidebar-hover',
            sidebarCollapsed ? 'justify-center' : 'justify-between'
          )}
        >
          <div className={cn('flex items-center gap-2', sidebarCollapsed && 'justify-center')}>
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-md">
              <Shield className="w-5 h-5 text-white" />
            </div>
            {!sidebarCollapsed && (
              <span className="text-white font-bold text-lg tracking-wide">hdn-omni</span>
            )}
          </div>
          {/* 데스크톱에서만 토글 버튼 표시 - 펼쳐진 상태일 때만 */}
          {!sidebarCollapsed && (
            <Button
              variant="icon"
              onClick={toggleSidebar}
              className="hidden md:flex hover:bg-sidebar-hover text-gray-400 hover:text-white"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
          )}
          {/* 모바일에서는 닫기 버튼 표시 */}
          <Button
            variant="icon"
            onClick={() => setMobileDrawerOpen(false)}
            className="md:hidden hover:bg-sidebar-hover text-gray-400 hover:text-white"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
        </div>

        {/* 접혔을 때 토글 버튼 - 사이드바 밖에 표시 */}
        {sidebarCollapsed && (
          <Button
            variant="icon"
            onClick={toggleSidebar}
            className="hidden md:flex absolute top-3 -right-6 z-[100] bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-full w-6 h-6 p-0 items-center justify-center border border-gray-700 shadow-lg"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto sidebar-scrollbar">
          {navigation.map((item) => {
            const isActive = isItemActive(item);
            const isExpanded = expandedItems.includes(item.name);
            const hasChildren = item.children && item.children.length > 0;

            return (
              <div key={item.name}>
                {/* Parent Menu Item */}
                <div
                  className="relative"
                  onMouseEnter={(e) => {
                    if (sidebarCollapsed) {
                      // Clear any pending close timeout
                      if (closeTimeoutRef.current) {
                        clearTimeout(closeTimeoutRef.current);
                        closeTimeoutRef.current = null;
                      }
                      const rect = e.currentTarget.getBoundingClientRect();
                      setHoveredItem(item.name);
                      setDropdownPosition({
                        top: rect.top,
                        left: rect.right,
                      });
                    }
                  }}
                  onMouseLeave={() => {
                    if (sidebarCollapsed) {
                      // Delay closing to allow mouse to move to dropdown
                      closeTimeoutRef.current = setTimeout(() => {
                        setHoveredItem(null);
                        setDropdownPosition(null);
                      }, 200);
                    }
                  }}
                >
                  <Link
                    href={item.href}
                    onClick={handleLinkClick}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all relative group',
                      sidebarCollapsed && 'justify-center',
                      hasChildren && !sidebarCollapsed && 'pr-10', // Add padding for expand button
                      isActive
                        ? 'bg-primary text-white font-medium shadow-md'
                        : 'text-gray-400 hover:bg-sidebar-hover hover:text-white'
                    )}
                    title={sidebarCollapsed ? item.name : undefined}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    {!sidebarCollapsed && <span className="text-sm font-medium">{item.name}</span>}
                  </Link>

                  {/* Expand/Collapse Button for items with children */}
                  {hasChildren && !sidebarCollapsed && (
                    <Button
                      variant="icon"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleExpanded(item.name);
                      }}
                      className={cn(
                        'absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 p-0 flex items-center justify-center',
                        isActive
                          ? 'text-white hover:bg-primary-600'
                          : 'text-gray-400 hover:text-white hover:bg-sidebar-hover'
                      )}
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </Button>
                  )}
                </div>

                {/* Sub Menu Items */}
                {hasChildren && !sidebarCollapsed && isExpanded && (
                  <div className="mt-1 ml-4 space-y-1">
                    {item.children!.map((child) => {
                      // Check for exact match or if pathname starts with child.href + '/'
                      // but exclude cases where pathname matches a sibling route
                      const isExactMatch = pathname === child.href;
                      const isSubRoute =
                        pathname.startsWith(child.href + '/') &&
                        !item.children!.some(
                          (sibling) =>
                            sibling.href !== child.href && pathname.startsWith(sibling.href)
                        );
                      const isChildActive = isExactMatch || isSubRoute;

                      return (
                        <Link
                          key={child.name}
                          href={child.href}
                          onClick={handleLinkClick}
                          className={cn(
                            'flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm',
                            isChildActive
                              ? 'bg-primary/20 text-white font-medium'
                              : 'text-gray-400 hover:bg-sidebar-hover hover:text-white'
                          )}
                        >
                          <child.icon className="w-4 h-4 flex-shrink-0" />
                          <span className="font-medium">{child.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Help Button */}
        <div className="p-3 border-t border-sidebar-hover">
          <Link
            href="/help"
            onClick={handleLinkClick}
            className={cn(
              'flex items-center w-full gap-3 px-3 py-2.5 rounded-lg bg-sidebar-hover text-gray-400 hover:text-white hover:bg-sidebar-active transition-colors group relative',
              sidebarCollapsed && 'md:justify-center',
              pathname === '/help' && 'bg-primary text-white'
            )}
          >
            <HelpCircle className="w-5 h-5 flex-shrink-0" />
            {!sidebarCollapsed && <span className="text-sm font-medium">도움말</span>}

            {/* Tooltip for collapsed state */}
            {sidebarCollapsed && (
              <div className="absolute left-full ml-2 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg">
                도움말
              </div>
            )}
          </Link>
        </div>
      </div>

      {/* Fixed position dropdown for collapsed sidebar */}
      {sidebarCollapsed && hoveredItem && dropdownPosition && (
        <div
          className="fixed px-3 py-1.5 bg-sidebar-bg text-white text-sm rounded-lg whitespace-nowrap z-[9999] shadow-xl border border-sidebar-hover"
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left + 8}px`,
          }}
          onMouseEnter={() => {
            // Clear any pending close timeout when mouse enters dropdown
            if (closeTimeoutRef.current) {
              clearTimeout(closeTimeoutRef.current);
              closeTimeoutRef.current = null;
            }
          }}
          onMouseLeave={() => {
            // Close immediately when mouse leaves dropdown
            setHoveredItem(null);
            setDropdownPosition(null);
          }}
        >
          <div className="font-medium mb-1">{hoveredItem}</div>
          {(() => {
            const item = navigation.find((i) => i.name === hoveredItem);
            if (item?.children) {
              return (
                <div className="mt-2 space-y-1 border-t border-sidebar-hover pt-2">
                  {item.children.map((child) => {
                    const isExactMatch = pathname === child.href;
                    const isSubRoute =
                      pathname.startsWith(child.href + '/') &&
                      !item.children!.some(
                        (sibling) =>
                          sibling.href !== child.href && pathname.startsWith(sibling.href)
                      );
                    const isChildActive = isExactMatch || isSubRoute;

                    return (
                      <Link
                        key={child.name}
                        href={child.href}
                        onClick={handleLinkClick}
                        className={cn(
                          'flex items-center gap-2 px-2 py-1.5 text-xs rounded transition-colors',
                          isChildActive
                            ? 'bg-primary text-white'
                            : 'hover:bg-sidebar-hover text-gray-400 hover:text-white'
                        )}
                      >
                        <child.icon className="w-3 h-3 flex-shrink-0" />
                        <span>{child.name}</span>
                      </Link>
                    );
                  })}
                </div>
              );
            }
            return null;
          })()}
        </div>
      )}
    </>
  );
}
