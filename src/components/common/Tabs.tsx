import React, { useState } from 'react';
import { classNames } from '../../utils';

interface TabItem {
  key: string;
  label: string;
  badge?: number;
  value?: string;
}

interface TabsProps {
  items: TabItem[];
  defaultKey?: string;
  activeKey?: string;
  onChange?: (key: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  items,
  defaultKey,
  activeKey,
  onChange,
  className = '',
}) => {
  const [internalKey, setInternalKey] = useState(defaultKey || items[0]?.key);
  const currentKey = activeKey !== undefined ? activeKey : internalKey;

  const handleClick = (key: string) => {
    if (activeKey === undefined) {
      setInternalKey(key);
    }
    onChange?.(key);
  };

  return (
    <div className={classNames('flex bg-neutral-100 rounded-lg p-1', className)}>
      {items.map((item) => {
        const isActive = currentKey === item.key;
        return (
          <button
            key={item.key}
            onClick={() => handleClick(item.key)}
            className={classNames(
              'flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all duration-200 relative',
              isActive
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-neutral-500 hover:text-neutral-700'
            )}
          >
            {item.label}
            {item.badge !== undefined && item.badge > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 text-xs rounded-full bg-danger-500 text-white">
                {item.badge > 99 ? '99+' : item.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

interface ScrollTabsProps {
  items: TabItem[];
  defaultKey?: string;
  activeKey?: string;
  onChange?: (key: string) => void;
  className?: string;
}

export const ScrollTabs: React.FC<ScrollTabsProps> = ({
  items,
  defaultKey,
  activeKey,
  onChange,
  className = '',
}) => {
  const [internalKey, setInternalKey] = useState(defaultKey || items[0]?.key);
  const currentKey = activeKey !== undefined ? activeKey : internalKey;

  const handleClick = (key: string) => {
    if (activeKey === undefined) {
      setInternalKey(key);
    }
    onChange?.(key);
  };

  return (
    <div className={classNames('flex overflow-x-auto no-scrollbar -mx-4 px-4', className)}>
      {items.map((item) => {
        const isActive = currentKey === item.key;
        return (
          <button
            key={item.key}
            onClick={() => handleClick(item.key)}
            className={classNames(
              'flex-shrink-0 py-2 px-4 mr-2 rounded-full text-sm font-medium transition-all duration-200 relative',
              isActive
                ? 'bg-primary-500 text-white shadow-button'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            )}
          >
            {item.label}
            {item.badge !== undefined && item.badge > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 text-xs rounded-full bg-white/20">
                {item.badge > 99 ? '99+' : item.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

interface SegmentedControlProps {
  options: TabItem[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const SegmentedControl: React.FC<SegmentedControlProps> = ({
  options,
  value,
  onChange,
  className = '',
}) => {
  return (
    <div className={classNames('flex bg-neutral-100 rounded-lg p-0.5', className)}>
      {options.map((option) => {
        const isActive = value === option.key;
        return (
          <button
            key={option.key}
            onClick={() => onChange(option.key)}
            className={classNames(
              'flex-1 py-1.5 px-2 rounded-md text-xs font-medium transition-all duration-200',
              isActive
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-neutral-500'
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
};
