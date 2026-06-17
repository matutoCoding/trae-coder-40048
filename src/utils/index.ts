import type { DeviceStatus, InspectionCycle, Priority, MaintenanceOrderStatus, RepairOrderStatus, SparePartStatus, RequisitionStatus, FaultType } from '../types';

export const formatDate = (date: string | Date | undefined | null, format: string = 'YYYY-MM-DD HH:mm', fallback: string = '--'): string => {
  if (!date) return fallback;
  const d = new Date(date);
  if (isNaN(d.getTime())) return fallback;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
};

export const formatDateCN = (date: string | Date): string => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();
  return `${year}年${month}月${day}日`;
};

export const getDaysDifference = (date1: string | Date, date2: string | Date): number => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const getDeviceStatusText = (status: DeviceStatus): string => {
  const map: Record<DeviceStatus, string> = {
    running: '运行中',
    standby: '待机',
    maintenance: '保养中',
    fault: '故障',
    offline: '离线',
  };
  return map[status];
};

export const getDeviceStatusColor = (status: DeviceStatus): { bg: string; text: string } => {
  const map: Record<DeviceStatus, { bg: string; text: string }> = {
    running: { bg: 'bg-success-100', text: 'text-success-600' },
    standby: { bg: 'bg-neutral-100', text: 'text-neutral-600' },
    maintenance: { bg: 'bg-warning-100', text: 'text-warning-600' },
    fault: { bg: 'bg-danger-100', text: 'text-danger-600' },
    offline: { bg: 'bg-neutral-200', text: 'text-neutral-500' },
  };
  return map[status];
};

export const getDeviceStatusBgColor = (status: DeviceStatus): string => {
  const map: Record<DeviceStatus, string> = {
    running: 'bg-success-50 text-success-700',
    standby: 'bg-neutral-100 text-neutral-600',
    maintenance: 'bg-warning-50 text-warning-700',
    fault: 'bg-danger-50 text-danger-700',
    offline: 'bg-neutral-100 text-neutral-500',
  };
  return map[status];
};

export const getInspectionCycleText = (cycle: InspectionCycle): string => {
  const map: Record<InspectionCycle, string> = {
    daily: '日检',
    weekly: '周检',
    monthly: '月检',
    quarterly: '季检',
  };
  return map[cycle];
};

export const getInspectionCycleColor = (cycle: InspectionCycle): string => {
  const map: Record<InspectionCycle, string> = {
    daily: 'bg-primary-50 text-primary-600',
    weekly: 'bg-success-50 text-success-600',
    monthly: 'bg-warning-50 text-warning-600',
    quarterly: 'bg-neutral-100 text-neutral-600',
  };
  return map[cycle];
};

export const getPriorityText = (priority: Priority): string => {
  const map: Record<Priority, string> = {
    low: '低',
    medium: '中',
    high: '高',
    urgent: '紧急',
  };
  return map[priority];
};

export const getPriorityColor = (priority: Priority): string => {
  const map: Record<Priority, string> = {
    low: 'bg-neutral-100 text-neutral-600',
    medium: 'bg-success-50 text-success-600',
    high: 'bg-warning-50 text-warning-600',
    urgent: 'bg-danger-50 text-danger-600',
  };
  return map[priority];
};

export const getMaintenanceStatusText = (status: MaintenanceOrderStatus): string => {
  const map: Record<MaintenanceOrderStatus, string> = {
    pending: '待派发',
    assigned: '已派单',
    in_progress: '进行中',
    completed: '已完成',
    accepted: '已验收',
  };
  return map[status];
};

export const getMaintenanceStatusColor = (status: MaintenanceOrderStatus): string => {
  const map: Record<MaintenanceOrderStatus, string> = {
    pending: 'bg-neutral-100 text-neutral-600',
    assigned: 'bg-primary-50 text-primary-600',
    in_progress: 'bg-warning-50 text-warning-600',
    completed: 'bg-success-50 text-success-600',
    accepted: 'bg-success-100 text-success-700',
  };
  return map[status];
};

export const getRepairStatusText = (status: RepairOrderStatus): string => {
  const map: Record<RepairOrderStatus, string> = {
    pending: '待派单',
    assigned: '已派单',
    in_progress: '维修中',
    completed: '待验收',
    accepted: '已验收',
    rejected: '已驳回',
    cancelled: '已取消',
  };
  return map[status];
};

export const getRepairStatusColor = (status: RepairOrderStatus): string => {
  const map: Record<RepairOrderStatus, string> = {
    pending: 'bg-neutral-100 text-neutral-600',
    assigned: 'bg-primary-50 text-primary-600',
    in_progress: 'bg-warning-50 text-warning-600',
    completed: 'bg-success-50 text-success-600',
    accepted: 'bg-success-100 text-success-700',
    rejected: 'bg-danger-50 text-danger-600',
    cancelled: 'bg-neutral-200 text-neutral-500',
  };
  return map[status];
};

export const getFaultTypeText = (type: FaultType): string => {
  const map: Record<FaultType, string> = {
    mechanical: '机械故障',
    electrical: '电气故障',
    hydraulic: '液压系统',
    pneumatic: '气动系统',
    control: '控制系统',
    other: '其他',
  };
  return map[type];
};

export const getSparePartStatusText = (status: SparePartStatus): string => {
  const map: Record<SparePartStatus, string> = {
    normal: '正常',
    low_stock: '库存不足',
    out_of_stock: '缺货',
  };
  return map[status];
};

export const getSparePartStatusColor = (status: SparePartStatus): string => {
  const map: Record<SparePartStatus, string> = {
    normal: 'bg-success-50 text-success-600',
    low_stock: 'bg-warning-50 text-warning-600',
    out_of_stock: 'bg-danger-50 text-danger-600',
  };
  return map[status];
};

export const getRequisitionStatusText = (status: RequisitionStatus): string => {
  const map: Record<RequisitionStatus, string> = {
    pending: '待审批',
    approved: '已批准',
    rejected: '已驳回',
    issued: '已出库',
  };
  return map[status];
};

export const getRequisitionStatusColor = (status: RequisitionStatus): string => {
  const map: Record<RequisitionStatus, string> = {
    pending: 'bg-warning-50 text-warning-600',
    approved: 'bg-primary-50 text-primary-600',
    rejected: 'bg-danger-50 text-danger-600',
    issued: 'bg-success-50 text-success-600',
  };
  return map[status];
};

export const getInspectionItemTypeIcon = (type: string): string => {
  const map: Record<string, string> = {
    oil_level: 'droplet',
    oil_pressure: 'gauge',
    lubrication: 'oil',
    temperature: 'thermometer',
    vibration: 'activity',
    visual: 'eye',
    other: 'file-text',
  };
  return map[type] || 'file-text';
};

export const getInspectionItemTypeText = (type: string): string => {
  const map: Record<string, string> = {
    oil_level: '油位检查',
    oil_pressure: '油压检查',
    lubrication: '润滑保养',
    temperature: '温度检测',
    vibration: '振动检测',
    visual: '外观检查',
    other: '其他',
  };
  return map[type] || '其他';
};

export const getStatusText = (status: string): string => {
  const map: Record<string, string> = {
    pending: '待处理',
    approved: '已批准',
    rejected: '已驳回',
    completed: '已完成',
    issued: '已出库',
    normal: '正常',
    low_stock: '库存不足',
    out_of_stock: '缺货',
  };
  return map[status] || status;
};

export const getStatusColor = (status: string): string => {
  const map: Record<string, string> = {
    pending: 'bg-warning-50 text-warning-600',
    approved: 'bg-primary-50 text-primary-600',
    rejected: 'bg-danger-50 text-danger-600',
    completed: 'bg-success-50 text-success-600',
    issued: 'bg-success-50 text-success-600',
    normal: 'bg-success-50 text-success-600',
    low_stock: 'bg-warning-50 text-warning-600',
    out_of_stock: 'bg-danger-50 text-danger-600',
  };
  return map[status] || 'bg-neutral-100 text-neutral-600';
};

export const generateId = (prefix: string = 'id'): string => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes}分钟`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) {
    return `${hours}小时`;
  }
  return `${hours}小时${mins}分钟`;
};

export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const classNames = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};
