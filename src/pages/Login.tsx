import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Factory, Lock, User, Eye, EyeOff } from 'lucide-react';
import { useAppStore } from '../store';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Form';
import { classNames } from '../utils';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAppStore();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('请输入用户名');
      return;
    }
    if (!password.trim()) {
      setError('请输入密码');
      return;
    }

    const success = await login(username.trim(), password.trim());
    if (success) {
      navigate('/dashboard');
    } else {
      setError('用户名或密码错误');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6 animate-fade-in">
          <Factory size={40} className="text-white" />
        </div>
        
        <h1 className="text-2xl font-bold text-white mb-1 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          数控机床点检系统
        </h1>
        <p className="text-white/70 text-sm mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          设备科智能管理平台
        </p>

        <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 animate-slide-up">
          <h2 className="text-xl font-bold text-neutral-700 mb-6 text-center">
            账号登录
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Input
                label="用户名"
                value={username}
                onChange={setUsername}
                placeholder="请输入用户名"
                required
                className="pl-10"
              />
              <User
                size={18}
                className="absolute left-3 top-9 text-neutral-400"
              />
            </div>

            <div className="relative">
              <Input
                label="密码"
                value={password}
                onChange={setPassword}
                type={showPassword ? 'text' : 'password'}
                placeholder="请输入密码"
                required
                className="pl-10 pr-10"
              />
              <Lock
                size={18}
                className="absolute left-3 top-9 text-neutral-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-neutral-400 hover:text-neutral-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {error && (
              <div className="bg-danger-50 text-danger-600 text-sm px-3 py-2 rounded-lg">
                {error}
              </div>
            )}

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center text-neutral-600">
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 text-primary-500 rounded border-neutral-300 focus:ring-primary-300 mr-2"
                />
                记住账号
              </label>
              <button type="button" className="text-primary-500 hover:text-primary-600">
                忘记密码？
              </button>
            </div>

            <Button
              type="submit"
              size="full"
              loading={isLoading}
              className="mt-2"
            >
              登 录
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-neutral-100">
            <p className="text-xs text-center text-neutral-400 mb-3">
              演示账号
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className={classNames(
                'px-2 py-1.5 rounded-lg text-center',
                'bg-primary-50 text-primary-600'
              )}>
                管理员: admin / 123456
              </div>
              <div className={classNames(
                'px-2 py-1.5 rounded-lg text-center',
                'bg-success-50 text-success-600'
              )}>
                工程师: engineer1 / 123456
              </div>
              <div className={classNames(
                'px-2 py-1.5 rounded-lg text-center',
                'bg-warning-50 text-warning-600'
              )}>
                点检员: inspector1 / 123456
              </div>
              <div className={classNames(
                'px-2 py-1.5 rounded-lg text-center',
                'bg-neutral-100 text-neutral-600'
              )}>
                操作员: operator1 / 123456
              </div>
            </div>
          </div>
        </div>

        <p className="mt-6 text-white/50 text-xs">
          © 2025 数控机床点检管理系统 v1.0
        </p>
      </div>
    </div>
  );
};
