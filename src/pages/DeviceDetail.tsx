import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Factory,
  MapPin,
  Calendar,
  Activity,
  Wrench,
  AlertTriangle,
  ClipboardList,
  QrCode,
  ChevronRight,
  FileText,
  Clock,
  Gauge,
  Thermometer,
  Droplets,
  Cog,
} from 'lucide-react';
import { useAppStore } from '../store';
import { Card, CardContent } from '../components/common/Card';
import { StatusBadge, ProgressBar } from '../components/common/StatusBadge';
import { Header } from '../components/layout/Header';
import { Tabs } from '../components/common/Tabs';
import { Button } from '../components/common/Button';
import { Empty } from '../components/common/Empty';
import { classNames, formatDate, getDeviceStatusText, getDeviceStatusColor } from '../utils';

export const DeviceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    devices,
    maintenanceOrders,
    repairOrders,
    inspectionRecords,
    createMaintenanceOrder,
    createRepairOrder,
  } = useAppStore();

  const device = useMemo(() => devices.find((d) => d.id === id), [devices, id]);

  const deviceData = useMemo(() => {
    if (!device) return null;

    const deviceMaintenance = maintenanceOrders.filter((o) => o.deviceId === device.id);
    const deviceRepairs = repairOrders.filter((o) => o.deviceId === device.id);
    const deviceInspections = inspectionRecords
      .filter((r) => r.deviceId === device.id)
      .slice(0, 10);

    const pendingMaintenance = deviceMaintenance.filter(
      (o) => o.status === 'pending' || o.status === 'in_progress'
    ).length;
    const pendingRepairs = deviceRepairs.filter(
      (o) => o.status === 'pending' || o.status === 'in_progress'
    ).length;

    return {
      deviceMaintenance,
      deviceRepairs,
      deviceInspections,
      pendingMaintenance,
      pendingRepairs,
    };
  }, [device, maintenanceOrders, repairOrders, inspectionRecords]);

  if (!device) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <Empty title="设备不存在" description="该设备可能已被删除" />
      </div>
    );
  }

  const handleScanInspection = () => {
    navigate(`/inspection/execute/${device.id}`);
  };

  const handleCreateMaintenance = () => {
    const newOrder = createMaintenanceOrder({
      deviceId: device.id,
      deviceName: device.name,
      deviceNo: device.deviceNo,
      title: `${device.name} - 日常保养`,
      maintenanceType: '日常',
      description: '日常保养',
      scheduledDate: new Date().toISOString(),
      assigneeId: 'user-001',
      assigneeName: '张工程师',
      items: [],
      status: 'pending',
    });
    navigate(`/maintenance-orders/${newOrder.id}`);
  };

  const handleCreateRepair = () => {
    navigate('/repair-orders/create', { state: { deviceId: device.id } });
  };

  const quickActions = [
    {
      icon: <QrCode size={20} />,
      label: '扫码点检',
      color: 'bg-primary-500',
      onClick: handleScanInspection,
    },
    {
      icon: <Wrench size={20} />,
      label: '发起保养',
      color: 'bg-warning-500',
      onClick: handleCreateMaintenance,
      badge: deviceData?.pendingMaintenance,
    },
    {
      icon: <AlertTriangle size={20} />,
      label: '故障报修',
      color: 'bg-danger-500',
      onClick: handleCreateRepair,
      badge: deviceData?.pendingRepairs,
    },
    {
      icon: <ClipboardList size={20} />,
      label: '点检记录',
      color: 'bg-success-500',
      onClick: () => {},
    },
  ];

  const infoItems = [
    { icon: <Factory size={16} />, label: '设备编号', value: device.deviceNo || '--' },
    { icon: <Cog size={16} />, label: '设备型号', value: device.model || '--' },
    { icon: <Factory size={16} />, label: '生产厂家', value: device.manufacturer || '--' },
    { icon: <MapPin size={16} />, label: '安装位置', value: device.location || '--' },
    { icon: <Calendar size={16} />, label: '安装日期', value: formatDate(device.installDate, 'YYYY-MM-DD') },
    { icon: <Activity size={16} />, label: '累计运行', value: device.runHours !== undefined && device.runHours !== null ? `${device.runHours} 小时` : '--' },
    { icon: <Calendar size={16} />, label: '上次保养', value: formatDate(device.lastMaintenanceDate, 'YYYY-MM-DD', '暂无') },
    { icon: <Clock size={16} />, label: '下次保养', value: formatDate(device.nextMaintenanceDate, 'YYYY-MM-DD', '暂无') },
  ];

  const realtimeData = [
    {
      icon: <Gauge size={16} />,
      label: '主轴转速',
      value: device.realtimeData?.spindleSpeed !== undefined && device.realtimeData?.spindleSpeed !== null
        ? device.realtimeData.spindleSpeed
        : null,
      unit: 'rpm',
      status: 'normal'
    },
    {
      icon: <Thermometer size={16} />,
      label: '主轴温度',
      value: device.realtimeData?.temperature !== undefined && device.realtimeData?.temperature !== null
        ? device.realtimeData.temperature
        : null,
      unit: '°C',
      status: device.realtimeData?.temperature !== undefined && device.realtimeData?.temperature !== null && device.realtimeData.temperature > 60 ? 'warning' : 'normal'
    },
    {
      icon: <Droplets size={16} />,
      label: '油压',
      value: device.realtimeData?.oilPressure !== undefined && device.realtimeData?.oilPressure !== null
        ? device.realtimeData.oilPressure
        : null,
      unit: 'MPa',
      status: device.realtimeData?.oilPressure !== undefined && device.realtimeData?.oilPressure !== null && device.realtimeData.oilPressure < 0.5 ? 'warning' : 'normal'
    },
    {
      icon: <Droplets size={16} />,
      label: '油位',
      value: device.realtimeData?.oilLevel !== undefined && device.realtimeData?.oilLevel !== null
        ? device.realtimeData.oilLevel
        : null,
      unit: '%',
      status: device.realtimeData?.oilLevel !== undefined && device.realtimeData?.oilLevel !== null && device.realtimeData.oilLevel < 30 ? 'danger' : 'normal'
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header title="设备详情" />

      <div className="px-4 py-4 space-y-4">
        <div
          className={classNames(
            'rounded-2xl p-5 text-white shadow-lg',
            device.status === 'running'
              ? 'bg-gradient-to-r from-success-500 to-success-600'
              : device.status === 'fault'
              ? 'bg-gradient-to-r from-danger-500 to-danger-600'
              : device.status === 'maintenance'
              ? 'bg-gradient-to-r from-warning-500 to-warning-600'
              : 'bg-gradient-to-r from-neutral-500 to-neutral-600'
          )}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mr-4">
                <Factory size={28} />
              </div>
              <div>
                <h1 className="text-xl font-bold">{device.name}</h1>
                <p className="text-white/80 text-sm mt-0.5">{device.deviceNo}</p>
              </div>
            </div>
            <StatusBadge status={device.status} variant="light" />
          </div>
          <div className="flex items-center text-white/90 text-sm">
            <MapPin size={14} className="mr-1" />
            {device.location}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              className="flex flex-col items-center p-3 bg-white rounded-xl shadow-card active:scale-95 transition-transform relative"
            >
              <div
                className={`w-10 h-10 rounded-lg ${action.color} text-white flex items-center justify-center mb-2`}
              >
                {action.icon}
              </div>
              <span className="text-xs text-neutral-600">{action.label}</span>
              {action.badge !== undefined && action.badge > 0 && (
                <span className="absolute top-1 right-1 w-5 h-5 bg-danger-500 text-white text-xs rounded-full flex items-center justify-center">
                  {action.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        <Card>
          <CardContent className="p-4">
            <h3 className="font-bold text-neutral-700 mb-4 flex items-center">
              <FileText size={18} className="mr-2 text-primary-500" />
              设备基本信息
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {infoItems.map((item, index) => (
                <div key={index} className="flex items-start">
                  <div className="w-8 h-8 bg-neutral-100 rounded-lg flex items-center justify-center mr-2 flex-shrink-0 text-neutral-500">
                    {item.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-neutral-400">{item.label}</p>
                    <p className="text-sm text-neutral-700 font-medium truncate">
                      {item.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h3 className="font-bold text-neutral-700 mb-4 flex items-center">
              <Activity size={18} className="mr-2 text-success-500" />
              实时运行数据
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {realtimeData.map((item, index) => (
                <div
                  key={index}
                  className={classNames(
                    'p-3 rounded-xl',
                    item.status === 'normal'
                      ? 'bg-success-50'
                      : item.status === 'warning'
                      ? 'bg-warning-50'
                      : 'bg-danger-50'
                  )}
                >
                  <div className="flex items-center mb-2">
                    <div
                      className={classNames(
                        'w-8 h-8 rounded-lg flex items-center justify-center mr-2',
                        item.status === 'normal'
                          ? 'bg-success-100 text-success-600'
                          : item.status === 'warning'
                          ? 'bg-warning-100 text-warning-600'
                          : 'bg-danger-100 text-danger-600'
                      )}
                    >
                      {item.icon}
                    </div>
                    <span className="text-sm text-neutral-600">{item.label}</span>
                  </div>
                  <p
                    className={classNames(
                      'text-2xl font-bold',
                      item.value === null
                        ? 'text-neutral-400'
                        : item.status === 'normal'
                        ? 'text-success-600'
                        : item.status === 'warning'
                        ? 'text-warning-600'
                        : 'text-danger-600'
                    )}
                  >
                    {item.value !== null ? item.value : '--'}
                    <span className="text-sm font-normal ml-1 opacity-80">
                      {item.value !== null ? item.unit : ''}
                    </span>
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h3 className="font-bold text-neutral-700 mb-4 flex items-center">
              <Activity size={18} className="mr-2 text-primary-500" />
              运行健康度
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-neutral-600">整体健康度</span>
                  <span className="text-sm font-medium text-primary-600">
                    {device.healthScore !== undefined && device.healthScore !== null ? `${device.healthScore}%` : '--'}
                  </span>
                </div>
                <ProgressBar
                  progress={device.healthScore ?? 0}
                  color={(device.healthScore ?? 0) >= 80 ? 'success' : (device.healthScore ?? 0) >= 60 ? 'warning' : 'danger'}
                  height={10}
                />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-neutral-600">设备利用率</span>
                  <span className="text-sm font-medium text-success-600">
                    {device.utilizationRate !== undefined && device.utilizationRate !== null ? `${device.utilizationRate}%` : '--'}
                  </span>
                </div>
                <ProgressBar progress={device.utilizationRate ?? 0} color="success" height={10} />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-neutral-600">保养完成率</span>
                  <span className="text-sm font-medium text-primary-600">95%</span>
                </div>
                <ProgressBar progress={95} color="primary" height={10} />
              </div>
            </div>
          </CardContent>
        </Card>

        {device.specifications && (
          <Card>
            <CardContent className="p-4">
              <h3 className="font-bold text-neutral-700 mb-4 flex items-center">
                <Cog size={18} className="mr-2 text-neutral-500" />
                技术参数
              </h3>
              <div className="space-y-2">
                {Object.entries(device.specifications).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex justify-between py-2 border-b border-neutral-100 last:border-0"
                  >
                    <span className="text-sm text-neutral-500">{key}</span>
                    <span className="text-sm text-neutral-700 font-medium">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {deviceData && deviceData.deviceInspections.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-neutral-700 flex items-center">
                  <ClipboardList size={18} className="mr-2 text-primary-500" />
                  最近点检记录
                </h3>
                <button
                  onClick={() => navigate('/inspection-plans')}
                  className="text-sm text-primary-500 flex items-center"
                >
                  全部 <ChevronRight size={16} />
                </button>
              </div>
              <div className="space-y-3">
                {deviceData.deviceInspections.map((record, index) => {
                  const plan = record.inspectionPlanId;
                  const abnormalCount = record.results.filter(
                    (r) => r.status === 'abnormal'
                  ).length;
                  return (
                    <div
                      key={record.id}
                      className="flex items-center p-3 bg-neutral-50 rounded-xl"
                    >
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${
                          abnormalCount > 0
                            ? 'bg-danger-100 text-danger-600'
                            : 'bg-success-100 text-success-600'
                        }`}
                      >
                        <ClipboardList size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-neutral-700 text-sm">
                          {record.inspectorName} · {record.inspectionType}点检
                        </p>
                        <p className="text-xs text-neutral-500 mt-0.5">
                          {formatDate(
                            new Date(record.inspectionTime),
                            'MM-DD HH:mm'
                          )}
                        </p>
                      </div>
                      <div className="text-right">
                        {abnormalCount > 0 ? (
                          <span className="text-xs text-danger-600 font-medium">
                            {abnormalCount} 项异常
                          </span>
                        ) : (
                          <span className="text-xs text-success-600 font-medium">
                            正常
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="pb-4">
          <Button size="full" variant="primary" onClick={handleScanInspection}>
            扫码执行点检
          </Button>
        </div>
      </div>
    </div>
  );
};
