# W.A.R.E. — Warehouse AI Control Center

A hackathon-ready, decision-first warehouse operations platform built with React + TypeScript + Vite.

## Why this version is different

It does not stop at CRUD dashboards. The product turns warehouse signals into explainable operational recommendations:

- Priority scoring for orders
- Smart inventory allocation decisions
- Low-stock and out-of-stock detection
- Replenishment recommendations
- Exception → Decision → Resolution workflow
- Picking/packing/QC/dispatch workflow board
- Bottleneck-oriented analytics
- Search and interactive order decisions
- Mock data only — no external warehouse API required

## Run

```bash
npm install
npm run dev
```

Open the local URL printed by Vite.

## Demo scenario

Open **Orders → ORD-1042**.

The order is Critical, needs 10 units of WH-552, and the available quantity after reservations is lower than the request. The decision drawer explains the shortage and recommends allocating available stock, placing the remainder on hold, and triggering replenishment.

## Suggested hackathon pitch

"W.A.R.E. does not just tell warehouse teams what is happening. It tells them what needs attention, recommends what to do next, and explains why."

## Note

This is a self-contained mock-data MVP. For a production version, connect the data layer to a real WMS/ERP and replace the deterministic decision engine with a monitored rules/optimization service or an LLM-assisted explanation layer.
