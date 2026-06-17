import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  ClipboardList,
  Calendar,
  Clock,
  ChevronRight,
  User,
  Play,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { useAppStore } from '../store';
import { Card, CardContent } from '../components/common/Card';
import { StatusBadge } from '../components/common/StatusBadge';
import { Header } from '../components/layout/Header';
import { BottomNav } from '../components/layout/BottomNav';
import { ScrollTabs, SegmentedControl } from '../components/common/Tabs';
import { Input } from '../components/common/Form';
import { Empty, EmptySearch } from '../components/common/Empty';
import { classNames, formatDate } from '../utils';
import type { InspectionPlanStatus } from '../types';

const statusTabs = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待执行' },
  { key: 'in_progress', label: '进行中' },
  { key: 'completed', label: '已完成' },
  { key: 'cancelled', label: '已取消' },
];

const cycleTabs = [
  { key: 'all', label: '全部' },
  { key: 'daily', label: '日检' },
  { key: 'weekly', label: '周检' },
  { key: 'monthly', label: '月检' },
];

const cycleLabelMap: Record<string, string> = {
  daily: '日检',
  weekly: '周检',
  monthly: '月检',
  quarterly: '季检',
};

export const InspectionPlanList: React.FC = () => {
  const navigate = useNavigate();
  const { inspectionPlans, devices, inspectionRecords } = useAppStore();
  const [activeTab, setActiveTab] = useState('all');
  const [activeCycle, setActiveCycle] = useState('all');
  const [searchKeyword, setSearchKeyword] = useState('');

  const filteredPlans = useMemo(() => {
    let result = [...inspectionPlans];

    if (activeCycle !== 'all') {
      result = result.filter((p) => p.cycle === activeCycle);
    }

    if (activeTab !== 'all') {
      result = result.filter((p) => p.status === activeTab);
    }

    if (searchKeyword.trim()) {
      const keyword = searchKeyword.toLowerCase();
      result = result.filter((p) => {
        const device = devices.find((d) => d.id === p.deviceId);
        const name = (p.name || '').toLowerCase();
        const inspectionType = (p.inspectionType || cycleLabelMap[p.cycle] || '').toLowerCase();
        const assigneeName = (p.assigneeName || p.executorName || '').toLowerCase();
        const deviceName = (device?.name || '').toLowerCase();
        const deviceNo = (device?.deviceNo || '').toLowerCase();
        return (
          name.includes(keyword) ||
          inspectionType.includes(keyword) ||
          assigneeName.includes(keyword) ||
          deviceName.includes(keyword) ||
          deviceNo.includes(keyword)
        );
      });
    }

    return result.sort((a, b) => {
      if (a.status === 'pending' && b.status !== 'pending') return -1;
      if (a.status !== 'pending' && b.status === 'pending') return 1;
      return new Date(b.scheduledDate || b.createdAt).getTime() - new Date(a.scheduledDate || a.createdAt).getTime();
    });
  }, [inspectionPlans, devices, activeTab, activeCycle, searchKeyword]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: inspectionPlans.length };
    inspectionPlans.forEach((p) => {
      counts[p.status] = (counts[p.status] || 0) + 1;
    });
    return counts;
  }, [inspectionPlans]);

  const todayCount = useMemo(() => {
    const today = new Date().toDateString();
    return inspectionPlans.filter(
      (p) =>
        new Date(p.scheduledDate).toDateString() === today &&
        (p.status === 'pending' || p.status === 'in_progress')
    ).length;
  }, [inspectionPlans]);

  const getCompletionStats = (planId: string) => {
    const records = inspectionRecords.filter(
      (r) => r.inspectionPlanId === planId || r.planId === planId
    );
    const completed = records.filter(
      (r) => r.status === 'completed' || r.status === 'normal' || r.status === 'completed_with_issues'
    ).length;
    const abnormal = records
      .filter(
        (r) =>
          r.status === 'completed' ||
          r.status === 'normal' ||
          r.status === 'completed_with_issues' ||
          r.status === 'abnormal'
      )
      .flatMap((r) => r.results || r.items || [])
      .filter((r) => r && r.status === 'abnormal').length;
    return { completed, abnormal, total: records.length };
  };

  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      <Header title="点检计划" />

      <div className="px-4 py-4 space-y-4">
        {todayCount > 0 && (
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-4 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">今日待点检</p>
                <p className="text-3xl font-bold mt-1">{todayCount}</p>
                <p className="text-white/70 text-xs mt-1">项点检任务待执行</p>
              </div>
              <button
                onClick={() => navigate('/scan')}
                className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl text-sm font-medium flex items-center active:scale-95 transition-transform"
              >
                <Play size={16} className="mr-1.5" />
                立即执行
              </button>
            </div>
          </div>
        )}

        <div className="relative">
          <Input
            value={searchKeyword}
            onChange={setSearchKeyword}
            placeholder="搜索计划名称、设备、负责人..."
            className="pl-10"
          />
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-neutral-600 font-medium">周期筛选</span>
          <SegmentedControl
            options={cycleTabs}
            value={activeCycle}
            onChange={setActiveCycle}
            className="w-64"
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

        {filteredPlans.length === 0 ? (
          searchKeyword ? (
            <EmptySearch keyword={searchKeyword} />
          ) : (
            <Empty
              icon={<ClipboardList size={32} className="text-neutral-300" />}
              title="暂无点检计划"
              description="该分类下暂无点检计划"
            />
          )
        ) : (
          <div className="space-y-3">
            {filteredPlans.map((plan, index) => {
              const device = devices.find((d) => d.id === plan.deviceId);
              const stats = getCompletionStats(plan.id);
              const isOverdue =
                plan.status === 'pending' &&
                new Date(plan.scheduledDate) < new Date() &&
                new Date(plan.scheduledDate).toDateString() !== new Date().toDateString();

              return (
                <Card
                  key={plan.id}
                  onClick={() => navigate(`/inspection-plans/${plan.id}`)}
                  className="cursor-pointer active:scale-[0.99] animate-fade-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-neutral-700 truncate">
                          {plan.name}
                        </h3>
                        <p className="text-xs text-neutral-500 mt-0.5">
                          {device?.name || '未知设备'} · {plan.inspectionType || cycleLabelMap[plan.cycle] || '日常'}点检
                        </p>
                      </div>
                      <div className="flex items-center ml-2">
                        {isOverdue && (
                          <span className="bg-danger-100 text-danger-600 text-xs px-2 py-0.5 rounded-full mr-2 flex items-center">
                            <AlertCircle size={12} className="mr-0.5" />
                            逾期
                          </span>
                        )}
                        <StatusBadge status={plan.status} />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="flex items-center text-xs text-neutral-500">
                        <Calendar size={12} className="mr-1.5 text-neutral-400" />
                        计划：{formatDate(new Date(plan.scheduledDate), 'MM-DD HH:mm')}
                      </div>
                      <div className="flex items-center text-xs text-neutral-500">
                        <User size={12} className="mr-1.5 text-neutral-400" />
                        {plan.assigneeName || plan.executorName || '未分配'}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
                      <div className="flex items-center space-x-4">
                        {stats.total > 0 && (
                          <>
                            <span className="text-xs text-neutral-500 flex items-center">
                              <CheckCircle2 size={12} className="mr-1 text-success-500" />
                              {stats.completed}/{stats.total} 项
                            </span>
                            {stats.abnormal > 0 && (
                              <span className="text-xs text-danger-600 flex items-center">
                                <XCircle size={12} className="mr-1" />
                                {stats.abnormal} 项异常
                              </span>
                            )}
                          </>
                        )}
                      </div>

                      {plan.status === 'pending' || plan.status === 'in_progress' ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/inspection/execute/${plan.deviceId}`);
                          }}
                          className={classNames(
                            'px-3 py-1.5 rounded-lg text-xs font-medium flex items-center',
                            isOverdue
                              ? 'bg-danger-500 text-white'
                              : 'bg-primary-500 text-white'
                          )}
                        >
                          <Play size={12} className="mr-1" />
                          执行点检
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

      <BottomNav active="inspection" />
    </div>
  );
};
