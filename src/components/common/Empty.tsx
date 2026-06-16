import React from 'react';
import { Inbox, Search, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';
import { Button } from './Button';
import { classNames } from '../../utils';

interface EmptyProps {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const Empty: React.FC<EmptyProps> = ({
  icon,
  title = '暂无数据',
  description,
  action,
  className = '',
}) => {
  return (
    <div className={classNames(
      'flex flex-col items-center justify-center py-12 px-4 text-center',
      className
    )}>
      <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
        {icon || <Inbox size={32} className="text-neutral-300" />}
      </div>
      <h3 className="text-base font-medium text-neutral-700 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-neutral-400 mb-4">{description}</p>
      )}
      {action && (
        <Button
          variant="primary"
          size="sm"
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      )}
    </div>
  );
};

export const EmptySearch: React.FC<{ keyword?: string }> = ({ keyword }) => (
  <Empty
    icon={<Search size={32} className="text-neutral-300" />}
    title="未找到相关结果"
    description={keyword ? `"${keyword}" 没有匹配的内容` : '请输入关键词搜索'}
  />
);

export const EmptyError: React.FC<{ onRetry?: () => void }> = ({ onRetry }) => (
  <Empty
    icon={<AlertCircle size={32} className="text-neutral-300" />}
    title="加载失败"
    description="网络异常，请稍后重试"
    action={onRetry ? { label: '重新加载', onClick: onRetry } : undefined}
  />
);

export const EmptyList: React.FC<{ type?: string; onCreate?: () => void }> = ({
  type = '内容',
  onCreate,
}) => (
  <Empty
    icon={<Inbox size={32} className="text-neutral-300" />}
    title={`暂无${type}`}
    description={`还没有创建任何${type}，点击下方按钮创建`}
    action={onCreate ? { label: `新建${type}`, onClick: onCreate } : undefined}
  />
);

export const EmptyTask: React.FC = () => (
  <Empty
    icon={<CheckCircle2 size={32} className="text-success-400" />}
    title="暂无待办事项"
    description="所有任务都已完成，太棒了！"
  />
);

export const EmptyMaintenance: React.FC = () => (
  <Empty
    icon={<Clock size={32} className="text-neutral-300" />}
    title="暂无保养工单"
    description="当前没有需要处理的保养工单"
  />
);

interface SkeletonProps {
  className?: string;
  height?: number | string;
  width?: number | string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', height, width }) => {
  const style: React.CSSProperties = {};
  if (height !== undefined) style.height = typeof height === 'number' ? `${height}px` : height;
  if (width !== undefined) style.width = typeof width === 'number' ? `${width}px` : width;
  
  return (
    <div 
      className={classNames(
        'animate-pulse bg-neutral-200 rounded',
        className
      )}
      style={style}
    />
  );
};

export const SkeletonCard: React.FC = () => (
  <div className="bg-white rounded-xl p-4 shadow-card animate-pulse">
    <div className="flex items-start space-x-3">
      <Skeleton className="w-12 h-12 rounded-lg" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    </div>
    <div className="mt-4 space-y-2">
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-5/6" />
    </div>
  </div>
);

export const SkeletonList: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div className={classNames('flex items-center justify-center', className)}>
      <svg
        className={classNames('animate-spin text-primary-500', sizeClasses[size])}
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        />
      </svg>
    </div>
  );
};

interface LoadingOverlayProps {
  text?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ text }) => (
  <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-50">
    <LoadingSpinner size="lg" />
    {text && <p className="mt-3 text-sm text-neutral-500">{text}</p>}
  </div>
);
