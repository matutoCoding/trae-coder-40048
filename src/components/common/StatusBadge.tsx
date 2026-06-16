import React from 'react';
import { classNames } from '../../utils';

interface StatusBadgeProps {
  text?: string;
  status?: string;
  color?: string;
  dot?: boolean;
  size?: 'sm' | 'md';
  variant?: 'default' | 'light' | 'dot';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  text,
  status,
  color,
  dot = false,
  size = 'md',
  variant = 'default',
  className = '',
}) => {
  const displayText = status || text || '';
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1';
  
  let bgColor = color || 'bg-neutral-100 text-neutral-600';
  
  if (variant === 'light') {
    if (!color) {
      const statusLower = displayText.toLowerCase();
      if (statusLower.includes('运行') || statusLower.includes('正常') || statusLower.includes('完成') || statusLower.includes('已完成') || statusLower.includes('approved') || statusLower.includes('completed') || statusLower.includes('success')) {
        bgColor = 'bg-success-50 text-success-600';
      } else if (statusLower.includes('故障') || statusLower.includes('异常') || statusLower.includes('紧急') || statusLower.includes('rejected') || statusLower.includes('fault') || statusLower.includes('danger')) {
        bgColor = 'bg-danger-50 text-danger-600';
      } else if (statusLower.includes('保养') || statusLower.includes('待处理') || statusLower.includes('维修中') || statusLower.includes('pending') || statusLower.includes('warning')) {
        bgColor = 'bg-warning-50 text-warning-600';
      } else if (statusLower.includes('待机') || statusLower.includes('进行中') || statusLower.includes('in_progress') || statusLower.includes('assigned')) {
        bgColor = 'bg-primary-50 text-primary-600';
      } else {
        bgColor = 'bg-neutral-100 text-neutral-600';
      }
    }
  }

  const isDot = variant === 'dot' || dot;
  
  return (
    <span className={classNames(
      'inline-flex items-center rounded-full font-medium',
      sizeClasses,
      bgColor,
      className
    )}>
      {isDot && (
        <span className={classNames(
          'w-1.5 h-1.5 rounded-full mr-1.5',
          bgColor.includes('success') || bgColor.includes('text-success') ? 'bg-success-500' :
          bgColor.includes('warning') || bgColor.includes('text-warning') ? 'bg-warning-500' :
          bgColor.includes('danger') || bgColor.includes('text-danger') ? 'bg-danger-500' :
          bgColor.includes('primary') || bgColor.includes('text-primary') ? 'bg-primary-500' : 'bg-neutral-400'
        )} />
      )}
      {displayText}
    </span>
  );
};

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: string;
  iconColor?: string;
  iconBg?: string;
  trend?: string | { value: number; isUp: boolean };
  trendUp?: boolean;
  subValue?: string;
  subValueColor?: string;
  delay?: number;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  color = 'bg-primary-500',
  iconColor,
  iconBg,
  trend,
  trendUp,
  subValue,
  subValueColor = 'text-neutral-500',
}) => {
  let trendValue: string | undefined;
  let isTrendUp = trendUp ?? false;
  
  if (typeof trend === 'object' && trend !== null) {
    trendValue = `${trend.isUp ? '+' : '-'}${trend.value}%`;
    isTrendUp = trend.isUp;
  } else if (typeof trend === 'string') {
    trendValue = trend;
  }

  const iconWrapperClass = iconBg || iconColor || color;

  return (
    <div className="bg-white rounded-xl p-4 shadow-card">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-neutral-500 mb-1">{label}</p>
          <p className="text-2xl font-bold text-neutral-700 font-mono">{value}</p>
          {subValue && (
            <p className={classNames('text-xs mt-1', subValueColor)}>{subValue}</p>
          )}
          {trendValue && (
            <p className={classNames(
              'text-xs mt-1',
              isTrendUp ? 'text-success-600' : 'text-danger-600'
            )}>
              {isTrendUp ? '↑' : '↓'} {trendValue}
            </p>
          )}
        </div>
        {icon && (
          <div className={classNames(
            'w-10 h-10 rounded-lg flex items-center justify-center',
            iconWrapperClass.includes('text-') ? iconWrapperClass : `${iconWrapperClass} text-white`
          )}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

interface ProgressBarProps {
  value?: number;
  progress?: number;
  max?: number;
  color?: string;
  showLabel?: boolean;
  height?: string | number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  progress,
  max = 100,
  color = 'bg-primary-500',
  showLabel = false,
  height,
}) => {
  const currentValue = progress ?? value ?? 0;
  const percentage = Math.min(Math.max((currentValue / max) * 100, 0), 100);
  
  let heightClass = 'h-2';
  if (typeof height === 'number') {
    heightClass = `h-[${height}px]`;
  } else if (typeof height === 'string') {
    heightClass = height.startsWith('h-') ? height : `h-[${height}px]`;
  }
  
  let barColor = color;
  if (color === 'success') barColor = 'bg-success-500';
  if (color === 'warning') barColor = 'bg-warning-500';
  if (color === 'danger') barColor = 'bg-danger-500';
  if (color === 'primary') barColor = 'bg-primary-500';
  
  return (
    <div className="w-full">
      <div className={classNames(
        'w-full bg-neutral-100 rounded-full overflow-hidden',
        heightClass
      )}>
        <div
          className={classNames(
            'h-full rounded-full transition-all duration-500 ease-out',
            barColor
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <p className="text-xs text-neutral-500 mt-1 text-right">{Math.round(percentage)}%</p>
      )}
    </div>
  );
};

interface TagProps {
  children: React.ReactNode;
  color?: string;
  size?: 'sm' | 'md';
}

export const Tag: React.FC<TagProps> = ({
  children,
  color = 'bg-neutral-100 text-neutral-600',
  size = 'sm',
}) => {
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1';
  
  return (
    <span className={classNames(
      'inline-flex items-center rounded-md',
      sizeClasses,
      color
    )}>
      {children}
    </span>
  );
};
