import type { StatisticsData, DowntimeRecord } from '../types';
import { mockDevices } from './devices';

export const mockDowntimeRecords: DowntimeRecord[] = [
  {
    id: 'dt-001',
    deviceId: 'd004',
    deviceName: '数控磨床MK1320',
    type: 'fault',
    reason: '砂轮主轴异响',
    startTime: '2025-06-15T09:30:00Z',
    relatedOrderId: 'ro-001',
    createdAt: '2025-06-15T09:30:00Z',
  },
  {
    id: 'dt-002',
    deviceId: 'd003',
    deviceName: '数控铣床XK715',
    type: 'maintenance',
    reason: '月度保养',
    startTime: '2025-06-15T14:00:00Z',
    relatedOrderId: 'mo-001',
    createdAt: '2025-06-15T14:00:00Z',
  },
  {
    id: 'dt-003',
    deviceId: 'd005',
    deviceName: '卧式加工中心HMC630',
    type: 'fault',
    reason: '液压系统报警',
    startTime: '2025-06-10T08:00:00Z',
    endTime: '2025-06-10T09:00:00Z',
    durationMinutes: 60,
    relatedOrderId: 'ro-004',
    createdAt: '2025-06-10T08:00:00Z',
  },
  {
    id: 'dt-004',
    deviceId: 'd002',
    deviceName: '立式加工中心VMC850',
    type: 'fault',
    reason: '控制系统报警',
    startTime: '2025-06-08T14:00:00Z',
    endTime: '2025-06-08T15:30:00Z',
    durationMinutes: 90,
    relatedOrderId: 'ro-005',
    createdAt: '2025-06-08T14:00:00Z',
  },
  {
    id: 'dt-005',
    deviceId: 'd006',
    deviceName: '数控车床CK6140',
    type: 'maintenance',
    reason: '季度保养',
    startTime: '2025-06-05T08:00:00Z',
    endTime: '2025-06-05T16:00:00Z',
    durationMinutes: 480,
    relatedOrderId: 'mo-004',
    createdAt: '2025-06-05T08:00:00Z',
  },
  {
    id: 'dt-006',
    deviceId: 'd007',
    deviceName: '龙门加工中心GMC2518',
    type: 'maintenance',
    reason: '刀库保养',
    startTime: '2025-06-14T09:00:00Z',
    endTime: '2025-06-14T12:00:00Z',
    durationMinutes: 180,
    relatedOrderId: 'mo-005',
    createdAt: '2025-06-14T09:00:00Z',
  },
  {
    id: 'dt-007',
    deviceId: 'd001',
    deviceName: '数控车床CK6150',
    type: 'planned',
    reason: '设备搬迁',
    startTime: '2025-06-01T08:00:00Z',
    endTime: '2025-06-01T18:00:00Z',
    durationMinutes: 600,
    createdAt: '2025-06-01T08:00:00Z',
  },
];

export const mockStatistics: StatisticsData = {
  totalDevices: mockDevices.length,
  runningDevices: mockDevices.filter(d => d.status === 'running').length,
  faultDevices: mockDevices.filter(d => d.status === 'fault').length,
  maintenanceDevices: mockDevices.filter(d => d.status === 'maintenance').length,
  totalInspectionsToday: 4,
  completedInspectionsToday: 2,
  pendingMaintenanceOrders: 3,
  pendingRepairOrders: 3,
  totalDowntimeHours: 25.2,
  averageAvailabilityRate: 94.8,
  monthlyTrend: [
    { month: '1月', downtimeHours: 32.5, availabilityRate: 93.2 },
    { month: '2月', downtimeHours: 28.3, availabilityRate: 94.1 },
    { month: '3月', downtimeHours: 35.8, availabilityRate: 92.5 },
    { month: '4月', downtimeHours: 22.1, availabilityRate: 95.4 },
    { month: '5月', downtimeHours: 28.7, availabilityRate: 94.0 },
    { month: '6月', downtimeHours: 25.2, availabilityRate: 94.8 },
  ],
  downtimeByDevice: [
    { deviceName: '数控磨床MK1320', downtimeHours: 8.5 },
    { deviceName: '数控车床CK6140', downtimeHours: 8.0 },
    { deviceName: '龙门加工中心GMC2518', downtimeHours: 3.0 },
    { deviceName: '数控车床CK6150', downtimeHours: 10.0 },
    { deviceName: '立式加工中心VMC850', downtimeHours: 1.5 },
    { deviceName: '卧式加工中心HMC630', downtimeHours: 1.0 },
  ],
  faultTypeDistribution: [
    { type: '机械故障', count: 8 },
    { type: '电气故障', count: 5 },
    { type: '液压系统', count: 4 },
    { type: '气动系统', count: 3 },
    { type: '控制系统', count: 6 },
    { type: '其他', count: 2 },
  ],
  maintenanceDueSoon: mockDevices.filter(d => {
    const nextDate = new Date(d.nextMaintenanceDate);
    const today = new Date();
    const diffDays = Math.ceil((nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays >= 0;
  }),
};

export const getStatistics = (): StatisticsData => {
  return mockStatistics;
};

export const getDowntimeRecordsByDevice = (deviceId: string): DowntimeRecord[] => {
  return mockDowntimeRecords.filter(r => r.deviceId === deviceId).sort(
    (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
  );
};

export const getDowntimeRecordsByType = (type: DowntimeRecord['type']): DowntimeRecord[] => {
  return mockDowntimeRecords.filter(r => r.type === type).sort(
    (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
  );
};

export const getTotalDowntimeHours = (): number => {
  return mockDowntimeRecords.reduce((total, record) => {
    return total + (record.durationMinutes ? record.durationMinutes / 60 : 0);
  }, 0);
};
