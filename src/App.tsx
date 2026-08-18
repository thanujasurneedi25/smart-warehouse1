import { useMemo, useState } from "react";
import {
  Activity, AlertTriangle, ArrowRight, BarChart3, Boxes, CheckCircle2,
  ChevronRight, ClipboardList, Clock3, PackageCheck, RefreshCw, Search, Plus, X,
  Settings2, ShieldAlert, Sparkles, Truck, Users, Warehouse
} from "lucide-react";
import { inventory as initialInventory, orders as initialOrders } from "./data";
import { allocationDecision, getDecisions, priorityScore } from "./engine";
import { InventoryItem, Order } from "./types";

type Page = "Command Center" | "Orders" | "Inventory" | "Fulfillment" | "Exceptions" | "Analytics" | "Intelligence";

const nav = [
  ["Command Center", Activity],
  ["Orders", ClipboardList],
  ["Inventory", Boxes],
  ["Fulfillment", PackageCheck],
  ["Exceptions", ShieldAlert],
  ["Analytics", BarChart3],
  ["Intelligence", Sparkles]
] as const;

function App() {
  const [page, setPage] = useState<Page>("Command Center");
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [inventory] = useState<InventoryItem[]>(initialInventory);
  const [selected, setSelected] = useState<Order | null>(null);
  const [search, setSearch] = useState("");
  const [showCreateOrder, setShowCreateOrder] = useState(false);
  const [showSimulator, setShowSimulator] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [toast, setToast] = useState("");

  const decisions = useMemo(() => getDecisions(orders, inventory), [orders, inventory]);
  const atRisk = orders.filter(o => o.risk >= 70).length;
  const lowStock = inventory.filter(i => i.stock <= i.reorderPoint).length;
  const fillRate = Math.round((orders.filter(o => o.status !== "On Hold").length / orders.length) * 100);

  function advanceOrder(id: string) {
    setOrders(prev => prev.map(o => {
      if (o.id !== id) return o;
      const next: Record<string, Order["status"]> = {
        New:"Allocated", Allocated:"Picking", Picking:"Packing", Packing:"QC", QC:"Dispatched",
        Dispatched:"Dispatched", "On Hold":"Allocated"
      };
      return { ...o, status: next[o.status] };
    }));
  }

  function runJudgeScenario() {
    const demoOrder: Order = {
      id: "ORD-DEMO", customer: "Priority Retailer", items: [{sku: "WH-552", qty: 10}],
      priority: "Critical", due: "Today · 2:30 PM", status: "On Hold", risk: 96, value: 780
    };
    setOrders(prev => [demoOrder, ...prev.filter(o => o.id !== demoOrder.id)]);
    setDemoMode(true); setPage("Intelligence");
    setToast("Judge scenario loaded: critical order vs. limited stock");
    setTimeout(()=>setToast(""), 3200);
  }

  function resetDemo() {
    setOrders(initialOrders); setDemoMode(false); setPage("Command Center");
    setToast("Demo data reset to the original warehouse scenario");
    setTimeout(()=>setToast(""), 2600);
  }

  function exportReport() {
    const lines = [
      "W.A.R.E. — Warehouse Operations Report",
      `Generated: ${new Date().toLocaleString()}`,
      `Orders: ${orders.length}`, `Orders at risk: ${atRisk}`, `Low-stock SKUs: ${lowStock}`, `Fulfillment health: ${fillRate}%`, "",
      "TOP DECISIONS",
      ...decisions.slice(0,5).map((d:any,i:number)=>`${i+1}. ${d.title} — ${d.explanation}`),
      "", "RECOMMENDED OPERATIONS",
      "Prioritize scarce inventory for critical orders.",
      "Trigger replenishment when stock reaches the reorder point.",
      "Move picker capacity toward the highest-load zone before the next batch."
    ];
    const blob = new Blob([lines.join("\n")], {type:"text/plain"});
    const url = URL.createObjectURL(blob); const a=document.createElement("a");
    a.href=url; a.download=`WARE-operations-report-${Date.now()}.txt`; a.click(); URL.revokeObjectURL(url);
    setToast("Operational report exported"); setTimeout(()=>setToast(""), 2200);
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark"><Warehouse size={21}/></div>
          <div><strong>W.A.R.E.</strong><span>AI Control Center</span></div>
        </div>
        <div className="workspace">
          <span>WORKSPACE</span>
          <div className="workspace-card"><div className="pulse"/><div><b>Central Warehouse</b><small>Live simulation</small></div></div>
        </div>
        <nav>
          {nav.map(([label, Icon]) => (
            <button className={page === label ? "nav-item active" : "nav-item"} onClick={() => setPage(label)} key={label}>
              <Icon size={18}/><span>{label}</span>{label === "Exceptions" && <em>{atRisk}</em>}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <button className="nav-item"><Settings2 size={18}/>Settings</button>
          <div className="operator"><div className="avatar">OP</div><div><b>Operations</b><small>Demo operator</small></div></div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <div className="crumb">Operations / {page}</div>
            <h1>{page}</h1>
          </div>
          <div className="top-actions">
            <div className="search"><Search size={17}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search orders, SKUs..." /></div>
            <button className="icon-btn" title="Refresh simulation"><RefreshCw size={17}/></button>
            <button className="top-primary" onClick={() => setShowCreateOrder(true)}><Plus size={15}/> New order</button>
            <button className="sim-btn" onClick={() => setShowSimulator(true)}><Sparkles size={14}/> Allocation simulator</button>
            <button className="demo-btn" onClick={runJudgeScenario}><Activity size={14}/> Judge demo</button>
            <button className="report-btn" onClick={exportReport}>Report</button>
            <div className="live"><span/> LIVE</div>
          </div>
        </header>

        {demoMode && <div className="demo-banner"><span><Activity size={13}/> JUDGE DEMO MODE</span><b>Critical order shortage scenario is active</b><button onClick={resetDemo}>Reset</button></div>}

        {page === "Command Center" && <Dashboard orders={orders} inventory={inventory} decisions={decisions} fillRate={fillRate} atRisk={atRisk} lowStock={lowStock} onSelect={setSelected} onNewOrder={() => setShowCreateOrder(true)} onSimulator={() => setShowSimulator(true)} />}
        {page === "Orders" && <OrdersPage orders={orders} search={search} onSelect={setSelected} onAdvance={advanceOrder} />}
        {page === "Inventory" && <InventoryPage inventory={inventory} search={search} />}
        {page === "Fulfillment" && <Fulfillment orders={orders} onAdvance={advanceOrder} />}
        {page === "Exceptions" && <ExceptionsPage decisions={decisions} orders={orders} inventory={inventory} onSelect={setSelected} />}
        {page === "Analytics" && <Analytics orders={orders} inventory={inventory} />}
        {page === "Intelligence" && <IntelligencePage orders={orders} inventory={inventory} decisions={decisions} onSelect={setSelected} />}

        <footer><span>Decision engine v1.0 · Mock warehouse environment</span><span>All recommendations are explainable</span><button className="reset-btn" onClick={resetDemo}>Reset demo</button></footer>
      </main>

      {toast && <div className="toast"><CheckCircle2 size={15}/>{toast}</div>}
      {selected && <DecisionDrawer order={selected} inventory={inventory} onClose={()=>setSelected(null)} onAdvance={()=>{advanceOrder(selected.id); setSelected(null)}} />}
      {showCreateOrder && <CreateOrderModal inventory={inventory} onClose={()=>setShowCreateOrder(false)} onCreate={(order: Order) => { setOrders(prev => [order, ...prev]); setShowCreateOrder(false); }} />}
      {showSimulator && <AllocationSimulator inventory={inventory} onClose={()=>setShowSimulator(false)} onOpenOrder={(order: Order) => { setShowSimulator(false); setSelected(order); }} />}
    </div>
  );
}

function Dashboard({orders, inventory, decisions, fillRate, atRisk, lowStock, onSelect, onNewOrder, onSimulator}: any) {
  return <div className="content">
    <section className="hero">
      <div><span className="eyebrow"><Sparkles size={14}/> DECISION INTELLIGENCE</span><h2>Good morning, Operations.</h2><p>Here are the decisions that need attention before the next dispatch cut-off.</p></div>
      <div className="hero-badge"><Activity size={18}/><div><b>94%</b><span>system readiness</span></div></div>
    </section>

    <div className="quick-actions">
      <button onClick={onNewOrder}><Plus size={15}/><div><b>Create test order</b><span>Simulate a new fulfillment request</span></div><ArrowRight size={15}/></button>
      <button onClick={onSimulator}><Sparkles size={15}/><div><b>Run allocation simulation</b><span>Test shortage decisions instantly</span></div><ArrowRight size={15}/></button>
      <div className="scenario-note"><span>DEMO SCENARIO</span><b>Shortage → Decision → Resolution</b></div>
    </div>
    <div className="kpis">
      <Kpi icon={<ClipboardList/>} label="Orders today" value={orders.length} note="+12% vs yesterday" />
      <Kpi icon={<ShieldAlert/>} label="Orders at risk" value={atRisk} note="Requires action" danger />
      <Kpi icon={<Boxes/>} label="Low-stock SKUs" value={lowStock} note="Replenishment needed" warn />
      <Kpi icon={<Truck/>} label="Fulfillment health" value={`${fillRate}%`} note="On-track orders" />
    </div>

    <div className="grid-2">
      <section className="panel">
        <PanelTitle icon={<Sparkles/>} title="Recommended decisions" action="View all" />
        <div className="decision-list">
          {decisions.slice(0,3).map((d:any, i:number)=><DecisionCard key={i} decision={d}/>)}
        </div>
      </section>
      <section className="panel">
        <PanelTitle icon={<Clock3/>} title="Priority queue" action="Open orders" />
        <div className="queue">
          {orders.sort((a:Order,b:Order)=>priorityScore(b)-priorityScore(a)).slice(0,5).map((o:Order)=>
            <button className="queue-row" key={o.id} onClick={()=>onSelect(o)}>
              <div className={`priority-dot ${o.priority.toLowerCase()}`}/><div className="grow"><b>{o.id}</b><span>{o.customer}</span></div><div className="risk"><b>{priorityScore(o)}</b><span>score</span></div><ChevronRight size={16}/>
            </button>
          )}
        </div>
      </section>
    </div>

    <section className="panel">
      <PanelTitle icon={<Activity/>} title="Fulfillment flow" action="Operations overview" />
      <div className="flow">
        {[
          ["New", orders.filter((o:Order)=>o.status==="New").length, ClipboardList],
          ["Allocated", orders.filter((o:Order)=>o.status==="Allocated").length, Boxes],
          ["Picking", orders.filter((o:Order)=>o.status==="Picking").length, Users],
          ["Packing", orders.filter((o:Order)=>o.status==="Packing").length, PackageCheck],
          ["QC", orders.filter((o:Order)=>o.status==="QC").length, CheckCircle2],
          ["Dispatched", orders.filter((o:Order)=>o.status==="Dispatched").length, Truck]
        ].map(([label,count,Icon]:any,i)=><div className="flow-step" key={label}><div className="flow-icon"><Icon size={18}/></div><b>{count}</b><span>{label}</span>{i<5&&<ArrowRight className="flow-arrow" size={15}/>}</div>)}
      </div>
    </section>
  </div>
}

function OrdersPage({orders, search, onSelect, onAdvance}: any) {
  const filtered = orders.filter((o:Order)=>`${o.id} ${o.customer}`.toLowerCase().includes(search.toLowerCase()));
  return <div className="content"><section className="panel table-panel">
    <PanelTitle icon={<ClipboardList/>} title="Order management" action={`${filtered.length} orders`} />
    <table><thead><tr><th>Order</th><th>Customer</th><th>Priority</th><th>Due</th><th>Risk</th><th>Status</th><th>Action</th></tr></thead>
    <tbody>{filtered.map((o:Order)=><tr key={o.id}><td><b>{o.id}</b></td><td>{o.customer}</td><td><Priority value={o.priority}/></td><td>{o.due}</td><td><Risk value={o.risk}/></td><td><Status value={o.status}/></td><td><button className="small-btn" onClick={()=>onSelect(o)}>Decide <ArrowRight size={13}/></button></td></tr>)}</tbody></table>
  </section></div>
}

function InventoryPage({inventory, search}: any) {
  const filtered = inventory.filter((i:InventoryItem)=>`${i.sku} ${i.name}`.toLowerCase().includes(search.toLowerCase()));
  return <div className="content"><section className="panel table-panel">
    <PanelTitle icon={<Boxes/>} title="Inventory health" action={`${filtered.length} SKUs`} />
    <table><thead><tr><th>SKU</th><th>Product</th><th>Location</th><th>Available</th><th>Reorder point</th><th>Health</th><th>Recommendation</th></tr></thead>
    <tbody>{filtered.map((i:InventoryItem)=>{const available=Math.max(i.stock-i.reserved,0); return <tr key={i.id}><td><b>{i.sku}</b></td><td>{i.name}</td><td>{i.location}</td><td><b>{available}</b> / {i.stock}</td><td>{i.reorderPoint}</td><td><Status value={i.health}/></td><td>{i.stock<=i.reorderPoint?<span className="recommend">Reorder {i.reorderQty}</span>:<span className="muted">Monitor</span>}</td></tr>})}</tbody></table>
  </section></div>
}

function Fulfillment({orders,onAdvance}:any) {
  const stages: Order["status"][] = ["New","Allocated","Picking","Packing","QC","Dispatched"];
  return <div className="content"><div className="kanban">{stages.map(stage=><section className="kanban-col" key={stage}><div className="kanban-head"><b>{stage}</b><span>{orders.filter((o:Order)=>o.status===stage).length}</span></div>{orders.filter((o:Order)=>o.status===stage).map((o:Order)=><article className="order-card" key={o.id}><div className="card-top"><b>{o.id}</b><Priority value={o.priority}/></div><p>{o.customer}</p><div className="card-meta"><span><Clock3 size={13}/> {o.due}</span><Risk value={o.risk}/></div>{stage!=="Dispatched"&&<button className="advance-btn" onClick={()=>onAdvance(o.id)}>Advance workflow <ArrowRight size={13}/></button>}</article>)}</section>)}</div></div>
}

function ExceptionsPage({decisions, orders, inventory, onSelect}:any) {
  return <div className="content"><section className="hero compact"><div><span className="eyebrow"><ShieldAlert size={14}/> EXCEPTION CENTER</span><h2>Exception → Decision → Resolution</h2><p>Every operational issue is paired with an explainable recommended action.</p></div></section><div className="decision-list wide">{decisions.map((d:any,i:number)=><DecisionCard decision={d} key={i}/>)}</div><section className="panel"><PanelTitle icon={<AlertTriangle/>} title="Orders currently on hold" action="Resolve from order detail"/>{orders.filter((o:Order)=>o.status==="On Hold").map((o:Order)=><button className="exception-row" key={o.id} onClick={()=>onSelect(o)}><div><b>{o.id}</b><span>{o.customer}</span></div><Priority value={o.priority}/><Risk value={o.risk}/><ChevronRight size={16}/></button>)}</section></div>
}

function Analytics({orders, inventory}:any) {
  const statuses = ["New","Allocated","Picking","Packing","QC","Dispatched"];
  const max = Math.max(...statuses.map(s=>orders.filter((o:Order)=>o.status===s).length),1);
  return <div className="content"><div className="grid-2"><section className="panel"><PanelTitle icon={<BarChart3/>} title="Order flow" action="Live simulation"/><div className="bars">{statuses.map(s=><div className="bar-row" key={s}><span>{s}</span><div className="bar-track"><div className="bar-fill" style={{width:`${(orders.filter((o:Order)=>o.status===s).length/max)*100}%`}}/></div><b>{orders.filter((o:Order)=>o.status===s).length}</b></div>)}</div></section><section className="panel"><PanelTitle icon={<Boxes/>} title="Inventory exposure" action="Risk view"/><div className="exposure"><div><b>{inventory.filter((i:InventoryItem)=>i.health==="Critical").length}</b><span>Critical SKUs</span></div><div><b>{inventory.filter((i:InventoryItem)=>i.health==="Out").length}</b><span>Out of stock</span></div><div><b>{inventory.reduce((a:number,i:InventoryItem)=>a+i.stock,0)}</b><span>Total units</span></div></div><div className="insight"><Sparkles size={17}/><div><b>AI insight</b><p>Packaging supplies show the highest replenishment exposure. Protect thermal labels and mailers before the next dispatch wave.</p></div></div></section></div></div>
}

function CreateOrderModal({inventory, onClose, onCreate}: {inventory: InventoryItem[]; onClose:()=>void; onCreate:(o:Order)=>void}) {
  const [customer, setCustomer] = useState("Demo Customer");
  const [sku, setSku] = useState(inventory[0]?.sku ?? "");
  const [qty, setQty] = useState(5);
  const [priority, setPriority] = useState<Order["priority"]>("High");
  function submit() {
    const item = inventory.find(i => i.sku === sku);
    const order: Order = { id:`ORD-${1060 + Math.floor(Math.random()*90)}`, customer, items:[{sku,qty:Math.max(1,qty)}], priority, due:"Today · 6:00 PM", status:"New", risk:priority==="Critical"?90:priority==="High"?72:priority==="Medium"?45:20, value:Math.round((item?.unitCost??10)*qty) };
    onCreate(order);
  }
  return <div className="overlay" onClick={onClose}><div className="modal" onClick={e=>e.stopPropagation()}>
    <div className="modal-head"><div><span className="eyebrow"><Plus size={13}/> ORDER INTAKE</span><h2>Create test order</h2><p>Use this during the hackathon demo to create a live decision.</p></div><button className="icon-btn" onClick={onClose}><X size={16}/></button></div>
    <div className="form-grid"><label>Customer<input value={customer} onChange={e=>setCustomer(e.target.value)} /></label><label>Priority<select value={priority} onChange={e=>setPriority(e.target.value as Order["priority"])}><option>Critical</option><option>High</option><option>Medium</option><option>Low</option></select></label><label>Product<select value={sku} onChange={e=>setSku(e.target.value)}>{inventory.map(i=><option key={i.sku} value={i.sku}>{i.sku} · {i.name}</option>)}</select></label><label>Quantity<input type="number" min="1" value={qty} onChange={e=>setQty(Number(e.target.value))} /></label></div>
    <div className="form-preview"><Sparkles size={16}/><div><b>What happens next?</b><p>The order enters the queue and the decision engine evaluates inventory availability and risk.</p></div></div>
    <button className="primary-btn" onClick={submit}>Create order <ArrowRight size={16}/></button>
  </div></div>
}

function AllocationSimulator({inventory, onClose, onOpenOrder}: {inventory: InventoryItem[]; onClose:()=>void; onOpenOrder:(o:Order)=>void}) {
  const [sku, setSku] = useState("WH-552"); const [qty, setQty] = useState(10); const [priority, setPriority] = useState<Order["priority"]>("Critical");
  const item=inventory.find(i=>i.sku===sku); const available=item?Math.max(item.stock-item.reserved,0):0; const shortage=Math.max(qty-available,0);
  const simulated:Order={id:"SIM-ORDER",customer:"Judge Demo",items:[{sku,qty}],priority,due:"Today · 2:30 PM",status:"On Hold",risk:priority==="Critical"?96:priority==="High"?78:45,value:Math.round((item?.unitCost??10)*qty)};
  const decision=allocationDecision(simulated,inventory);
  return <div className="overlay" onClick={onClose}><div className="simulator" onClick={e=>e.stopPropagation()}>
    <div className="modal-head"><div><span className="eyebrow"><Sparkles size={13}/> LIVE DECISION LAB</span><h2>Smart allocation simulator</h2><p>Change the scenario and watch the recommendation update.</p></div><button className="icon-btn" onClick={onClose}><X size={16}/></button></div>
    <div className="sim-grid"><div className="sim-controls"><label>SKU<select value={sku} onChange={e=>setSku(e.target.value)}>{inventory.map(i=><option key={i.sku} value={i.sku}>{i.sku} · {i.name}</option>)}</select></label><label>Requested units<input type="number" min="1" value={qty} onChange={e=>setQty(Number(e.target.value))}/></label><label>Order priority<select value={priority} onChange={e=>setPriority(e.target.value as Order["priority"])}><option>Critical</option><option>High</option><option>Medium</option><option>Low</option></select></label></div>
      <div className={`simulation-result ${decision.severity}`}><div className="result-metrics"><div><span>REQUESTED</span><b>{qty}</b></div><div><span>AVAILABLE</span><b>{available}</b></div><div><span>SHORTAGE</span><b>{shortage}</b></div></div><div className="decision-card"><div className="decision-icon"><Sparkles size={16}/></div><div className="grow"><b>{decision.title}</b><p>{decision.explanation}</p></div></div><div className="action-list">{decision.actions.map((a:string,i:number)=><div key={a}><span>{i+1}</span>{a}</div>)}</div><button className="primary-btn" onClick={()=>onOpenOrder(simulated)}>Open decision detail <ArrowRight size={16}/></button></div></div>
  </div></div>
}

function IntelligencePage({orders, inventory, decisions, onSelect}: any) {
  const [selectedSku, setSelectedSku] = useState(inventory[0]?.sku ?? "");
  const sku = inventory.find((i:InventoryItem)=>i.sku===selectedSku) ?? inventory[0];
  const riskRows = inventory.map((i:InventoryItem)=>({
    ...i,
    available: Math.max(i.stock-i.reserved,0),
    risk: Math.min(99, Math.round((Math.max(i.reorderPoint*1.6-i.stock,0)/(Math.max(i.reorderPoint*1.6,1)))*70 + (i.stock<=i.reorderPoint?25:0)))
  })).sort((a:any,b:any)=>b.risk-a.risk);
  const zoneData = [
    {name:"A · Fast movers", load:88, picks:34, state:"Bottleneck"},
    {name:"B · Electronics", load:71, picks:27, state:"Busy"},
    {name:"C · Accessories", load:52, picks:19, state:"Healthy"},
    {name:"D · Oversize", load:39, picks:11, state:"Healthy"}
  ];
  const topOrder = [...orders].sort((a:Order,b:Order)=>priorityScore(b)-priorityScore(a))[0];
  const copilot = topOrder ? allocationDecision(topOrder, inventory) : null;
  const pickPlan = [...orders].filter((o:Order)=>["Allocated","Picking","New"].includes(o.status)).sort((a:Order,b:Order)=>priorityScore(b)-priorityScore(a)).slice(0,4);
  return <div className="content">
    <section className="hero intelligence-hero"><div><span className="eyebrow"><Sparkles size={14}/> WAREHOUSE INTELLIGENCE</span><h2>Decision Copilot</h2><p>Explainable recommendations for allocation, stock risk and warehouse bottlenecks.</p></div><div className="hero-badge"><Sparkles size={18}/><div><b>V3</b><span>intelligence layer</span></div></div></section>

    <div className="intel-grid">
      <section className="panel copilot-panel"><PanelTitle icon={<Sparkles/>} title="AI-style Decision Copilot" action="Explainable" />
        {copilot ? <><div className={`copilot-result ${copilot.severity}`}><div className="copilot-icon"><Sparkles size={18}/></div><div className="grow"><span>TOP PRIORITY · {topOrder.id}</span><h3>{copilot.title}</h3><p>{copilot.explanation}</p></div><Risk value={topOrder.risk}/></div><div className="copilot-why"><label>REASONING SIGNALS</label><div className="signal-grid"><div><span>Priority</span><b>{topOrder.priority}</b></div><div><span>Decision score</span><b>{priorityScore(topOrder)}</b></div><div><span>Due</span><b>{topOrder.due}</b></div></div></div><div className="action-list">{copilot.actions.map((a:string,i:number)=><div key={a}><span>{i+1}</span>{a}</div>)}</div><button className="primary-btn" onClick={()=>onSelect(topOrder)}>Open full decision <ArrowRight size={16}/></button></> : <p>No active orders.</p>}
      </section>
      <section className="panel"><PanelTitle icon={<ShieldAlert/>} title="Stockout risk" action="Prioritized" /><div className="risk-table">{riskRows.slice(0,5).map((r:any)=><div className="risk-row" key={r.sku} onClick={()=>setSelectedSku(r.sku)}><div className="risk-bar"><span style={{width:`${Math.max(8,r.risk)}%`}}/></div><div className="grow"><b>{r.sku}</b><span>{r.name} · {r.available} available</span></div><strong className={r.risk>=70?"risk-high":r.risk>=40?"risk-med":"risk-low"}>{r.risk}%</strong></div>)}</div></section>
    </div>

    <div className="intel-grid">
      <section className="panel"><PanelTitle icon={<Warehouse/>} title="Warehouse bottleneck map" action="Live simulation" /><div className="zone-grid">{zoneData.map(z=><div className={`zone ${z.load>=80?"hot":z.load>=65?"busy":"healthy"}`} key={z.name}><div className="zone-top"><b>{z.name}</b><span>{z.state}</span></div><div className="zone-meter"><span style={{width:`${z.load}%`}}/></div><div className="zone-meta"><span>{z.load}% load</span><span>{z.picks} picks queued</span></div></div>)}</div><div className="insight-note"><Sparkles size={15}/><span><b>Suggested response:</b> move the next available picker to Zone A before starting another batch. This reduces the highest current congestion.</span></div></section>
      <section className="panel"><PanelTitle icon={<Truck/>} title="Optimized picking queue" action="Priority aware" /><div className="pick-list">{pickPlan.map((o:Order,i:number)=><div className="pick-row" key={o.id}><div className="pick-num">{i+1}</div><div className="grow"><b>{o.id}</b><span>{o.items.map(x=>x.sku).join(" · ")} · {o.priority}</span></div><Risk value={o.risk}/><ChevronRight size={14}/></div>)}{pickPlan.length===0&&<div className="empty">No orders ready for picking.</div>}</div><div className="route-note"><Truck size={15}/><span><b>Route logic:</b> highest priority first, then group by warehouse zone to reduce travel.</span></div></section>
    </div>

    <section className="panel"><PanelTitle icon={<RefreshCw/>} title="Smart replenishment" action="Recommended actions" /><div className="replenish-grid">{riskRows.filter((r:any)=>r.stock<=r.reorderPoint).slice(0,4).map((r:any)=><div className="replenish-card" key={r.sku}><div><b>{r.sku}</b><span>{r.name}</span></div><div className="replenish-number"><small>RECOMMENDED</small><strong>{Math.max(r.reorderPoint*2-r.stock,1)} units</strong></div><button onClick={()=>setSelectedSku(r.sku)}>Inspect <ArrowRight size={13}/></button></div>)}</div></section>
  </div>
}

function DecisionDrawer({order, inventory, onClose, onAdvance}:any) {
  const d = allocationDecision(order, inventory);
  return <div className="overlay" onClick={onClose}><aside className="drawer" onClick={e=>e.stopPropagation()}><div className="drawer-head"><div><span className="eyebrow"><Sparkles size={13}/> DECISION ANALYSIS</span><h2>{order.id}</h2><p>{order.customer} · {order.due}</p></div><button className="icon-btn" onClick={onClose}>×</button></div><div className={`decision-hero ${d.severity}`}><div className="decision-symbol"><Sparkles size={20}/></div><div><span>RECOMMENDED ACTION</span><h3>{d.title}</h3></div></div><div className="drawer-section"><label>WHY THIS DECISION?</label><p>{d.explanation}</p></div><div className="drawer-section"><label>ACTION PLAN</label>{d.actions.map((a:string,i:number)=><div className="action-line" key={a}><span>{i+1}</span>{a}</div>)}</div><div className="drawer-section"><label>ORDER SIGNALS</label><div className="signal-grid"><div><span>Priority</span><b>{order.priority}</b></div><div><span>Risk</span><b>{order.risk}%</b></div><div><span>Decision score</span><b>{priorityScore(order)}</b></div></div></div><button className="primary-btn" onClick={onAdvance}>Apply recommendation <ArrowRight size={16}/></button></aside></div>
}

function Kpi({icon,label,value,note,danger,warn}:any){return <div className={`kpi ${danger?"danger":""} ${warn?"warn":""}`}><div className="kpi-icon">{icon}</div><div><span>{label}</span><b>{value}</b><small>{note}</small></div></div>}
function PanelTitle({icon,title,action}:any){return <div className="panel-title"><div><span>{icon}</span><h3>{title}</h3></div><button>{action}<ChevronRight size={14}/></button></div>}
function Priority({value}:{value:string}){return <span className={`tag priority ${value.toLowerCase()}`}>{value}</span>}
function Status({value}:{value:string}){return <span className={`tag status ${value.toLowerCase().replaceAll(" ","-")}`}>{value}</span>}
function Risk({value}:{value:number}){return <span className={`risk-chip ${value>=80?"high":value>=60?"medium":"low"}`}>{value}%</span>}
function DecisionCard({decision}:any){return <article className={`decision-card ${decision.severity}`}><div className="decision-icon"><Sparkles size={16}/></div><div className="grow"><b>{decision.title}</b><p>{decision.explanation}</p><div className="mini-actions">{decision.actions.slice(0,2).map((a:string)=><span key={a}>{a}</span>)}</div></div><ChevronRight size={17}/></article>}

export default App;
