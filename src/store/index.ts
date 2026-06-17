import { create } from 'zustand';
import type { User, Device, InspectionPlan, InspectionRecord, MaintenanceOrder, RepairOrder, SparePart, SparePartRequisition, SparePartRequest, StatisticsData, DowntimeRecord, InspectionItem } from '../types';
import { mockUsers, getCurrentUser } from '../mock/users';
import { mockDevices } from '../mock/devices';
import { mockInspectionPlans, mockInspectionRecords, mockInspectionItems } from '../mock/inspection';
import { mockMaintenanceOrders } from '../mock/maintenance';
import { mockRepairOrders } from '../mock/repair';
import { mockSpareParts, mockSparePartRequisitions, mockSparePartRequests } from '../mock/spareParts';
import { mockStatistics, mockDowntimeRecords } from '../mock/statistics';

const STORAGE_KEYS = {
  user: 'cnc_user',
  maintenanceOrders: 'cnc_maintenance_orders',
  repairOrders: 'cnc_repair_orders',
  sparePartRequests: 'cnc_spare_part_requests',
  spareParts: 'cnc_spare_parts',
  inspectionRecords: 'cnc_inspection_records',
  devices: 'cnc_devices',
  sparePartRequisitions: 'cnc_spare_part_requisitions',
};

function loadPersistedData<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      return JSON.parse(saved) as T;
    }
  } catch (e) {
    console.error(`Failed to load ${key}:`, e);
  }
  return fallback;
}

function savePersistedData<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Failed to save ${key}:`, e);
  }
}

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
  resetData: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  user: null,
  devices: loadPersistedData(STORAGE_KEYS.devices, mockDevices),
  inspectionPlans: mockInspectionPlans,
  inspectionRecords: loadPersistedData(STORAGE_KEYS.inspectionRecords, mockInspectionRecords),
  inspectionItems: mockInspectionItems,
  maintenanceOrders: loadPersistedData(STORAGE_KEYS.maintenanceOrders, mockMaintenanceOrders),
  repairOrders: loadPersistedData(STORAGE_KEYS.repairOrders, mockRepairOrders),
  spareParts: loadPersistedData(STORAGE_KEYS.spareParts, mockSpareParts),
  sparePartRequisitions: loadPersistedData(STORAGE_KEYS.sparePartRequisitions, mockSparePartRequisitions),
  sparePartRequests: loadPersistedData(STORAGE_KEYS.sparePartRequests, mockSparePartRequests),
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
      savePersistedData(STORAGE_KEYS.user, user);
      return true;
    }
    set({ isLoading: false });
    return false;
  },

  logout: () => {
    set({ user: null, activeTab: 'dashboard' });
    localStorage.removeItem(STORAGE_KEYS.user);
  },

  setActiveTab: (tab: string) => set({ activeTab: tab }),

  addInspectionRecord: (record: InspectionRecord) => {
    set(state => {
      const newRecords = [record, ...state.inspectionRecords];
      savePersistedData(STORAGE_KEYS.inspectionRecords, newRecords);
      return { inspectionRecords: newRecords };
    });
  },

  updateMaintenanceOrder: (id: string, updates: Partial<MaintenanceOrder>) => {
    set(state => {
      const newOrders = state.maintenanceOrders.map(o => 
        o.id === id ? { ...o, ...updates, updatedAt: new Date().toISOString() } : o
      );
      savePersistedData(STORAGE_KEYS.maintenanceOrders, newOrders);
      return { maintenanceOrders: newOrders };
    });
  },

  updateRepairOrder: (id: string, updates: Partial<RepairOrder>) => {
    set(state => {
      const newOrders = state.repairOrders.map(o => 
        o.id === id ? { ...o, ...updates, updatedAt: new Date().toISOString() } : o
      );
      savePersistedData(STORAGE_KEYS.repairOrders, newOrders);
      return { repairOrders: newOrders };
    });
  },

  addRepairOrder: (order: RepairOrder) => {
    set(state => {
      const newOrders = [order, ...state.repairOrders];
      savePersistedData(STORAGE_KEYS.repairOrders, newOrders);
      return { repairOrders: newOrders };
    });
  },

  addSparePartRequisition: (requisition: SparePartRequisition) => {
    set(state => {
      const newRequisitions = [requisition, ...state.sparePartRequisitions];
      savePersistedData(STORAGE_KEYS.sparePartRequisitions, newRequisitions);
      return { sparePartRequisitions: newRequisitions };
    });
  },

  updateSparePartRequisition: (requisition: SparePartRequisition) => {
    set(state => {
      const newRequisitions = state.sparePartRequisitions.map(r => 
        r.id === requisition.id ? requisition : r
      );
      savePersistedData(STORAGE_KEYS.sparePartRequisitions, newRequisitions);
      return { sparePartRequisitions: newRequisitions };
    });
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
    set(state => {
      const newOrders = [newOrder, ...state.maintenanceOrders];
      savePersistedData(STORAGE_KEYS.maintenanceOrders, newOrders);
      return { maintenanceOrders: newOrders };
    });
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
    set(state => {
      const newOrders = [newOrder, ...state.repairOrders];
      savePersistedData(STORAGE_KEYS.repairOrders, newOrders);
      return { repairOrders: newOrders };
    });
    return newOrder;
  },

  updateDeviceStatus: (deviceId: string, status: Device['status']) => {
    set(state => {
      const newDevices = state.devices.map(d =>
        d.id === deviceId ? { ...d, status, updatedAt: new Date().toISOString() } : d
      );
      savePersistedData(STORAGE_KEYS.devices, newDevices);
      return { devices: newDevices };
    });
  },

  addSparePartRequest: (request: SparePartRequest) => {
    set(state => {
      const newRequests = [request, ...state.sparePartRequests];
      savePersistedData(STORAGE_KEYS.sparePartRequests, newRequests);
      return { sparePartRequests: newRequests };
    });
  },

  updateSparePartRequest: (id: string, updates: Partial<SparePartRequest>) => {
    set(state => {
      const newRequests = state.sparePartRequests.map(r =>
        r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r
      );
      savePersistedData(STORAGE_KEYS.sparePartRequests, newRequests);
      return { sparePartRequests: newRequests };
    });
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
    set(state => {
      const newRequests = [newRequest, ...state.sparePartRequests];
      savePersistedData(STORAGE_KEYS.sparePartRequests, newRequests);
      return { sparePartRequests: newRequests };
    });
    return newRequest;
  },

  updateSparePartStock: (partId: string, quantity: number) => {
    set(state => {
      const newParts = state.spareParts.map(p =>
        p.id === partId
          ? { ...p, stock: Math.max(0, (p.stock || 0) - quantity), stockQuantity: Math.max(0, (p.stockQuantity || 0) - quantity), updatedAt: new Date().toISOString() }
          : p
      );
      savePersistedData(STORAGE_KEYS.spareParts, newParts);
      return { spareParts: newParts };
    });
  },

  resetData: () => {
    const keys = Object.values(STORAGE_KEYS);
    keys.forEach(key => localStorage.removeItem(key));
    set({
      devices: mockDevices,
      inspectionRecords: mockInspectionRecords,
      maintenanceOrders: mockMaintenanceOrders,
      repairOrders: mockRepairOrders,
      spareParts: mockSpareParts,
      sparePartRequisitions: mockSparePartRequisitions,
      sparePartRequests: mockSparePartRequests,
      user: null,
    });
  },
}));

export const initStoreFromStorage = () => {
  const savedUser = localStorage.getItem(STORAGE_KEYS.user);
  if (savedUser) {
    try {
      const user = JSON.parse(savedUser);
      useAppStore.setState({ user });
    } catch (e) {
      console.error('Failed to parse saved user:', e);
    }
  }
};
