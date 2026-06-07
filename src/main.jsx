import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  BarChart3,
  CalendarClock,
  CircleDollarSign,
  Download,
  Edit3,
  History,
  LayoutDashboard,
  PackagePlus,
  Plus,
  Save,
  Search,
  Trash2,
  Utensils,
  Boxes,
  ShieldCheck
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import "./styles.css";

const API_BASE = (import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000").replace(/\/+$/, "");
const UNITS = ["กิโลกรัม", "กรัม", "แพ็ค", "ถุง", "ลัง", "ขวด", "ฟอง"];

const money = (value) =>
  new Intl.NumberFormat("th-TH", { maximumFractionDigits: 2 }).format(Number(value || 0));

const todayIso = () => new Date().toISOString().slice(0, 10);

async function api(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || response.statusText);
  }
  return response.headers.get("content-type")?.includes("application/json")
    ? response.json()
    : response;
}

function App() {
  const [view, setView] = useState("dashboard");
  const [ingredients, setIngredients] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [report, setReport] = useState(null);
  const [editingPurchase, setEditingPurchase] = useState(null);
  const [toast, setToast] = useState("");

  const refreshAll = async () => {
    const [ingredientData, purchaseData, dashboardData, reportData] = await Promise.all([
      api("/ingredients"),
      api("/purchases"),
      api("/dashboard"),
      api("/reports?scope=month")
    ]);
    setIngredients(ingredientData);
    setPurchases(purchaseData);
    setDashboard(dashboardData);
    setReport(reportData);
  };

  useEffect(() => {
    refreshAll().catch((error) => setToast(`เชื่อมต่อ backend ไม่ได้: ${error.message}`));
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      if (new Date().toTimeString().slice(0, 8) === "23:59:59") refreshAll();
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const notify = (message) => {
    setToast(message);
    setTimeout(() => setToast(""), 3500);
  };

  const savePurchase = async (payload, id) => {
    await api(id ? `/purchases/${id}` : "/purchases", {
      method: id ? "PUT" : "POST",
      body: JSON.stringify(payload)
    });
    setEditingPurchase(null);
    await refreshAll();
    setView("dashboard");
    notify("บันทึกรายการซื้อเรียบร้อย");
  };

  const deletePurchase = async (id) => {
    await api(`/purchases/${id}`, { method: "DELETE" });
    await refreshAll();
    notify("ลบรายการซื้อแล้ว");
  };

  const pages = {
    dashboard: <Dashboard data={dashboard} purchases={purchases} onAdd={() => setView("purchase")} />,
    purchase: (
      <PurchaseForm
        ingredients={ingredients}
        initialPurchase={editingPurchase}
        onCancel={() => {
          setEditingPurchase(null);
          setView("dashboard");
        }}
        onSave={savePurchase}
      />
    ),
    ingredients: (
      <IngredientsPage ingredients={ingredients} refresh={refreshAll} notify={notify} />
    ),
    history: (
      <HistoryPage
        purchases={purchases}
        ingredients={ingredients}
        refresh={refreshAll}
        onEdit={(purchase) => {
          setEditingPurchase(purchase);
          setView("purchase");
        }}
        onDelete={deletePurchase}
      />
    ),
    reports: <ReportsPage report={report} setReport={setReport} notify={notify} />,
    backup: <BackupPage notify={notify} />
  };

  return (
    <div className="app-bg min-h-screen text-ink">
      <header className="sticky top-0 z-20 border-b border-tamarind/20 bg-paper/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-lg border border-tamarind/25 bg-honey text-brown shadow-[0_3px_0_#7a421e]">
              <Utensils size={22} />
            </div>
            <div>
              <h1 className="brand-title text-xl font-bold leading-tight">ฝีมือแม่</h1>
              <p className="text-xs font-semibold text-tamarind/65">บันทึกวัตถุดิบประจำวันให้อุ่นใจเหมือนจดสมุดครัว</p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-28 pt-5">{pages[view]}</main>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-tamarind/20 bg-paper/95 shadow-[0_-10px_30px_rgba(89,47,20,0.10)] backdrop-blur">
        <div className="mx-auto grid max-w-6xl grid-cols-6 gap-1 px-2 py-2">
          <Tab icon={LayoutDashboard} label="หน้าแรก" active={view === "dashboard"} onClick={() => setView("dashboard")} />
          <Tab icon={PackagePlus} label="บันทึก" active={view === "purchase"} onClick={() => setView("purchase")} />
          <Tab icon={Boxes} label="วัตถุดิบ" active={view === "ingredients"} onClick={() => setView("ingredients")} />
          <Tab icon={History} label="ย้อนหลัง" active={view === "history"} onClick={() => setView("history")} />
          <Tab icon={BarChart3} label="รายงาน" active={view === "reports"} onClick={() => setView("reports")} />
          <Tab icon={ShieldCheck} label="สำรอง" active={view === "backup"} onClick={() => setView("backup")} />
        </div>
      </nav>

      {toast && <div className="fixed bottom-24 left-4 right-4 z-40 mx-auto max-w-md rounded-lg border border-honey/30 bg-tamarind px-4 py-3 text-center text-sm font-semibold text-white shadow-xl">{toast}</div>}
    </div>
  );
}

function Tab({ icon: Icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-md text-xs font-semibold ${
        active ? "bg-clay text-brown shadow-[0_2px_0_#774016]" : "text-tamarind/70 hover:bg-honey/10"
      }`}
      title={label}
    >
      <Icon size={20} />
      <span>{label}</span>
    </button>
  );
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="paper-card rounded-lg p-4">
      <div className="mb-3 flex items-center justify-between text-tamarind/60">
        <span className="text-sm">{label}</span>
        <Icon size={20} />
      </div>
      <div className="brand-title text-2xl font-bold">{value}</div>
    </div>
  );
}

function Dashboard({ data, purchases, onAdd }) {
  const latest = purchases.slice(0, 4);
  return (
    <section className="space-y-5">
      <div className="kitchen-banner">
        <div>
          <p className="text-sm font-bold text-honey">ร้านอาหารไทยโฮมเมด</p>
          <h2 className="brand-title mt-1 text-3xl font-black leading-tight">วัตถุดิบดี เริ่มที่หลังร้าน</h2>
          <p className="mt-2 max-w-xl text-sm font-semibold text-tamarind/65">จดจากตลาด แล้วกลับมาบันทึกยอดซื้อให้ครบในไม่กี่แตะ</p>
        </div>
        <div className="hidden text-right sm:block">
          <div className="brand-title text-5xl font-black">{money(data?.today_total)}</div>
          <div className="text-sm font-bold text-tamarind/60">บาท วันนี้</div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">หน้าแรก</h2>
          <p className="text-sm font-semibold text-tamarind/60">สรุปยอดซื้อวันนี้และเดือนนี้</p>
        </div>
        <button className="primary-btn" onClick={onAdd}>
          <Plus size={18} /> เพิ่มรายการซื้อ
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={CircleDollarSign} label="ยอดซื้อวันนี้" value={`${money(data?.today_total)} บาท`} />
        <Stat icon={CalendarClock} label="ยอดซื้อเดือนนี้" value={`${money(data?.month_total)} บาท`} />
        <Stat icon={PackagePlus} label="จำนวนรายการวันนี้" value={`${data?.today_item_count || 0} รายการ`} />
        <Stat icon={Boxes} label="จำนวนวัตถุดิบ" value={`${data?.ingredient_count || 0} รายการ`} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        <Panel title="วัตถุดิบที่ซื้อวันนี้">
          {data?.today_ingredients?.length ? (
            <div className="flex flex-wrap gap-2">
              {data.today_ingredients.map((name) => <span className="pill" key={name}>{name}</span>)}
            </div>
          ) : (
            <Empty text="ยังไม่มีรายการซื้อของวันนี้" />
          )}
        </Panel>
        <Panel title="รายการล่าสุด">
          <div className="space-y-3">
            {latest.map((purchase) => (
              <div className="flex items-center justify-between
              rounded-lg
              border border-[#D6BFA6]
              bg-[#FFF8ED]
              px-3 py-2
              shadow-sm"
              key={purchase.id}>
                <div>
                  <div className="font-semibold">{purchase.purchase_date}</div>
                  <div className="text-sm text-tamarind/60">{purchase.items.length} รายการ</div>
                </div>
                <div className="font-bold">{money(purchase.total_amount)} บาท</div>
              </div>
            ))}
            {!latest.length && <Empty text="ยังไม่มีประวัติการซื้อ" />}
          </div>
        </Panel>
      </div>
    </section>
  );
}

function PurchaseForm({ ingredients, initialPurchase, onSave, onCancel }) {
  const [purchaseDate, setPurchaseDate] = useState(initialPurchase?.purchase_date || todayIso());
  const [rows, setRows] = useState(
    initialPurchase?.items?.map((item) => ({
      ingredient_id: item.ingredient_id,
      quantity: item.quantity,
      unit_price: item.unit_price
    })) || [{ ingredient_id: ingredients[0]?.id || "", quantity: "", unit_price: "" }]
  );

  useEffect(() => {
    if (!initialPurchase && ingredients[0] && rows.length === 1 && !rows[0].ingredient_id) {
      setRows([{ ...rows[0], ingredient_id: ingredients[0].id }]);
    }
  }, [ingredients]);

  const total = useMemo(
    () => rows.reduce((sum, row) => sum + Number(row.quantity || 0) * Number(row.unit_price || 0), 0),
    [rows]
  );

  const updateRow = (index, patch) =>
    setRows(rows.map((row, rowIndex) => (rowIndex === index ? { ...row, ...patch } : row)));

  const addRow = () =>
    setRows([...rows, { ingredient_id: ingredients[0]?.id || "", quantity: "", unit_price: "" }]);

  const removeRow = (index) => setRows(rows.filter((_, rowIndex) => rowIndex !== index));

  const submit = (event) => {
    event.preventDefault();
    const payload = {
      purchase_date: purchaseDate,
      items: rows.map((row) => ({
        ingredient_id: Number(row.ingredient_id),
        quantity: Number(row.quantity),
        unit_price: Number(row.unit_price)
      }))
    };
    onSave(payload, initialPurchase?.id);
  };

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold">{initialPurchase ? "แก้ไขรายการซื้อ" : "บันทึกรายการซื้อ"}</h2>
        <p className="text-sm font-semibold text-tamarind/60">เลือกวัตถุดิบจากรายการเดิม กรอกจำนวนและราคา ระบบรวมยอดให้ทันที</p>
      </div>
      <form className="space-y-4" onSubmit={submit}>
        <Panel title="วันที่ซื้อ">
          <input className="input max-w-xs" type="date" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} />
        </Panel>

        <Panel title="รายการ">
          <div className="space-y-3">
            {rows.map((row, index) => {
              const ingredient = ingredients.find((item) => item.id === Number(row.ingredient_id));
              const amount = Number(row.quantity || 0) * Number(row.unit_price || 0);
              return (
                <div className="grid gap-2 rounded-lg border border-tamarind/20 bg-rice/70 p-3 md:grid-cols-[1.6fr_1fr_1fr_auto]" key={index}>
                  <label className="field">
                    <span>วัตถุดิบ</span>
                    <select className="input" value={row.ingredient_id} onChange={(e) => updateRow(index, { ingredient_id: e.target.value })}>
                      {ingredients.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}
                    </select>
                  </label>
                  <label className="field">
                    <span>จำนวน ({ingredient?.unit || "-"})</span>
                    <input className="input" required min="0.01" step="0.01" type="number" value={row.quantity} onChange={(e) => updateRow(index, { quantity: e.target.value })} />
                  </label>
                  <label className="field">
                    <span>ราคา</span>
                    <input className="input" required min="0" step="0.01" type="number" value={row.unit_price} onChange={(e) => updateRow(index, { unit_price: e.target.value })} />
                  </label>
                  <div className="flex items-end justify-between gap-2">
                    <div className="pb-2 font-bold">{money(amount)} บาท</div>
                    <button className="icon-btn danger" type="button" onClick={() => removeRow(index)} disabled={rows.length === 1} title="ลบรายการ">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          <button className="secondary-btn mt-3" type="button" onClick={addRow}>
            <Plus size={18} /> เพิ่มรายการ
          </button>
        </Panel>

        <div className="paper-card sticky bottom-20 rounded-lg p-4 shadow-lg">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-bold text-tamarind/60">ยอดรวมทั้งวัน</span>
            <strong className="brand-title text-2xl">{money(total)} บาท</strong>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button className="secondary-btn justify-center" type="button" onClick={onCancel}>ยกเลิก</button>
            <button className="primary-btn justify-center" type="submit"><Save size={18} /> บันทึก</button>
          </div>
        </div>
      </form>
    </section>
  );
}

function IngredientsPage({ ingredients, refresh, notify }) {
  const [form, setForm] = useState({ name: "", unit: "กิโลกรัม" });
  const [editing, setEditing] = useState(null);

  const save = async (event) => {
    event.preventDefault();
    await api(editing ? `/ingredients/${editing}` : "/ingredients", {
      method: editing ? "PUT" : "POST",
      body: JSON.stringify(form)
    });
    setForm({ name: "", unit: "กิโลกรัม" });
    setEditing(null);
    await refresh();
    notify("บันทึกวัตถุดิบเรียบร้อย");
  };

  const edit = (item) => {
    setEditing(item.id);
    setForm({ name: item.name, unit: item.unit });
  };

  const remove = async (id) => {
    await api(`/ingredients/${id}`, { method: "DELETE" });
    await refresh();
    notify("ลบวัตถุดิบแล้ว");
  };

  return (
    <section className="grid gap-4 lg:grid-cols-[360px_1fr]">
      <Panel title={editing ? "แก้ไขวัตถุดิบ" : "เพิ่มวัตถุดิบ"}>
        <form className="space-y-3" onSubmit={save}>
          <label className="field">
            <span>ชื่อวัตถุดิบ</span>
            <input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </label>
          <label className="field">
            <span>หน่วยนับ</span>
            <select className="input" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}>
              {UNITS.map((unit) => <option key={unit}>{unit}</option>)}
            </select>
          </label>
          <button className="primary-btn w-full justify-center" type="submit"><Save size={18} /> บันทึก</button>
        </form>
      </Panel>
      <Panel title="รายการวัตถุดิบ">
        <div className="grid gap-2 sm:grid-cols-2">
          {ingredients.map((item) => (
            <div className="flex items-center justify-between
  rounded-lg
  border border-[#D6BFA6]
  bg-[#FFF8ED]
  px-3 py-2
  shadow-sm" key={item.id}>
              <div>
                <div className="font-semibold">{item.name}</div>
                <div className="text-sm text-tamarind/60">{item.unit}</div>
              </div>
              <div className="flex gap-1">
                <button className="icon-btn" onClick={() => edit(item)} title="แก้ไข"><Edit3 size={17} /></button>
                <button className="icon-btn danger" onClick={() => remove(item.id)} title="ลบ"><Trash2 size={17} /></button>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </section>
  );
}

function HistoryPage({ purchases, onEdit, onDelete }) {
  const [keyword, setKeyword] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const filtered = purchases.filter((purchase) => {
    const hasKeyword = !keyword || purchase.items.some((item) => item.ingredient_name.includes(keyword));
    const inStart = !start || purchase.purchase_date >= start;
    const inEnd = !end || purchase.purchase_date <= end;
    return hasKeyword && inStart && inEnd;
  });

  return (
    <section className="space-y-4">
      <Panel title="ค้นหาข้อมูลย้อนหลัง">
        <div className="grid gap-2 md:grid-cols-[1.5fr_1fr_1fr]">
          <label className="field">
            <span>ชื่อวัตถุดิบ</span>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-3 text-tamarind/40" size={18} />
              <input className="input pl-10" placeholder="เช่น หมู" value={keyword} onChange={(e) => setKeyword(e.target.value)} />
            </div>
          </label>
          <label className="field"><span>ตั้งแต่วันที่</span><input className="input" type="date" value={start} onChange={(e) => setStart(e.target.value)} /></label>
          <label className="field"><span>ถึงวันที่</span><input className="input" type="date" value={end} onChange={(e) => setEnd(e.target.value)} /></label>
        </div>
      </Panel>
      <div className="space-y-3">
        {filtered.map((purchase) => (
          <Panel title={`${purchase.purchase_date} - ${money(purchase.total_amount)} บาท`} key={purchase.id}>
            <div className="space-y-2">
              {purchase.items.map((item) => (
                <div className="flex items-center justify-between text-sm" key={item.id}>
                  <span>{item.ingredient_name} {money(item.quantity)} {item.unit}</span>
                  <strong>{money(item.amount)} บาท</strong>
                </div>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <button className="secondary-btn" onClick={() => onEdit(purchase)}><Edit3 size={18} /> แก้ไข</button>
              <button className="secondary-btn text-red-700" onClick={() => onDelete(purchase.id)}><Trash2 size={18} /> ลบ</button>
            </div>
          </Panel>
        ))}
        {!filtered.length && <Empty text="ไม่พบข้อมูลตามเงื่อนไข" />}
      </div>
    </section>
  );
}

function ReportsPage({ report, setReport, notify }) {
  const [scope, setScope] = useState("month");
  const loadReport = async (nextScope = scope) => {
    setScope(nextScope);
    setReport(await api(`/reports?scope=${nextScope}`));
  };
  const exportExcel = () => {
    window.open(`${API_BASE}/export/excel`, "_blank");
    notify("เริ่มดาวน์โหลด Excel");
  };

  return (
    <section className="space-y-4">
      <Panel title="รายงาน">
        <div className="flex flex-wrap gap-2">
          {[
            ["day", "รายวัน"],
            ["week", "รายสัปดาห์"],
            ["month", "รายเดือน"],
            ["year", "รายปี"]
          ].map(([value, label]) => (
            <button className={scope === value ? "primary-btn" : "secondary-btn"} key={value} onClick={() => loadReport(value)}>{label}</button>
          ))}
          <button className="secondary-btn" onClick={exportExcel}><Download size={18} /> Export Excel</button>
        </div>
      </Panel>

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat icon={CircleDollarSign} label="ยอดซื้อรวม" value={`${money(report?.total_amount)} บาท`} />
        <Stat icon={CalendarClock} label="จำนวนวันบันทึก" value={`${report?.recorded_days || 0} วัน`} />
        <Stat icon={PackagePlus} label="จำนวนรายการทั้งหมด" value={`${report?.item_count || 0} รายการ`} />
      </div>

      <Panel title="กราฟยอดซื้อ">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={report?.series || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip formatter={(value) => `${money(value)} บาท`} />
              <Bar dataKey="total" fill="#D97A25" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <Panel title="Top 10 วัตถุดิบที่ซื้อบ่อยที่สุด">
        <div className="space-y-2">
          {(report?.top_ingredients || []).map((item, index) => (
            <div className="flex items-center justify-between
  rounded-lg
  border border-[#D6BFA6]
  bg-[#FFF8ED]
  px-3 py-2
  shadow-sm" key={item.ingredient_name}>
              <strong>{index + 1}</strong>
              <span>{item.ingredient_name}</span>
              <span className="font-bold">{item.purchase_count} ครั้ง</span>
            </div>
          ))}
          {!report?.top_ingredients?.length && <Empty text="ยังไม่มีข้อมูลสำหรับรายงาน" />}
        </div>
      </Panel>
    </section>
  );
}

function BackupPage({ notify }) {
  const backup = async () => {
    const result = await api("/backup", { method: "POST" });
    notify(`สำรองข้อมูลแล้ว: ${result.backup_file}`);
  };
  return (
    <Panel title="สำรองข้อมูล">
      <p className="mb-4 text-sm font-semibold text-tamarind/70">สร้างไฟล์สำรองฐานข้อมูลไว้ในโฟลเดอร์ backend/backups เพื่อป้องกันข้อมูลสูญหาย</p>
      <button className="primary-btn" onClick={backup}><ShieldCheck size={18} /> Backup ตอนนี้</button>
    </Panel>
  );
}

function Panel({ title, children }) {
  return (
    <section className="paper-card rounded-lg p-4">
      <h3 className="brand-title mb-3 text-base font-bold">{title}</h3>
      {children}
    </section>
  );
}

function Empty({ text }) {
  return <div className="rounded-md border border-dashed border-[#D6BFA6] bg-[#FFF8ED] px-3 py-4 text-center text-sm font-semibold text-[#6E3A18]/55">{text}</div>;
}

createRoot(document.getElementById("root")).render(<App />);
