import { InventoryItem, Order, Decision } from "./types";

export function priorityScore(order: Order) {
  const p = { Critical: 100, High: 75, Medium: 50, Low: 25 }[order.priority];
  return Math.round(p * 0.55 + order.risk * 0.35 + Math.min(order.value / 10, 10));
}

export function allocationDecision(order: Order, items: InventoryItem[]): Decision {
  const shortages: string[] = [];
  let full = true;
  let totalAvailable = true;

  for (const line of order.items) {
    const item = items.find(i => i.sku === line.sku);
    const available = item ? Math.max(item.stock - item.reserved, 0) : 0;
    if (available < line.qty) {
      full = false;
      totalAvailable = false;
      shortages.push(`${line.sku}: needs ${line.qty}, available ${available}`);
    }
  }

  if (full) {
    return {
      title: "Fully allocate order",
      severity: "success",
      explanation: "All requested quantities are available after existing reservations.",
      actions: ["Reserve stock immediately", "Move order to picking queue", "Recalculate available-to-promise stock"]
    };
  }

  if (order.priority === "Critical" || order.priority === "High") {
    return {
      title: "Prioritize scarce stock",
      severity: "critical",
      explanation: `The order is ${order.priority.toLowerCase()} priority but has an inventory shortage. ${shortages.join("; ")}.`,
      actions: ["Allocate available units to this order", "Place missing quantity on shortage hold", "Trigger replenishment and notify fulfillment lead"]
    };
  }

  return {
    title: "Hold and replenish",
    severity: "warning",
    explanation: `This order cannot be fully fulfilled without reducing service quality for higher-priority work. ${shortages.join("; ")}.`,
    actions: ["Keep order on hold", "Protect stock for higher-priority orders", "Create replenishment recommendation"]
  };
}

export function getDecisions(orders: Order[], items: InventoryItem[]): Decision[] {
  const decisions: Decision[] = [];
  const critical = orders.find(o => o.id === "ORD-1042");
  if (critical) decisions.push(allocationDecision(critical, items));

  const low = items.filter(i => i.stock <= i.reorderPoint);
  if (low.length) decisions.push({
    title: `${low.length} SKUs need replenishment`,
    severity: "warning",
    explanation: `${low.map(i => i.sku).join(", ")} are at or below their reorder points.`,
    actions: ["Create suggested purchase orders", "Review supplier lead time", "Protect remaining available stock"]
  });

  const picking = orders.filter(o => o.status === "Picking").length;
  if (picking >= 1) decisions.push({
    title: "Picking queue needs attention",
    severity: "info",
    explanation: `${picking} order(s) are actively being picked. Prioritize high-risk orders first to reduce SLA exposure.`,
    actions: ["Sort pick queue by decision score", "Batch nearby SKUs", "Assign capacity to the highest-risk order"]
  });

  decisions.push({
    title: "Dispatch readiness is healthy",
    severity: "success",
    explanation: "Most orders are moving through the workflow without a blocking exception.",
    actions: ["Continue monitoring", "Run next risk scan before dispatch cut-off"]
  });

  return decisions;
}
