import type { RepairOrder } from '../types';

export const mockRepairOrders: RepairOrder[] = [
  {
    id: 'ro-001',
    deviceId: 'd004',
    deviceName: '数控磨床MK1320',
    deviceNo: 'CNC-004',
    title: '砂轮主轴异响',
    faultType: 'mechanical',
    priority: 'urgent',
    description: '砂轮主轴运转时发出异响，振动明显增大，已停机等待维修',
    images: ['/images/fault-1.jpg', '/images/fault-2.jpg'],
    reporterId: 'u006',
    reporterName: '孙操作',
    assigneeId: 'u002',
    assigneeName: '李工',
    status: 'in_progress',
    repairLogs: [
      {
        id: 'log-001',
        timestamp: '2025-06-15T09:30:00Z',
        operatorId: 'u006',
        operatorName: '孙操作',
        action: '报修登记',
        description: '发现主轴异响，振动大，已停机并提交报修',
      },
      {
        id: 'log-002',
        timestamp: '2025-06-15T09:45:00Z',
        operatorId: 'u001',
        operatorName: '张管理',
        action: '派单',
        description: '已派单给李工处理此故障',
      },
      {
        id: 'log-003',
        timestamp: '2025-06-15T10:00:00Z',
        operatorId: 'u002',
        operatorName: '李工',
        action: '接单',
        description: '已接单，正在准备工具和备件前往现场',
      },
      {
        id: 'log-004',
        timestamp: '2025-06-15T10:30:00Z',
        operatorId: 'u002',
        operatorName: '李工',
        action: '故障诊断',
        description: '初步判断为轴承磨损，需要拆卸检查确认',
        images: ['/images/diagnosis-1.jpg'],
      },
      {
        id: 'log-005',
        timestamp: '2025-06-16T08:30:00Z',
        operatorId: 'u002',
        operatorName: '李工',
        action: '维修中',
        description: '已申请主轴轴承备件，等待备件出库后进行更换',
      },
    ],
    sparePartsUsed: [],
    downtimeStart: '2025-06-15T09:30:00Z',
    createdAt: '2025-06-15T09:30:00Z',
    updatedAt: '2025-06-16T08:30:00Z',
  },
  {
    id: 'ro-002',
    deviceId: 'd003',
    deviceName: '数控铣床XK715',
    deviceNo: 'CNC-003',
    title: 'Y轴导轨异响',
    faultType: 'mechanical',
    priority: 'high',
    description: 'Y轴移动时有异响，点检时发现，需安排检查',
    reporterId: 'u004',
    reporterName: '赵点检',
    assigneeId: 'u003',
    assigneeName: '王工',
    status: 'assigned',
    repairLogs: [
      {
        id: 'log-006',
        timestamp: '2025-06-15T09:45:00Z',
        operatorId: 'u004',
        operatorName: '赵点检',
        action: '报修登记',
        description: '日常点检时发现Y轴导轨有异响，建议安排检查',
      },
      {
        id: 'log-007',
        timestamp: '2025-06-15T10:00:00Z',
        operatorId: 'u001',
        operatorName: '张管理',
        action: '派单',
        description: '已派单给王工，安排在保养期间一并检查',
      },
    ],
    sparePartsUsed: [],
    downtimeStart: '2025-06-15T14:00:00Z',
    createdAt: '2025-06-15T09:45:00Z',
    updatedAt: '2025-06-15T10:00:00Z',
  },
  {
    id: 'ro-003',
    deviceId: 'd001',
    deviceName: '数控车床CK6150',
    deviceNo: 'CNC-001',
    title: '换刀机构卡滞',
    faultType: 'pneumatic',
    priority: 'medium',
    description: '换刀时偶尔出现卡滞，需要手动复位后才能继续',
    reporterId: 'u007',
    reporterName: '周操作',
    status: 'pending',
    repairLogs: [
      {
        id: 'log-008',
        timestamp: '2025-06-16T10:20:00Z',
        operatorId: 'u007',
        operatorName: '周操作',
        action: '报修登记',
        description: '换刀过程中偶尔卡滞，影响生产效率',
        images: ['/images/tool-change.jpg'],
      },
    ],
    sparePartsUsed: [],
    downtimeStart: '2025-06-16T10:20:00Z',
    createdAt: '2025-06-16T10:20:00Z',
    updatedAt: '2025-06-16T10:20:00Z',
  },
  {
    id: 'ro-004',
    deviceId: 'd005',
    deviceName: '卧式加工中心HMC630',
    deviceNo: 'CNC-005',
    title: '液压系统报警',
    faultType: 'hydraulic',
    priority: 'high',
    description: '开机时液压系统压力报警，无法正常启动',
    reporterId: 'u006',
    reporterName: '孙操作',
    assigneeId: 'u002',
    assigneeName: '李工',
    status: 'completed',
    repairLogs: [
      {
        id: 'log-009',
        timestamp: '2025-06-10T08:00:00Z',
        operatorId: 'u006',
        operatorName: '孙操作',
        action: '报修登记',
        description: '液压系统压力报警，无法启动',
      },
      {
        id: 'log-010',
        timestamp: '2025-06-10T08:15:00Z',
        operatorId: 'u001',
        operatorName: '张管理',
        action: '派单',
        description: '紧急派单给李工处理',
      },
      {
        id: 'log-011',
        timestamp: '2025-06-10T08:30:00Z',
        operatorId: 'u002',
        operatorName: '李工',
        action: '故障诊断',
        description: '检查发现液压油位过低，导致压力不足',
      },
      {
        id: 'log-012',
        timestamp: '2025-06-10T09:00:00Z',
        operatorId: 'u002',
        operatorName: '李工',
        action: '维修完成',
        description: '已补充液压油至标准油位，系统恢复正常',
      },
    ],
    sparePartsUsed: [
      { sparePartId: 'sp-004', name: '抗磨液压油', quantity: 20, unit: 'L' },
    ],
    downtimeStart: '2025-06-10T08:00:00Z',
    downtimeEnd: '2025-06-10T09:00:00Z',
    totalDowntimeMinutes: 60,
    createdAt: '2025-06-10T08:00:00Z',
    updatedAt: '2025-06-10T09:30:00Z',
  },
  {
    id: 'ro-005',
    deviceId: 'd002',
    deviceName: '立式加工中心VMC850',
    deviceNo: 'CNC-002',
    title: '控制系统报警',
    faultType: 'control',
    priority: 'medium',
    description: '加工过程中偶尔出现过载报警，复位后可继续',
    reporterId: 'u007',
    reporterName: '周操作',
    assigneeId: 'u003',
    assigneeName: '王工',
    status: 'accepted',
    repairLogs: [
      {
        id: 'log-013',
        timestamp: '2025-06-08T14:00:00Z',
        operatorId: 'u007',
        operatorName: '周操作',
        action: '报修登记',
        description: '加工时偶尔出现伺服过载报警',
      },
      {
        id: 'log-014',
        timestamp: '2025-06-08T14:30:00Z',
        operatorId: 'u003',
        operatorName: '王工',
        action: '故障诊断',
        description: '检查发现伺服参数设置不合理，切削参数过高',
      },
      {
        id: 'log-015',
        timestamp: '2025-06-08T15:30:00Z',
        operatorId: 'u003',
        operatorName: '王工',
        action: '维修完成',
        description: '已优化伺服参数和切削参数，运行测试正常',
      },
      {
        id: 'log-016',
        timestamp: '2025-06-09T08:00:00Z',
        operatorId: 'u007',
        operatorName: '周操作',
        action: '验收确认',
        description: '设备运行一天未再出现报警，确认修复',
      },
    ],
    sparePartsUsed: [],
    downtimeStart: '2025-06-08T14:00:00Z',
    downtimeEnd: '2025-06-08T15:30:00Z',
    totalDowntimeMinutes: 90,
    createdAt: '2025-06-08T14:00:00Z',
    updatedAt: '2025-06-09T08:00:00Z',
  },
];

export const getRepairOrderById = (id: string): RepairOrder | undefined => {
  return mockRepairOrders.find(o => o.id === id);
};

export const getRepairOrdersByDevice = (deviceId: string): RepairOrder[] => {
  return mockRepairOrders.filter(o => o.deviceId === deviceId).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};

export const getRepairOrdersByStatus = (status: RepairOrder['status']): RepairOrder[] => {
  return mockRepairOrders.filter(o => o.status === status).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};

export const getRepairOrdersByReporter = (reporterId: string): RepairOrder[] => {
  return mockRepairOrders.filter(o => o.reporterId === reporterId).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};

export const getRepairOrdersByAssignee = (assigneeId: string): RepairOrder[] => {
  return mockRepairOrders.filter(o => o.assigneeId === assigneeId).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};

export const getPendingRepairCount = (): number => {
  return mockRepairOrders.filter(o => o.status === 'pending' || o.status === 'assigned').length;
};
