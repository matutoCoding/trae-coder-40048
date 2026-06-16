import type { InspectionPlan, InspectionRecord, InspectionItem } from '../types';

export const standardInspectionItems: InspectionItem[] = [
  {
    id: 'item-001',
    name: '主轴油位检查',
    type: 'oil_level',
    unit: 'mm',
    minValue: 20,
    maxValue: 30,
    standard: '油位应在20-30mm之间，低于20mm需补充',
    required: true,
  },
  {
    id: 'item-002',
    name: '液压系统油压',
    type: 'oil_pressure',
    unit: 'MPa',
    minValue: 4.0,
    maxValue: 6.0,
    standard: '系统油压应保持在4.0-6.0MPa',
    required: true,
  },
  {
    id: 'item-003',
    name: 'X轴导轨润滑',
    type: 'lubrication',
    standard: '检查润滑管路畅通，油膜均匀无干涸',
    required: true,
  },
  {
    id: 'item-004',
    name: 'Y轴导轨润滑',
    type: 'lubrication',
    standard: '检查润滑管路畅通，油膜均匀无干涸',
    required: true,
  },
  {
    id: 'item-005',
    name: 'Z轴导轨润滑',
    type: 'lubrication',
    standard: '检查润滑管路畅通，油膜均匀无干涸',
    required: true,
  },
  {
    id: 'item-006',
    name: '主轴运转温度',
    type: 'temperature',
    unit: '°C',
    maxValue: 60,
    standard: '主轴连续运转后温度不应超过60°C',
    required: true,
  },
  {
    id: 'item-007',
    name: '设备振动检测',
    type: 'vibration',
    unit: 'mm/s',
    maxValue: 2.8,
    standard: '振动值应小于2.8mm/s',
    required: false,
  },
  {
    id: 'item-008',
    name: '外观检查',
    type: 'visual',
    standard: '检查设备外观是否有异常磨损、漏油、异响等',
    required: true,
  },
];

export const mockInspectionPlans: InspectionPlan[] = [
  {
    id: 'plan-001',
    deviceId: 'd001',
    deviceName: '数控车床CK6150',
    name: 'CK6150每日点检',
    cycle: 'daily',
    executorId: 'u004',
    executorName: '赵点检',
    items: [
      standardInspectionItems[0],
      standardInspectionItems[1],
      standardInspectionItems[2],
      standardInspectionItems[3],
      standardInspectionItems[4],
      standardInspectionItems[7],
    ],
    startTime: '08:00',
    endTime: '08:30',
    status: 'active',
    progress: 85,
    createdAt: '2025-06-01T00:00:00Z',
    updatedAt: '2025-06-16T00:00:00Z',
  },
  {
    id: 'plan-002',
    deviceId: 'd001',
    deviceName: '数控车床CK6150',
    name: 'CK6150每周点检',
    cycle: 'weekly',
    executorId: 'u004',
    executorName: '赵点检',
    items: [
      ...standardInspectionItems,
      {
        id: 'item-009',
        name: '电气柜清洁',
        type: 'other',
        standard: '清理电气柜内灰尘，检查接线端子',
        required: true,
      },
    ],
    startTime: '08:00',
    endTime: '10:00',
    status: 'active',
    progress: 100,
    createdAt: '2025-06-01T00:00:00Z',
    updatedAt: '2025-06-10T00:00:00Z',
  },
  {
    id: 'plan-003',
    deviceId: 'd002',
    deviceName: '立式加工中心VMC850',
    name: 'VMC850每日点检',
    cycle: 'daily',
    executorId: 'u005',
    executorName: '钱点检',
    items: [
      standardInspectionItems[0],
      standardInspectionItems[1],
      standardInspectionItems[2],
      standardInspectionItems[3],
      standardInspectionItems[4],
      standardInspectionItems[5],
      standardInspectionItems[7],
    ],
    startTime: '08:30',
    endTime: '09:00',
    status: 'active',
    progress: 60,
    createdAt: '2025-06-01T00:00:00Z',
    updatedAt: '2025-06-16T00:00:00Z',
  },
  {
    id: 'plan-004',
    deviceId: 'd003',
    deviceName: '数控铣床XK715',
    name: 'XK715每日点检',
    cycle: 'daily',
    executorId: 'u004',
    executorName: '赵点检',
    items: [
      standardInspectionItems[0],
      standardInspectionItems[1],
      standardInspectionItems[2],
      standardInspectionItems[3],
      standardInspectionItems[4],
      standardInspectionItems[7],
    ],
    startTime: '09:00',
    endTime: '09:30',
    status: 'active',
    progress: 0,
    createdAt: '2025-06-01T00:00:00Z',
    updatedAt: '2025-06-15T00:00:00Z',
  },
  {
    id: 'plan-005',
    deviceId: 'd006',
    deviceName: '数控车床CK6140',
    name: 'CK6140每月点检',
    cycle: 'monthly',
    executorId: 'u005',
    executorName: '钱点检',
    items: standardInspectionItems,
    startTime: '08:00',
    endTime: '12:00',
    status: 'inactive',
    progress: 100,
    createdAt: '2025-05-01T00:00:00Z',
    updatedAt: '2025-06-01T00:00:00Z',
  },
];

export const mockInspectionRecords: InspectionRecord[] = [
  {
    id: 'record-001',
    planId: 'plan-001',
    deviceId: 'd001',
    deviceName: '数控车床CK6150',
    deviceNo: 'CNC-001',
    executorId: 'u004',
    executorName: '赵点检',
    items: [
      { itemId: 'item-001', value: 25, status: 'normal' },
      { itemId: 'item-002', value: 5.2, status: 'normal' },
      { itemId: 'item-003', status: 'normal' },
      { itemId: 'item-004', status: 'normal' },
      { itemId: 'item-005', status: 'normal' },
      { itemId: 'item-007', status: 'normal' },
    ],
    status: 'normal',
    remark: '设备状态良好，各项指标正常',
    startTime: '2025-06-16T08:00:00Z',
    endTime: '2025-06-16T08:25:00Z',
    createdAt: '2025-06-16T08:25:00Z',
  },
  {
    id: 'record-002',
    planId: 'plan-003',
    deviceId: 'd002',
    deviceName: '立式加工中心VMC850',
    deviceNo: 'CNC-002',
    executorId: 'u005',
    executorName: '钱点检',
    items: [
      { itemId: 'item-001', value: 18, status: 'abnormal', remark: '油位偏低，已补充' },
      { itemId: 'item-002', value: 5.5, status: 'normal' },
      { itemId: 'item-003', status: 'normal' },
    ],
    status: 'partial',
    remark: '主轴油位偏低，已补充润滑油',
    images: ['/images/oil-refill.jpg'],
    startTime: '2025-06-16T08:30:00Z',
    endTime: '2025-06-16T08:50:00Z',
    createdAt: '2025-06-16T08:50:00Z',
  },
  {
    id: 'record-003',
    planId: 'plan-004',
    deviceId: 'd003',
    deviceName: '数控铣床XK715',
    deviceNo: 'CNC-003',
    executorId: 'u004',
    executorName: '赵点检',
    items: [
      { itemId: 'item-001', value: 22, status: 'normal' },
      { itemId: 'item-002', value: 6.5, status: 'abnormal', remark: '油压偏高，建议检查' },
      { itemId: 'item-003', status: 'normal' },
      { itemId: 'item-004', status: 'abnormal', remark: 'Y轴导轨有异响，需安排检查' },
      { itemId: 'item-005', status: 'normal' },
      { itemId: 'item-007', status: 'abnormal', remark: '发现少量漏油痕迹' },
    ],
    status: 'abnormal',
    remark: '发现多处异常，已生成维修工单',
    images: ['/images/abnormal-1.jpg', '/images/abnormal-2.jpg'],
    startTime: '2025-06-15T09:00:00Z',
    endTime: '2025-06-15T09:45:00Z',
    createdAt: '2025-06-15T09:45:00Z',
  },
];

export const getInspectionPlanById = (id: string): InspectionPlan | undefined => {
  return mockInspectionPlans.find(p => p.id === id);
};

export const getInspectionPlansByDevice = (deviceId: string): InspectionPlan[] => {
  return mockInspectionPlans.filter(p => p.deviceId === deviceId);
};

export const getInspectionPlansByCycle = (cycle: InspectionPlan['cycle']): InspectionPlan[] => {
  return mockInspectionPlans.filter(p => p.cycle === cycle);
};

export const getInspectionPlansByExecutor = (executorId: string): InspectionPlan[] => {
  return mockInspectionPlans.filter(p => p.executorId === executorId);
};

export const getInspectionRecordsByDevice = (deviceId: string): InspectionRecord[] => {
  return mockInspectionRecords.filter(r => r.deviceId === deviceId).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};

export const getInspectionRecordsByExecutor = (executorId: string): InspectionRecord[] => {
  return mockInspectionRecords.filter(r => r.executorId === executorId).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};

export const mockInspectionItems: InspectionItem[] = standardInspectionItems;

export const getTodayInspectionCount = (): { total: number; completed: number } => {
  const today = new Date().toISOString().split('T')[0];
  const activePlans = mockInspectionPlans.filter(p => p.status === 'active' && p.cycle === 'daily');
  const completedToday = mockInspectionRecords.filter(
    r => r.createdAt.startsWith(today)
  ).length;
  return {
    total: activePlans.length,
    completed: completedToday,
  };
};
