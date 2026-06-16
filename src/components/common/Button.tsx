import React from 'react';
import { classNames } from '../../utils';

type ButtonVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'ghost' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg' | 'full';

interface ButtonProps {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700 shadow-button',
  secondary: 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 active:bg-neutral-300',
  success: 'bg-success-500 text-white hover:bg-success-600 active:bg-success-700',
  warning: 'bg-warning-500 text-white hover:bg-warning-600 active:bg-warning-700',
  danger: 'bg-danger-500 text-white hover:bg-danger-600 active:bg-danger-700',
  ghost: 'bg-transparent text-primary-500 hover:bg-primary-50 active:bg-primary-100',
  outline: 'bg-transparent border border-primary-500 text-primary-500 hover:bg-primary-50 active:bg-primary-100',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'text-sm px-3 py-1.5 h-8',
  md: 'text-sm px-4 py-2 h-10',
  lg: 'text-base px-6 py-3 h-12',
  full: 'text-base px-4 py-3 h-12 w-full',
};

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  className = '',
  type = 'button',
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={classNames(
        'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-primary-300',
        'active:scale-[0.96]',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {!loading && icon && iconPosition === 'left' && <span className="mr-2">{icon}</span>}
      {children}
      {!loading && icon && iconPosition === 'right' && <span className="ml-2">{icon}</span>}
    </button>
  );
};

interface IconButtonProps {
  icon: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  onClick,
  variant = 'ghost',
  size = 'md',
  disabled = false,
  className = '',
}) => {
  const variantStyles: Record<string, string> = {
    primary: 'bg-primary-500 text-white hover:bg-primary-600',
    secondary: 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200',
    ghost: 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700',
  };

  const sizeStyles: Record<string, string> = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={classNames(
        'flex items-center justify-center rounded-lg transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-primary-300',
        'active:scale-[0.96]',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {icon}
    </button>
  );
};

interface FloatingButtonProps {
  icon: React.ReactNode;
  onClick?: () => void;
  label?: string;
  position?: 'bottom-right' | 'bottom-center';
}

export const FloatingButton: React.FC<FloatingButtonProps> = ({
  icon,
  onClick,
  label,
  position = 'bottom-right',
}) => {
  const positionClasses: Record<string, string> = {
    'bottom-right': 'right-4 bottom-20',
    'bottom-center': 'left-1/2 -translate-x-1/2 bottom-20',
  };

  return (
    <button
      onClick={onClick}
      className={classNames(
        'fixed z-40 flex items-center space-x-2 px-4 py-3',
        'bg-primary-500 text-white rounded-full shadow-lg',
        'hover:bg-primary-600 active:bg-primary-700 transition-all duration-200',
        'active:scale-[0.96]',
        positionClasses[position]
      )}
    >
      {icon}
      {label && <span className="font-medium">{label}</span>}
    </button>
  );
};
