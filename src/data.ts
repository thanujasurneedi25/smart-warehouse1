import { InventoryItem, Order } from "./types";

export const inventory: InventoryItem[] = [
  { id:"i1", sku:"WH-204", name:"Wireless Barcode Scanner", category:"Equipment", location:"A-03-14", stock:4, reserved:2, reorderPoint:10, reorderQty:24, unitCost:78, health:"Critical" },
  { id:"i2", sku:"WH-118", name:"Packing Tape 48mm", category:"Packaging", location:"P-01-02", stock:86, reserved:24, reorderPoint:40, reorderQty:120, unitCost:3.5, health:"Healthy" },
  { id:"i3", sku:"WH-331", name:"Thermal Labels", category:"Packaging", location:"P-02-06", stock:18, reserved:11, reorderPoint:25, reorderQty:100, unitCost:0.18, health:"Low" },
  { id:"i4", sku:"WH-552", name:"USB-C Hub", category:"Electronics", location:"B-04-08", stock:7, reserved:5, reorderPoint:12, reorderQty:30, unitCost:24, health:"Critical" },
  { id:"i5", sku:"WH-407", name:"Laptop Stand", category:"Accessories", location:"B-02-03", stock:42, reserved:16, reorderPoint:15, reorderQty:40, unitCost:29, health:"Healthy" },
  { id:"i6", sku:"WH-610", name:"Protective Mailer", category:"Packaging", location:"P-03-01", stock:8, reserved:7, reorderPoint:30, reorderQty:150, unitCost:0.9, health:"Critical" },
  { id:"i7", sku:"WH-720", name:"Wireless Keyboard", category:"Electronics", location:"C-01-09", stock:0, reserved:0, reorderPoint:8, reorderQty:25, unitCost:34, health:"Out" },
  { id:"i8", sku:"WH-801", name:"Desk Lamp", category:"Accessories", location:"C-02-04", stock:31, reserved:8, reorderPoint:12, reorderQty:20, unitCost:22, health:"Healthy" }
];

export const orders: Order[] = [
  { id:"ORD-1042", customer:"Apex Technologies", items:[{sku:"WH-552",qty:10}], priority:"Critical", due:"Today · 2:30 PM", status:"On Hold", risk:96, value:240 },
  { id:"ORD-1038", customer:"Nova Retail", items:[{sku:"WH-407",qty:8},{sku:"WH-118",qty:12}], priority:"High", due:"Today · 4:00 PM", status:"Picking", risk:72, value:274 },
  { id:"ORD-1047", customer:"Orbit Labs", items:[{sku:"WH-204",qty:3}], priority:"High", due:"Today · 5:15 PM", status:"Allocated", risk:64, value:234 },
  { id:"ORD-1051", customer:"GreenCart", items:[{sku:"WH-331",qty:5}], priority:"Medium", due:"Tomorrow · 10:00 AM", status:"New", risk:38, value:0.9 },
  { id:"ORD-1029", customer:"Vertex Systems", items:[{sku:"WH-801",qty:4}], priority:"Low", due:"Tomorrow · 3:00 PM", status:"Packing", risk:12, value:88 },
  { id:"ORD-1055", customer:"ByteWorks", items:[{sku:"WH-720",qty:2}], priority:"High", due:"Tomorrow · 9:00 AM", status:"On Hold", risk:91, value:68 }
];
