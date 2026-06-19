import { fetchVehicleApi, fetchVehicleAppApi } from './api';

export const VEHICLE_QUERY_KEYS = {
  approvalWorkflows: ['vehicle', 'approvalWorkflows'] as const,
  dashboard: ['vehicle', 'dashboard'] as const,
  drivers: ['vehicle', 'drivers'] as const,
  expenses: ['vehicle', 'expenses'] as const,
  itemWarehouseCollection: ['vehicle', 'itemWarehouseCollection'] as const,
  orders: ['vehicle', 'orders'] as const,
  plans: ['vehicle', 'plans'] as const,
  pickLists: ['vehicle', 'pickLists'] as const,
  deliveryNotes: ['vehicle', 'deliveryNotes'] as const,
  purchaseRequests: ['vehicle', 'purchaseRequests'] as const,
  routes: ['vehicle', 'routes'] as const,
  trucks: ['vehicle', 'trucks'] as const,
  users: ['vehicle', 'users'] as const,
  workflowTasks: ['vehicle', 'workflowTasks'] as const,
  warehouses: ['vehicle', 'warehouses'] as const,
  wmsPurchaseOrders: ['wms', 'purchaseOrders'] as const,
  wmsInventoryTransfers: ['wms', 'inventoryTransfers'] as const,
  wmsCycleCounts: ['wms', 'cycleCounts'] as const,
  wmsBins: ['wms', 'bins'] as const,
  wmsBatchExpiry: ['wms', 'batchExpiry'] as const,
  wmsThreePLBilling: ['wms', 'threePLBilling'] as const,
  invoices: ['vehicle', 'invoices'] as const,
  vanInventory: ['vehicle', 'vanInventory'] as const,
  settlements: ['vehicle', 'settlements'] as const
};

export interface VehicleOrderLine {
  LineNum?: number;
  ItemCode: string;
  ItemName: string;
  Quantity: number;
  UnitPrice?: number;
  TaxCode?: string;
  TaxRate?: number;
  TaxTotal?: number;
  LineTotal?: number;
  WeightKg: number;
  VolumeM3: number;
}

export interface VehicleAddressExtension {
  ShipToStreet?: string;
  ShipToStreetNo?: string;
  ShipToBlock?: string;
  ShipToBuilding?: string;
  ShipToCity?: string;
  ShipToZipCode?: string;
  ShipToCounty?: string;
  ShipToState?: string;
  ShipToCountry?: string;
  BillToStreet?: string;
  BillToCity?: string;
  BillToCountry?: string;
  [key: string]: unknown;
}

export interface VehicleOrder {
  DocEntry?: number;
  DocNum: number | string;
  DocDate?: string;
  DocDueDate?: string;
  ShipDate?: string;
  CardCode?: string;
  CardName: string;
  WarehouseCode: string;
  WeightKg: number;
  VolumeM3: number;
  City: string;
  Street: string;
  Status: string;
  DocumentStatus?: string;
  Address?: string;
  Address2?: string;
  AddressExtension?: VehicleAddressExtension;
  VatSum?: number;
  TaxTotal?: number;
  TotalTax?: number;
  DocTotal?: number;
  DocCurrency?: string;
  DocumentLines: VehicleOrderLine[];
}

export interface VehicleTruck {
  TruckId: string;
  PlateNumber: string;
  Type: string;
  CapacityTons: number;
  Status: string;
  WarehouseCode: string;
}

export interface VehicleWarehouse {
  WarehouseCode: string;
  WarehouseName: string;
  Emirate?: string;
  City?: string;
  Latitude?: number;
  Longitude?: number;
}

export interface ItemWarehouseStock {
  ItemCode: string;
  ItemName: string;
  WarehouseCode: string;
  WarehouseName: string;
  City: string;
  Street: string;
  InStock: number;
  Committed: number;
  Ordered: number;
  Available: number;
  StockWeightKg: number;
  StockVolumeM3: number;
  UnitWeightKg: number;
  UnitVolumeM3: number;
}

const normalizeList = <T>(payload: unknown, key: string): T[] => {
  if (Array.isArray(payload)) return payload as T[];
  if (payload && typeof payload === 'object') {
    const value = (payload as Record<string, unknown>)[key];
    return Array.isArray(value) ? value as T[] : [];
  }
  return [];
};

export const VehicleService = {
  async getApprovalWorkflows() {
    const payload = await fetchVehicleAppApi<unknown>('/api/app/workflows');
    return normalizeList<any>(payload, 'approvalWorkflows');
  },

  async updateApprovalWorkflow(workflowId: string, payload: Record<string, unknown>) {
    return fetchVehicleAppApi<any>(`/api/app/workflows/${workflowId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  },

  async deleteApprovalWorkflow(workflowId: string) {
    return fetchVehicleAppApi<any>(`/api/app/workflows/${workflowId}`, {
      method: 'DELETE'
    });
  },

  async getDashboard() {
    return fetchVehicleAppApi<any>('/api/app/dashboard');
  },

  async getDrivers() {
    const payload = await fetchVehicleAppApi<unknown>('/api/app/drivers');
    return normalizeList<any>(payload, 'drivers');
  },

  createDriver(payload: Record<string, unknown>) {
    return fetchVehicleAppApi<any>('/api/app/drivers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  },

  createDeliveryFromPickList(payload: Record<string, unknown>) {
    return fetchVehicleAppApi<any>('/api/app/deliveries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  },

  updateDriver(driverId: string, payload: Record<string, unknown>) {
    return fetchVehicleAppApi<any>(`/api/app/drivers/${driverId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  },

  deactivateDriver(driverId: string) {
    return fetchVehicleAppApi<any>(`/api/app/drivers/${driverId}`, {
      method: 'DELETE'
    });
  },

  async getExpenses() {
    const payload = await fetchVehicleAppApi<unknown>('/b1s/v1/expenses');
    return normalizeList<any>(payload, 'expenses');
  },

  createExpense(payload: Record<string, unknown>) {
    return fetchVehicleAppApi<any>('/b1s/v1/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  },

  async getItemWarehouseCollection() {
    const payload = await fetchVehicleApi<unknown>('/b1s/v1/ItemWarehouseCollection');
    return normalizeList<ItemWarehouseStock>(payload, 'ItemWarehouseCollection');
  },

  async getOrders() {
    const payload = await fetchVehicleApi<unknown>('/b1s/v1/orders');
    return normalizeList<VehicleOrder>(payload, 'orders');
  },

  async getPlans() {
    const payload = await fetchVehicleAppApi<unknown>('/api/app/plans');
    return normalizeList<any>(payload, 'plans');
  },

  async getPickLists() {
    const payload = await fetchVehicleApi<unknown>('/b1s/v1/PickLists');
    return normalizeList<any>(payload, 'PickLists');
  },

  async getPicklistById(picklistId: string | number) {
    const payload = await fetchVehicleApi<unknown>(`/b1s/v1/PickLists/${picklistId}`);
    return payload;
  },

  async getDeliveryNotes() {
    const payload = await fetchVehicleApi<unknown>('/b1s/v1/DeliveryNotes');
    return normalizeList<any>(payload, 'DeliveryNotes');
  },

  async getInvoices() {
    const payload = await fetchVehicleApi<unknown>('/b1s/v1/Invoices');
    return normalizeList<any>(payload, 'Invoices');
  },

  createInvoice(payload: Record<string, unknown>) {
    return fetchVehicleApi<any>(`/b1s/v1/Invoices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  },

  async getVanInventory() {
    const payload = await fetchVehicleApi<unknown>('/b1s/v1/VanInventory');
    return normalizeList<any>(payload, 'VanInventory');
  },

  async getPurchaseRequests() {
    const payload = await fetchVehicleApi<unknown>('/b1s/v1/PurchaseRequests');
    return normalizeList<any>(payload, 'PurchaseRequests');
  },

  async getRoutes() {
    const payload = await fetchVehicleAppApi<unknown>('/api/app/routes');
    return normalizeList<any>(payload, 'routes');
  },

  async getTrucks() {
    const payload = await fetchVehicleApi<unknown>('/b1s/v1/trucks');
    return normalizeList<VehicleTruck>(payload, 'trucks');
  },

  async getUsers() {
    const payload = await fetchVehicleAppApi<unknown>('/api/app/users');
    return normalizeList<any>(payload, 'users');
  },

  async getWorkflowTasks() {
    const payload = await fetchVehicleAppApi<unknown>('/api/app/tasks');
    return normalizeList<any>(payload, 'WorkflowTasks');
  },

  async getWarehouses() {
    const payload = await fetchVehicleApi<unknown>('/b1s/v1/warehouses');
    return normalizeList<VehicleWarehouse>(payload, 'warehouses');
  },

  optimizePlan(payload: { depot: string; orders: VehicleOrder[]; trucks: VehicleTruck[] }) {
    return fetchVehicleApi<any>('/b1s/v1/optimize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  },

  createPlan(payload: Record<string, unknown>) {
    return fetchVehicleAppApi('/api/app/plans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  },

  approvePlan(planId: string, payload: Record<string, unknown> = {}) {
    return fetchVehicleAppApi<any>(`/api/app/plans/${planId}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  },

  completePickList(taskId: string | number, payload: Record<string, unknown> = {}) {
    return fetchVehicleAppApi<any>(`/api/app/tasks/${taskId}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  },

  // Alias for creating a delivery from a picklist – used by UI components
  async createDelivery(payload: { pickListId: number | string; driverId?: string; driverName?: string }) {
    return this.createDeliveryFromPickList(payload);
  },

  confirmDriverPickup(deliveryId: number | string, payload: { driverId?: string; driverName?: string } = {}) {
    return fetchVehicleApi<any>(`/b1s/v1/DeliveryNotes/${deliveryId}/pickup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  },

  submitDeliveryPod(payload: Record<string, unknown>) {
    return fetchVehicleAppApi<any>('/api/app/pods', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  },

  async getWmsPurchaseOrders() {
    const payload = await fetchVehicleApi<unknown>('/b1s/v1/wmsPurchaseOrders');
    return normalizeList<any>(payload, 'wmsPurchaseOrders');
  },

  async getWmsInventoryTransfers() {
    const payload = await fetchVehicleApi<unknown>('/b1s/v1/wmsInventoryTransfers');
    return normalizeList<any>(payload, 'wmsInventoryTransfers');
  },

  async getWmsCycleCounts() {
    const payload = await fetchVehicleApi<unknown>('/b1s/v1/wmsCycleCounts');
    return normalizeList<any>(payload, 'wmsCycleCounts');
  },

  async getWmsBins() {
    const payload = await fetchVehicleApi<unknown>('/b1s/v1/wmsBins');
    return normalizeList<any>(payload, 'wmsBins');
  },

  async getWmsBatchExpiry() {
    const payload = await fetchVehicleApi<unknown>('/b1s/v1/wmsBatchExpiry');
    return normalizeList<any>(payload, 'wmsBatchExpiry');
  },

  async getWmsThreePLBilling() {
    const payload = await fetchVehicleApi<unknown>('/b1s/v1/wmsThreePLBilling');
    return normalizeList<any>(payload, 'wmsThreePLBilling');
  },

  async getSettlements() {
    const payload = await fetchVehicleApi<unknown>('/b1s/v1/settlements');
    return normalizeList<any>(payload, 'settlements');
  },

  createSettlement(payload: Record<string, unknown>) {
    return fetchVehicleApi<any>('/b1s/v1/settlements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  }
};
