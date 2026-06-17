export interface User {
  id: string;
  username: string;
  realName?: string;
  name: string;
  roleName?: string;
  role: 'admin' | 'engineer' | 'inspector' | 'operator' | 'storekeeper';
  phone?: string;
  email?: string;
  department?: string;
  avatar?: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export type DeviceStatus = 'running' | 'standby' | 'maintenance' | 'fault' | 'offline';

export interface DeviceRealtimeData {
  spindleSpeed: number;
  temperature: number;
  oilPressure: number;
  oilLevel: number;
  vibration?: number;
  power?: number;
}

export interface Device {
  id: string;
  deviceNo: string;
  name: string;
  model: string;
  manufacturer: string;
  location: string;
  status: DeviceStatus;
  healthScore?: number;
  utilizationRate?: number;
  runHours?: number;
  installDate?: string;
  commissionDate?: string;
  lastMaintenanceDate: string;
  nextMaintenanceDate: string;
  lastInspectionDate?: string;
  totalRunningHours?: number;
  specifications?: Record<string, string>;
  realtimeData?: DeviceRealtimeData;
  qrCode?: string;
  createdAt: string;
  updatedAt: string;
}

export type InspectionCycle = 'daily' | 'weekly' | 'monthly' | 'quarterly';
export type InspectionItemType = 'oil_level' | 'oil_pressure' | 'lubrication' | 'temperature' | 'vibration' | 'visual' | 'other';
export type InspectionPlanStatus = 'active' | 'inactive' | 'pending';
export type InspectionResultStatus = 'normal' | 'abnormal' | 'partial' | 'skipped';

export type InspectionItemDataType = 'number' | 'text' | 'select' | 'boolean' | 'image' | 'percentage' | 'options';

export interface InspectionItemOption {
  value: string;
  label: string;
}

export interface InspectionItem {
  id: string;
  name: string;
  type: InspectionItemType;
  category?: string;
  categoryName?: string;
  description?: string;
  dataType?: InspectionItemDataType;
  unit?: string;
  minValue?: number;
  maxValue?: number;
  normalRange?: string;
  standard: string;
  required: boolean;
  isKey?: boolean;
  requireImage?: boolean;
  deviceId?: string;
  applicableModels?: string[];
  options?: InspectionItemOption[];
}

export interface InspectionPlan {
  id: string;
  deviceId: string;
  deviceName: string;
  name: string;
  inspectionType?: string;
  cycle: InspectionCycle;
  executorId: string;
  executorName: string;
  assigneeName?: string;
  items: InspectionItem[];
  startTime: string;
  endTime: string;
  scheduledDate?: string;
  status: InspectionPlanStatus | 'in_progress';
  progress: number;
  createdAt: string;
  updatedAt: string;
}

export interface InspectionItemResult {
  itemId: string;
  value?: number | string;
  status: 'normal' | 'abnormal' | 'skipped';
  remark?: string;
  images?: string[];
}

export interface InspectionRecord {
  id: string;
  planId?: string;
  inspectionPlanId?: string;
  deviceId: string;
  deviceName: string;
  deviceNo: string;
  location?: string;
  inspectorId?: string;
  inspectorName?: string;
  executorId?: string;
  executorName?: string;
  inspectionType?: string;
  inspectionTime?: string;
  items?: InspectionItemResult[];
  results?: InspectionItemResult[];
  abnormalCount?: number;
  normalCount?: number;
  status: 'normal' | 'abnormal' | 'partial' | 'pending' | 'skipped' | 'completed' | 'completed_with_issues';
  remarks?: string;
  images?: string[];
  inspectedAt?: string;
  startTime?: string;
  endTime?: string;
  remark?: string;
  createdAt?: string;
}

export type MaintenanceOrderType = 'routine' | 'preventive' | 'corrective';
export type MaintenanceOrderStatus = 'pending' | 'assigned' | 'in_progress' | 'completed' | 'accepted';

export interface MaintenanceTask {
  id: string;
  name: string;
  description: string;
  category?: string;
  dataType?: string;
  requireImage?: boolean;
  status: 'pending' | 'in_progress' | 'completed';
  completedAt?: string;
}

export interface MaintenanceMaterial {
  sparePartId: string;
  name: string;
  quantity: number;
  unit: string;
}

export interface MaintenanceItemResult {
  id?: string;
  itemId?: string;
  name?: string;
  value?: string | number;
  result?: string;
  remark?: string;
  images?: string[];
  status: 'pending' | 'in_progress' | 'completed' | 'skipped' | 'replaced';
  completedAt?: string;
}

export interface MaintenanceOrder {
  id: string;
  orderNo?: string;
  deviceId: string;
  deviceName: string;
  deviceNo: string;
  title: string;
  maintenanceType?: string;
  type: MaintenanceOrderType;
  priority: Priority;
  description: string;
  tasks: MaintenanceTask[];
  items?: MaintenanceTask[];
  completedItems?: number;
  results?: MaintenanceItemResult[];
  materials: MaintenanceMaterial[];
  spareParts?: SparePartUsage[];
  laborHours?: number;
  totalCost?: number;
  remark?: string;
  assigneeId?: string;
  assigneeName?: string;
  status: MaintenanceOrderStatus;
  scheduledDate: string;
  actualStartDate?: string;
  actualEndDate?: string;
  acceptedBy?: string;
  acceptedByName?: string;
  acceptedAt?: string;
  acceptanceResult?: 'passed' | 'failed' | string;
  acceptanceRemark?: string;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
}

export type FaultType = 'mechanical' | 'electrical' | 'hydraulic' | 'pneumatic' | 'control' | 'other';
export type RepairOrderStatus = 'pending' | 'assigned' | 'in_progress' | 'completed' | 'accepted' | 'rejected' | 'cancelled';
export type Priority = 'low' | 'medium' | 'high' | 'urgent' | string;

export interface RepairLog {
  id: string;
  timestamp: string;
  operatorId: string;
  operatorName: string;
  action: string;
  description: string;
  images?: string[];
}

export interface SparePartUsage {
  partId?: string;
  sparePartId?: string;
  partName?: string;
  name?: string;
  partCode?: string;
  specification?: string;
  quantity: number;
  unit: string;
  unitPrice?: number;
  requisitionId?: string;
}

export interface RepairOrder {
  id: string;
  orderNo?: string;
  deviceId: string;
  deviceName: string;
  deviceNo: string;
  title: string;
  faultType: string;
  priority: Priority;
  description: string;
  faultDescription?: string;
  images?: string[];
  reporterId: string;
  reporterName: string;
  reporterPhone?: string;
  location?: string;
  estimatedDowntime?: number;
  assigneeId?: string;
  assigneeName?: string;
  status: RepairOrderStatus;
  repairLogs?: RepairLog[];
  processLogs?: RepairProcessLog[];
  sparePartsUsed?: SparePartUsage[];
  spareParts?: SparePartUsage[];
  diagnosis?: string;
  solution?: string;
  remark?: string;
  laborHours?: number;
  totalCost?: number;
  actualStartDate?: string;
  actualEndDate?: string;
  downtimeStart?: string;
  downtimeEnd?: string;
  totalDowntimeMinutes?: number;
  createdAt: string;
  updatedAt: string;
}

export interface RepairProcessLog {
  id: string;
  operatorId: string;
  operatorName: string;
  timestamp: string;
  action: string;
  remark?: string;
}

export type SparePartStatus = 'normal' | 'low_stock' | 'out_of_stock';
export type RequisitionStatus = 'pending' | 'approved' | 'rejected' | 'issued';

export interface SparePart {
  id: string;
  partCode?: string;
  partNo?: string;
  name: string;
  category: string;
  specification?: string;
  specifications?: string;
  unit: string;
  stock?: number;
  stockQuantity?: number;
  minStock: number;
  maxStock: number;
  price?: number;
  unitPrice?: number;
  location: string;
  supplier?: string;
  status: SparePartStatus;
  createdAt: string;
  updatedAt: string;
}

export interface RequisitionItem {
  sparePartId: string;
  name: string;
  requestedQuantity: number;
  issuedQuantity?: number;
  unit: string;
}

export interface SparePartRequest {
  id: string;
  requestNo: string;
  requesterId: string;
  requesterName: string;
  requesterDepartment: string;
  purpose: string;
  purposeDetail?: string;
  deviceId?: string;
  items: SparePartUsage[];
  totalAmount: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  approverId?: string;
  approverName?: string;
  approvedAt?: string;
  rejectReason?: string;
  deliveredAt?: string;
  createdAt: string;
}

export interface SparePartRequisition {
  id: string;
  applicantId: string;
  applicantName: string;
  approverId?: string;
  approverName?: string;
  items: RequisitionItem[];
  purpose: string;
  status: RequisitionStatus;
  approvedAt?: string;
  issuedAt?: string;
  createdAt: string;
}

export type DowntimeType = 'fault' | 'maintenance' | 'planned';

export interface DowntimeRecord {
  id: string;
  deviceId: string;
  deviceName: string;
  type: DowntimeType;
  reason: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  durationMinutes?: number;
  relatedOrderId?: string;
  createdAt: string;
}

export interface StatisticsData {
  totalDevices: number;
  runningDevices: number;
  faultDevices: number;
  maintenanceDevices: number;
  totalInspectionsToday: number;
  completedInspectionsToday: number;
  pendingMaintenanceOrders: number;
  pendingRepairOrders: number;
  totalDowntimeHours: number;
  averageAvailabilityRate: number;
  availabilityRate?: number;
  monthlyDowntime?: number;
  inspectionCompletionRate?: number;
  monthlyTrend: { month: string; downtimeHours: number; availabilityRate: number }[];
  downtimeByDevice: { deviceName: string; downtimeHours: number }[];
  faultTypeDistribution: { type: string; count: number }[];
  maintenanceDueSoon: Device[];
}
