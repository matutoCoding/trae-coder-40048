import { create } from 'zustand';
import type { User, Device, InspectionPlan, InspectionRecord, MaintenanceOrder, RepairOrder, SparePart, SparePartRequisition, SparePartRequest, StatisticsData, DowntimeRecord, InspectionItem } from '../types';
import { mockUsers, getCurrentUser } from '../mock/users';
import { mockDevices } from '../mock/devices';
import { mockInspectionPlans, mockInspectionRecords, mockInspectionItems } from '../mock/inspection';
import { mockMaintenanceOrders } from '../mock/maintenance';
import { mockRepairOrders } from '../mock/repair';
import { mockSpareParts, mockSparePartRequisitions, mockSparePartRequests } from '../mock/spareParts';
import { mockStatistics, mockDowntimeRecords } from '../mock/statistics';

interface AppState {
  user: User | null;
  devices: Device[];
  inspectionPlans: InspectionPlan[];
  inspectionRecords: InspectionRecord[];
  inspectionItems: InspectionItem[];
  maintenanceOrders: MaintenanceOrder[];
  repairOrders: RepairOrder[];
  spareParts: SparePart[];
  sparePartRequisitions: SparePartRequisition[];
  sparePartRequests: SparePartRequest[];
  downtimeRecords: DowntimeRecord[];
  statistics: StatisticsData;
  isLoading: boolean;
  activeTab: string;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  setActiveTab: (tab: string) => void;
  addInspectionRecord: (record: InspectionRecord) => void;
  updateMaintenanceOrder: (id: string, updates: Partial<MaintenanceOrder>) => void;
  updateRepairOrder: (id: string, updates: Partial<RepairOrder>) => void;
  addRepairOrder: (order: RepairOrder) => void;
  createMaintenanceOrder: (order: Partial<MaintenanceOrder>) => MaintenanceOrder;
  createRepairOrder: (order: Partial<RepairOrder>) => RepairOrder;
  updateDeviceStatus: (deviceId: string, status: Device['status']) => void;
  addSparePartRequisition: (requisition: SparePartRequisition) => void;
  updateSparePartRequisition: (requisition: SparePartRequisition) => void;
  addSparePartRequest: (request: SparePartRequest) => void;
  updateSparePartRequest: (id: string, updates: Partial<SparePartRequest>) => void;
  createSparePartRequest: (request: Partial<SparePartRequest>) => SparePartRequest;
  updateSparePartStock: (partId: string, quantity: number) => void;
  getDeviceById: (id: string) => Device | undefined;
  getMaintenanceOrderById: (id: string) => MaintenanceOrder | undefined;
  getRepairOrderById: (id: string) => RepairOrder | undefined;
  getSparePartRequestById: (id: string) => SparePartRequest | undefined;
}

export const useAppStore = create<AppState>((set, get) => ({
  user: null,
  devices: mockDevices,
  inspectionPlans: mockInspectionPlans,
  inspectionRecords: mockInspectionRecords,
  inspectionItems: mockInspectionItems,
  maintenanceOrders: mockMaintenanceOrders,
  repairOrders: mockRepairOrders,
  spareParts: mockSpareParts,
  sparePartRequisitions: mockSparePartRequisitions,
  sparePartRequests: mockSparePartRequests,
  downtimeRecords: mockDowntimeRecords,
  statistics: mockStatistics,
  isLoading: false,
  activeTab: 'dashboard',

  login: async (username: string, password: string) => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const user = mockUsers.find(u => u.username === username);
    if (user && password === '123456') {
      set({ user, isLoading: false });
      localStorage.setItem('cnc_user', JSON.stringify(user));
      return true;
    }
    set({ isLoading: false });
    return false;
  },

  logout: () => {
    set({ user: null, activeTab: 'dashboard' });
    localStorage.removeItem('cnc_user');
  },

  setActiveTab: (tab: string) => set({ activeTab: tab }),

  addInspectionRecord: (record: InspectionRecord) => {
    set(state => ({
      inspectionRecords: [record, ...state.inspectionRecords],
    }));
  },

  updateMaintenanceOrder: (id: string, updates: Partial<MaintenanceOrder>) => {
    set(state => ({
      maintenanceOrders: state.maintenanceOrders.map(o => 
        o.id === id ? { ...o, ...updates, updatedAt: new Date().toISOString() } : o
      ),
    }));
  },

  updateRepairOrder: (id: string, updates: Partial<RepairOrder>) => {
    set(state => ({
      repairOrders: state.repairOrders.map(o => 
        o.id === id ? { ...o, ...updates, updatedAt: new Date().toISOString() } : o
      ),
    }));
  },

  addRepairOrder: (order: RepairOrder) => {
    set(state => ({
      repairOrders: [order, ...state.repairOrders],
    }));
  },

  addSparePartRequisition: (requisition: SparePartRequisition) => {
    set(state => ({
      sparePartRequisitions: [requisition, ...state.sparePartRequisitions],
    }));
  },

  updateSparePartRequisition: (requisition: SparePartRequisition) => {
    set(state => ({
      sparePartRequisitions: state.sparePartRequisitions.map(r => 
        r.id === requisition.id ? requisition : r
      ),
    }));
  },

  getDeviceById: (id: string) => {
    return get().devices.find(d => d.id === id);
  },

  getMaintenanceOrderById: (id: string) => {
    return get().maintenanceOrders.find(o => o.id === id);
  },

  getRepairOrderById: (id: string) => {
    return get().repairOrders.find(o => o.id === id);
  },

  createMaintenanceOrder: (order: Partial<MaintenanceOrder>) => {
    const newOrder: MaintenanceOrder = {
      id: `mo_${Date.now()}`,
      orderNo: `BY${Date.now().toString().slice(-8)}`,
      deviceId: '',
      deviceName: '',
      deviceNo: '',
      title: '',
      type: 'routine',
      priority: 'medium',
      description: '',
      tasks: [],
      materials: [],
      status: 'pending',
      scheduledDate: new Date().toISOString(),
      createdBy: '',
      createdByName: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...order,
    };
    set(state => ({
      maintenanceOrders: [newOrder, ...state.maintenanceOrders],
    }));
    return newOrder;
  },

  createRepairOrder: (order: Partial<RepairOrder>) => {
    const newOrder: RepairOrder = {
      id: `ro_${Date.now()}`,
      orderNo: `WX${Date.now().toString().slice(-8)}`,
      deviceId: '',
      deviceName: '',
      deviceNo: '',
      title: '',
      faultType: '',
      priority: 'medium',
      description: '',
      reporterId: '',
      reporterName: '',
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...order,
    };
    set(state => ({
      repairOrders: [newOrder, ...state.repairOrders],
    }));
    return newOrder;
  },

  updateDeviceStatus: (deviceId: string, status: Device['status']) => {
    set(state => ({
      devices: state.devices.map(d =>
        d.id === deviceId ? { ...d, status, updatedAt: new Date().toISOString() } : d
      ),
    }));
  },

  addSparePartRequest: (request: SparePartRequest) => {
    set(state => ({
      sparePartRequests: [request, ...state.sparePartRequests],
    }));
  },

  updateSparePartRequest: (id: string, updates: Partial<SparePartRequest>) => {
    set(state => ({
      sparePartRequests: state.sparePartRequests.map(r =>
        r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r
      ),
    }));
  },

  getSparePartRequestById: (id: string) => {
    return get().sparePartRequests.find(r => r.id === id);
  },

  createSparePartRequest: (request: Partial<SparePartRequest>) => {
    const newRequest: SparePartRequest = {
      id: `spr_${Date.now()}`,
      requestNo: `LY${Date.now().toString().slice(-8)}`,
      requesterId: '',
      requesterName: '',
      requesterDepartment: '',
      purpose: '',
      items: [],
      totalAmount: 0,
      status: 'pending',
      createdAt: new Date().toISOString(),
      ...request,
    };
    set(state => ({
      sparePartRequests: [newRequest, ...state.sparePartRequests],
    }));
    return newRequest;
  },

  updateSparePartStock: (partId: string, quantity: number) => {
    set(state => ({
      spareParts: state.spareParts.map(p =>
        p.id === partId
          ? { ...p, stock: Math.max(0, (p.stock || 0) - quantity), stockQuantity: Math.max(0, (p.stockQuantity || 0) - quantity), updatedAt: new Date().toISOString() }
          : p
      ),
    }));
  },
}));

export const initStoreFromStorage = () => {
  const savedUser = localStorage.getItem('cnc_user');
  if (savedUser) {
    try {
      const user = JSON.parse(savedUser);
      useAppStore.setState({ user });
    } catch (e) {
      console.error('Failed to parse saved user:', e);
    }
  }
};
