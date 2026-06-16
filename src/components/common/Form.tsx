import React, { useState } from 'react';
import { ChevronDown, Camera, X } from 'lucide-react';
import { classNames } from '../../utils';

interface InputProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'number' | 'password' | 'textarea';
  required?: boolean;
  error?: string;
  disabled?: boolean;
  className?: string;
  rows?: number;
  suffix?: string;
  prefix?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  required = false,
  error,
  disabled = false,
  className = '',
  rows = 3,
  suffix,
  prefix,
}) => {
  const inputClasses = classNames(
    'flex-1 px-3 py-2.5 rounded-lg border text-sm transition-colors',
    'focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-500',
    error ? 'border-danger-500 bg-danger-50' : 'border-neutral-200',
    disabled ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed' : 'bg-white',
    type === 'textarea' ? 'resize-none' : ''
  );

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-neutral-700 mb-1.5">
          {label}
          {required && <span className="text-danger-500 ml-1">*</span>}
        </label>
      )}
      {(suffix || prefix) && type !== 'textarea' ? (
        <div className="flex items-center">
          {prefix && (
            <span className="px-3 py-2.5 bg-neutral-100 border border-r-0 border-neutral-200 rounded-l-lg text-sm text-neutral-500">
              {prefix}
            </span>
          )}
          <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className={classNames(
              inputClasses,
              prefix ? 'rounded-l-none' : '',
              suffix ? 'rounded-r-none' : ''
            )}
          />
          {suffix && (
            <span className="px-3 py-2.5 bg-neutral-100 border border-l-0 border-neutral-200 rounded-r-lg text-sm text-neutral-500">
              {suffix}
            </span>
          )}
        </div>
      ) : type === 'textarea' ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          rows={rows}
          className={inputClasses}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={inputClasses}
        />
      )}
      {error && <p className="text-xs text-danger-500 mt-1">{error}</p>}
    </div>
  );
};

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder = '请选择',
  required = false,
  error,
  disabled = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(o => o.value === value);

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-neutral-700 mb-1.5">
          {label}
          {required && <span className="text-danger-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={classNames(
            'w-full px-3 py-2.5 rounded-lg border text-sm text-left transition-colors flex items-center justify-between',
            'focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-500',
            error ? 'border-danger-500 bg-danger-50' : 'border-neutral-200',
            disabled ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed' : 'bg-white'
          )}
        >
          <span className={selectedOption ? 'text-neutral-700' : 'text-neutral-400'}>
            {selectedOption?.label || placeholder}
          </span>
          <ChevronDown size={16} className={classNames(
            'text-neutral-400 transition-transform duration-200',
            isOpen ? 'rotate-180' : ''
          )} />
        </button>
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-neutral-200 rounded-lg shadow-card-hover max-h-48 overflow-y-auto">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={classNames(
                  'w-full px-3 py-2.5 text-sm text-left transition-colors',
                  'hover:bg-primary-50 hover:text-primary-600',
                  option.value === value ? 'bg-primary-50 text-primary-600 font-medium' : 'text-neutral-700'
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
      {error && <p className="text-xs text-danger-500 mt-1">{error}</p>}
    </div>
  );
};

interface SliderProps {
  label?: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  className?: string;
}

export const Slider: React.FC<SliderProps> = ({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  unit = '',
  className = '',
}) => {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={className}>
      {label && (
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-neutral-700">{label}</label>
          <span className="text-sm font-mono text-primary-600 font-medium">
            {value}{unit}
          </span>
        </div>
      )}
      <div className="relative h-2 bg-neutral-200 rounded-full">
        <div
          className="absolute h-full bg-primary-500 rounded-full"
          style={{ width: `${percentage}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div
          className="absolute w-5 h-5 bg-white border-2 border-primary-500 rounded-full shadow-md -translate-x-1/2 -translate-y-1/2 top-1/2 pointer-events-none"
          style={{ left: `${percentage}%` }}
        />
      </div>
      <div className="flex justify-between mt-1 text-xs text-neutral-400">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
};

interface ImageUploadProps {
  label?: string;
  images?: string[];
  value?: string[];
  onChange: (images: string[]) => void;
  maxCount?: number;
  className?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  label,
  images,
  value,
  onChange,
  maxCount = 9,
  className = '',
}) => {
  const currentImages = value || images || [];
  
  const handleAdd = () => {
    if (currentImages.length >= maxCount) return;
    const fakeImage = `/images/upload-${Date.now()}.jpg`;
    onChange([...currentImages, fakeImage]);
  };

  const handleRemove = (index: number) => {
    const newImages = currentImages.filter((_, i) => i !== index);
    onChange(newImages);
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          {label}
        </label>
      )}
      <div className="grid grid-cols-4 gap-2">
        {currentImages.map((image, index) => (
          <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-neutral-100">
            <img
              src={image}
              alt={`上传图片${index + 1}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect fill="%23e5e6eb" width="100" height="100"/%3E%3Ctext x="50" y="55" text-anchor="middle" fill="%2386909c" font-size="12"%3E图片%3C/text%3E%3C/svg%3E';
              }}
            />
            <button
              onClick={() => handleRemove(index)}
              className="absolute top-1 right-1 w-5 h-5 bg-danger-500 text-white rounded-full flex items-center justify-center"
            >
              <X size={12} />
            </button>
          </div>
        ))}
        {currentImages.length < maxCount && (
          <button
            onClick={handleAdd}
            className="aspect-square rounded-lg border-2 border-dashed border-neutral-300 flex flex-col items-center justify-center text-neutral-400 hover:border-primary-500 hover:text-primary-500 transition-colors"
          >
            <Camera size={24} />
            <span className="text-xs mt-1">添加</span>
          </button>
        )}
      </div>
    </div>
  );
};

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  className?: string;
}

export const Switch: React.FC<SwitchProps> = ({
  checked,
  onChange,
  disabled = false,
  label,
  className = '',
}) => {
  return (
    <div className={classNames('flex items-center justify-between', className)}>
      {label && <span className="text-sm text-neutral-700">{label}</span>}
      <button
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        className={classNames(
          'relative w-12 h-6 rounded-full transition-colors duration-200',
          checked ? 'bg-primary-500' : 'bg-neutral-300',
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        )}
      >
        <span
          className={classNames(
            'absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200',
            checked ? 'translate-x-6' : 'translate-x-0.5'
          )}
        />
      </button>
    </div>
  );
};

interface RadioGroupProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  className?: string;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  label,
  value,
  onChange,
  options,
  className = '',
}) => {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          {label}
        </label>
      )}
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={classNames(
              'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border',
              value === option.value
                ? 'bg-primary-500 text-white border-primary-500 shadow-button'
                : 'bg-white text-neutral-600 border-neutral-200 hover:border-primary-300 hover:text-primary-500'
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};
