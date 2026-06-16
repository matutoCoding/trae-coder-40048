import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Factory,
  ClipboardList,
  QrCode,
  Wrench,
  AlertTriangle,
  Package,
  BarChart3,
  ChevronRight,
  Bell,
  Scan,
  CalendarCheck,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { useAppStore } from '../store';
import { Card, CardContent } from '../components/common/Card';
import { StatusBadge, StatCard, ProgressBar } from '../components/common/StatusBadge';
import { Header } from '../components/layout/Header';
import { BottomNav } from '../components/layout/BottomNav';
import { formatDate, getDeviceStatusText, getDeviceStatusColor } from '../utils';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const {
    user,
    devices,
    inspectionPlans,
    maintenanceOrders,
    repairOrders,
    statistics,
    inspectionRecords,
  } = useAppStore();

  const stats = useMemo(() => {
    const totalDevices = devices.length;
    const runningDevices = devices.filter((d) => d.status === 'running').length;
    const faultDevices = devices.filter((d) => d.status === 'fault').length;
    const maintenanceDevices = devices.filter((d) => d.status === 'maintenance').length;

    const pendingInspections = inspectionPlans.filter(
      (p) => p.status === 'pending'
    ).length;
    const todayInspections = inspectionRecords.filter(
      (r) => new Date(r.inspectionTime).toDateString() === new Date().toDateString()
    ).length;

    const pendingMaintenance = maintenanceOrders.filter(
      (o) => o.status === 'pending' || o.status === 'in_progress'
    ).length;
    const pendingRepairs = repairOrders.filter(
      (o) => o.status === 'pending' || o.status === 'in_progress'
    ).length;

    const upcomingMaintenance = maintenanceOrders
      .filter((o) => o.status === 'pending')
      .slice(0, 3);

    const recentAlerts = [
      ...devices
        .filter((d) => d.status === 'fault')
        .map((d) => ({
          id: d.id,
          type: 'fault' as const,
          title: `${d.name} 故障`,
          message: '设备出现故障，需要紧急处理',
          time: '10分钟前',
          deviceId: d.id,
        })),
      ...maintenanceOrders
        .filter((o) => o.status === 'pending')
        .slice(0, 2)
        .map((o) => {
          const device = devices.find((d) => d.id === o.deviceId);
          return {
            id: o.id,
            type: 'maintenance' as const,
            title: `${device?.name || '设备'} 保养到期`,
            message: `${o.maintenanceType}保养任务待处理`,
            time: '即将到期',
            deviceId: o.deviceId,
          };
        }),
    ].slice(0, 5);

    return {
      totalDevices,
      runningDevices,
      faultDevices,
      maintenanceDevices,
      pendingInspections,
      todayInspections,
      pendingMaintenance,
      pendingRepairs,
      upcomingMaintenance,
      recentAlerts,
      availabilityRate: statistics?.availabilityRate || 95.6,
      monthlyDowntime: statistics?.monthlyDowntime || 12.5,
      inspectionCompletionRate: statistics?.inspectionCompletionRate || 92.3,
    };
  }, [devices, inspectionPlans, maintenanceOrders, repairOrders, inspectionRecords, statistics]);

  const quickActions = [
    {
      icon: <QrCode size={24} />,
      label: '扫码点检',
      color: 'bg-primary-500',
      path: '/scan-qr',
    },
    {
      icon: <ClipboardList size={24} />,
      label: '点检计划',
      color: 'bg-success-500',
      path: '/inspection-plans',
    },
    {
      icon: <Wrench size={24} />,
      label: '保养工单',
      color: 'bg-warning-500',
      path: '/maintenance-orders',
    },
    {
      icon: <AlertTriangle size={24} />,
      label: '维修报修',
      color: 'bg-danger-500',
      path: '/repair-orders',
    },
    {
      icon: <Package size={24} />,
      label: '备件仓库',
      color: 'bg-purple-500',
      path: '/spare-parts',
    },
    {
      icon: <BarChart3 size={24} />,
      label: '停机统计',
      color: 'bg-cyan-500',
      path: '/statistics',
    },
    {
      icon: <Factory size={24} />,
      label: '设备台账',
      color: 'bg-orange-500',
      path: '/devices',
    },
    {
      icon: <Bell size={24} />,
      label: '消息中心',
      color: 'bg-pink-500',
      path: '/profile',
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      <Header
        title="工作台"
        showBack={false}
        rightAction={
          <button
            onClick={() => navigate('/profile')}
            className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center"
          >
            <Bell size={20} className="text-white" />
          </button>
        }
      />

      <div className="px-4 py-4 space-y-4">
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-4 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-white/80 text-sm">欢迎回来，{user?.realName}</p>
              <p className="text-xl font-bold mt-1">{user?.roleName}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <Factory size={24} />
            </div>
          </div>
          <p className="text-white/90 text-sm">
            {formatDate(new Date(), 'YYYY年MM月DD日')} · 今日点检任务：{stats.todayInspections} 项已完成，{stats.pendingInspections} 项待执行
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <StatCard
            icon={<Factory size={20} />}
            iconColor="bg-primary-100 text-primary-600"
            label="设备总数"
            value={stats.totalDevices}
            subValue={`${stats.runningDevices} 台运行中`}
            subValueColor="text-success-600"
          />
          <StatCard
            icon={<AlertTriangle size={20} />}
            iconColor="bg-danger-100 text-danger-600"
            label="故障设备"
            value={stats.faultDevices}
            subValue={`${stats.maintenanceDevices} 台保养中`}
            subValueColor="text-warning-600"
          />
          <StatCard
            icon={<TrendingUp size={20} />}
            iconColor="bg-success-100 text-success-600"
            label="设备完好率"
            value={`${stats.availabilityRate}%`}
            subValue="月度统计"
            trend={{ value: 2.3, isUp: true }}
          />
          <StatCard
            icon={<Clock size={20} />}
            iconColor="bg-warning-100 text-warning-600"
            label="月停机时长"
            value={`${stats.monthlyDowntime}h`}
            subValue="较上月"
            trend={{ value: 1.5, isUp: false }}
          />
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-neutral-700">快捷功能</h3>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => navigate(action.path)}
                  className="flex flex-col items-center animate-fade-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div
                    className={`w-12 h-12 rounded-xl ${action.color} text-white flex items-center justify-center shadow-button mb-2 active:scale-95 transition-transform`}
                  >
                    {action.icon}
                  </div>
                  <span className="text-xs text-neutral-600">{action.label}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-neutral-700">今日待办</h3>
              <button
                onClick={() => navigate('/inspection-plans')}
                className="text-sm text-primary-500 flex items-center"
              >
                查看全部 <ChevronRight size={16} />
              </button>
            </div>
            <div className="space-y-3">
              <div
                onClick={() => navigate('/inspection-plans')}
                className="flex items-center p-3 bg-primary-50 rounded-xl cursor-pointer active:bg-primary-100 transition-colors"
              >
                <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center mr-3">
                  <Scan size={20} className="text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-neutral-700">点检任务</p>
                  <p className="text-sm text-neutral-500">今日 {stats.pendingInspections} 项待点检</p>
                </div>
                <StatusBadge status="pending" />
              </div>

              <div
                onClick={() => navigate('/maintenance-orders')}
                className="flex items-center p-3 bg-warning-50 rounded-xl cursor-pointer active:bg-warning-100 transition-colors"
              >
                <div className="w-10 h-10 bg-warning-500 rounded-lg flex items-center justify-center mr-3">
                  <Wrench size={20} className="text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-neutral-700">保养工单</p>
                  <p className="text-sm text-neutral-500">{stats.pendingMaintenance} 项待处理</p>
                </div>
                <StatusBadge status="in_progress" />
              </div>

              <div
                onClick={() => navigate('/repair-orders')}
                className="flex items-center p-3 bg-danger-50 rounded-xl cursor-pointer active:bg-danger-100 transition-colors"
              >
                <div className="w-10 h-10 bg-danger-500 rounded-lg flex items-center justify-center mr-3">
                  <AlertTriangle size={20} className="text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-neutral-700">维修工单</p>
                  <p className="text-sm text-neutral-500">{stats.pendingRepairs} 项待处理</p>
                </div>
                <StatusBadge status="fault" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-neutral-700">设备状态概览</h3>
              <button
                onClick={() => navigate('/devices')}
                className="text-sm text-primary-500 flex items-center"
              >
                查看全部 <ChevronRight size={16} />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-success-500 mr-2" />
                  <span className="text-sm text-neutral-600">运行中</span>
                </div>
                <span className="text-sm font-medium text-neutral-700">
                  {stats.runningDevices}/{stats.totalDevices}
                </span>
              </div>
              <ProgressBar
                progress={(stats.runningDevices / stats.totalDevices) * 100}
                color="success"
                height={8}
              />

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-danger-500 mr-2" />
                  <span className="text-sm text-neutral-600">故障</span>
                </div>
                <span className="text-sm font-medium text-neutral-700">
                  {stats.faultDevices}/{stats.totalDevices}
                </span>
              </div>
              <ProgressBar
                progress={(stats.faultDevices / stats.totalDevices) * 100}
                color="danger"
                height={8}
              />

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-warning-500 mr-2" />
                  <span className="text-sm text-neutral-600">保养中</span>
                </div>
                <span className="text-sm font-medium text-neutral-700">
                  {stats.maintenanceDevices}/{stats.totalDevices}
                </span>
              </div>
              <ProgressBar
                progress={(stats.maintenanceDevices / stats.totalDevices) * 100}
                color="warning"
                height={8}
              />
            </div>
          </CardContent>
        </Card>

        {stats.recentAlerts.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-neutral-700">预警提醒</h3>
                <span className="bg-danger-100 text-danger-600 text-xs px-2 py-0.5 rounded-full">
                  {stats.recentAlerts.length} 条
                </span>
              </div>
              <div className="space-y-3">
                {stats.recentAlerts.map((alert, index) => (
                  <div
                    key={alert.id}
                    onClick={() => navigate(`/devices/${alert.deviceId}`)}
                    className="flex items-start p-3 bg-neutral-50 rounded-xl cursor-pointer active:bg-neutral-100 transition-colors animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 flex-shrink-0 ${
                        alert.type === 'fault'
                          ? 'bg-danger-100 text-danger-600'
                          : 'bg-warning-100 text-warning-600'
                      }`}
                    >
                      {alert.type === 'fault' ? (
                        <XCircle size={18} />
                      ) : (
                        <CalendarCheck size={18} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-neutral-700 text-sm truncate">
                        {alert.title}
                      </p>
                      <p className="text-xs text-neutral-500 mt-0.5">{alert.message}</p>
                      <p className="text-xs text-neutral-400 mt-1">{alert.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-neutral-700">即将到期保养</h3>
              <button
                onClick={() => navigate('/maintenance-orders')}
                className="text-sm text-primary-500 flex items-center"
              >
                查看全部 <ChevronRight size={16} />
              </button>
            </div>
            <div className="space-y-3">
              {stats.upcomingMaintenance.length > 0 ? (
                stats.upcomingMaintenance.map((order, index) => {
                  const device = devices.find((d) => d.id === order.deviceId);
                  return (
                    <div
                      key={order.id}
                      className="flex items-center p-3 bg-neutral-50 rounded-xl animate-fade-in"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="w-10 h-10 bg-warning-100 rounded-lg flex items-center justify-center mr-3">
                        <Wrench size={20} className="text-warning-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-neutral-700 text-sm truncate">
                          {device?.name || '未知设备'}
                        </p>
                        <p className="text-xs text-neutral-500 mt-0.5">
                          {order.maintenanceType}保养 · {order.description}
                        </p>
                        <p className="text-xs text-warning-600 mt-1">
                          计划时间：{formatDate(new Date(order.scheduledDate), 'MM-DD HH:mm')}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-6 text-neutral-400 text-sm">
                  <CheckCircle2 size={40} className="mx-auto mb-2 text-success-400" />
                  暂无即将到期的保养任务
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <BottomNav active="home" />
    </div>
  );
};
