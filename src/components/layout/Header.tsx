import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Search } from 'lucide-react';
import { useAppStore } from '../../store';
import { classNames } from '../../utils';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  showSearch?: boolean;
  showNotification?: boolean;
  rightAction?: React.ReactNode;
  dark?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  showBack = false,
  showSearch = false,
  showNotification = true,
  rightAction,
  dark = false,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAppStore();

  const pageTitles: Record<string, string> = {
    '/dashboard': '工作台',
    '/devices': '设备台账',
    '/inspection-plans': '点检计划',
    '/scan': '扫码点检',
    '/maintenance': '保养工单',
    '/repair': '维修报修',
    '/spare-parts': '备件仓库',
    '/statistics': '停机统计',
    '/profile': '个人中心',
    '/repair/create': '故障报修',
    '/spare-parts/requisition': '备件领用',
  };

  const getPageTitle = () => {
    if (title) return title;
    if (location.pathname.startsWith('/devices/')) return '设备详情';
    if (location.pathname.startsWith('/inspection-plans/')) return '计划详情';
    if (location.pathname.startsWith('/inspection/')) return '点检执行';
    if (location.pathname.startsWith('/maintenance/')) return '工单详情';
    if (location.pathname.startsWith('/repair/') && !location.pathname.endsWith('/create')) return '维修详情';
    return pageTitles[location.pathname] || '';
  };

  const handleBack = () => {
    navigate(-1);
  };

  const showHeader = dark || !['/', '/login', '/scan'].includes(location.pathname);

  if (!showHeader) return null;

  return (
    <header className={classNames(
      'fixed top-0 left-0 right-0 z-50 safe-area-top',
      dark ? 'bg-neutral-900 border-b border-neutral-800' : 'bg-white border-b border-neutral-200'
    )}>
      <div className="flex items-center justify-between h-12 px-4 max-w-md mx-auto">
        <div className="flex items-center flex-1">
          {showBack && (
            <button
              onClick={handleBack}
              className={classNames(
                'w-8 h-8 flex items-center justify-center -ml-2 transition-colors active:scale-95',
                dark ? 'text-white hover:text-primary-400' : 'text-neutral-600 hover:text-primary-500'
              )}
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <h1 className={classNames(
            'text-lg font-semibold',
            showBack ? 'ml-2' : '',
            dark ? 'text-white' : 'text-neutral-700'
          )}>
            {getPageTitle()}
          </h1>
        </div>
        <div className="flex items-center space-x-1">
          {showSearch && (
            <button className={classNames(
              'w-8 h-8 flex items-center justify-center transition-colors active:scale-95',
              dark ? 'text-white hover:text-primary-400' : 'text-neutral-500 hover:text-primary-500'
            )}>
              <Search size={20} />
            </button>
          )}
          {showNotification && (
            <button className={classNames(
              'relative w-8 h-8 flex items-center justify-center transition-colors active:scale-95',
              dark ? 'text-white hover:text-primary-400' : 'text-neutral-500 hover:text-primary-500'
            )}>
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger-500 rounded-full" />
            </button>
          )}
          {rightAction}
        </div>
      </div>
    </header>
  );
};
