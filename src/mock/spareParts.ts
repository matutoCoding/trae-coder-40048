import type { SparePart, SparePartRequisition, SparePartRequest } from '../types';

export const mockSpareParts: SparePart[] = [
  {
    id: 'sp-001',
    partCode: 'SP-LG-001',
    partNo: 'SP-LG-001',
    name: '导轨润滑脂',
    category: '润滑油脂',
    specification: '长城7014-1高温润滑脂',
    specifications: '长城7014-1高温润滑脂',
    unit: 'kg',
    stock: 25,
    stockQuantity: 25,
    minStock: 10,
    maxStock: 50,
    price: 85,
    unitPrice: 85,
    location: 'A区-01货架',
    supplier: '长城润滑油',
    status: 'normal',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2025-06-15T00:00:00Z',
  },
  {
    id: 'sp-002',
    partCode: 'SP-ZC-001',
    partNo: 'SP-ZC-001',
    name: '主轴轴承',
    category: '轴承',
    specification: 'NSK 7014AC角接触球轴承',
    specifications: 'NSK 7014AC角接触球轴承',
    unit: '个',
    stock: 4,
    stockQuantity: 4,
    minStock: 5,
    maxStock: 20,
    price: 680,
    unitPrice: 680,
    location: 'B区-03货架',
    supplier: 'NSK授权经销商',
    status: 'low_stock',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2025-06-10T00:00:00Z',
  },
  {
    id: 'sp-003',
    partCode: 'SP-LX-001',
    partNo: 'SP-LX-001',
    name: '液压油滤芯',
    category: '滤芯',
    specification: '黎明液压 FBX-400×20',
    specifications: '黎明液压 FBX-400×20',
    unit: '个',
    stock: 8,
    stockQuantity: 8,
    minStock: 5,
    maxStock: 15,
    price: 120,
    unitPrice: 120,
    location: 'A区-02货架',
    supplier: '黎明液压',
    status: 'normal',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2025-06-12T00:00:00Z',
  },
  {
    id: 'sp-004',
    partCode: 'SP-YH-001',
    partNo: 'SP-YH-001',
    name: '抗磨液压油',
    category: '润滑油脂',
    specification: '美孚DTE25抗磨液压油46#',
    specifications: '美孚DTE25抗磨液压油46#',
    unit: 'L',
    stock: 0,
    stockQuantity: 0,
    minStock: 50,
    maxStock: 200,
    price: 28,
    unitPrice: 28,
    location: 'C区-油桶区',
    supplier: '美孚润滑油',
    status: 'out_of_stock',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2025-06-10T00:00:00Z',
  },
  {
    id: 'sp-005',
    partCode: 'SP-ZC-002',
    partNo: 'SP-ZC-002',
    name: '砂轮主轴轴承',
    category: '轴承',
    specification: 'FAG NN3020ASK.M.SP精密轴承',
    specifications: 'FAG NN3020ASK.M.SP精密轴承',
    unit: '套',
    stock: 1,
    stockQuantity: 1,
    minStock: 2,
    maxStock: 5,
    price: 3200,
    unitPrice: 3200,
    location: 'B区-05货架',
    supplier: 'FAG授权经销商',
    status: 'low_stock',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2025-06-15T00:00:00Z',
  },
  {
    id: 'sp-006',
    partCode: 'SP-PL-001',
    partNo: 'SP-PL-001',
    name: '切削液',
    category: '润滑油脂',
    specification: '嘉实多Syntilo 9918全合成切削液',
    specifications: '嘉实多Syntilo 9918全合成切削液',
    unit: 'L',
    stock: 150,
    stockQuantity: 150,
    minStock: 100,
    maxStock: 500,
    price: 18,
    unitPrice: 18,
    location: 'C区-油桶区',
    supplier: '嘉实多',
    status: 'normal',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2025-06-08T00:00:00Z',
  },
  {
    id: 'sp-007',
    partCode: 'SP-DQ-001',
    partNo: 'SP-DQ-001',
    name: '伺服电机',
    category: '电气元件',
    specification: '发那科A06B-0227-B000伺服电机',
    specifications: '发那科A06B-0227-B000伺服电机',
    unit: '台',
    stock: 2,
    stockQuantity: 2,
    minStock: 2,
    maxStock: 5,
    price: 15800,
    unitPrice: 15800,
    location: 'D区-电气柜',
    supplier: '发那科授权经销商',
    status: 'normal',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2025-05-20T00:00:00Z',
  },
  {
    id: 'sp-008',
    partCode: 'SP-LX-002',
    partNo: 'SP-LX-002',
    name: '空气过滤器',
    category: '滤芯',
    specification: 'SMC AF40-04滤芯',
    specifications: 'SMC AF40-04滤芯',
    unit: '个',
    stock: 12,
    stockQuantity: 12,
    minStock: 10,
    maxStock: 30,
    price: 65,
    unitPrice: 65,
    location: 'A区-03货架',
    supplier: 'SMC授权经销商',
    status: 'normal',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2025-06-05T00:00:00Z',
  },
  {
    id: 'sp-009',
    partCode: 'SP-SS-001',
    partNo: 'SP-SS-001',
    name: '拉爪弹簧',
    category: '机械配件',
    specification: 'BT40主轴拉爪弹簧',
    specifications: 'BT40主轴拉爪弹簧',
    unit: '个',
    stock: 6,
    stockQuantity: 6,
    minStock: 5,
    maxStock: 20,
    price: 45,
    unitPrice: 45,
    location: 'B区-02货架',
    supplier: '台湾丸荣',
    status: 'normal',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2025-06-01T00:00:00Z',
  },
  {
    id: 'sp-010',
    partCode: 'SP-MF-001',
    partNo: 'SP-MF-001',
    name: '密封圈套件',
    category: '密封件',
    specification: '液压缸密封圈修理包',
    specifications: '液压缸密封圈修理包',
    unit: '套',
    stock: 15,
    stockQuantity: 15,
    minStock: 10,
    maxStock: 30,
    price: 180,
    unitPrice: 180,
    location: 'A区-04货架',
    supplier: 'NOK授权经销商',
    status: 'normal',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2025-06-12T00:00:00Z',
  },
];

export const mockSparePartRequisitions: SparePartRequisition[] = [
  {
    id: 'req-001',
    applicantId: 'u002',
    applicantName: '李工',
    items: [
      { sparePartId: 'sp-005', name: '砂轮主轴轴承', requestedQuantity: 1, unit: '套' },
    ],
    purpose: 'MK1320数控磨床主轴维修',
    status: 'pending',
    createdAt: '2025-06-16T08:30:00Z',
  },
  {
    id: 'req-002',
    applicantId: 'u002',
    applicantName: '李工',
    approverId: 'u001',
    approverName: '张管理',
    items: [
      { sparePartId: 'sp-001', name: '导轨润滑脂', requestedQuantity: 2, issuedQuantity: 2, unit: 'kg' },
      { sparePartId: 'sp-003', name: '液压油滤芯', requestedQuantity: 1, issuedQuantity: 1, unit: '个' },
    ],
    purpose: 'XK715数控铣床月度保养',
    status: 'issued',
    approvedAt: '2025-06-16T08:00:00Z',
    issuedAt: '2025-06-16T08:30:00Z',
    createdAt: '2025-06-15T14:00:00Z',
  },
  {
    id: 'req-003',
    applicantId: 'u003',
    applicantName: '王工',
    approverId: 'u001',
    approverName: '张管理',
    items: [
      { sparePartId: 'sp-001', name: '导轨润滑脂', requestedQuantity: 3, issuedQuantity: 3, unit: 'kg' },
      { sparePartId: 'sp-002', name: '主轴轴承', requestedQuantity: 2, issuedQuantity: 2, unit: '个' },
    ],
    purpose: 'CK6150数控车床预防性保养',
    status: 'approved',
    approvedAt: '2025-06-15T15:00:00Z',
    createdAt: '2025-06-14T10:00:00Z',
  },
  {
    id: 'req-004',
    applicantId: 'u002',
    applicantName: '李工',
    approverId: 'u001',
    approverName: '张管理',
    items: [
      { sparePartId: 'sp-004', name: '抗磨液压油', requestedQuantity: 20, issuedQuantity: 20, unit: 'L' },
    ],
    purpose: 'HMC630卧式加工中心液压油补充',
    status: 'issued',
    approvedAt: '2025-06-10T08:15:00Z',
    issuedAt: '2025-06-10T08:30:00Z',
    createdAt: '2025-06-10T08:10:00Z',
  },
];

export const getSparePartById = (id: string): SparePart | undefined => {
  return mockSpareParts.find(p => p.id === id);
};

export const getSparePartByNo = (partNo: string): SparePart | undefined => {
  return mockSpareParts.find(p => p.partNo === partNo);
};

export const getSparePartsByCategory = (category: string): SparePart[] => {
  return mockSpareParts.filter(p => p.category === category).sort(
    (a, b) => a.name.localeCompare(b.name)
  );
};

export const getSparePartsByStatus = (status: SparePart['status']): SparePart[] => {
  return mockSpareParts.filter(p => p.status === status).sort(
    (a, b) => a.name.localeCompare(b.name)
  );
};

export const getSparePartRequisitionById = (id: string): SparePartRequisition | undefined => {
  return mockSparePartRequisitions.find(r => r.id === id);
};

export const getSparePartRequisitionsByStatus = (status: SparePartRequisition['status']): SparePartRequisition[] => {
  return mockSparePartRequisitions.filter(r => r.status === status).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};

export const getSparePartCategories = (): string[] => {
  const categories = new Set(mockSpareParts.map(p => p.category));
  return Array.from(categories).sort();
};

export const mockSparePartRequests: SparePartRequest[] = [
  {
    id: 'spr-001',
    requestNo: 'LY20250616001',
    requesterId: 'u002',
    requesterName: '李工',
    requesterDepartment: '设备科',
    purpose: '维修',
    purposeDetail: 'MK1320数控磨床主轴维修',
    deviceId: 'd005',
    items: [
      { partId: 'sp-005', sparePartId: 'sp-005', partName: '砂轮主轴轴承', name: '砂轮主轴轴承', partCode: 'SP-ZC-002', specification: 'FAG NN3020ASK.M.SP精密轴承', quantity: 1, unit: '套', unitPrice: 3200 },
    ],
    totalAmount: 3200,
    status: 'pending',
    createdAt: '2025-06-16T08:30:00Z',
  },
  {
    id: 'spr-002',
    requestNo: 'LY20250615001',
    requesterId: 'u002',
    requesterName: '李工',
    requesterDepartment: '设备科',
    purpose: '保养',
    purposeDetail: 'XK715数控铣床月度保养',
    deviceId: 'd003',
    items: [
      { partId: 'sp-001', sparePartId: 'sp-001', partName: '导轨润滑脂', name: '导轨润滑脂', partCode: 'SP-LG-001', specification: '长城7014-1高温润滑脂', quantity: 2, unit: 'kg', unitPrice: 85 },
      { partId: 'sp-003', sparePartId: 'sp-003', partName: '液压油滤芯', name: '液压油滤芯', partCode: 'SP-LX-001', specification: '黎明液压 FBX-400×20', quantity: 1, unit: '个', unitPrice: 120 },
    ],
    totalAmount: 290,
    status: 'completed',
    approverId: 'u001',
    approverName: '张管理',
    approvedAt: '2025-06-15T08:00:00Z',
    deliveredAt: '2025-06-15T08:30:00Z',
    createdAt: '2025-06-15T08:00:00Z',
  },
  {
    id: 'spr-003',
    requestNo: 'LY20250614001',
    requesterId: 'u003',
    requesterName: '王工',
    requesterDepartment: '设备科',
    purpose: '保养',
    purposeDetail: 'CK6150数控车床预防性保养',
    deviceId: 'd001',
    items: [
      { partId: 'sp-001', sparePartId: 'sp-001', partName: '导轨润滑脂', name: '导轨润滑脂', partCode: 'SP-LG-001', specification: '长城7014-1高温润滑脂', quantity: 3, unit: 'kg', unitPrice: 85 },
      { partId: 'sp-002', sparePartId: 'sp-002', partName: '主轴轴承', name: '主轴轴承', partCode: 'SP-ZC-001', specification: 'NSK 7014AC角接触球轴承', quantity: 2, unit: '个', unitPrice: 680 },
    ],
    totalAmount: 1615,
    status: 'approved',
    approverId: 'u001',
    approverName: '张管理',
    approvedAt: '2025-06-14T15:00:00Z',
    createdAt: '2025-06-14T10:00:00Z',
  },
];

export const getLowStockParts = (): SparePart[] => {
  return mockSpareParts.filter(p => p.status === 'low_stock' || p.status === 'out_of_stock').sort(
    (a, b) => a.stockQuantity - b.stockQuantity
  );
};
