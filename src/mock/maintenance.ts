import type { MaintenanceOrder } from '../types';

export const mockMaintenanceOrders: MaintenanceOrder[] = [
  {
    id: 'mo-001',
    deviceId: 'd003',
    deviceName: '数控铣床XK715',
    deviceNo: 'CNC-003',
    title: 'XK715月度保养',
    type: 'routine',
    priority: 'medium',
    description: '按照月度保养计划执行全面保养，包括导轨润滑、油路清洗、电气检查等',
    tasks: [
      { id: 't-001', name: 'X轴导轨润滑保养', description: '清理导轨面，加注润滑脂，检查润滑系统', status: 'completed', completedAt: '2025-06-17T09:00:00Z' },
      { id: 't-002', name: 'Y轴导轨润滑保养', description: '清理导轨面，加注润滑脂，检查润滑系统', status: 'in_progress' },
      { id: 't-003', name: 'Z轴导轨润滑保养', description: '清理导轨面，加注润滑脂，检查润滑系统', status: 'pending' },
      { id: 't-004', name: '液压系统检查', description: '检查液压油位、滤芯、密封件，必要时更换', status: 'pending' },
      { id: 't-005', name: '电气柜清洁检查', description: '清理电气柜灰尘，紧固接线端子，检查接触器', status: 'pending' },
    ],
    materials: [
      { sparePartId: 'sp-001', name: '导轨润滑脂', quantity: 2, unit: 'kg' },
      { sparePartId: 'sp-003', name: '液压油滤芯', quantity: 1, unit: '个' },
    ],
    assigneeId: 'u002',
    assigneeName: '李工',
    status: 'in_progress',
    scheduledDate: '2025-06-17',
    actualStartDate: '2025-06-17T08:00:00Z',
    createdBy: 'u001',
    createdByName: '张管理',
    createdAt: '2025-06-10T00:00:00Z',
    updatedAt: '2025-06-17T09:30:00Z',
  },
  {
    id: 'mo-002',
    deviceId: 'd001',
    deviceName: '数控车床CK6150',
    deviceNo: 'CNC-001',
    title: 'CK6150预防性保养',
    type: 'preventive',
    priority: 'high',
    description: '设备运行已达12000小时，需要进行全面预防性保养',
    tasks: [
      { id: 't-006', name: '主轴轴承更换', description: '检查主轴轴承磨损情况，必要时更换', status: 'pending' },
      { id: 't-007', name: '丝杠间隙调整', description: '检查并调整各轴丝杠间隙', status: 'pending' },
      { id: 't-008', name: '换刀机构保养', description: '清洁换刀机构，润滑运动部件', status: 'pending' },
    ],
    materials: [
      { sparePartId: 'sp-002', name: '主轴轴承', quantity: 2, unit: '个' },
      { sparePartId: 'sp-001', name: '导轨润滑脂', quantity: 3, unit: 'kg' },
    ],
    assigneeId: 'u003',
    assigneeName: '王工',
    status: 'assigned',
    scheduledDate: '2025-06-20',
    createdBy: 'u001',
    createdByName: '张管理',
    createdAt: '2025-06-12T00:00:00Z',
    updatedAt: '2025-06-15T10:00:00Z',
  },
  {
    id: 'mo-003',
    deviceId: 'd004',
    deviceName: '数控磨床MK1320',
    deviceNo: 'CNC-004',
    title: 'MK1320砂轮主轴修复',
    type: 'corrective',
    priority: 'urgent',
    description: '砂轮主轴有异响，需要拆卸检查并修复',
    tasks: [
      { id: 't-009', name: '主轴拆卸检查', description: '拆卸砂轮主轴，检查轴承和轴瓦', status: 'pending' },
      { id: 't-010', name: '主轴修复', description: '根据检查结果进行修复或更换', status: 'pending' },
      { id: 't-011', name: '安装调试', description: '安装主轴并进行动平衡调试', status: 'pending' },
    ],
    materials: [
      { sparePartId: 'sp-005', name: '砂轮主轴轴承', quantity: 1, unit: '套' },
    ],
    status: 'pending',
    scheduledDate: '2025-06-18',
    createdBy: 'u001',
    createdByName: '张管理',
    createdAt: '2025-06-15T09:00:00Z',
    updatedAt: '2025-06-15T09:00:00Z',
  },
  {
    id: 'mo-004',
    deviceId: 'd006',
    deviceName: '数控车床CK6140',
    deviceNo: 'CNC-006',
    title: 'CK6140季度保养',
    type: 'routine',
    priority: 'low',
    description: '季度例行保养，检查各系统运行状态',
    tasks: [
      { id: 't-012', name: '全面润滑保养', description: '所有润滑点加注润滑脂', status: 'completed', completedAt: '2025-06-05T10:00:00Z' },
      { id: 't-013', name: '精度检测', description: '检测各轴定位精度和重复定位精度', status: 'completed', completedAt: '2025-06-05T14:00:00Z' },
      { id: 't-014', name: '安全检查', description: '检查安全门、急停、限位开关等安全装置', status: 'completed', completedAt: '2025-06-05T15:30:00Z' },
    ],
    materials: [
      { sparePartId: 'sp-001', name: '导轨润滑脂', quantity: 1, unit: 'kg' },
    ],
    assigneeId: 'u002',
    assigneeName: '李工',
    status: 'accepted',
    scheduledDate: '2025-06-05',
    actualStartDate: '2025-06-05T08:00:00Z',
    actualEndDate: '2025-06-05T16:00:00Z',
    createdBy: 'u001',
    createdByName: '张管理',
    createdAt: '2025-05-28T00:00:00Z',
    updatedAt: '2025-06-06T10:00:00Z',
  },
  {
    id: 'mo-005',
    deviceId: 'd007',
    deviceName: '龙门加工中心GMC2518',
    deviceNo: 'CNC-007',
    title: 'GMC2518刀库保养',
    type: 'preventive',
    priority: 'medium',
    description: '刀库换刀频繁，需要定期保养确保运行可靠',
    tasks: [
      { id: 't-015', name: '刀库清洁', description: '清洁刀库内的切屑和灰尘', status: 'pending' },
      { id: 't-016', name: '换刀臂润滑', description: '润滑换刀臂运动副', status: 'pending' },
      { id: 't-017', name: '刀套检查', description: '检查刀套夹紧力和定位精度', status: 'pending' },
    ],
    materials: [],
    assigneeId: 'u003',
    assigneeName: '王工',
    status: 'completed',
    scheduledDate: '2025-06-14',
    actualStartDate: '2025-06-14T09:00:00Z',
    actualEndDate: '2025-06-14T12:00:00Z',
    createdBy: 'u001',
    createdByName: '张管理',
    createdAt: '2025-06-07T00:00:00Z',
    updatedAt: '2025-06-14T12:30:00Z',
  },
];

export const getMaintenanceOrderById = (id: string): MaintenanceOrder | undefined => {
  return mockMaintenanceOrders.find(o => o.id === id);
};

export const getMaintenanceOrdersByDevice = (deviceId: string): MaintenanceOrder[] => {
  return mockMaintenanceOrders.filter(o => o.deviceId === deviceId).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};

export const getMaintenanceOrdersByStatus = (status: MaintenanceOrder['status']): MaintenanceOrder[] => {
  return mockMaintenanceOrders.filter(o => o.status === status).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};

export const getMaintenanceOrdersByAssignee = (assigneeId: string): MaintenanceOrder[] => {
  return mockMaintenanceOrders.filter(o => o.assigneeId === assigneeId).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};

export const getPendingMaintenanceCount = (): number => {
  return mockMaintenanceOrders.filter(o => o.status === 'pending' || o.status === 'assigned').length;
};
