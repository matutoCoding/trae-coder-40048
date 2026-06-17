import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  AlertTriangle,
  Calendar,
  User,
  ChevronRight,
  Clock,
  CheckCircle2,
  Play,
  Plus,
  Factory,
  AlertCircle,
  Wrench,
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
import { classNames, formatDate, getPriorityColor, getPriorityText } from '../utils';

const statusTabs = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待处理' },
  { key: 'in_progress', label: '维修中' },
  { key: 'completed', label: '已完成' },
  { key: 'cancelled', label: '已取消' },
];

export const RepairList: React.FC = () => {
  const navigate = useNavigate();
  const { repairOrders, devices, user } = useAppStore();
  const [activeTab, setActiveTab] = useState('all');
  const [searchKeyword, setSearchKeyword] = useState('');

  const filteredOrders = useMemo(() => {
    let result = [...repairOrders];

    if (activeTab !== 'all') {
      result = result.filter((o) => o.status === activeTab);
    }

    if (searchKeyword.trim()) {
      const keyword = searchKeyword.toLowerCase();
      result = result.filter((o) => {
        const device = devices.find((d) => d.id === o.deviceId);
        return (
          o.orderNo.toLowerCase().includes(keyword) ||
          o.faultDescription.toLowerCase().includes(keyword) ||
          o.reporterName.toLowerCase().includes(keyword) ||
          o.assigneeName?.toLowerCase().includes(keyword) ||
          device?.name.toLowerCase().includes(keyword) ||
          device?.deviceNo.toLowerCase().includes(keyword)
        );
      });
    }

    return result.sort((a, b) => {
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      if (a.status === 'pending' && b.status !== 'pending') return -1;
      if (a.status !== 'pending' && b.status === 'pending') return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [repairOrders, devices, activeTab, searchKeyword]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: repairOrders.length };
    repairOrders.forEach((o) => {
      counts[o.status] = (counts[o.status] || 0) + 1;
    });
    return counts;
  }, [repairOrders]);

  const urgentCount = useMemo(() => {
    return repairOrders.filter(
      (o) => o.priority === 'urgent' && o.status !== 'completed' && o.status !== 'cancelled'
    ).length;
  }, [repairOrders]);

  const getFaultTypeIcon = (type: string) => {
    switch (type) {
      case '电气故障':
        return <Wrench size={18} />;
      case '机械故障':
        return <Factory size={18} />;
      case '液压故障':
        return <AlertTriangle size={18} />;
      case '操作故障':
        return <AlertCircle size={18} />;
      default:
        return <AlertTriangle size={18} />;
    }
  };

  const getFaultTypeColor = (type: string) => {
    switch (type) {
      case '电气故障':
        return 'bg-yellow-100 text-yellow-600';
      case '机械故障':
        return 'bg-blue-100 text-blue-600';
      case '液压故障':
        return 'bg-cyan-100 text-cyan-600';
      case '操作故障':
        return 'bg-purple-100 text-purple-600';
      default:
        return 'bg-neutral-100 text-neutral-600';
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      <Header title="维修工单" />

      <div className="px-4 py-4 space-y-4">
        {urgentCount > 0 && (
          <div className="bg-gradient-to-r from-danger-500 to-danger-600 rounded-2xl p-4 text-white shadow-lg animate-pulse-soft">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm flex items-center">
                  <AlertTriangle size={14} className="mr-1" />
                  紧急报修
                </p>
                <p className="text-3xl font-bold mt-1">{urgentCount}</p>
                <p className="text-white/70 text-xs mt-1">项紧急维修待处理</p>
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
            placeholder="搜索工单号、设备、故障描述..."
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
              icon={<AlertTriangle size={32} className="text-neutral-300" />}
              title="暂无维修工单"
              description="该分类下暂无维修工单"
            />
          )
        ) : (
          <div className="space-y-3">
            {filteredOrders.map((order, index) => {
              const device = devices.find((d) => d.id === order.deviceId);
              const isMine = order.assigneeId === user?.id;
              const isReporter = order.reporterId === user?.id;

              return (
                <Card
                  key={order.id}
                  onClick={() => navigate(`/repair-orders/${order.id}`)}
                  className="cursor-pointer active:scale-[0.99] animate-fade-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start flex-1 min-w-0">
                        <div
                          className={classNames(
                            'w-12 h-12 rounded-xl flex items-center justify-center mr-4 flex-shrink-0',
                            getFaultTypeColor(order.faultType)
                          )}
                        >
                          {getFaultTypeIcon(order.faultType)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center flex-wrap">
                            <span
                              className={classNames(
                                'text-xs px-2 py-0.5 rounded-full mr-2',
                                getFaultTypeColor(order.faultType)
                              )}
                            >
                              {order.faultType}
                            </span>
                            <span
                              className={classNames(
                                'text-xs px-2 py-0.5 rounded-full mr-2',
                                getPriorityColor(order.priority)
                              )}
                            >
                              {getPriorityText(order.priority)}
                            </span>
                            {isMine && (
                              <span className="text-xs bg-primary-100 text-primary-600 px-2 py-0.5 rounded-full mr-2">
                                我的
                              </span>
                            )}
                            {isReporter && (
                              <span className="text-xs bg-success-100 text-success-600 px-2 py-0.5 rounded-full">
                                我上报
                              </span>
                            )}
                          </div>
                          <h3 className="font-bold text-neutral-700 mt-1.5 truncate">
                            {device?.name || '未知设备'}
                          </h3>
                          <p className="text-xs text-neutral-500 mt-0.5 truncate">
                            {order.orderNo} · {order.faultDescription}
                          </p>
                        </div>
                      </div>
                      <StatusBadge status={order.status} className="ml-2 flex-shrink-0" />
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="flex items-center text-xs text-neutral-500">
                        <User size={12} className="mr-1.5 text-neutral-400" />
                        上报：{order.reporterName}
                      </div>
                      <div className="flex items-center text-xs text-neutral-500">
                        <Calendar size={12} className="mr-1.5 text-neutral-400" />
                        {formatDate(new Date(order.createdAt), 'MM-DD HH:mm')}
                      </div>
                    </div>

                    {order.assigneeName && (
                      <div className="flex items-center text-xs text-neutral-500 mb-3">
                        <User size={12} className="mr-1.5 text-neutral-400" />
                        维修：{order.assigneeName}
                        {order.actualStartDate && (
                          <>
                            <span className="mx-2">·</span>
                            <Clock size={12} className="mr-1.5 text-neutral-400" />
                            {formatDate(new Date(order.actualStartDate), 'MM-DD HH:mm')}
                            {order.actualEndDate && (
                              <>
                                <span className="mx-1">~</span>
                                {formatDate(new Date(order.actualEndDate), 'MM-DD HH:mm')}
                              </>
                            )}
                          </>
                        )}
                      </div>
                    )}

                    {order.diagnosis && (
                      <div className="flex items-start text-xs text-neutral-500 mb-3">
                        <Wrench size={12} className="mr-1.5 text-neutral-400 mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-2">诊断：{order.diagnosis}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
                      <span className="text-xs text-neutral-400">
                        {order.estimatedDowntime && `预计停机 ${order.estimatedDowntime} 小时`}
                      </span>

                      {(order.status === 'pending' || order.status === 'in_progress') &&
                      (isMine || user?.role === 'admin') ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/repair-orders/${order.id}`);
                          }}
                          className={classNames(
                            'px-3 py-1.5 rounded-lg text-xs font-medium flex items-center',
                            order.priority === 'urgent'
                              ? 'bg-danger-500 text-white'
                              : 'bg-primary-500 text-white'
                          )}
                        >
                          <Play size={12} className="mr-1" />
                          {order.status === 'pending' ? '开始维修' : '继续维修'}
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
        onClick={() => navigate('/repair-orders/create')}
      />

      <BottomNav active="repair" />
    </div>
  );
};
