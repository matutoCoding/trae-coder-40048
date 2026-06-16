import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
} from 'recharts';
import {
  TrendingUp,
  Clock,
  AlertTriangle,
  Package,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Wrench,
  Calendar,
  ArrowUp,
  ArrowDown,
  Factory,
  CheckCircle2,
  FileCheck,
  AlertCircle,
  Settings,
} from 'lucide-react';
import { useAppStore } from '../store';
import { Card, CardContent } from '../components/common/Card';
import { StatusBadge, StatCard, ProgressBar } from '../components/common/StatusBadge';
import { Header } from '../components/layout/Header';
import { SegmentedControl } from '../components/common/Tabs';
import { Skeleton } from '../components/common/Empty';
import { classNames, formatDate, getStatusColor, getStatusText } from '../utils';

const COLORS = ['#165DFF', '#14C9C9', '#FF7D00', '#F53F3F', '#722ED1', '#86909C'];

export const Statistics: React.FC = () => {
  const {
    devices,
    repairOrders,
    maintenanceOrders,
    inspectionRecords,
    downtimeRecords,
    sparePartRequests,
    spareParts,
    isLoading,
    user,
  } = useAppStore();

  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('month');

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

  const getDateRange = () => {
    switch (timeRange) {
      case 'week':
        return sevenDaysAgo;
      case 'quarter':
        return ninetyDaysAgo;
      default:
        return thirtyDaysAgo;
    }
  };

  const dateRange = getDateRange();

  const stats = useMemo(() => {
    const totalDevices = devices.length;
    const runningDevices = devices.filter((d) => d.status === 'running').length;
    const availableRateNum =
      totalDevices > 0 ? (runningDevices / totalDevices) * 100 : 0;
    const availableRate = availableRateNum.toFixed(1);

    const filteredRepairs = repairOrders.filter(
      (r) => new Date(r.createdAt) >= dateRange
    );
    const completedRepairs = filteredRepairs.filter((r) => r.status === 'completed');
    const repairCompletionRateNum =
      filteredRepairs.length > 0
        ? (completedRepairs.length / filteredRepairs.length) * 100
        : 0;
    const repairCompletionRate = repairCompletionRateNum.toFixed(1);

    const filteredMaintenances = maintenanceOrders.filter(
      (m) => new Date(m.createdAt) >= dateRange
    );
    const completedMaintenances = filteredMaintenances.filter(
      (m) => m.status === 'completed'
    );
    const maintenanceCompletionRateNum =
      filteredMaintenances.length > 0
        ? (completedMaintenances.length / filteredMaintenances.length) * 100
        : 0;
    const maintenanceCompletionRate = maintenanceCompletionRateNum.toFixed(1);

    const totalDowntime = downtimeRecords
      .filter((d) => new Date(d.startTime) >= dateRange)
      .reduce((sum, d) => sum + d.duration, 0);

    const filteredInspections = inspectionRecords.filter(
      (i) => i.inspectedAt && new Date(i.inspectedAt) >= dateRange
    );
    const inspectionPassRateNum =
      filteredInspections.length > 0
        ? (filteredInspections.filter((i) => i.status === 'normal').length /
            filteredInspections.length) *
          100
        : 0;
    const inspectionPassRate = inspectionPassRateNum.toFixed(1);

    const filteredRequests = sparePartRequests.filter(
      (r) => new Date(r.createdAt) >= dateRange
    );
    const totalSparePartCost = filteredRequests
      .filter((r) => r.status === 'completed' || r.status === 'approved')
      .reduce((sum, r) => sum + r.totalAmount, 0);

    const urgentRepairs = filteredRepairs.filter(
      (r) => r.priority === 'urgent' && r.status !== 'completed'
    ).length;

    const maintenanceDue = maintenanceOrders.filter((m) => {
      if (m.status === 'completed') return false;
      const scheduledDate = new Date(m.scheduledDate);
      return scheduledDate <= now && scheduledDate >= thirtyDaysAgo;
    }).length;

    const lowStockParts = spareParts.filter((p) => p.stock <= p.minStock).length;

    return [
      {
        label: '设备完好率',
        value: `${availableRate}%`,
        icon: Factory,
        color: availableRateNum >= 90 ? 'success' : availableRateNum >= 75 ? 'warning' : 'danger',
        trend: '+2.3%',
        trendUp: true,
      },
      {
        label: '平均无故障时间',
        value: '168h',
        icon: Clock,
        color: 'primary',
        trend: '+12h',
        trendUp: true,
      },
      {
        label: '维修完成率',
        value: `${repairCompletionRate}%`,
        icon: Wrench,
        color: repairCompletionRateNum >= 90 ? 'success' : 'warning',
        trend: '-3.2%',
        trendUp: false,
      },
      {
        label: '保养完成率',
        value: `${maintenanceCompletionRate}%`,
        icon: FileCheck,
        color: maintenanceCompletionRateNum >= 90 ? 'success' : 'warning',
        trend: '+5.1%',
        trendUp: true,
      },
      {
        label: '总停机时长',
        value: `${totalDowntime}h`,
        icon: AlertTriangle,
        color: totalDowntime < 50 ? 'success' : totalDowntime < 100 ? 'warning' : 'danger',
        trend: '-15h',
        trendUp: false,
      },
      {
        label: '点检合格率',
        value: `${inspectionPassRate}%`,
        icon: CheckCircle2,
        color: inspectionPassRateNum >= 95 ? 'success' : 'warning',
        trend: '+1.5%',
        trendUp: true,
      },
      {
        label: '备件消耗金额',
        value: `¥${totalSparePartCost.toLocaleString()}`,
        icon: Package,
        color: 'primary',
        trend: '+12.3%',
        trendUp: false,
      },
      {
        label: '待处理事项',
        value: (urgentRepairs + maintenanceDue + lowStockParts).toString(),
        icon: AlertCircle,
        color:
          urgentRepairs + maintenanceDue + lowStockParts > 0 ? 'danger' : 'success',
      },
    ];
  }, [
    devices,
    repairOrders,
    maintenanceOrders,
    inspectionRecords,
    downtimeRecords,
    sparePartRequests,
    spareParts,
    dateRange,
    now,
    thirtyDaysAgo,
  ]);

  const downtimeChartData = useMemo(() => {
    const days = timeRange === 'week' ? 7 : timeRange === 'quarter' ? 12 : 30;
    const data: { date: string; downtime: number; repairs: number }[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr =
        timeRange === 'quarter'
          ? formatDate(date, 'MM/DD')
          : formatDate(date, 'MM-DD');

      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);

      const dayDowntime = downtimeRecords
        .filter(
          (d) =>
            new Date(d.startTime) >= dayStart && new Date(d.startTime) <= dayEnd
        )
        .reduce((sum, d) => sum + d.duration, 0);

      const dayRepairs = repairOrders.filter(
        (r) => new Date(r.createdAt) >= dayStart && new Date(r.createdAt) <= dayEnd
      ).length;

      data.push({
        date: dateStr,
        downtime: Number(dayDowntime.toFixed(1)),
        repairs: dayRepairs,
      });
    }

    return data;
  }, [downtimeRecords, repairOrders, timeRange, now]);

  const faultTypeData = useMemo(() => {
    const filtered = repairOrders.filter(
      (r) => new Date(r.createdAt) >= dateRange
    );

    const typeCount: Record<string, number> = {};
    filtered.forEach((r) => {
      typeCount[r.faultType] = (typeCount[r.faultType] || 0) + 1;
    });

    return Object.entries(typeCount).map(([name, value], index) => ({
      name,
      value,
      color: COLORS[index % COLORS.length],
    }));
  }, [repairOrders, dateRange]);

  const deviceStatusData = useMemo(() => {
    const statusCount: Record<string, number> = {};
    devices.forEach((d) => {
      statusCount[getStatusText(d.status)] = (statusCount[getStatusText(d.status)] || 0) + 1;
    });

    return Object.entries(statusCount).map(([name, value], index) => ({
      name,
      value,
      color: COLORS[index % COLORS.length],
    }));
  }, [devices]);

  const maintenanceTrendData = useMemo(() => {
    const months = [
      '1月', '2月', '3月', '4月', '5月', '6月',
      '7月', '8月', '9月', '10月', '11月', '12月'
    ];
    const currentMonth = now.getMonth();

    const data = [];
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      const monthStart = new Date(now.getFullYear(), monthIndex, 1);
      const monthEnd = new Date(now.getFullYear(), monthIndex + 1, 0);

      const completed = maintenanceOrders.filter(
        (m) =>
          m.status === 'completed' &&
          new Date(m.actualEndDate || m.scheduledDate) >= monthStart &&
          new Date(m.actualEndDate || m.scheduledDate) <= monthEnd
      ).length;

      const planned = maintenanceOrders.filter(
        (m) =>
          new Date(m.scheduledDate) >= monthStart &&
          new Date(m.scheduledDate) <= monthEnd
      ).length;

      data.push({
        month: months[monthIndex],
        已完成: completed,
        计划数: planned,
      });
    }

    return data;
  }, [maintenanceOrders, now]);

  const alerts = useMemo(() => {
    const list: { type: string; message: string; color: string; icon: any }[] = [];

    devices.forEach((d) => {
      if (d.healthScore < 70 && d.status !== 'maintenance' && d.status !== 'fault') {
        list.push({
          type: '健康预警',
          message: `${d.name} (${d.deviceNo}) 健康度仅 ${d.healthScore}分`,
          color: 'warning',
          icon: AlertTriangle,
        });
      }
    });

    maintenanceOrders.forEach((m) => {
      if (m.status !== 'completed') {
        const scheduledDate = new Date(m.scheduledDate);
        const daysUntil = Math.ceil(
          (scheduledDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysUntil <= 3 && daysUntil >= 0) {
          list.push({
            type: '保养提醒',
            message: `${m.orderNo} - ${m.deviceName} ${m.maintenanceType} 还有 ${daysUntil} 天到期`,
            color: 'primary',
            icon: Calendar,
          });
        }
        if (daysUntil < 0) {
          list.push({
            type: '保养逾期',
            message: `${m.orderNo} - ${m.deviceName} ${m.maintenanceType} 已逾期 ${Math.abs(daysUntil)} 天`,
            color: 'danger',
            icon: AlertCircle,
          });
        }
      }
    });

    spareParts.forEach((p) => {
      if (p.stock <= p.minStock) {
        list.push({
          type: '库存不足',
          message: `${p.name} (${p.partCode}) 库存仅 ${p.stock} ${p.unit}`,
          color: 'warning',
          icon: Package,
        });
      }
    });

    repairOrders.forEach((r) => {
      if (r.priority === 'urgent' && r.status !== 'completed') {
        list.push({
          type: '紧急维修',
          message: `${r.orderNo} - ${r.deviceName} ${r.faultType}`,
          color: 'danger',
          icon: Wrench,
        });
      }
    });

    return list.sort((a, b) => {
      if (a.color === 'danger' && b.color !== 'danger') return -1;
      if (b.color === 'danger' && a.color !== 'danger') return 1;
      if (a.color === 'warning' && b.color !== 'warning') return -1;
      if (b.color === 'warning' && a.color !== 'warning') return 1;
      return 0;
    });
  }, [devices, maintenanceOrders, spareParts, repairOrders, now]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Header title="数据统计" />
        <div className="px-4 py-4 space-y-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} height={60} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header title="数据统计" />

      <div className="px-4 pt-4">
        <SegmentedControl
          options={[
            { key: 'week', label: '近7天', value: 'week' },
            { key: 'month', label: '近30天', value: 'month' },
            { key: 'quarter', label: '近90天', value: 'quarter' },
          ]}
          value={timeRange}
          onChange={(v) => setTimeRange(v as any)}
        />
      </div>

      <div className="px-4 py-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat, index) => (
            <Card
              key={stat.label}
              className="animate-slide-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <CardContent className="p-3">
                <div className="flex items-start justify-between">
                  <div
                    className={classNames(
                      'w-9 h-9 rounded-lg flex items-center justify-center',
                      stat.color === 'success' && 'bg-success-100',
                      stat.color === 'warning' && 'bg-warning-100',
                      stat.color === 'danger' && 'bg-danger-100',
                      stat.color === 'primary' && 'bg-primary-100'
                    )}
                  >
                    <stat.icon
                      size={18}
                      className={classNames(
                        stat.color === 'success' && 'text-success-500',
                        stat.color === 'warning' && 'text-warning-500',
                        stat.color === 'danger' && 'text-danger-500',
                        stat.color === 'primary' && 'text-primary-500'
                      )}
                    />
                  </div>
                  {stat.trend && (
                    <div
                      className={classNames(
                        'flex items-center text-xs font-medium',
                        stat.trendUp ? 'text-success-500' : 'text-danger-500'
                      )}
                    >
                      {stat.trendUp ? (
                        <ArrowUp size={12} className="mr-0.5" />
                      ) : (
                        <ArrowDown size={12} className="mr-0.5" />
                      )}
                      {stat.trend}
                    </div>
                  )}
                </div>
                <div className="mt-3">
                  <p className="text-2xl font-bold text-neutral-700">
                    {stat.value}
                  </p>
                  <p className="text-xs text-neutral-500 mt-1">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {alerts.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <h3 className="font-bold text-neutral-700 mb-3 flex items-center">
                <AlertTriangle size={18} className="mr-2 text-warning-500" />
                预警提醒
                <span className="ml-2 w-5 h-5 bg-danger-500 text-white rounded-full text-xs flex items-center justify-center">
                  {alerts.length}
                </span>
              </h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {alerts.slice(0, 10).map((alert, index) => (
                  <div
                    key={index}
                    className="flex items-start p-3 bg-neutral-50 rounded-xl animate-fade-in"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div
                      className={classNames(
                        'w-8 h-8 rounded-lg flex items-center justify-center mr-3 flex-shrink-0',
                        alert.color === 'danger' && 'bg-danger-100',
                        alert.color === 'warning' && 'bg-warning-100',
                        alert.color === 'primary' && 'bg-primary-100'
                      )}
                    >
                      <alert.icon
                        size={16}
                        className={classNames(
                          alert.color === 'danger' && 'text-danger-500',
                          alert.color === 'warning' && 'text-warning-500',
                          alert.color === 'primary' && 'text-primary-500'
                        )}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <StatusBadge
                        status={alert.type}
                        variant="dot"
                        color={alert.color as any}
                        className="mb-1"
                      />
                      <p className="text-sm text-neutral-700">{alert.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="p-4">
            <h3 className="font-bold text-neutral-700 mb-4 flex items-center">
              <BarChart3 size={18} className="mr-2 text-primary-500" />
              停机时长趋势
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={downtimeChartData}>
                  <defs>
                    <linearGradient id="downtimeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#165DFF" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#165DFF" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: '#86909C' }}
                    axisLine={{ stroke: '#f0f0f0' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: '#86909C' }}
                    axisLine={{ stroke: '#f0f0f0' }}
                    tickLine={false}
                    unit="h"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="downtime"
                    stroke="#165DFF"
                    strokeWidth={2}
                    fill="url(#downtimeGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-bold text-neutral-700 mb-3 flex items-center">
                <PieChartIcon size={16} className="mr-2 text-primary-500" />
                故障类型分布
              </h3>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={faultTypeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={55}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {faultTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {faultTypeData.map((item, index) => (
                  <div key={index} className="flex items-center">
                    <div
                      className="w-2 h-2 rounded-full mr-1"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-xs text-neutral-500">
                      {item.name}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h3 className="font-bold text-neutral-700 mb-3 flex items-center">
                <Activity size={16} className="mr-2 text-primary-500" />
                设备状态分布
              </h3>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={deviceStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={55}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {deviceStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {deviceStatusData.map((item, index) => (
                  <div key={index} className="flex items-center">
                    <div
                      className="w-2 h-2 rounded-full mr-1"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-xs text-neutral-500">
                      {item.name}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-4">
            <h3 className="font-bold text-neutral-700 mb-4 flex items-center">
              <TrendingUp size={18} className="mr-2 text-primary-500" />
              保养完成趋势
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={maintenanceTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 10, fill: '#86909C' }}
                    axisLine={{ stroke: '#f0f0f0' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: '#86909C' }}
                    axisLine={{ stroke: '#f0f0f0' }}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    }}
                  />
                  <Bar dataKey="计划数" fill="#E8F3FF" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="已完成" fill="#165DFF" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center items-center space-x-4 mt-3">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-[#E8F3FF] rounded mr-1.5" />
                <span className="text-xs text-neutral-500">计划数</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-[#165DFF] rounded mr-1.5" />
                <span className="text-xs text-neutral-500">已完成</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h3 className="font-bold text-neutral-700 mb-4 flex items-center">
              <Factory size={18} className="mr-2 text-primary-500" />
              设备健康度排行
            </h3>
            <div className="space-y-3">
              {[...devices]
                .sort((a, b) => b.healthScore - a.healthScore)
                .map((device, index) => (
                  <div
                    key={device.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center">
                        <span
                          className={classNames(
                            'w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold mr-2',
                            index < 3
                              ? 'bg-primary-500 text-white'
                              : 'bg-neutral-100 text-neutral-500'
                          )}
                        >
                          {index + 1}
                        </span>
                        <span className="text-sm font-medium text-neutral-700 truncate max-w-[150px]">
                          {device.name}
                        </span>
                      </div>
                      <span
                        className={classNames(
                          'text-sm font-bold',
                          device.healthScore >= 90
                            ? 'text-success-500'
                            : device.healthScore >= 70
                            ? 'text-warning-500'
                            : 'text-danger-500'
                        )}
                      >
                        {device.healthScore}分
                      </span>
                    </div>
                    <ProgressBar
                      progress={device.healthScore}
                      color={
                        device.healthScore >= 90
                          ? 'success'
                          : device.healthScore >= 70
                          ? 'warning'
                          : 'danger'
                      }
                      height={6}
                    />
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <div className="h-20" />
      </div>
    </div>
  );
};
