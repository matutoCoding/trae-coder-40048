import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Cpu, ClipboardList, QrCode, Wrench, Package, BarChart3, User } from 'lucide-react';
import { useAppStore } from '../../store';
import { classNames } from '../../utils';

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { path: '/dashboard', label: '首页', icon: <LayoutDashboard size={20} /> },
  { path: '/devices', label: '设备', icon: <Cpu size={20} /> },
  { path: '/inspection-plans', label: '点检', icon: <ClipboardList size={20} /> },
  { path: '/scan', label: '扫码', icon: <QrCode size={20} /> },
  { path: '/maintenance', label: '保养', icon: <Wrench size={20} /> },
  { path: '/repair', label: '维修', icon: <Wrench size={20} /> },
  { path: '/spare-parts', label: '备件', icon: <Package size={20} /> },
  { path: '/statistics', label: '统计', icon: <BarChart3 size={20} /> },
];

interface BottomNavProps {
  active?: string;
}

export const BottomNav: React.FC<BottomNavProps> = ({ active }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { activeTab, setActiveTab } = useAppStore();

  const handleNavClick = (path: string, tab: string) => {
    setActiveTab(tab);
    navigate(path);
  };

  const showNav = !['/', '/login'].includes(location.pathname);

  if (!showNav) return null;

  const getIsActive = (path: string) => {
    if (active) {
      const tabMap: Record<string, string> = {
        'home': '/dashboard',
        'dashboard': '/dashboard',
        'devices': '/devices',
        'inspection-plans': '/inspection-plans',
        'scan': '/scan',
        'maintenance': '/maintenance',
        'repair': '/repair',
        'spare-parts': '/spare-parts',
        'statistics': '/statistics',
        'profile': '/profile',
      };
      return tabMap[active] === path;
    }
    if (path === '/scan') return location.pathname.startsWith('/scan') || location.pathname.startsWith('/inspection');
    if (path === '/repair') return location.pathname.startsWith('/repair');
    if (path === '/maintenance') return location.pathname.startsWith('/maintenance');
    if (path === '/spare-parts') return location.pathname.startsWith('/spare-parts');
    return location.pathname === path;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 z-50 safe-area-bottom">
      <div className="flex justify-around items-center h-14 max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = getIsActive(item.path);
          return (
            <button
              key={item.path}
              onClick={() => handleNavClick(item.path, item.path.replace('/', ''))}
              className={classNames(
                'flex flex-col items-center justify-center flex-1 h-full transition-all duration-200',
                isActive ? 'text-primary-500' : 'text-neutral-400 hover:text-neutral-600'
              )}
            >
              <div className={classNames(
                'transition-transform duration-200',
                isActive ? 'scale-110' : ''
              )}>
                {item.icon}
              </div>
              <span className={classNames(
                'text-xs mt-0.5',
                isActive ? 'font-medium' : ''
              )}>
                {item.label}
              </span>
              {isActive && (
                <div className="absolute top-0 w-12 h-0.5 bg-primary-500 rounded-full" />
              )}
            </button>
          );
        })}
        <button
          onClick={() => handleNavClick('/profile', 'profile')}
          className={classNames(
            'flex flex-col items-center justify-center flex-1 h-full transition-all duration-200',
            location.pathname === '/profile' ? 'text-primary-500' : 'text-neutral-400 hover:text-neutral-600'
          )}
        >
          <div className={classNames(
            'transition-transform duration-200',
            location.pathname === '/profile' ? 'scale-110' : ''
          )}>
            <User size={20} />
          </div>
          <span className={classNames(
            'text-xs mt-0.5',
            location.pathname === '/profile' ? 'font-medium' : ''
          )}>
            我的
          </span>
          {location.pathname === '/profile' && (
            <div className="absolute top-0 w-12 h-0.5 bg-primary-500 rounded-full" />
          )}
        </button>
      </div>
    </nav>
  );
};
