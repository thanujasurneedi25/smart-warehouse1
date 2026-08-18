export type Priority = "Critical" | "High" | "Medium" | "Low";
export type OrderStatus = "New" | "Allocated" | "Picking" | "Packing" | "QC" | "Dispatched" | "On Hold";

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  location: string;
  stock: number;
  reserved: number;
  reorderPoint: number;
  reorderQty: number;
  unitCost: number;
  health: "Healthy" | "Low" | "Critical" | "Out";
}

export interface Order {
  id: string;
  customer: string;
  items: { sku: string; qty: number }[];
  priority: Priority;
  due: string;
  status: OrderStatus;
  risk: number;
  value: number;
}

export interface Decision {
  title: string;
  severity: "critical" | "warning" | "info" | "success";
  explanation: string;
  actions: string[];
}
