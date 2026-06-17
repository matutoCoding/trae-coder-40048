import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Wrench,
  Calendar,
  User,
  ChevronRight,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Play,
  Plus,
  Factory,
} from 'lucide-react';
import { useAppStore } from '../store';
import { Card, CardContent } from '../components/common/Card';
import { StatusBadge } from '../components/common/StatusBadge';
import { FloatingButton } from '../components/common/Button';
import { Header } from '../components/layout/Header';
import { BottomNav } from '../components/layout/BottomNav';
import { ScrollTabs } from '../components/common/Tabs';
import { Input } from '../components/common/Form';
import { Empty, EmptySearch } from '../components/common/Empty';
import { classNames, formatDate } from '../utils';

const statusTabs = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待处理' },
  { key: 'in_progress', label: '进行中' },
  { key: 'completed', label: '已完成' },
  { key: 'cancelled', label: '已取消' },
];

export const MaintenanceOrderList: React.FC = () => {
  const navigate = useNavigate();
  const { maintenanceOrders, devices, user } = useAppStore();
  const [activeTab, setActiveTab] = useState('all');
  const [searchKeyword, setSearchKeyword] = useState('');

  const filteredOrders = useMemo(() => {
    let result = [...maintenanceOrders];

    if (activeTab !== 'all') {
      result = result.filter((o) => o.status === activeTab);
    }

    if (searchKeyword.trim()) {
      const keyword = searchKeyword.toLowerCase();
      result = result.filter((o) => {
        const device = devices.find((d) => d.id === o.deviceId);
        return (
          (o.orderNo || '').toLowerCase().includes(keyword) ||
          (o.description || '').toLowerCase().includes(keyword) ||
          (o.assigneeName || '').toLowerCase().includes(keyword) ||
          device?.name.toLowerCase().includes(keyword) ||
          device?.deviceNo.toLowerCase().includes(keyword)
        );
      });
    }

    return result.sort((a, b) => {
      if (a.status === 'pending' && b.status !== 'pending') return -1;
      if (a.status !== 'pending' && b.status === 'pending') return 1;
      return new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime();
    });
  }, [maintenanceOrders, devices, activeTab, searchKeyword]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: maintenanceOrders.length };
    maintenanceOrders.forEach((o) => {
      counts[o.status] = (counts[o.status] || 0) + 1;
    });
    return counts;
  }, [maintenanceOrders]);

  const overdueCount = useMemo(() => {
    return maintenanceOrders.filter(
      (o) =>
        o.status === 'pending' &&
        new Date(o.scheduledDate) < new Date() &&
        new Date(o.scheduledDate).toDateString() !== new Date().toDateString()
    ).length;
  }, [maintenanceOrders]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case '日常':
        return <Wrench size={18} />;
      case '定期':
        return <Calendar size={18} />;
      case '换季':
        return <Clock size={18} />;
      case '专项':
        return <Wrench size={18} />;
      default:
        return <Wrench size={18} />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case '日常':
        return 'bg-primary-100 text-primary-600';
      case '定期':
        return 'bg-success-100 text-success-600';
      case '换季':
        return 'bg-warning-100 text-warning-600';
      case '专项':
        return 'bg-purple-100 text-purple-600';
      default:
        return 'bg-neutral-100 text-neutral-600';
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      <Header title="保养工单" />

      <div className="px-4 py-4 space-y-4">
        {overdueCount > 0 && (
          <div className="bg-gradient-to-r from-warning-500 to-warning-600 rounded-2xl p-4 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">逾期未处理</p>
                <p className="text-3xl font-bold mt-1">{overdueCount}</p>
                <p className="text-white/70 text-xs mt-1">项保养工单已逾期</p>
              </div>
              <button
                onClick={() => setActiveTab('pending')}
                className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl text-sm font-medium active:scale-95 transition-transform"
              >
                立即处理
              </button>
            </div>
          </div>
        )}

        <div className="relative">
          <Input
            value={searchKeyword}
            onChange={setSearchKeyword}
            placeholder="搜索工单号、设备、负责人..."
            className="pl-10"
          />
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
          />
        </div>

        <ScrollTabs
          items={statusTabs.map((t) => ({
            ...t,
            badge: statusCounts[t.key] || 0,
          }))}
          activeKey={activeTab}
          onChange={setActiveTab}
        />

        {filteredOrders.length === 0 ? (
          searchKeyword ? (
            <EmptySearch keyword={searchKeyword} />
          ) : (
            <Empty
              icon={<Wrench size={32} className="text-neutral-300" />}
              title="暂无保养工单"
              description="该分类下暂无保养工单"
            />
          )
        ) : (
          <div className="space-y-3">
            {filteredOrders.map((order, index) => {
              const device = devices.find((d) => d.id === order.deviceId);
              const isOverdue =
                order.status === 'pending' &&
                new Date(order.scheduledDate) < new Date() &&
                new Date(order.scheduledDate).toDateString() !== new Date().toDateString();

              const isMine = order.assigneeId === user?.id;

              return (
                <Card
                  key={order.id}
                  onClick={() => navigate(`/maintenance-orders/${order.id}`)}
                  className="cursor-pointer active:scale-[0.99] animate-fade-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start flex-1 min-w-0">
                        <div
                          className={classNames(
                            'w-12 h-12 rounded-xl flex items-center justify-center mr-4 flex-shrink-0',
                            getTypeColor(order.maintenanceType)
                          )}
                        >
                          {getTypeIcon(order.maintenanceType)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center">
                            <span
                              className={classNames(
                                'text-xs px-2 py-0.5 rounded-full mr-2',
                                getTypeColor(order.maintenanceType)
                              )}
                            >
                              {order.maintenanceType}保养
                            </span>
                            {isMine && (
                              <span className="text-xs bg-primary-100 text-primary-600 px-2 py-0.5 rounded-full">
                                我的
                              </span>
                            )}
                          </div>
                          <h3 className="font-bold text-neutral-700 mt-1.5 truncate">
                            {device?.name || '未知设备'}
                          </h3>
                          <p className="text-xs text-neutral-500 mt-0.5 truncate">
                            {order.orderNo} · {order.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center ml-2">
                        {isOverdue && (
                          <span className="bg-danger-100 text-danger-600 text-xs px-2 py-0.5 rounded-full mr-2 flex items-center">
                            <AlertTriangle size={12} className="mr-0.5" />
                            逾期
                          </span>
                        )}
                        <StatusBadge status={order.status} />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="flex items-center text-xs text-neutral-500">
                        <Calendar size={12} className="mr-1.5 text-neutral-400" />
                        计划：{formatDate(new Date(order.scheduledDate), 'MM-DD HH:mm')}
                      </div>
                      <div className="flex items-center text-xs text-neutral-500">
                        <User size={12} className="mr-1.5 text-neutral-400" />
                        {order.assigneeName}
                      </div>
                    </div>

                    {order.actualStartDate && (
                      <div className="flex items-center text-xs text-neutral-500 mb-3">
                        <Clock size={12} className="mr-1.5 text-neutral-400" />
                        实际开始：{formatDate(new Date(order.actualStartDate), 'MM-DD HH:mm')}
                        {order.actualEndDate && (
                          <>
                            <span className="mx-2">~</span>
                            完成：{formatDate(new Date(order.actualEndDate), 'MM-DD HH:mm')}
                          </>
                        )}
                      </div>
                    )}

                    {(order.items?.length || order.tasks?.length || 0) > 0 && (
                      <div className="flex items-center text-xs text-neutral-500 mb-3">
                        <CheckCircle2 size={12} className="mr-1.5 text-success-500" />
                        保养项：{order.completedItems || 0}/{order.items?.length || order.tasks?.length || 0} 已完成
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
                      <span className="text-xs text-neutral-400">
                        创建于 {formatDate(new Date(order.createdAt), 'MM-DD')}
                      </span>

                      {(order.status === 'pending' || order.status === 'in_progress') && isMine ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/maintenance-orders/${order.id}`);
                          }}
                          className={classNames(
                            'px-3 py-1.5 rounded-lg text-xs font-medium flex items-center',
                            isOverdue
                              ? 'bg-danger-500 text-white'
                              : 'bg-primary-500 text-white'
                          )}
                        >
                          <Play size={12} className="mr-1" />
                          {order.status === 'pending' ? '开始保养' : '继续保养'}
                        </button>
                      ) : (
                        <ChevronRight size={18} className="text-neutral-300" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <FloatingButton
        icon={<Plus size={24} />}
        onClick={() => navigate('/maintenance-orders/create')}
      />

      <BottomNav active="maintenance" />
    </div>
  );
};
