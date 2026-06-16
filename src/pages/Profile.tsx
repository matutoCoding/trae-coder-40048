import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Settings,
  LogOut,
  ChevronRight,
  FileText,
  Wrench,
  ClipboardCheck,
  Package,
  BarChart3,
  Bell,
  HelpCircle,
  Shield,
  Phone,
  Mail,
  Building,
  Calendar,
  Award,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useAppStore } from '../store';
import { Card, CardContent } from '../components/common/Card';
import { StatusBadge } from '../components/common/StatusBadge';
import { Header } from '../components/layout/Header';
import { Button } from '../components/common/Button';
import { classNames, formatDate } from '../utils';

const getRoleText = (role: string) => {
  switch (role) {
    case 'admin':
      return '设备主管';
    case 'engineer':
      return '维修工程师';
    case 'inspector':
      return '点检员';
    case 'storekeeper':
      return '仓库管理员';
    case 'operator':
      return '操作员';
    default:
      return role;
  }
};

const getRoleColor = (role: string) => {
  switch (role) {
    case 'admin':
      return 'bg-primary-100 text-primary-600';
    case 'engineer':
      return 'bg-success-100 text-success-600';
    case 'inspector':
      return 'bg-warning-100 text-warning-600';
    case 'storekeeper':
      return 'bg-purple-100 text-purple-600';
    case 'operator':
      return 'bg-neutral-100 text-neutral-600';
    default:
      return 'bg-neutral-100 text-neutral-600';
  }
};

export const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, inspectionRecords, repairOrders, maintenanceOrders, sparePartRequests } =
    useAppStore();

  const myStats = useMemo(() => {
    if (!user) return null;

    const myInspections = inspectionRecords.filter(
      (r) => r.inspectorId === user.id
    );
    const myRepairs = repairOrders.filter((r) => r.assigneeId === user.id);
    const myMaintenances = maintenanceOrders.filter(
      (m) => m.assigneeId === user.id
    );
    const myRequests = sparePartRequests.filter(
      (r) => r.requesterId === user.id
    );

    const completedInspections = myInspections.filter(
      (r) => r.status === 'normal' || r.status === 'abnormal'
    ).length;
    const completedRepairs = myRepairs.filter(
      (r) => r.status === 'completed'
    ).length;
    const completedMaintenances = myMaintenances.filter(
      (m) => m.status === 'completed'
    ).length;
    const pendingTasks =
      myInspections.filter((r) => r.status === 'pending').length +
      myRepairs.filter((r) => r.status !== 'completed').length +
      myMaintenances.filter((m) => m.status !== 'completed').length;

    const abnormalInspections = myInspections.filter(
      (r) => r.status === 'abnormal'
    ).length;

    const totalRepairHours = myRepairs
      .filter((r) => r.status === 'completed' && r.laborHours)
      .reduce((sum, r) => sum + (r.laborHours || 0), 0);

    return [
      {
        label: '完成点检',
        value: completedInspections.toString(),
        icon: ClipboardCheck,
        color: 'success',
      },
      {
        label: '完成维修',
        value: completedRepairs.toString(),
        icon: Wrench,
        color: 'primary',
      },
      {
        label: '完成保养',
        value: completedMaintenances.toString(),
        icon: FileText,
        color: 'warning',
      },
      {
        label: '待办任务',
        value: pendingTasks.toString(),
        icon: Clock,
        color: pendingTasks > 0 ? 'danger' : 'neutral',
      },
    ];
  }, [user, inspectionRecords, repairOrders, maintenanceOrders, sparePartRequests]);

  const recentActivities = useMemo(() => {
    if (!user) return [];

    const activities: {
      type: string;
      title: string;
      time: string;
      status: string;
      color: string;
    }[] = [];

    inspectionRecords
      .filter((r) => r.inspectorId === user.id)
      .slice(0, 3)
      .forEach((r) => {
        activities.push({
          type: '点检',
          title: `${r.deviceName} - 点检完成`,
          time: r.inspectedAt,
          status: r.status === 'normal' ? '正常' : '异常',
          color: r.status === 'normal' ? 'success' : 'danger',
        });
      });

    repairOrders
      .filter((r) => r.assigneeId === user.id || r.reporterId === user.id)
      .slice(0, 3)
      .forEach((r) => {
        activities.push({
          type: '维修',
          title: `${r.orderNo} - ${r.deviceName} ${r.faultType}`,
          time: r.createdAt,
          status: r.status,
          color:
            r.status === 'completed'
              ? 'success'
              : r.status === 'in_progress'
              ? 'primary'
              : 'warning',
        });
      });

    maintenanceOrders
      .filter((m) => m.assigneeId === user.id)
      .slice(0, 3)
      .forEach((m) => {
        activities.push({
          type: '保养',
          title: `${m.orderNo} - ${m.deviceName} ${m.maintenanceType}`,
          time: m.createdAt,
          status: m.status,
          color:
            m.status === 'completed'
              ? 'success'
              : m.status === 'in_progress'
              ? 'primary'
              : 'warning',
        });
      });

    return activities
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 5);
  }, [user, inspectionRecords, repairOrders, maintenanceOrders]);

  const menuItems = [
    {
      icon: Bell,
      label: '消息通知',
      badge: 3,
      onClick: () => {},
    },
    {
      icon: FileText,
      label: '我的工单',
      onClick: () => navigate('/repair-orders'),
    },
    {
      icon: ClipboardCheck,
      label: '我的点检',
      onClick: () => navigate('/inspection-plans'),
    },
    {
      icon: Package,
      label: '我的领用',
      onClick: () => navigate('/spare-parts'),
    },
    {
      icon: BarChart3,
      label: '数据统计',
      onClick: () => navigate('/statistics'),
    },
    {
      icon: Shield,
      label: '账号安全',
      onClick: () => {},
    },
    {
      icon: HelpCircle,
      label: '帮助中心',
      onClick: () => {},
    },
    {
      icon: Settings,
      label: '系统设置',
      onClick: () => {},
    },
  ];

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header title="个人中心" />

      <div className="px-4 py-4 space-y-4">
        <div className="bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 rounded-2xl p-5 text-white shadow-lg">
          <div className="flex items-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mr-4">
              <User size={32} />
            </div>
            <div className="flex-1">
              <div className="flex items-center">
                <h1 className="text-xl font-bold">{user.realName}</h1>
                <span
                  className={classNames(
                    'ml-2 text-xs px-2 py-0.5 rounded-full',
                    getRoleColor(user.role)
                  )}
                >
                  {getRoleText(user.role)}
                </span>
              </div>
              <p className="text-white/80 text-sm mt-1">工号: {user.username}</p>
              <div className="flex items-center text-white/70 text-xs mt-2">
                <Building size={12} className="mr-1" />
                {user.department}
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center text-white/80 text-xs mb-1">
                <Award size={12} className="mr-1" />
                积分 1280
              </div>
              <StatusBadge status="在线" variant="dot" color="success" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-white/20">
            <div className="flex items-center text-white/80 text-xs">
              <Phone size={12} className="mr-1.5" />
              {user.phone}
            </div>
            <div className="flex items-center text-white/80 text-xs">
              <Mail size={12} className="mr-1.5" />
              {user.email}
            </div>
          </div>
        </div>

        {myStats && (
          <div className="grid grid-cols-4 gap-2">
            {myStats.map((stat, index) => (
              <Card
                key={stat.label}
                className="animate-slide-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <CardContent className="p-3 text-center">
                  <div
                    className={classNames(
                      'w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-2',
                      stat.color === 'success' && 'bg-success-100',
                      stat.color === 'warning' && 'bg-warning-100',
                      stat.color === 'danger' && 'bg-danger-100',
                      stat.color === 'primary' && 'bg-primary-100',
                      stat.color === 'neutral' && 'bg-neutral-100'
                    )}
                  >
                    <stat.icon
                      size={16}
                      className={classNames(
                        stat.color === 'success' && 'text-success-500',
                        stat.color === 'warning' && 'text-warning-500',
                        stat.color === 'danger' && 'text-danger-500',
                        stat.color === 'primary' && 'text-primary-500',
                        stat.color === 'neutral' && 'text-neutral-500'
                      )}
                    />
                  </div>
                  <p className="text-lg font-bold text-neutral-700">
                    {stat.value}
                  </p>
                  <p className="text-xs text-neutral-500">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Card>
          <CardContent className="p-4">
            <h3 className="font-bold text-neutral-700 mb-4 flex items-center">
              <Calendar size={18} className="mr-2 text-primary-500" />
              最近动态
            </h3>
            {recentActivities.length === 0 ? (
              <div className="text-center py-6 text-neutral-400 text-sm">
                暂无动态
              </div>
            ) : (
              <div className="space-y-3">
                {recentActivities.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-start animate-fade-in"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div
                      className={classNames(
                        'w-2 h-2 rounded-full mt-2 mr-3 flex-shrink-0',
                        activity.color === 'success' && 'bg-success-500',
                        activity.color === 'warning' && 'bg-warning-500',
                        activity.color === 'danger' && 'bg-danger-500',
                        activity.color === 'primary' && 'bg-primary-500'
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span
                          className={classNames(
                            'text-xs px-2 py-0.5 rounded-full mr-2',
                            activity.type === '点检' && 'bg-blue-100 text-blue-600',
                            activity.type === '维修' && 'bg-orange-100 text-orange-600',
                            activity.type === '保养' && 'bg-green-100 text-green-600'
                          )}
                        >
                          {activity.type}
                        </span>
                        <StatusBadge
                          status={activity.status}
                          variant="dot"
                          color={activity.color as any}
                        />
                      </div>
                      <p className="text-sm text-neutral-700 mt-1 truncate">
                        {activity.title}
                      </p>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        {formatDate(new Date(activity.time), 'MM-DD HH:mm')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            <div className="p-4 border-b border-neutral-100">
              <h3 className="font-bold text-neutral-700 flex items-center">
                <Settings size={18} className="mr-2 text-primary-500" />
                设置
              </h3>
            </div>
            {menuItems.map((item, index) => (
              <div
                key={item.label}
                onClick={item.onClick}
                className="flex items-center justify-between p-4 border-b border-neutral-100 last:border-b-0 cursor-pointer active:bg-neutral-50 transition-colors"
              >
                <div className="flex items-center">
                  <item.icon size={18} className="text-neutral-400 mr-3" />
                  <span className="text-sm text-neutral-700">{item.label}</span>
                </div>
                <div className="flex items-center">
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="w-5 h-5 bg-danger-500 text-white rounded-full text-xs flex items-center justify-center mr-2">
                      {item.badge}
                    </span>
                  )}
                  <ChevronRight size={16} className="text-neutral-300" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="bg-white rounded-2xl p-4">
          <div className="text-center text-xs text-neutral-400">
            <p>数控机床设备点检系统 v1.0.0</p>
            <p className="mt-1">© 2024 设备科管理系统</p>
          </div>
        </div>

        <Button
          size="full"
          variant="danger"
          onClick={() => {
            logout();
            navigate('/login');
          }}
          className="mb-8"
        >
          <LogOut size={18} className="mr-2" />
          退出登录
        </Button>
      </div>
    </div>
  );
};
