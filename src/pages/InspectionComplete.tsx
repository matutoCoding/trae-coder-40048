import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Home,
  ClipboardList,
  QrCode,
  ArrowRight,
  AlertCircle,
  Factory,
} from 'lucide-react';
import { Card, CardContent } from '../components/common/Card';
import { Header } from '../components/layout/Header';
import { Button } from '../components/common/Button';
import { classNames } from '../utils';

export const InspectionComplete: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const stateData = (location.state as {
    deviceId?: string;
    deviceName?: string;
    stats?: {
      normal: number;
      abnormal: number;
      skipped: number;
      total: number;
    };
    abnormalCount?: number;
  }) || {};

  const deviceName = stateData.deviceName || '设备';
  const stats = stateData.stats || { normal: 0, abnormal: 0, skipped: 0, total: 0 };
  const abnormalCount = stateData.abnormalCount ?? 0;
  const deviceId = stateData.deviceId;

  const isSuccess = abnormalCount === 0;

  const quickActions = [
    ...(deviceId
      ? [
          {
            icon: <Factory size={20} />,
            label: '返回设备详情',
            color: 'bg-neutral-600',
            onClick: () => navigate(`/devices/${deviceId}`),
          },
        ]
      : []),
    {
      icon: <Home size={20} />,
      label: '返回首页',
      color: 'bg-primary-500',
      onClick: () => navigate('/'),
    },
    {
      icon: <ClipboardList size={20} />,
      label: '点检计划',
      color: 'bg-success-500',
      onClick: () => navigate('/inspection-plans'),
    },
    {
      icon: <QrCode size={20} />,
      label: '继续扫码',
      color: 'bg-warning-500',
      onClick: () => navigate('/scan'),
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <Header title="点检完成" showBack={false} />

      <div className="flex-1 px-4 py-8 flex flex-col items-center justify-center">
        <div className="text-center mb-8 animate-fade-in">
          <div
            className={classNames(
              'w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6',
              isSuccess
                ? 'bg-success-100 animate-pulse-soft'
                : 'bg-warning-100'
            )}
          >
            {isSuccess ? (
              <CheckCircle2 size={48} className="text-success-500" />
            ) : (
              <AlertTriangle size={48} className="text-warning-500" />
            )}
          </div>

          <h1 className="text-2xl font-bold text-neutral-700 mb-2">
            {isSuccess ? '点检完成！' : '点检完成，发现异常'}
          </h1>
          <p className="text-neutral-500">
            {deviceName} 点检已完成
          </p>
        </div>

        <Card className="w-full max-w-sm mb-8 animate-slide-up">
          <CardContent className="p-6">
            <h3 className="font-bold text-neutral-700 mb-4 text-center">点检结果统计</h3>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <CheckCircle2 size={24} className="text-success-500" />
                </div>
                <p className="text-2xl font-bold text-success-600">{stats.normal}</p>
                <p className="text-xs text-neutral-500">正常</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-danger-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <XCircle size={24} className="text-danger-500" />
                </div>
                <p className="text-2xl font-bold text-danger-600">{stats.abnormal}</p>
                <p className="text-xs text-neutral-500">异常</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-warning-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <AlertTriangle size={24} className="text-warning-500" />
                </div>
                <p className="text-2xl font-bold text-warning-600">{stats.skipped}</p>
                <p className="text-xs text-neutral-500">跳过</p>
              </div>
            </div>

            <div className="bg-neutral-50 rounded-xl p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-neutral-600">点检项总数</span>
                <span className="font-bold text-neutral-700">{stats.total} 项</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-600">完成率</span>
                <span className="font-bold text-primary-600">
                  {stats.total > 0
                    ? Math.round(((stats.normal + stats.abnormal + stats.skipped) / stats.total) * 100)
                    : 0}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {!isSuccess && (
          <Card className="w-full max-w-sm mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <CardContent className="p-4">
              <div className="flex items-start">
                <div className="w-10 h-10 bg-warning-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                  <AlertCircle size={20} className="text-warning-500" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-neutral-700 text-sm">
                    检测到 {stats.abnormal} 项异常
                  </p>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    设备状态已自动更新为"保养中"，请尽快安排处理
                  </p>
                  <button
                    onClick={() => navigate('/maintenance-orders')}
                    className="mt-3 text-sm text-primary-500 font-medium flex items-center"
                  >
                    创建保养工单
                    <ArrowRight size={14} className="ml-1" />
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="w-full max-w-sm space-y-3 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              className="w-full flex items-center p-4 bg-white rounded-xl shadow-card active:scale-[0.99] transition-transform"
            >
              <div
                className={`w-12 h-12 ${action.color} text-white rounded-xl flex items-center justify-center mr-4`}
              >
                {action.icon}
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-neutral-700">{action.label}</p>
              </div>
              <ArrowRight size={20} className="text-neutral-300" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
