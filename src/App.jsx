import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Building2,
  CalendarDays,
  Camera,
  CheckSquare,
  ChevronRight,
  ClipboardList,
  FileText,
  ListChecks,
  Loader2,
  LogIn,
  LogOut,
  MapPin,
  Package,
  Plus,
  Save,
  Search,
  ShieldCheck,
  StickyNote,
  Trash2,
  UserRound,
  WalletCards,
} from "lucide-react";

function Card({ children, className = "" }) {
  return (
    <div className={`rounded-2xl border bg-white shadow-sm ${className}`}>
      {children}
    </div>
  );
}

function CardContent({ children, className = "" }) {
  return <div className={className}>{children}</div>;
}

function Button({ children, className = "", variant, ...props }) {
  const base =
    "inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-xl border px-3 py-2 text-sm font-medium transition";
  const style =
    variant === "outline"
      ? "bg-white text-slate-900 hover:bg-slate-100"
      : "bg-slate-900 text-white hover:bg-slate-800";

  return (
    <button className={`${base} ${style} ${className}`} {...props}>
      {children}
    </button>
  );
}

const I = {
  dashboard: Building2,
  projects: Building2,
  contracts: FileText,
  claims: WalletCards,
  memos: StickyNote,
  checklists: ListChecks,
  daily: ClipboardList,
  defects: AlertTriangle,
  materials: Package,
  todos: CheckSquare,
  photos: Camera,
};

const mods = [
  ["dashboard", "總覽"],
  ["projects", "工地管理"],
  ["contracts", "工程合約"],
  ["claims", "廠商請款"],
  ["memos", "工項 Memo"],
  ["checklists", "階段檢核表"],
  ["daily", "施工日報"],
  ["defects", "缺失改善"],
  ["materials", "材料庫存"],
  ["todos", "待辦事項"],
  ["photos", "照片中心"],
].map(([id, label]) => ({ id, label, icon: I[id] }));

const projects = [
  {
    name: "東區住宅新建工程",
    owner: "陳先生",
    status: "進行中",
    address: "台中市東區",
    defects: 8,
    dailyPhotos: 32,
    nextClaim: "2026/05",
  },
  {
    name: "北屯店面裝修工程",
    owner: "林小姐",
    status: "收尾中",
    address: "台中市北屯區",
    defects: 3,
    dailyPhotos: 18,
    nextClaim: "2026/06",
  },
];

const claimSeed = [
  {
    period: "第 1 期",
    month: "2026/05",
    trade: "水電工程",
    vendor: "宏鑫水電",
    contract: "水電配管工程",
    amount: 185000,
    status: "待付款",
  },
  {
    period: "第 2 期",
    month: "2026/05",
    trade: "泥作工程",
    vendor: "順發泥作",
    contract: "浴室泥作工程",
    amount: 126000,
    status: "審核中",
  },
  {
    period: "第 1 期",
    month: "2026/06",
    trade: "防水工程",
    vendor: "永信防水",
    contract: "防水工程",
    amount: 98000,
    status: "待送審",
  },
];

const memos = [
  [
    "水電工程",
    "2F 管線路徑待確認",
    "廚房排水與弱電箱位置需與業主確認後再封板。",
    "待確認",
  ],
  [
    "防水工程",
    "浴室門檻加強",
    "3F 主臥浴室門檻需補強收邊，避免後續滲水爭議。",
    "追蹤中",
  ],
  ["磁磚工程", "磁磚到料批號", "客浴牆磚需確認是否同批號，避免色差。", "待處理"],
].map(([trade, title, note, status]) => ({ trade, title, note, status }));

const checks = [
  "基礎工程|放樣完成,開挖完成,基礎鋼筋查驗,模板查驗,混凝土澆置紀錄",
  "結構工程|柱牆鋼筋查驗,梁版模板查驗,水電套管確認,混凝土澆置紀錄",
  "裝修工程|水電配管完成,防水試水,磁磚鋪貼查驗,油漆底補確認",
  "驗收交屋|缺失彙整,設備測試,清潔完成,業主複驗",
].map((s, i) => {
  const [stage, itemText] = s.split("|");
  return {
    stage,
    done: [5, 4, 3, 1][i],
    items: itemText.split(","),
  };
});

const defectSeed = [
  ["3F 主臥浴室", "防水", "永信防水", "2026/05/25", "待改善", "重大"],
  ["2F 樓梯間", "油漆", "佳美油漆", "2026/05/27", "待複驗", "一般"],
  ["1F 客廳", "磁磚", "順發泥作", "2026/05/30", "改善中", "重要"],
].map(([location, type, vendor, due, status, level]) => ({
  location,
  type,
  vendor,
  due,
  status,
  level,
}));

const groups = {
  trade: [
    [
      "基礎工程",
      ["放樣工班", "土方開挖工班", "基礎鋼筋工班", "基礎模板工班", "基礎混凝土工班"],
    ],
    ["結構工程", ["鋼筋工班", "模板工班", "混凝土澆置工班", "鋼構工班"]],
    ["裝修工程", ["水電工班", "消防工班", "防水工班", "磁磚工班", "油漆工班", "木作工班", "清潔工班"]],
    ["假設與臨時工程", ["鷹架工班", "安全圍籬工班", "臨時水電工班", "吊掛工班"]],
    ["其他", ["點工", "雜工", "監工", "其他工班"]],
  ],
  material: [
    ["土建材料", ["水泥", "砂", "碎石", "混凝土", "鋼筋", "模板"]],
    ["裝修材料", ["磁磚", "填縫劑", "油漆", "矽利康", "木作板材"]],
    ["水電消防材料", ["PVC 管", "電線", "線槽", "開關插座", "消防管件"]],
    ["防水材料", ["防水材", "彈性水泥", "PU 防水", "止水條"]],
    ["其他", ["清潔用品", "耗材", "其他材料"]],
  ],
  equipment: [
    ["重型機具", ["吊車", "怪手", "堆高機", "挖土機"]],
    ["施工機具", ["切割機", "電鑽", "攪拌機", "震動機", "雷射水平儀"]],
    ["臨時設備", ["發電機", "抽水機", "照明設備", "臨時配電箱"]],
    ["安全設備", ["安全護欄", "安全網", "施工圍籬", "交通錐"]],
    ["其他", ["其他機具"]],
  ],
};

const weather = ["晴", "陰", "雨", "雷雨", "颱風", "高溫", "寒流"];

const twd = (n) =>
  new Intl.NumberFormat("zh-TW", {
    style: "currency",
    currency: "TWD",
    maximumFractionDigits: 0,
  }).format(n || 0);

const sum = (arr, m) =>
  arr.filter((x) => x.month === m).reduce((a, b) => a + b.amount, 0);

const byTrade = (arr, m) =>
  arr
    .filter((x) => x.month === m)
    .reduce((o, x) => {
      o[x.trade] = (o[x.trade] || 0) + x.amount;
      return o;
    }, {});

const del = (label, fn) =>
  window.confirm(`確定刪除「${label}」？`) &&
  window.confirm(`再次確認刪除「${label}」？`) &&
  fn();

async function apiFetch(path, options = {}) {
  const response = await fetch(path, {
    credentials: "include",
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  const data =
    response.status === 204 ? null : await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error || "伺服器連線失敗");
  }

  return data;
}

console.assert(sum(claimSeed, "2026/05") === 311000, "claim total test");
console.assert(byTrade(claimSeed, "2026/05")["水電工程"] === 185000, "trade summary test");

function Badge({ children }) {
  return (
    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
      {children}
    </span>
  );
}

function Del({ label, onClick, icon = false }) {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={() => del(label, onClick)}
      className="h-8 rounded-lg px-2 text-xs text-red-600"
      aria-label={`刪除 ${label}`}
    >
      <Trash2 className={icon ? "h-3.5 w-3.5" : "mr-1 h-3.5 w-3.5"} />
      {icon ? null : "刪除"}
    </Button>
  );
}

function Header({ title, sub, btn = "新增資料" }) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="mt-1 text-sm text-slate-500">{sub}</p>
      </div>
      <Button className="rounded-xl">
        <Plus className="mr-2 h-4 w-4" />
        {btn}
      </Button>
    </div>
  );
}

function Stat({ title, value, desc, icon: Icon }) {
  return (
    <Card className="rounded-2xl shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">{title}</p>
            <h3 className="mt-2 text-2xl font-bold">{value}</h3>
            <p className="mt-1 text-xs text-slate-500">{desc}</p>
          </div>
          <div className="rounded-2xl bg-slate-100 p-3">
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SelectGroup({ value, onChange, type, placeholder }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-xl border bg-white px-3 py-2 outline-none"
    >
      <option value="">{placeholder}</option>
      {groups[type].map(([group, items]) => (
        <optgroup key={group} label={group}>
          {items.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}

function Input({ value, onChange, ph = "", type = "text", ro = false }) {
  const controlledProps =
    onChange || ro
      ? {
          value: value ?? "",
          onChange: (e) => onChange?.(e.target.value),
          readOnly: ro,
        }
      : { defaultValue: value ?? "" };

  return (
    <input
      type={type}
      placeholder={ph}
      className={`w-full rounded-xl border px-3 py-2 outline-none ${
        ro ? "bg-slate-100 text-slate-600" : "bg-white"
      }`}
      {...controlledProps}
    />
  );
}

function LoadingScreen() {
  return (
    <Shell full>
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="flex items-center gap-3 rounded-2xl border bg-white px-5 py-4 text-sm text-slate-600 shadow-sm">
          <Loader2 className="h-5 w-5 animate-spin" />
          載入中
        </div>
      </div>
    </Shell>
  );
}

function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState("admin@eztodo.local");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      onLogin(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Shell full>
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-5xl items-center gap-6 lg:grid-cols-[1fr_420px]">
        <div className="rounded-3xl bg-slate-900 p-8 text-white">
          <div className="mb-8 inline-flex rounded-2xl bg-white/10 p-3">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold">EZtoDO 工程管理</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">
            登入後即可管理工地、施工日報、請款、缺失改善與照片紀錄。
          </p>
        </div>

        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-bold">管理員登入</h2>
            <form onSubmit={handleSubmit} className="mt-5 grid gap-4">
              <label>
                <span className="text-sm font-medium">帳號</span>
                <div className="mt-2">
                  <Input value={email} onChange={setEmail} ph="admin@eztodo.local" />
                </div>
              </label>
              <label>
                <span className="text-sm font-medium">密碼</span>
                <div className="mt-2">
                  <Input
                    type="password"
                    value={password}
                    onChange={setPassword}
                    ph="請輸入管理員密碼"
                  />
                </div>
              </label>
              {error ? (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </div>
              ) : null}
              <Button type="submit" disabled={loading} className="mt-1">
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <LogIn className="mr-2 h-4 w-4" />
                )}
                登入
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Shell>
  );
}

function ProjectSelect({ onSelect, onLogout }) {
  const [mode, setMode] = useState("list");
  const [list, setList] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [p, setP] = useState({
    name: "",
    owner: "",
    address: "",
    status: "進行中",
    startDate: "",
    endDate: "",
    manager: "",
    note: "",
  });

  useEffect(() => {
    let active = true;

    async function loadProjects() {
      setLoading(true);
      setError("");

      try {
        const data = await apiFetch("/api/projects");
        if (active) setList(data.projects || []);
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProjects();

    return () => {
      active = false;
    };
  }, []);

  async function createProject() {
    const nextProject = {
      ...p,
      name: p.name || "未命名工地",
      owner: p.owner || "未填寫",
      address: p.address || "未填寫地址",
      defects: 0,
      dailyPhotos: 0,
      nextClaim: "2026/05",
    };

    setError("");

    try {
      const data = await apiFetch("/api/projects", {
        method: "POST",
        body: JSON.stringify(nextProject),
      });
      setList([...list, data.project]);
      onSelect(data.project);
    } catch (err) {
      setError(err.message);
    }
  }

  async function removeProject(project) {
    setError("");

    try {
      await apiFetch(`/api/projects/${project.id}`, { method: "DELETE" });
      setList(list.filter((item) => item.id !== project.id));
    } catch (err) {
      setError(err.message);
    }
  }

  const filteredProjects = list.filter((project) => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return true;
    return [project.name, project.owner, project.address]
      .join(" ")
      .toLowerCase()
      .includes(keyword);
  });

  if (mode === "create") {
    return (
      <Shell full>
        <div className="mb-6 flex flex-col justify-between gap-4 rounded-3xl bg-slate-900 p-6 text-white sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold">建立新的工地資料</h1>
            <p className="mt-2 text-sm text-slate-300">
              後續日報、合約、請款、缺失與照片都會歸到此工地。
            </p>
          </div>
          <Button type="button" variant="outline" onClick={onLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            登出
          </Button>
        </div>
        {error ? (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        ) : null}
        <Card>
          <CardContent className="grid gap-4 p-5 md:grid-cols-2">
            {[
              ["name", "工地名稱"],
              ["owner", "業主 / 客戶"],
              ["address", "工地地址"],
              ["manager", "工地主任 / 管理人"],
            ].map(([key, label]) => (
              <label key={key} className={key === "name" || key === "address" ? "md:col-span-2" : ""}>
                <span className="text-sm font-medium">{label}</span>
                <div className="mt-2">
                  <Input value={p[key]} onChange={(value) => setP({ ...p, [key]: value })} />
                </div>
              </label>
            ))}
            <label>
              <span className="text-sm font-medium">狀態</span>
              <select
                value={p.status}
                onChange={(e) => setP({ ...p, status: e.target.value })}
                className="mt-2 w-full rounded-xl border bg-white px-3 py-2"
              >
                {["準備中", "進行中", "收尾中", "已完工", "暫停"].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </label>
            <label>
              <span className="text-sm font-medium">開工日期</span>
              <div className="mt-2">
                <Input type="date" value={p.startDate} onChange={(value) => setP({ ...p, startDate: value })} />
              </div>
            </label>
            <label>
              <span className="text-sm font-medium">預計完工日期</span>
              <div className="mt-2">
                <Input type="date" value={p.endDate} onChange={(value) => setP({ ...p, endDate: value })} />
              </div>
            </label>
            <label className="md:col-span-2">
              <span className="text-sm font-medium">備註</span>
              <textarea
                value={p.note}
                onChange={(e) => setP({ ...p, note: e.target.value })}
                className="mt-2 min-h-24 w-full rounded-xl border px-3 py-2"
              />
            </label>
            <div className="flex justify-end gap-3 md:col-span-2">
              <Button type="button" variant="outline" onClick={() => setMode("list")}>
                取消
              </Button>
              <Button
                type="button"
                onClick={createProject}
              >
                <Save className="mr-2 h-4 w-4" />
                儲存並進入
              </Button>
            </div>
          </CardContent>
        </Card>
      </Shell>
    );
  }

  return (
    <Shell full>
      <div className="mb-6 flex flex-col justify-between gap-4 rounded-3xl bg-slate-900 p-6 text-white sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold">請先選擇工地</h1>
          <p className="mt-2 text-sm text-slate-300">先選工地，避免多案場資料混在一起。</p>
        </div>
        <Button type="button" variant="outline" onClick={onLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          登出
        </Button>
      </div>
      <div className="mb-4 flex gap-3 rounded-2xl border bg-white p-3">
        <Search className="h-5 w-5 text-slate-400" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="w-full outline-none"
          placeholder="搜尋工地"
        />
      </div>
      {error ? (
        <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}
      {loading ? (
        <div className="rounded-2xl border bg-white p-8 text-center text-slate-500">
          <Loader2 className="mx-auto mb-3 h-6 w-6 animate-spin" />
          讀取工地資料中
        </div>
      ) : null}
      <div className="grid gap-4 md:grid-cols-2">
        {!loading && filteredProjects.map((project) => (
          <Card key={project.id || project.name} className="rounded-2xl">
            <CardContent className="p-5">
              <div className="flex justify-between">
                <div>
                  <h2 className="text-xl font-bold">{project.name}</h2>
                  <p className="mt-2 flex gap-1 text-sm text-slate-500">
                    <MapPin className="h-4 w-4" />
                    {project.address}
                  </p>
                  <p className="mt-1 flex gap-1 text-sm text-slate-500">
                    <UserRound className="h-4 w-4" />
                    業主：{project.owner}
                  </p>
                </div>
                <Badge>{project.status}</Badge>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-2 text-center text-sm">
                <div className="rounded-xl bg-slate-50 p-3">
                  缺失
                  <br />
                  <b>{project.defects}</b>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  照片
                  <br />
                  <b>{project.dailyPhotos}</b>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  請款期
                  <br />
                  <b>{project.nextClaim}</b>
                </div>
              </div>
              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                <Button type="button" onClick={() => onSelect(project)}>
                  進入
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
                <Del
                  label={project.name}
                  onClick={() => removeProject(project)}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="mt-6 flex justify-end">
        <Button type="button" variant="outline" onClick={() => setMode("create")}>
          <Plus className="mr-2 h-4 w-4" />
          新增工地
        </Button>
      </div>
    </Shell>
  );
}

function Shell({ children, full = false }) {
  return (
    <div className="min-h-screen bg-slate-50 p-4 text-slate-900">
      <div className={full ? "mx-auto w-full max-w-5xl" : ""}>{children}</div>
    </div>
  );
}

function Dashboard({ p, claims, onSwitch }) {
  const m = p.nextClaim || "2026/05";
  const total = sum(claims, m);
  const summary = byTrade(claims, m);

  return (
    <div>
      <div className="mb-5 flex flex-col justify-between gap-4 rounded-2xl border bg-white p-5 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm text-slate-500">目前工地</p>
          <h1 className="text-2xl font-bold">{p.name}</h1>
          <p className="text-sm text-slate-500">
            {p.address}｜業主：{p.owner}
          </p>
        </div>
        <Button type="button" variant="outline" onClick={onSwitch}>
          切換工地
        </Button>
      </div>
      <Header title="工地總覽" sub="此工地的合約、請款、日報、缺失、材料與照片" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat title="工地狀態" value={p.status} desc="目前工程狀態" icon={Building2} />
        <Stat title="待改善缺失" value={p.defects} desc="此工地缺失數" icon={AlertTriangle} />
        <Stat
          title="本月廠商請款"
          value={twd(total)}
          desc={`${m}，共 ${claims.filter((x) => x.month === m).length} 筆`}
          icon={WalletCards}
        />
        <Stat title="照片紀錄" value={p.dailyPhotos} desc="AI 辨識與歸檔" icon={Camera} />
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <h2 className="mb-4 text-lg font-bold">本月請款彙整</h2>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">{m}</p>
              <p className="text-2xl font-bold">{twd(total)}</p>
            </div>
            <div className="mt-4 space-y-2">
              {Object.entries(summary).map(([key, value]) => (
                <div key={key} className="flex justify-between rounded-xl border p-3 text-sm">
                  <b>{key}</b>
                  <b>{twd(value)}</b>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardContent className="p-5">
            <h2 className="mb-4 text-lg font-bold">快捷功能</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {mods
                .filter((x) => !["dashboard", "projects"].includes(x.id))
                .map((x) => {
                  const Icon = x.icon;
                  return (
                    <div key={x.id} className="flex gap-3 rounded-2xl border p-4">
                      <Icon className="h-5 w-5" />
                      <b>{x.label}</b>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardContent className="p-8 text-center text-slate-500">
            <h3 className="text-lg font-bold text-slate-900">照片辨識</h3>
            <p className="mt-2">功能開發中</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Claims({ p, claims, setClaims }) {
  return (
    <ListPage
      title="廠商請款資料"
      sub={`目前工地：${p.name}`}
      items={claims}
      render={(x) => (
        <Card key={`${x.vendor}-${x.period}-${x.month}`}>
          <CardContent className="flex flex-col justify-between gap-4 p-5 sm:flex-row">
            <div>
              <div className="flex flex-wrap gap-2">
                <h3 className="text-lg font-bold">{x.vendor}</h3>
                <Badge>{x.status}</Badge>
                <Badge>{x.trade}</Badge>
              </div>
              <p className="text-sm text-slate-500">{x.contract}</p>
              <p className="flex gap-1 text-sm text-slate-500">
                <CalendarDays className="h-4 w-4" />
                {x.period}/{x.month}
              </p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-sm text-slate-500">本期請款</p>
              <p className="text-2xl font-bold">{twd(x.amount)}</p>
              <div className="mt-2">
                <Del label={`${x.vendor} ${x.period}`} onClick={() => setClaims(claims.filter((c) => c !== x))} />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    />
  );
}

function Memos({ p }) {
  const [items, setItems] = useState(memos);

  return (
    <ListPage
      title="工項 Memo 紀錄"
      sub={`目前工地：${p.name}`}
      items={items}
      render={(x) => (
        <Card key={x.title}>
          <CardContent className="flex flex-col justify-between gap-4 p-5 sm:flex-row">
            <div>
              <div className="flex flex-wrap gap-2">
                <Badge>{x.trade}</Badge>
                <Badge>{x.status}</Badge>
              </div>
              <h3 className="mt-3 text-lg font-bold">{x.title}</h3>
              <p className="text-sm text-slate-500">{x.note}</p>
            </div>
            <Del label={x.title} onClick={() => setItems(items.filter((i) => i !== x))} />
          </CardContent>
        </Card>
      )}
    />
  );
}

function Checklists({ p }) {
  const [items, setItems] = useState(checks);

  return (
    <div>
      <Header title="工地各階段檢核表" sub={`目前工地：${p.name}`} btn="新增檢核表" />
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((s) => {
          const pct = s.items.length ? Math.round((s.done / s.items.length) * 100) : 0;

          return (
            <Card key={s.stage}>
              <CardContent className="p-5">
                <div className="flex justify-between">
                  <div>
                    <h3 className="text-lg font-bold">{s.stage}</h3>
                    <p className="text-sm text-slate-500">
                      已完成 {s.done}/{s.items.length}
                    </p>
                  </div>
                  <Del icon label={s.stage} onClick={() => setItems(items.filter((i) => i !== s))} />
                </div>
                <div className="mt-4 h-2 rounded-full bg-slate-100">
                  <div className="h-2 rounded-full bg-slate-900" style={{ width: `${pct}%` }} />
                </div>
                <div className="mt-4 space-y-2">
                  {s.items.map((item, i) => (
                    <div key={item} className="flex justify-between rounded-xl border p-3 text-sm">
                      <label>
                        <input type="checkbox" defaultChecked={i < s.done} /> {item}
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          del(item, () =>
                            setItems(
                              items.map((a) =>
                                a === s
                                  ? {
                                      ...a,
                                      items: a.items.filter((x) => x !== item),
                                      done: Math.min(a.done, a.items.length - 1),
                                    }
                                  : a,
                              ),
                            ),
                          )
                        }
                        className="text-red-600"
                        aria-label={`刪除 ${item}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function Daily({ p }) {
  const empty = {
    work: { trade: "", workers: "", description: "", note: "" },
    mat: { name: "", spec: "", quantity: "", unit: "", note: "" },
    eq: { name: "", quantity: "", note: "" },
  };
  const [work, setWork] = useState([{ id: 1, ...empty.work }]);
  const [mat, setMat] = useState([{ id: 1, ...empty.mat }]);
  const [eq, setEq] = useState([{ id: 1, ...empty.eq }]);

  const upd = (set, id, key, value) =>
    set((items) => items.map((x) => (x.id === id ? { ...x, [key]: value } : x)));
  const add = (set, obj) => set((items) => [...items, { id: Date.now(), ...obj }]);
  const rem = (set, id) => set((items) => (items.length === 1 ? items : items.filter((x) => x.id !== id)));

  return (
    <div>
      <Header title="施工日報紀錄" sub={`目前工地：${p.name}`} btn="新增日報" />
      <Card>
        <CardContent className="grid gap-4 p-5 md:grid-cols-2">
          <Input type="date" />
          <Input value={p.name} ro />
          <select className="rounded-xl border bg-white px-3 py-2">
            <option>請選擇天氣</option>
            {weather.map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
          <Input ph="天氣備註" />
          <Rows
            title="施工工班 / 人數 / 內容"
            list={work}
            add={() => add(setWork, empty.work)}
            del={(id, i) => del(`工班紀錄 ${i + 1}`, () => rem(setWork, id))}
            render={(x) => (
              <>
                <SelectGroup
                  type="trade"
                  value={x.trade}
                  onChange={(value) => upd(setWork, x.id, "trade", value)}
                  placeholder="請選擇工班"
                />
                <Input
                  type="number"
                  value={x.workers}
                  onChange={(value) => upd(setWork, x.id, "workers", value)}
                  ph="人數"
                />
                <Input
                  value={x.description}
                  onChange={(value) => upd(setWork, x.id, "description", value)}
                  ph="今日施工項目"
                />
                <Input value={x.note} onChange={(value) => upd(setWork, x.id, "note", value)} ph="備註" />
              </>
            )}
          />
          <Rows
            title="材料使用 / 進場"
            list={mat}
            add={() => add(setMat, empty.mat)}
            del={(id, i) => del(`材料紀錄 ${i + 1}`, () => rem(setMat, id))}
            render={(x) => (
              <>
                <SelectGroup
                  type="material"
                  value={x.name}
                  onChange={(value) => upd(setMat, x.id, "name", value)}
                  placeholder="請選擇材料"
                />
                <Input value={x.spec} onChange={(value) => upd(setMat, x.id, "spec", value)} ph="規格" />
                <Input
                  type="number"
                  value={x.quantity}
                  onChange={(value) => upd(setMat, x.id, "quantity", value)}
                  ph="數量"
                />
                <Input value={x.unit} onChange={(value) => upd(setMat, x.id, "unit", value)} ph="單位" />
                <Input value={x.note} onChange={(value) => upd(setMat, x.id, "note", value)} ph="備註" />
              </>
            )}
          />
          <Rows
            title="機具使用"
            list={eq}
            add={() => add(setEq, empty.eq)}
            del={(id, i) => del(`機具紀錄 ${i + 1}`, () => rem(setEq, id))}
            render={(x) => (
              <>
                <SelectGroup
                  type="equipment"
                  value={x.name}
                  onChange={(value) => upd(setEq, x.id, "name", value)}
                  placeholder="請選擇機具"
                />
                <Input
                  type="number"
                  value={x.quantity}
                  onChange={(value) => upd(setEq, x.id, "quantity", value)}
                  ph="數量"
                />
                <Input value={x.note} onChange={(value) => upd(setEq, x.id, "note", value)} ph="備註" />
              </>
            )}
          />
          <div className="rounded-2xl border border-dashed p-5 text-center text-slate-500 md:col-span-2">
            <p className="font-medium text-slate-900">照片辨識</p>
            <p className="mt-2">功能開發中</p>
          </div>
          <div className="flex justify-end md:col-span-2">
            <Button type="button">
              <Save className="mr-2 h-4 w-4" />
              儲存日報
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Rows({ title, list, add, del: remove, render }) {
  return (
    <div className="rounded-2xl border p-4 md:col-span-2">
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="font-bold">{title}</h3>
        <Button type="button" variant="outline" onClick={add}>
          <Plus className="mr-2 h-4 w-4" />
          新增
        </Button>
      </div>
      <div className="space-y-3">
        {list.map((x, i) => (
          <div key={x.id} className="rounded-2xl bg-slate-50 p-4">
            <div className="mb-3 flex justify-between">
              <b>紀錄 {i + 1}</b>
              <button
                type="button"
                onClick={() => remove(x.id, i)}
                className="rounded-md px-2 py-1 text-xs text-red-600 hover:bg-red-50"
              >
                刪除
              </button>
            </div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">{render(x)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Defects({ p }) {
  const [items, setItems] = useState(defectSeed);

  return (
    <ListPage
      title="缺失改善"
      sub={`目前工地：${p.name}`}
      items={items}
      render={(x) => (
        <Card key={`${x.location}-${x.type}`}>
          <CardContent className="flex flex-col justify-between gap-4 p-5 sm:flex-row">
            <div>
              <div className="flex flex-wrap gap-2">
                <h3 className="text-lg font-bold">{x.location}</h3>
                <Badge>{x.level}</Badge>
                <Badge>{x.status}</Badge>
              </div>
              <p className="text-sm text-slate-500">
                類型：{x.type}｜負責廠商：{x.vendor}
              </p>
              <p className="text-sm text-slate-500">改善期限：{x.due}</p>
            </div>
            <Del label={`${x.location} ${x.type}`} onClick={() => setItems(items.filter((i) => i !== x))} />
          </CardContent>
        </Card>
      )}
    />
  );
}

function ListPage({ title, sub, items, render }) {
  return (
    <div>
      <Header title={title} sub={sub} />
      <div className="grid gap-4">{items.map(render)}</div>
    </div>
  );
}

function Placeholder({ title }) {
  return (
    <div>
      <Header title={title} sub="此頁先建立版面，後續接資料庫" />
      <Card>
        <CardContent className="p-8 text-center text-slate-500">{title} 模組待開發</CardContent>
      </Card>
    </div>
  );
}

export default function App() {
  const [auth, setAuth] = useState({ loading: true, user: null });
  const [active, setActive] = useState("dashboard");
  const [p, setP] = useState(null);
  const [claims, setClaims] = useState(claimSeed);

  useEffect(() => {
    let activeRequest = true;

    async function loadSession() {
      try {
        const data = await apiFetch("/api/auth/me");
        if (activeRequest) setAuth({ loading: false, user: data.user });
      } catch {
        if (activeRequest) setAuth({ loading: false, user: null });
      }
    }

    loadSession();

    return () => {
      activeRequest = false;
    };
  }, []);

  async function handleLogout() {
    await apiFetch("/api/auth/logout", { method: "POST" }).catch(() => null);
    setP(null);
    setActive("dashboard");
    setAuth({ loading: false, user: null });
  }

  const page = useMemo(() => {
    if (!p) return null;
    if (active === "dashboard") return <Dashboard p={p} claims={claims} onSwitch={() => setP(null)} />;
    if (active === "claims") return <Claims p={p} claims={claims} setClaims={setClaims} />;
    if (active === "memos") return <Memos p={p} />;
    if (active === "checklists") return <Checklists p={p} />;
    if (active === "daily") return <Daily p={p} />;
    if (active === "defects") return <Defects p={p} />;
    return <Placeholder title={mods.find((x) => x.id === active)?.label || "模組"} />;
  }, [active, p, claims]);

  if (auth.loading) {
    return <LoadingScreen />;
  }

  if (!auth.user) {
    return (
      <LoginScreen
        onLogin={(user) => {
          setAuth({ loading: false, user });
          setActive("dashboard");
          setP(null);
        }}
      />
    );
  }

  if (!p) {
    return (
      <ProjectSelect
        onLogout={handleLogout}
        onSelect={(project) => {
          setP(project);
          setActive("dashboard");
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 p-4 lg:flex-row">
        <aside className="lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)] lg:w-72">
          <Card className="h-full rounded-2xl">
            <CardContent className="p-4">
              <div className="mb-4 rounded-2xl bg-slate-900 p-4 text-white">
                <p className="text-xs text-slate-300">目前工地</p>
                <h2 className="mt-1 text-lg font-bold">{p.name}</h2>
                <p className="mt-2 text-xs text-slate-300">
                  {auth.user.name}｜{auth.user.role}
                </p>
                <button
                  type="button"
                  onClick={() => setP(null)}
                  className="mt-3 text-xs text-slate-300 underline"
                >
                  返回主頁切換工地
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="mt-3 flex items-center gap-1 text-xs text-slate-300 underline"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  登出
                </button>
              </div>
              <nav className="grid gap-2">
                {mods.map((m) => {
                  const Icon = m.icon;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setActive(m.id)}
                      className={`flex gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium ${
                        active === m.id
                          ? "bg-slate-900 text-white"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      {m.label}
                    </button>
                  );
                })}
              </nav>
            </CardContent>
          </Card>
        </aside>
        <main className="min-w-0 flex-1">
          <motion.div
            key={`${p.name}-${active}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {page}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
