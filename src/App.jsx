import React, { useEffect, useMemo, useRef, useState } from "react";
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
  Megaphone,
  Package,
  Plus,
  RefreshCw,
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
    "inline-flex max-w-full items-center justify-center gap-1 whitespace-nowrap rounded-xl border px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60";
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
  manual: FileText,
  projects: Megaphone,
  contracts: FileText,
  claims: WalletCards,
  memos: StickyNote,
  checklists: ListChecks,
  schedule: CalendarDays,
  daily: ClipboardList,
  defects: AlertTriangle,
  materials: Package,
  todos: CheckSquare,
  photos: Camera,
};

const mods = [
  ["dashboard", "總覽"],
  ["manual", "操作手冊"],
  ["projects", "重要公告"],
  ["contracts", "工程合約"],
  ["claims", "廠商請款"],
  ["memos", "工項 Memo"],
  ["checklists", "階段檢核表"],
  ["schedule", "預定進度"],
  ["daily", "施工日報"],
  ["defects", "缺失改善"],
  ["materials", "材料庫存"],
  ["todos", "待辦事項"],
  ["photos", "照片中心"],
].map(([id, label]) => ({ id, label, icon: I[id] }));

const APP_VERSION = "eztodo_26052504";
const SAMPLE_PROJECT_NAME = "範例工地：東區住宅新建工程";
const DAILY_AI_SOURCE_MAX_BYTES = 3 * 1024 * 1024;

const projectStatusOptions = ["籌備中", "進行中", "收尾中", "暫停", "結案"];
const organizationOptions = ["測試分組1", "測試分組2", "測試分組3"];

const projects = [
  {
    name: SAMPLE_PROJECT_NAME,
    owner: "範例業主",
    status: "進行中",
    address: "台中市東區",
    defects: 8,
    dailyPhotos: 32,
    nextClaim: "2026/05",
    startDate: "2026-02-16",
    endDate: "2026-11-30",
    manager: "範例工地主任",
    note: "此工地為系統展示用範例，可用來熟悉總覽、請款、Memo、日報與缺失流程。",
  },
];

const useLocalPreview = import.meta.env.DEV;
const previewUser = {
  id: "local-preview",
  email: "preview@local",
  name: "本機預覽",
  organizationName: "測試分組1",
  role: "preview",
};
const previewProjects = projects.map((project, index) => ({
  id: `preview-${index + 1}`,
  ...project,
}));

const adminSeedUsers = [
  {
    id: "admin",
    name: "Renault",
    email: "irrvyh4815@gmail.com",
    organizationName: "測試分組1",
    role: "admin",
    canView: true,
    canEdit: true,
    emailVerified: true,
  },
  {
    id: "viewer",
    name: "現場閱覽",
    email: "viewer@example.com",
    organizationName: "測試分組2",
    role: "member",
    canView: true,
    canEdit: false,
    emailVerified: true,
  },
];

function normalizeAccountPermissions(user) {
  const isAdmin = user.role === "admin";
  const canView = Boolean(user.canView ?? true);
  return {
    ...user,
    organizationName: user.organizationName || user.organization_name || "",
    role: isAdmin ? "admin" : user.role || "member",
    canView: isAdmin ? true : canView,
    canEdit: isAdmin ? true : canView && Boolean(user.canEdit ?? false),
    emailVerified: isAdmin ? true : Boolean(user.emailVerified ?? true),
  };
}

function defaultAccountDraft() {
  return {
    name: "",
    email: "",
    organizationName: organizationOptions[0],
    password: "",
    role: "member",
    canView: true,
    canEdit: false,
  };
}

const projectMemberRoleOptions = [
  { value: "manager", label: "共同管理者" },
  { value: "editor", label: "可編輯" },
  { value: "viewer", label: "僅閱覽" },
];

function projectMemberRoleLabel(role) {
  return {
    admin: "系統管理員",
    owner: "工地建立者",
    manager: "共同管理者",
    editor: "可編輯",
    viewer: "僅閱覽",
  }[role] || "成員";
}

const claimSeed = [
  {
    period: "第 1 期",
    month: "2026/05",
    trade: "水電工程",
    vendor: "宏鑫水電",
    contract: "水電配管工程",
    amount: 185000,
    status: "待付款",
    projectName: SAMPLE_PROJECT_NAME,
  },
  {
    period: "第 2 期",
    month: "2026/05",
    trade: "泥作工程",
    vendor: "順發泥作",
    contract: "浴室泥作工程",
    amount: 126000,
    status: "審核中",
    projectName: SAMPLE_PROJECT_NAME,
  },
  {
    period: "第 1 期",
    month: "2026/06",
    trade: "防水工程",
    vendor: "永信防水",
    contract: "防水工程",
    amount: 98000,
    status: "待送審",
    projectName: SAMPLE_PROJECT_NAME,
  },
];

const contractSeed = [
  {
    id: "contract-1",
    projectName: SAMPLE_PROJECT_NAME,
    name: "水電配管工程",
    vendor: "宏鑫水電",
    trade: "水電工程",
    amount: 1200000,
    status: "執行中",
    contact: "張先生",
    phone: "04-2222-1688",
    email: "service@hongxin.example",
    address: "台中市東區進德路 88 號",
    note: "現場窗口負責配管與弱電協調。",
    attachments: [],
  },
  {
    id: "contract-2",
    projectName: SAMPLE_PROJECT_NAME,
    name: "防水工程",
    vendor: "永信防水",
    trade: "防水工程",
    amount: 360000,
    status: "執行中",
    contact: "黃小姐",
    phone: "04-2233-9777",
    email: "contact@yongxin.example",
    address: "台中市南區忠明南路 120 號",
    note: "浴室與陽台防水保固五年。",
    attachments: [],
  },
];

const memos = [
  [
    "memo-1",
    SAMPLE_PROJECT_NAME,
    "水電工程",
    "2F 管線路徑待確認",
    "2026-05-26",
    "廚房排水與弱電箱位置需與業主確認後再封板。",
    "待確認",
  ],
  [
    "memo-2",
    SAMPLE_PROJECT_NAME,
    "防水工程",
    "浴室門檻加強",
    "2026-05-28",
    "3F 主臥浴室門檻需補強收邊，避免後續滲水爭議。",
    "追蹤中",
  ],
  [
    "memo-3",
    SAMPLE_PROJECT_NAME,
    "磁磚工程",
    "磁磚到料批號",
    "2026-05-29",
    "客浴牆磚需確認是否同批號，避免色差。",
    "待處理",
  ],
].map(([id, projectName, trade, title, date, note, status]) => ({
  id,
  projectName,
  trade,
  title,
  date,
  note,
  status,
  attachments: [],
}));

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

const scheduleSeed = [
  {
    id: "schedule-1",
    projectName: SAMPLE_PROJECT_NAME,
    trade: "防水工班",
    name: "3F 防水試水",
    startDate: "2026-05-25",
    endDate: "2026-05-30",
    percent: 65,
    status: "進行中",
    note: "完成後安排複驗",
    attachments: [],
  },
  {
    id: "schedule-2",
    projectName: SAMPLE_PROJECT_NAME,
    trade: "水電工班",
    name: "2F 弱電箱定位",
    startDate: "2026-05-26",
    endDate: "2026-05-27",
    percent: 40,
    status: "進行中",
    note: "需與業主確認位置",
    attachments: [],
  },
];

const todoSeed = [
  {
    id: "todo-1",
    projectName: SAMPLE_PROJECT_NAME,
    title: "確認浴室門檻收邊",
    owner: "李工務",
    date: "2026-05-25",
    status: "重要",
    note: "與防水複驗一起確認",
    attachments: [],
  },
  {
    id: "todo-2",
    projectName: SAMPLE_PROJECT_NAME,
    title: "回覆業主弱電箱位置",
    owner: "王主任",
    date: "2026-05-27",
    status: "緊急",
    note: "確認後通知水電工班",
    attachments: [],
  },
];

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

function parseDate(value) {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(value) {
  return value || "未設定";
}

function formatDateTime(value) {
  if (!value) return "尚未登入";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function countWorkDays(startDate, endDate = new Date()) {
  const start = parseDate(startDate);
  if (!start) return 0;

  const cursor = new Date(start);
  const end = new Date(endDate);
  cursor.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  if (cursor > end) return 0;

  let days = 0;
  while (cursor <= end) {
    days += 1;
    cursor.setDate(cursor.getDate() + 1);
  }

  return days;
}

function toDateKey(date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function todayKey() {
  return toDateKey(new Date());
}

function addDays(date, amount) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function monthKeyFromDate(date) {
  return toDateKey(date).slice(0, 7);
}

function monthTitle(monthKey) {
  const date = parseDate(`${monthKey}-01`);
  if (!date) return monthKey;
  return new Intl.DateTimeFormat("zh-TW", {
    year: "numeric",
    month: "long",
  }).format(date);
}

function monthCalendarDays(monthKey) {
  const firstDay = parseDate(`${monthKey}-01`) || new Date();
  const gridStart = addDays(firstDay, -firstDay.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const date = addDays(gridStart, index);
    const key = toDateKey(date);
    return {
      date: key,
      day: date.getDate(),
      currentMonth: monthKeyFromDate(date) === monthKey,
      isToday: key === todayKey(),
    };
  });
}

function moveMonth(monthKey, amount) {
  const date = parseDate(`${monthKey}-01`) || new Date();
  date.setMonth(date.getMonth() + amount);
  return monthKeyFromDate(date);
}

function matchesProject(item, project) {
  if (!item || !project) return false;
  if (item.projectId) return item.projectId === project.id;
  if (item.projectName) return item.projectName === project.name;
  return true;
}

function shortDateLabel(value) {
  const date = parseDate(value);
  if (!date) return value || "-";
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

function workDateRows(startDate, endDate) {
  const start = parseDate(startDate);
  const end = parseDate(endDate);
  if (!start || !end || start > end) return [];

  const rows = [];
  const cursor = new Date(start);
  let workDay = 0;

  while (cursor <= end) {
    workDay += 1;
    const date = toDateKey(cursor);
    rows.push({
      date,
      workDay,
      label: shortDateLabel(date),
    });
    cursor.setDate(cursor.getDate() + 1);
  }

  return rows;
}

function normalizeDateRange(startDate, endDate) {
  const start = startDate || endDate || todayKey();
  const end = endDate || start;
  return start <= end ? { start, end } : { start: end, end: start };
}

function clampPercent(value) {
  const percent = Number(value);
  if (Number.isNaN(percent)) return 0;
  return Math.min(100, Math.max(0, percent));
}

const scheduleStatusOptions = ["未開始", "進行中", "延遲", "已完成"];
const scheduleStatusClass = {
  未開始: "border-slate-200 bg-slate-100 text-slate-700",
  進行中: "border-blue-200 bg-blue-50 text-blue-700",
  延遲: "border-red-200 bg-red-50 text-red-700",
  已完成: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

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
    const error = new Error(data?.error || "伺服器連線失敗");
    error.code = data?.code || "API_ERROR";
    error.status = response.status;
    throw error;
  }

  return data;
}

console.assert(sum(claimSeed, "2026/05") === 311000, "claim total test");
console.assert(byTrade(claimSeed, "2026/05")["水電工程"] === 185000, "trade summary test");

function Badge({ children }) {
  return (
    <span className="inline-flex shrink-0 items-center whitespace-nowrap rounded-full bg-slate-100 px-3 py-1 text-xs font-medium leading-none text-slate-700">
      {children}
    </span>
  );
}

function VersionFooter({ className = "" }) {
  return (
    <div className={`text-center text-[11px] font-medium text-slate-400 ${className}`}>
      版本 {APP_VERSION}
    </div>
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

function toImageAttachments(fileList, meta = {}) {
  return Array.from(fileList || [])
    .filter((file) => file.type.startsWith("image/"))
    .map((file) => {
      const { keepFile, ...attachmentMeta } = meta;
      return {
        id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2)}`,
        name: file.name,
        size: file.size,
        url: URL.createObjectURL(file),
        ...(keepFile ? { file } : {}),
        ...attachmentMeta,
      };
    });
}

function ImageAttachments({
  value = [],
  onChange,
  className = "",
  title = "圖片附件",
  description = "可上傳現場照片，作為此筆資料的附件紀錄。",
  buttonLabel = "上傳圖片",
  maxFiles,
  meta,
}) {
  const inputId = useMemo(
    () => `image-attachments-${Math.random().toString(36).slice(2)}`,
    [],
  );
  const remaining = Number.isFinite(maxFiles) ? Math.max(maxFiles - value.length, 0) : null;

  return (
    <div className={className}>
      <input
        id={inputId}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(event) => {
          const picked = toImageAttachments(event.target.files, meta);
          const limited = Number.isFinite(maxFiles) ? picked.slice(0, remaining) : picked;
          onChange([...(value || []), ...limited]);
          event.target.value = "";
        }}
      />
      <div className="flex flex-col gap-3 rounded-2xl border border-dashed bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-900">{title}</p>
          <p className="mt-1 text-xs text-slate-500">{description}</p>
          {Number.isFinite(maxFiles) ? (
            <p className="mt-1 text-xs font-medium text-slate-500">
              已選 {value.length}/{maxFiles} 張
            </p>
          ) : null}
        </div>
        <Button
          type="button"
          variant="outline"
          disabled={Number.isFinite(maxFiles) && value.length >= maxFiles}
          onClick={() => document.getElementById(inputId)?.click()}
        >
          <Camera className="mr-2 h-4 w-4" />
          {buttonLabel}
        </Button>
      </div>
      {value?.length ? (
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {value.map((image) => (
            <div key={image.id} className="flex items-center gap-3 rounded-xl border bg-white p-2">
              <img
                src={image.url}
                alt={image.name}
                className="h-14 w-14 rounded-lg object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{image.name}</p>
                <p className="text-xs text-slate-500">{Math.ceil(image.size / 1024)} KB</p>
              </div>
              <button
                type="button"
                onClick={() => onChange(value.filter((item) => item.id !== image.id))}
                className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                aria-label={`移除 ${image.name}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function AttachmentSummary({ attachments = [] }) {
  if (!attachments?.length) return null;

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <Badge>圖片 {attachments.length} 張</Badge>
      {attachments.slice(0, 4).map((image) => (
        <img
          key={image.id}
          src={image.url}
          alt={image.name}
          className="h-10 w-10 rounded-lg border object-cover"
        />
      ))}
    </div>
  );
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function withRowIds(rows, emptyRow) {
  const source = Array.isArray(rows) && rows.length ? rows : [emptyRow];
  return source.map((row, index) => ({
    id: Date.now() + index + Math.floor(Math.random() * 1000),
    ...emptyRow,
    ...row,
  }));
}

function Header({ title, sub, btn = "新增資料", onAdd }) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="mt-1 break-words text-sm text-slate-500">{sub}</p>
      </div>
      {onAdd ? (
        <Button type="button" className="w-full rounded-xl sm:w-auto" onClick={onAdd}>
          <Plus className="mr-2 h-4 w-4" />
          {btn}
        </Button>
      ) : null}
    </div>
  );
}

function Stat({ title, value, desc, icon: Icon }) {
  return (
    <Card className="rounded-2xl shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm text-slate-500">{title}</p>
            <h3 className="mt-2 break-words text-xl font-bold sm:text-2xl">{value}</h3>
            <p className="mt-1 text-xs text-slate-500">{desc}</p>
          </div>
          <div className="shrink-0 rounded-2xl bg-slate-100 p-3">
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

const otherOptionValue = "__other__";
const otherOptionLabel = "其他";

function CustomSelect({
  value = "",
  onChange,
  options = [],
  groupedOptions = [],
  placeholder,
  className = "",
  selectClassName = "",
  otherPlaceholder = "請輸入其他內容",
}) {
  const optionValues = [
    ...options,
    ...groupedOptions.flatMap(([, items]) => items),
  ];
  const hasValue = value !== "";
  const isOtherValue =
    value === otherOptionLabel || (hasValue && !optionValues.includes(value));
  const selectValue = isOtherValue ? otherOptionValue : value;

  return (
    <div className={className}>
      <select
        value={selectValue}
        onChange={(event) => {
          const next = event.target.value;
          onChange(next === otherOptionValue ? otherOptionLabel : next);
        }}
        className={`w-full rounded-xl border bg-white px-3 py-2 outline-none ${selectClassName}`}
      >
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
        {groupedOptions.map(([group, items]) => (
          <optgroup key={group} label={group}>
            {items.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </optgroup>
        ))}
        <option value={otherOptionValue}>{otherOptionLabel}</option>
      </select>
      {isOtherValue ? (
        <Input
          value={value === otherOptionLabel ? "" : value}
          onChange={onChange}
          ph={otherPlaceholder}
        />
      ) : null}
    </div>
  );
}

function SelectGroup({ value, onChange, type, placeholder }) {
  return (
    <CustomSelect
      value={value}
      onChange={onChange}
      groupedOptions={groups[type]}
      placeholder={placeholder}
      otherPlaceholder="請輸入自訂項目"
      className="space-y-2"
    />
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

function AccordionSection({ title, desc, meta, open, onToggle, children }) {
  return (
    <div className="rounded-2xl border bg-white">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 p-4 text-left hover:bg-slate-50"
      >
        <span className="min-w-0">
          <span className="block font-bold text-slate-900">{title}</span>
          {desc ? <span className="mt-1 block text-sm text-slate-500">{desc}</span> : null}
        </span>
        <span className="flex shrink-0 items-center gap-2">
          {meta ? <Badge>{meta}</Badge> : null}
          <ChevronRight
            className={`h-5 w-5 text-slate-500 transition ${open ? "rotate-90" : ""}`}
          />
        </span>
      </button>
      {open ? <div className="border-t p-4">{children}</div> : null}
    </div>
  );
}

function LoginScreen({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [organizationName, setOrganizationName] = useState(organizationOptions[0]);
  const [email, setEmail] = useState("admin@eztodo.local");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [errorCode, setErrorCode] = useState("");
  const [resendNotice, setResendNotice] = useState("");
  const [registerNotice, setRegisterNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const loginTags = ["工地管理", "施工日報", "廠商請款", "缺失追蹤", "甘特圖", "照片附件"];

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setErrorCode("");
    setResendNotice("");
    setRegisterNotice("");
    setLoading(true);

    try {
      if (mode === "register") {
        if (!name.trim()) {
          throw new Error("請輸入暱稱 / 姓名");
        }
        if (!organizationName) {
          throw new Error("請選擇所屬單位");
        }
        if (password.length < 8) {
          throw new Error("密碼至少需要 8 碼");
        }
        if (password !== confirmPassword) {
          throw new Error("兩次輸入的密碼不一致");
        }

        const data = await apiFetch("/api/auth/register", {
          method: "POST",
          body: JSON.stringify({ name, email, password, organizationName }),
        });

        if (data.emailVerificationRequired) {
          setRegisterNotice("註冊完成，驗證信已寄出。請先到信箱完成驗證後再登入。");
          setMode("login");
          setPassword("");
          setConfirmPassword("");
          return;
        }

        onLogin(data.user);
        return;
      }

      const data = await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      onLogin(data.user);
    } catch (err) {
      setError(err.message);
      setErrorCode(err.code || "");
    } finally {
      setLoading(false);
    }
  }

  async function resendVerification() {
    setError("");
    setResendNotice("");
    setResendLoading(true);

    try {
      const data = await apiFetch("/api/auth/resend-verification", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setResendNotice(data.message || "驗證信已寄出，請到信箱收信。");
    } catch (err) {
      setError(err.message);
      setErrorCode(err.code || "");
    } finally {
      setResendLoading(false);
    }
  }

  return (
    <Shell full>
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-5xl items-center gap-6 lg:grid-cols-[1fr_420px]">
        <div className="rounded-3xl bg-slate-900 p-8 text-white">
          <div className="mb-8 flex items-center justify-between gap-4">
            <div className="inline-flex rounded-2xl bg-white/10 p-3">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <p className="text-right text-sm font-medium text-slate-300">製作團隊：R3nault</p>
          </div>
          <p className="text-sm font-medium text-slate-300">把案場每天的大小事，整理成能追蹤的進度</p>
          <h1 className="mt-3 max-w-2xl text-3xl font-bold leading-tight sm:text-4xl">
            EZtoDO工程管理程式
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-slate-200">
            從工地進度、廠商合約、請款節點到缺失改善，將現場訊息、
            表單與照片紀錄收進同一個工作台，讓工程管理少一點翻找，多一點掌握。
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {loginTags.map((item) => (
              <span key={item} className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-medium text-slate-100">
                {item}
              </span>
            ))}
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <div>
              <p className="text-2xl font-bold">01</p>
              <p className="mt-1 text-xs leading-5 text-slate-300">工地資料集中，避免多案場紀錄混在一起。</p>
            </div>
            <div>
              <p className="text-2xl font-bold">02</p>
              <p className="mt-1 text-xs leading-5 text-slate-300">請款、Memo、待辦與缺失都能依工地追蹤。</p>
            </div>
            <div>
              <p className="text-2xl font-bold">03</p>
              <p className="mt-1 text-xs leading-5 text-slate-300">預定進度搭配日曆檢視，讓下一步工作更好安排。</p>
            </div>
          </div>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="flex rounded-2xl border bg-slate-50 p-1">
              {[
                ["login", "登入帳號"],
                ["register", "註冊帳號"],
              ].map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    setMode(id);
                    setError("");
                    setErrorCode("");
                    setResendNotice("");
                    setRegisterNotice("");
                  }}
                  className={`flex-1 rounded-xl px-3 py-2 text-sm font-bold transition ${
                    mode === id ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:bg-white"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <h2 className="mt-5 text-xl font-bold">
              {mode === "login" ? "登入 EZtoDO" : "建立新帳號"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {mode === "login"
                ? "請輸入帳號密碼進入你的工地工作台。"
                : "註冊後系統會寄送驗證信，完成信箱驗證後才能登入。"}
            </p>
            <form onSubmit={handleSubmit} className="mt-5 grid gap-4">
              {mode === "register" ? (
                <label>
                  <span className="text-sm font-medium">暱稱 / 姓名</span>
                  <div className="mt-2">
                    <Input value={name} onChange={setName} ph="例如：王主任" />
                  </div>
                </label>
              ) : null}
              {mode === "register" ? (
                <label>
                  <span className="text-sm font-medium">所屬單位</span>
                  <select
                    value={organizationName}
                    onChange={(event) => setOrganizationName(event.target.value)}
                    className="mt-2 w-full rounded-xl border bg-white px-3 py-2 outline-none"
                    required
                  >
                    {organizationOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}
              <label>
                <span className="text-sm font-medium">帳號</span>
                <div className="mt-2">
                  <Input value={email} onChange={setEmail} ph="email@example.com" />
                </div>
              </label>
              <label>
                <span className="text-sm font-medium">密碼</span>
                <div className="mt-2">
                  <Input
                    type="password"
                    value={password}
                    onChange={setPassword}
                    ph={mode === "login" ? "請輸入密碼" : "至少 8 碼"}
                  />
                </div>
              </label>
              {mode === "register" ? (
                <label>
                  <span className="text-sm font-medium">確認密碼</span>
                  <div className="mt-2">
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={setConfirmPassword}
                      ph="再次輸入密碼"
                    />
                  </div>
                </label>
              ) : null}
              {error ? (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                  {errorCode === "EMAIL_NOT_VERIFIED" ? (
                    <div className="mt-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={resendVerification}
                        disabled={resendLoading}
                        className="bg-white text-red-700 hover:bg-red-50"
                      >
                        {resendLoading ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <ShieldCheck className="mr-2 h-4 w-4" />
                        )}
                        重寄驗證信
                      </Button>
                    </div>
                  ) : null}
                </div>
              ) : null}
              {resendNotice ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                  {resendNotice}
                </div>
              ) : null}
              {registerNotice ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                  {registerNotice}
                </div>
              ) : null}
              <Button type="submit" disabled={loading} className="mt-1">
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <LogIn className="mr-2 h-4 w-4" />
                )}
                {mode === "login" ? "登入" : "註冊帳號"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
      <VersionFooter className="mt-4" />
    </Shell>
  );
}

function ProjectSelect({ onSelect }) {
  const [mode, setMode] = useState("list");
  const [list, setList] = useState(useLocalPreview ? previewProjects : []);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(!useLocalPreview);
  const [refreshing, setRefreshing] = useState(false);
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
    attachments: [],
  });

  async function loadProjects({ quiet = false } = {}) {
    if (useLocalPreview) {
      setRefreshing(false);
      return;
    }

    setLoading(!quiet);
    setRefreshing(quiet);
    setError("");

    try {
      const data = await apiFetch("/api/projects");
      setList(data.projects || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadProjects();
  }, []);

  async function createProject() {
    const nextProject = {
      ...p,
      id: `preview-${Date.now()}`,
      name: p.name || "未命名工地",
      owner: p.owner || "未填寫",
      address: p.address || "未填寫地址",
      defects: 0,
      dailyPhotos: 0,
      nextClaim: "2026/05",
    };

    setError("");

    if (useLocalPreview) {
      setList([...list, nextProject]);
      onSelect(nextProject);
      return;
    }

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

    if (useLocalPreview) {
      setList(list.filter((item) => item.id !== project.id));
      return;
    }

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
              <CustomSelect
                value={p.status}
                onChange={(value) => setP({ ...p, status: value })}
                options={projectStatusOptions}
                className="mt-2 space-y-2"
                otherPlaceholder="請輸入自訂工地狀態"
              />
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
            <ImageAttachments
              className="md:col-span-2"
              value={p.attachments}
              onChange={(attachments) => setP({ ...p, attachments })}
            />
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
        <VersionFooter className="mt-4" />
      </Shell>
    );
  }

  return (
    <Shell full>
      <div className="mb-6 flex flex-col justify-between gap-4 rounded-3xl bg-slate-900 p-6 text-white sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold">請先創建/選擇工地</h1>
          <p className="mt-2 text-sm text-slate-300">
            只會顯示你建立或被邀請共同管理的工地。
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          className="border-white/20 bg-white/10 text-white hover:bg-white/20"
          disabled={refreshing || loading}
          onClick={() => loadProjects({ quiet: true })}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          刷新工地
        </Button>
      </div>
      <div className="mb-4 grid gap-3 lg:grid-cols-[1fr_auto]">
        <div className="flex gap-3 rounded-2xl border bg-white p-3">
          <Search className="h-5 w-5 text-slate-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="w-full outline-none"
            placeholder="搜尋工地"
          />
        </div>
        <Button type="button" variant="outline" onClick={() => setMode("create")}>
          <Plus className="mr-2 h-4 w-4" />
          新增工地
        </Button>
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
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-xl font-bold">{project.name}</h2>
                  <p className="mt-2 flex gap-1 text-sm text-slate-500">
                    <MapPin className="h-4 w-4" />
                    {project.address}
                  </p>
                  <p className="mt-1 flex gap-1 text-sm text-slate-500">
                    <UserRound className="h-4 w-4" />
                    業主：{project.owner}
                  </p>
                  <p className="mt-1 flex gap-1 text-sm text-slate-500">
                    <UserRound className="h-4 w-4" />
                    建立者：{project.createdByName || "系統管理員"}
                    {project.memberRole ? `｜我的權限：${projectMemberRoleLabel(project.memberRole)}` : ""}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    開工：{formatDate(project.startDate)}｜預計完工：{formatDate(project.endDate)}
                  </p>
                  {project.note ? (
                    <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                      備註：{project.note}
                    </p>
                  ) : null}
                  <AttachmentSummary attachments={project.attachments} />
                </div>
                <Badge>{project.status}</Badge>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-2 text-center text-sm sm:grid-cols-4">
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
                <div className="rounded-xl bg-slate-50 p-3">
                  天數
                  <br />
                  <b>{countWorkDays(project.startDate)}</b>
                </div>
              </div>
              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                <Button type="button" onClick={() => onSelect(project)}>
                  進入
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
                {project.canManage ? (
                  <Del
                    label={project.name}
                    onClick={() => removeProject(project)}
                  />
                ) : (
                  <Badge>{project.canEdit ? "可共同編輯" : "僅可閱覽"}</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <VersionFooter className="mt-6" />
    </Shell>
  );
}

function Shell({ children, full = false }) {
  return (
    <div className="min-h-screen bg-slate-50 p-3 text-slate-900 sm:p-4">
      <div className={full ? "mx-auto w-full max-w-5xl" : ""}>{children}</div>
    </div>
  );
}

function DashboardCalendar({ project, todos, memos: memoItems, className = "" }) {
  const [monthKey, setMonthKey] = useState(todayKey().slice(0, 7));
  const days = useMemo(() => monthCalendarDays(monthKey), [monthKey]);
  const weekDays = ["日", "一", "二", "三", "四", "五", "六"];
  const eventsByDate = useMemo(() => {
    const map = new Map();
    const pushEvent = (date, event) => {
      if (!date) return;
      map.set(date, [...(map.get(date) || []), event]);
    };

    todos.forEach((todo) => {
      pushEvent(todo.date, {
        id: todo.id,
        type: "todo",
        title: todo.title,
        meta: todo.owner || todo.status,
      });
    });
    memoItems.forEach((memo) => {
      pushEvent(memo.date, {
        id: memo.id,
        type: "memo",
        title: memo.title,
        meta: memo.trade || memo.status,
      });
    });

    return map;
  }, [todos, memoItems]);
  const daysWithEvents = days
    .map((day) => ({ ...day, events: eventsByDate.get(day.date) || [] }))
    .filter((day) => day.currentMonth && day.events.length);

  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardContent className="p-5">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h2 className="text-lg font-bold">待辦事項與工項 Memo</h2>
            <p className="mt-1 break-words text-sm text-slate-500">
              {project.name} 的月曆檢視
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:flex sm:items-center">
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => setMonthKey(moveMonth(monthKey, -1))}
            >
              上月
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => setMonthKey(todayKey().slice(0, 7))}
            >
              今天
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => setMonthKey(moveMonth(monthKey, 1))}
            >
              下月
            </Button>
          </div>
        </div>

        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-xl font-bold sm:text-2xl">{monthTitle(monthKey)}</h3>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 font-medium text-amber-700">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              待辦事項
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 font-medium text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              工項 Memo
            </span>
          </div>
        </div>

        <div className="sm:hidden">
          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-slate-500">
            {weekDays.map((day) => (
              <div key={day} className="py-1">
                {day}
              </div>
            ))}
          </div>
          <div className="mt-1 grid grid-cols-7 gap-1">
            {days.map((day) => {
              const events = eventsByDate.get(day.date) || [];

              return (
                <div
                  key={day.date}
                  className={`flex aspect-square min-h-10 flex-col items-center justify-center rounded-xl border p-1 ${
                    day.currentMonth ? "bg-white" : "bg-slate-50 text-slate-300"
                  } ${day.isToday ? "border-slate-900" : ""}`}
                >
                  <span
                    className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                      day.isToday ? "bg-slate-900 text-white" : ""
                    }`}
                  >
                    {day.day}
                  </span>
                  <div className="mt-1 flex h-2 items-center justify-center gap-0.5">
                    {events.slice(0, 3).map((event) => (
                      <span
                        key={`${event.type}-${event.id}`}
                        className={`h-1.5 w-1.5 rounded-full ${
                          event.type === "todo" ? "bg-amber-500" : "bg-emerald-500"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 max-h-80 overflow-auto rounded-2xl border bg-slate-50">
            {daysWithEvents.length ? (
              <div className="divide-y">
                {daysWithEvents.map((day) => (
                  <div key={day.date} className="grid grid-cols-[3.5rem_1fr] gap-3 p-3">
                    <div className="text-center">
                      <p className="text-xs text-slate-500">{shortDateLabel(day.date)}</p>
                      <p className="mt-1 text-lg font-bold text-slate-900">{day.day}</p>
                    </div>
                    <div className="space-y-2">
                      {day.events.map((event) => (
                        <div
                          key={`${event.type}-${event.id}`}
                          className={`rounded-xl border px-3 py-2 text-xs ${
                            event.type === "todo"
                              ? "border-amber-200 bg-amber-50 text-amber-800"
                              : "border-emerald-200 bg-emerald-50 text-emerald-800"
                          }`}
                        >
                          <p className="font-semibold">{event.title}</p>
                          {event.meta ? <p className="mt-0.5 opacity-80">{event.meta}</p> : null}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-5 text-center text-sm text-slate-500">
                本月尚無待辦事項或工項 Memo。
              </div>
            )}
          </div>
        </div>

        <div className="hidden overflow-x-auto rounded-2xl border bg-white sm:block">
          <div className="grid min-w-[700px] grid-cols-7 border-b bg-slate-50">
            {weekDays.map((day) => (
              <div key={day} className="border-r px-3 py-2 text-center text-xs font-bold text-slate-500 last:border-r-0">
                {day}
              </div>
            ))}
          </div>
          <div className="grid min-w-[700px] grid-cols-7">
            {days.map((day, index) => {
              const events = eventsByDate.get(day.date) || [];

              return (
                <div
                  key={day.date}
                  className={`min-h-28 border-r border-b p-2 md:min-h-32 ${
                    day.currentMonth ? "bg-white" : "bg-slate-50 text-slate-400"
                  } ${(index + 1) % 7 === 0 ? "border-r-0" : ""}`}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span
                      className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold ${
                        day.isToday ? "bg-slate-900 text-white" : ""
                      }`}
                    >
                      {day.day}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {events.slice(0, 3).map((event) => (
                      <div
                        key={`${event.type}-${event.id}`}
                        className={`rounded-md border px-2 py-1 text-xs ${
                          event.type === "todo"
                            ? "border-amber-200 bg-amber-50 text-amber-800"
                            : "border-emerald-200 bg-emerald-50 text-emerald-800"
                        }`}
                      >
                        <p className="truncate font-semibold">{event.title}</p>
                        {event.meta ? <p className="truncate opacity-80">{event.meta}</p> : null}
                      </div>
                    ))}
                    {events.length > 3 ? (
                      <p className="px-2 text-xs font-medium text-slate-500">+{events.length - 3} 筆</p>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function VendorContacts({ contracts }) {
  const [openId, setOpenId] = useState("");
  const [query, setQuery] = useState("");
  const filteredContracts = contracts.filter((contract) => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return true;
    return [
      contract.vendor,
      contract.name,
      contract.trade,
      contract.contact,
      contract.phone,
      contract.email,
    ]
      .join(" ")
      .toLowerCase()
      .includes(keyword);
  });

  return (
    <Card className="lg:col-span-3">
      <CardContent className="p-5">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-bold">廠商資訊</h2>
            <p className="mt-1 text-sm text-slate-500">由工程合約同步的聯絡資訊</p>
          </div>
          <Badge>{contracts.length} 家廠商</Badge>
        </div>
        {contracts.length ? (
          <div className="mb-4 flex items-center gap-3 rounded-2xl border bg-slate-50 px-3 py-2">
            <Search className="h-5 w-5 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="w-full bg-transparent text-sm outline-none"
              placeholder="搜尋廠商、合約、工種、聯絡人、電話"
            />
          </div>
        ) : null}
        {contracts.length ? (
          <div className="grid gap-3">
            {filteredContracts.map((contract) => {
              const isOpen = openId === contract.id;

              return (
              <div key={contract.id} className="rounded-2xl border p-4">
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? "" : contract.id)}
                  className="flex w-full flex-col gap-3 text-left sm:flex-row sm:items-center sm:justify-between"
                  aria-expanded={isOpen}
                >
                  <span>
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-bold">{contract.vendor}</span>
                      <Badge>{contract.status}</Badge>
                      <Badge>{contract.trade}</Badge>
                    </span>
                    <span className="mt-2 block text-sm text-slate-500">{contract.name}</span>
                    <span className="mt-1 block text-sm text-slate-600">
                      {contract.contact || "未填寫聯絡人"}｜{contract.phone || "未填寫電話"}
                    </span>
                  </span>
                  <ChevronRight
                    className={`h-5 w-5 shrink-0 text-slate-500 transition ${
                      isOpen ? "rotate-90" : ""
                    }`}
                  />
                </button>
                {isOpen ? (
                  <div className="mt-4 grid gap-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600 sm:grid-cols-2">
                    <p>聯絡人：{contract.contact || "未填寫"}</p>
                    <p>電話：{contract.phone || "未填寫"}</p>
                    <p>Email：{contract.email || "未填寫"}</p>
                    <p>地址：{contract.address || "未填寫"}</p>
                    {contract.note ? (
                      <p className="sm:col-span-2">備註：{contract.note}</p>
                    ) : null}
                  </div>
                ) : null}
              </div>
              );
            })}
            {!filteredContracts.length ? (
              <div className="rounded-2xl border border-dashed p-6 text-center text-sm text-slate-500">
                找不到符合的廠商資訊。
              </div>
            ) : null}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed p-6 text-center text-sm text-slate-500">
            尚無工程合約廠商資訊。
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ProjectMembers({ project }) {
  const [members, setMembers] = useState([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("manager");
  const [loading, setLoading] = useState(!useLocalPreview);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const canManage = useLocalPreview || Boolean(project.canManage);

  async function loadMembers() {
    if (useLocalPreview) {
      setMembers([
        {
          userId: "preview-owner",
          name: project.createdByName || "本機預覽",
          email: "preview@local",
          role: "owner",
          canView: true,
          canEdit: true,
        },
      ]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await apiFetch(`/api/projects/${encodeURIComponent(project.id)}/members`);
      setMembers(data.members || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (project.id) loadMembers();
  }, [project.id]);

  async function addMember() {
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError("請輸入已註冊帳號 Email");
      return;
    }

    setBusy("add");
    setError("");

    if (useLocalPreview) {
      setMembers([
        ...members,
        {
          userId: `preview-member-${Date.now()}`,
          name: cleanEmail.split("@")[0],
          email: cleanEmail,
          role,
          canView: true,
          canEdit: role !== "viewer",
        },
      ]);
      setEmail("");
      setBusy("");
      return;
    }

    try {
      const data = await apiFetch(`/api/projects/${encodeURIComponent(project.id)}/members`, {
        method: "POST",
        body: JSON.stringify({ email: cleanEmail, role }),
      });
      setMembers(data.members || []);
      setEmail("");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy("");
    }
  }

  async function updateMember(member, nextRole) {
    if (member.role === "owner") return;

    setError("");
    const previous = members;
    const nextMembers = members.map((item) =>
      item.userId === member.userId
        ? { ...item, role: nextRole, canView: true, canEdit: nextRole !== "viewer" }
        : item,
    );
    setMembers(nextMembers);

    if (useLocalPreview) return;

    try {
      const data = await apiFetch(
        `/api/projects/${encodeURIComponent(project.id)}/members/${encodeURIComponent(member.userId)}`,
        {
          method: "PATCH",
          body: JSON.stringify({ role: nextRole }),
        },
      );
      setMembers(data.members || nextMembers);
    } catch (err) {
      setError(err.message);
      setMembers(previous);
    }
  }

  async function removeMember(member) {
    if (member.role === "owner") return;
    if (!window.confirm(`確定將「${member.email}」移出此工地？`)) return;

    const previous = members;
    setMembers(members.filter((item) => item.userId !== member.userId));
    setError("");

    if (useLocalPreview) return;

    try {
      const data = await apiFetch(
        `/api/projects/${encodeURIComponent(project.id)}/members/${encodeURIComponent(member.userId)}`,
        { method: "DELETE" },
      );
      setMembers(data.members || []);
    } catch (err) {
      setError(err.message);
      setMembers(previous);
    }
  }

  return (
    <Card className="lg:col-span-3">
      <CardContent className="p-5">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-bold">工地成員與隔離權限</h2>
            <p className="mt-1 text-sm text-slate-500">
              只有工地建立者、共同管理者與被邀請成員能看到此工地。
            </p>
          </div>
          <Button type="button" variant="outline" disabled={loading} onClick={loadMembers}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            刷新成員
          </Button>
        </div>

        {error ? (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {canManage ? (
          <div className="mb-4 grid gap-3 rounded-2xl bg-slate-50 p-4 lg:grid-cols-[1fr_180px_auto]">
            <Input value={email} onChange={setEmail} ph="輸入已註冊帳號 Email" />
            <select
              value={role}
              onChange={(event) => setRole(event.target.value)}
              className="w-full rounded-xl border bg-white px-3 py-2 outline-none"
            >
              {projectMemberRoleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <Button type="button" disabled={busy === "add"} onClick={addMember}>
              {busy === "add" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              邀請加入
            </Button>
          </div>
        ) : null}

        {loading ? (
          <div className="rounded-2xl border border-dashed p-6 text-center text-sm text-slate-500">
            讀取成員中
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {members.map((member) => (
              <div key={member.userId} className="rounded-2xl border p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="break-words font-bold">{member.name || member.email}</h3>
                      <Badge>{projectMemberRoleLabel(member.role)}</Badge>
                    </div>
                    <p className="mt-1 break-words text-sm text-slate-500">{member.email}</p>
                    <p className="mt-2 text-xs text-slate-500">
                      {member.canEdit ? "可查看與編輯此工地資料" : "只能查看此工地資料"}
                    </p>
                  </div>
                  {canManage && member.role !== "owner" ? (
                    <button
                      type="button"
                      onClick={() => removeMember(member)}
                      className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                      aria-label={`移除 ${member.email}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  ) : null}
                </div>
                {canManage && member.role !== "owner" ? (
                  <select
                    value={member.role}
                    onChange={(event) => updateMember(member, event.target.value)}
                    className="mt-3 w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none"
                  >
                    {projectMemberRoleOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : null}
              </div>
            ))}
            {!members.length ? (
              <div className="rounded-2xl border border-dashed p-6 text-center text-sm text-slate-500 md:col-span-2">
                尚無工地成員資料。
              </div>
            ) : null}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Dashboard({ p, claims, memoItems, todoItems, contractItems }) {
  const m = p.nextClaim || "2026/05";
  const total = sum(claims, m);
  const summary = byTrade(claims, m);
  const workDays = countWorkDays(p.startDate);

  return (
    <div>
      <Header title="工地總覽" sub="此工地的合約、請款、日報、缺失與材料" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat title="工地狀態" value={p.status} desc="目前工程狀態" icon={Building2} />
        <Stat title="累計天數" value={`${workDays} 天`} desc="含週日與國定假日" icon={CalendarDays} />
        <Stat
          title="本月廠商請款"
          value={twd(total)}
          desc={`${m}，共 ${claims.filter((x) => x.month === m).length} 筆`}
          icon={WalletCards}
        />
        <Stat title="待改善缺失" value={p.defects} desc="此工地缺失數" icon={AlertTriangle} />
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
        <DashboardCalendar className="lg:col-span-2" project={p} todos={todoItems} memos={memoItems} />
        <ProjectMembers project={p} />
        <VendorContacts contracts={contractItems} />
      </div>
    </div>
  );
}

function Claims({ p, claims, setClaims, allClaims = claims }) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({
    period: "",
    month: p.nextClaim || "2026/05",
    trade: "",
    vendor: "",
    contract: "",
    amount: "",
    status: "待送審",
    attachments: [],
  });

  function saveClaim() {
    const next = {
      ...draft,
      period: draft.period || `第 ${claims.length + 1} 期`,
      trade: draft.trade || "未分類工程",
      vendor: draft.vendor || "未填寫廠商",
      contract: draft.contract || "未填寫合約",
      amount: Number(draft.amount || 0),
      attachments: draft.attachments || [],
      projectId: p.id,
      projectName: p.name,
    };

    setClaims([next, ...allClaims]);
    setDraft({
      period: "",
      month: p.nextClaim || "2026/05",
      trade: "",
      vendor: "",
      contract: "",
      amount: "",
      status: "待送審",
      attachments: [],
    });
    setAdding(false);
  }

  return (
    <ListPage
      title="廠商請款資料"
      sub={`目前工地：${p.name}`}
      onAdd={() => setAdding(true)}
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
              <AttachmentSummary attachments={x.attachments} />
            </div>
            <div className="text-left sm:text-right">
              <p className="text-sm text-slate-500">本期請款</p>
              <p className="text-2xl font-bold">{twd(x.amount)}</p>
              <div className="mt-2">
                <Del label={`${x.vendor} ${x.period}`} onClick={() => setClaims(allClaims.filter((c) => c !== x))} />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    >
      {adding ? (
        <Card className="mb-4">
          <CardContent className="grid gap-4 p-5 md:grid-cols-2">
            <label>
              <span className="text-sm font-medium">廠商名稱</span>
              <div className="mt-2">
                <Input
                  value={draft.vendor}
                  onChange={(value) => setDraft({ ...draft, vendor: value })}
                  ph="例如：宏鑫水電"
                />
              </div>
            </label>
            <label>
              <span className="text-sm font-medium">工程類別</span>
              <div className="mt-2">
                <Input
                  value={draft.trade}
                  onChange={(value) => setDraft({ ...draft, trade: value })}
                  ph="例如：水電工程"
                />
              </div>
            </label>
            <label>
              <span className="text-sm font-medium">合約名稱</span>
              <div className="mt-2">
                <Input
                  value={draft.contract}
                  onChange={(value) => setDraft({ ...draft, contract: value })}
                  ph="例如：水電配管工程"
                />
              </div>
            </label>
            <label>
              <span className="text-sm font-medium">期別</span>
              <div className="mt-2">
                <Input
                  value={draft.period}
                  onChange={(value) => setDraft({ ...draft, period: value })}
                  ph="例如：第 1 期"
                />
              </div>
            </label>
            <label>
              <span className="text-sm font-medium">請款月份</span>
              <div className="mt-2">
                <Input
                  value={draft.month}
                  onChange={(value) => setDraft({ ...draft, month: value })}
                  ph="例如：2026/05"
                />
              </div>
            </label>
            <label>
              <span className="text-sm font-medium">本期金額</span>
              <div className="mt-2">
                <Input
                  type="number"
                  value={draft.amount}
                  onChange={(value) => setDraft({ ...draft, amount: value })}
                  ph="例如：185000"
                />
              </div>
            </label>
            <label>
              <span className="text-sm font-medium">狀態</span>
              <CustomSelect
                value={draft.status}
                onChange={(value) => setDraft({ ...draft, status: value })}
                options={["待送審", "審核中", "待付款", "已付款"]}
                className="mt-2 space-y-2"
                otherPlaceholder="請輸入自訂狀態"
              />
            </label>
            <ImageAttachments
              className="md:col-span-2"
              value={draft.attachments}
              onChange={(attachments) => setDraft({ ...draft, attachments })}
            />
            <div className="flex justify-end gap-3 md:col-span-2">
              <Button type="button" variant="outline" onClick={() => setAdding(false)}>
                取消
              </Button>
              <Button type="button" onClick={saveClaim}>
                <Save className="mr-2 h-4 w-4" />
                儲存請款
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </ListPage>
  );
}

function Contracts({ p, items, onSave, onDelete }) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({
    name: "",
    vendor: "",
    trade: "",
    amount: "",
    status: "草稿",
    contact: "",
    phone: "",
    email: "",
    address: "",
    note: "",
    attachments: [],
  });

  function resetDraft() {
    setDraft({
      name: "",
      vendor: "",
      trade: "",
      amount: "",
      status: "草稿",
      contact: "",
      phone: "",
      email: "",
      address: "",
      note: "",
      attachments: [],
    });
  }

  function saveContract() {
    onSave({
      id: Date.now(),
      projectId: p.id,
      projectName: p.name,
      name: draft.name || "未命名合約",
      vendor: draft.vendor || "未填寫廠商",
      trade: draft.trade || "未分類工程",
      amount: Number(draft.amount || 0),
      status: draft.status || "草稿",
      contact: draft.contact,
      phone: draft.phone,
      email: draft.email,
      address: draft.address,
      note: draft.note,
      attachments: draft.attachments || [],
    });
    resetDraft();
    setAdding(false);
  }

  return (
    <ListPage
      title="工程合約"
      sub={`目前工地：${p.name}`}
      btn="新增合約"
      onAdd={() => setAdding(true)}
      items={items}
      render={(contract) => (
        <Card key={contract.id}>
          <CardContent className="flex flex-col justify-between gap-4 p-5 sm:flex-row">
            <div>
              <div className="flex flex-wrap gap-2">
                <h3 className="text-lg font-bold">{contract.name}</h3>
                <Badge>{contract.status}</Badge>
                <Badge>{contract.trade}</Badge>
              </div>
              <p className="mt-2 text-sm text-slate-500">
                廠商：{contract.vendor}｜金額：{twd(contract.amount)}
              </p>
              <p className="text-sm text-slate-500">
                聯絡人：{contract.contact || "未填寫"}｜電話：{contract.phone || "未填寫"}
              </p>
              <p className="text-sm text-slate-500">
                Email：{contract.email || "未填寫"}
              </p>
              <AttachmentSummary attachments={contract.attachments} />
            </div>
            <Del label={contract.name} onClick={() => onDelete(contract.id)} />
          </CardContent>
        </Card>
      )}
    >
      {adding ? (
        <Card className="mb-4">
          <CardContent className="grid gap-4 p-5 md:grid-cols-2">
            <label>
              <span className="text-sm font-medium">合約名稱</span>
              <div className="mt-2">
                <Input
                  value={draft.name}
                  onChange={(value) => setDraft({ ...draft, name: value })}
                  ph="例如：水電配管工程"
                />
              </div>
            </label>
            <label>
              <span className="text-sm font-medium">廠商名稱</span>
              <div className="mt-2">
                <Input
                  value={draft.vendor}
                  onChange={(value) => setDraft({ ...draft, vendor: value })}
                  ph="例如：宏鑫水電"
                />
              </div>
            </label>
            <label>
              <span className="text-sm font-medium">工程類別</span>
              <div className="mt-2">
                <Input
                  value={draft.trade}
                  onChange={(value) => setDraft({ ...draft, trade: value })}
                  ph="例如：水電工程"
                />
              </div>
            </label>
            <label>
              <span className="text-sm font-medium">合約金額</span>
              <div className="mt-2">
                <Input
                  type="number"
                  value={draft.amount}
                  onChange={(value) => setDraft({ ...draft, amount: value })}
                  ph="例如：1200000"
                />
              </div>
            </label>
            <label>
              <span className="text-sm font-medium">狀態</span>
              <CustomSelect
                value={draft.status}
                onChange={(value) => setDraft({ ...draft, status: value })}
                options={["草稿", "待簽核", "執行中", "已結案"]}
                className="mt-2 space-y-2"
                otherPlaceholder="請輸入自訂合約狀態"
              />
            </label>
            <label>
              <span className="text-sm font-medium">聯絡人</span>
              <div className="mt-2">
                <Input
                  value={draft.contact}
                  onChange={(value) => setDraft({ ...draft, contact: value })}
                  ph="例如：張先生"
                />
              </div>
            </label>
            <label>
              <span className="text-sm font-medium">電話</span>
              <div className="mt-2">
                <Input
                  value={draft.phone}
                  onChange={(value) => setDraft({ ...draft, phone: value })}
                  ph="例如：04-2222-1688"
                />
              </div>
            </label>
            <label>
              <span className="text-sm font-medium">Email</span>
              <div className="mt-2">
                <Input
                  type="email"
                  value={draft.email}
                  onChange={(value) => setDraft({ ...draft, email: value })}
                  ph="例如：vendor@example.com"
                />
              </div>
            </label>
            <label className="md:col-span-2">
              <span className="text-sm font-medium">地址</span>
              <div className="mt-2">
                <Input
                  value={draft.address}
                  onChange={(value) => setDraft({ ...draft, address: value })}
                  ph="例如：台中市東區..."
                />
              </div>
            </label>
            <label className="md:col-span-2">
              <span className="text-sm font-medium">備註</span>
              <textarea
                value={draft.note}
                onChange={(event) => setDraft({ ...draft, note: event.target.value })}
                className="mt-2 min-h-24 w-full rounded-xl border px-3 py-2 outline-none"
                placeholder="付款條件、保固、現場窗口補充"
              />
            </label>
            <ImageAttachments
              className="md:col-span-2"
              value={draft.attachments}
              onChange={(attachments) => setDraft({ ...draft, attachments })}
            />
            <div className="flex justify-end gap-3 md:col-span-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  resetDraft();
                  setAdding(false);
                }}
              >
                取消
              </Button>
              <Button type="button" onClick={saveContract}>
                <Save className="mr-2 h-4 w-4" />
                儲存合約
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </ListPage>
  );
}

function Memos({ p, items, onSave, onDelete }) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({
    trade: "",
    title: "",
    date: todayKey(),
    note: "",
    status: "待處理",
    attachments: [],
  });

  function saveMemo() {
    onSave({
      id: Date.now(),
      projectId: p.id,
      projectName: p.name,
      trade: draft.trade || "未分類工項",
      title: draft.title || "未命名 Memo",
      date: draft.date || todayKey(),
      note: draft.note || "未填寫內容",
      status: draft.status,
      attachments: draft.attachments || [],
    });
    setDraft({ trade: "", title: "", date: todayKey(), note: "", status: "待處理", attachments: [] });
    setAdding(false);
  }

  return (
    <ListPage
      title="工項 Memo 紀錄"
      sub={`目前工地：${p.name}`}
      onAdd={() => setAdding(true)}
      items={items}
      render={(x) => (
        <Card key={x.id || x.title}>
          <CardContent className="flex flex-col justify-between gap-4 p-5 sm:flex-row">
            <div>
              <div className="flex flex-wrap gap-2">
                <Badge>{x.trade}</Badge>
                <Badge>{x.status}</Badge>
              </div>
              <h3 className="mt-3 text-lg font-bold">{x.title}</h3>
              <p className="text-sm text-slate-500">日期：{x.date || "未設定"}</p>
              <p className="text-sm text-slate-500">{x.note}</p>
              <AttachmentSummary attachments={x.attachments} />
            </div>
            <Del label={x.title} onClick={() => onDelete(x.id)} />
          </CardContent>
        </Card>
      )}
    >
      {adding ? (
        <Card className="mb-4">
          <CardContent className="grid gap-4 p-5 md:grid-cols-2">
            <label>
              <span className="text-sm font-medium">工項</span>
              <div className="mt-2">
                <Input
                  value={draft.trade}
                  onChange={(value) => setDraft({ ...draft, trade: value })}
                  ph="例如：防水工程"
                />
              </div>
            </label>
            <label>
              <span className="text-sm font-medium">狀態</span>
              <CustomSelect
                value={draft.status}
                onChange={(value) => setDraft({ ...draft, status: value })}
                options={["待確認", "待處理", "追蹤中", "已完成"]}
                className="mt-2 space-y-2"
                otherPlaceholder="請輸入自訂狀態"
              />
            </label>
            <label>
              <span className="text-sm font-medium">日期</span>
              <div className="mt-2">
                <Input
                  type="date"
                  value={draft.date}
                  onChange={(value) => setDraft({ ...draft, date: value })}
                />
              </div>
            </label>
            <label>
              <span className="text-sm font-medium">標題</span>
              <div className="mt-2">
                <Input
                  value={draft.title}
                  onChange={(value) => setDraft({ ...draft, title: value })}
                  ph="例如：浴室門檻加強"
                />
              </div>
            </label>
            <label className="md:col-span-2">
              <span className="text-sm font-medium">內容</span>
              <textarea
                value={draft.note}
                onChange={(event) => setDraft({ ...draft, note: event.target.value })}
                className="mt-2 min-h-24 w-full rounded-xl border px-3 py-2 outline-none"
                placeholder="記錄待確認事項、施工提醒或業主討論結果"
              />
            </label>
            <ImageAttachments
              className="md:col-span-2"
              value={draft.attachments}
              onChange={(attachments) => setDraft({ ...draft, attachments })}
            />
            <div className="flex justify-end gap-3 md:col-span-2">
              <Button type="button" variant="outline" onClick={() => setAdding(false)}>
                取消
              </Button>
              <Button type="button" onClick={saveMemo}>
                <Save className="mr-2 h-4 w-4" />
                儲存 Memo
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </ListPage>
  );
}

function Checklists({ p }) {
  const [items, setItems] = useState(checks);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({
    stage: "",
    items: "",
    attachments: [],
  });

  function saveChecklist() {
    const nextItems = draft.items
      .split(/[\n,，]/)
      .map((item) => item.trim())
      .filter(Boolean);

    setItems([
      {
        stage: draft.stage || "未命名階段",
        done: 0,
        items: nextItems.length ? nextItems : ["新增檢核項目"],
        attachments: draft.attachments || [],
      },
      ...items,
    ]);
    setDraft({ stage: "", items: "", attachments: [] });
    setAdding(false);
  }

  return (
    <div>
      <Header
        title="工地各階段檢核表"
        sub={`目前工地：${p.name}`}
        btn="新增檢核表"
        onAdd={() => setAdding(true)}
      />
      {adding ? (
        <Card className="mb-4">
          <CardContent className="grid gap-4 p-5 md:grid-cols-2">
            <label className="md:col-span-2">
              <span className="text-sm font-medium">階段名稱</span>
              <div className="mt-2">
                <Input
                  value={draft.stage}
                  onChange={(value) => setDraft({ ...draft, stage: value })}
                  ph="例如：屋頂防水驗收"
                />
              </div>
            </label>
            <label className="md:col-span-2">
              <span className="text-sm font-medium">檢核項目</span>
              <textarea
                value={draft.items}
                onChange={(event) => setDraft({ ...draft, items: event.target.value })}
                className="mt-2 min-h-28 w-full rounded-xl border px-3 py-2 outline-none"
                placeholder="每行一項，或用逗號分隔"
              />
            </label>
            <ImageAttachments
              className="md:col-span-2"
              value={draft.attachments}
              onChange={(attachments) => setDraft({ ...draft, attachments })}
            />
            <div className="flex justify-end gap-3 md:col-span-2">
              <Button type="button" variant="outline" onClick={() => setAdding(false)}>
                取消
              </Button>
              <Button type="button" onClick={saveChecklist}>
                <Save className="mr-2 h-4 w-4" />
                儲存檢核表
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}
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
                <AttachmentSummary attachments={s.attachments} />
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
  const paperInputId = useMemo(
    () => `daily-ai-source-${Math.random().toString(36).slice(2)}`,
    [],
  );
  const [work, setWork] = useState([{ id: 1, ...empty.work }]);
  const [mat, setMat] = useState([{ id: 1, ...empty.mat }]);
  const [eq, setEq] = useState([{ id: 1, ...empty.eq }]);
  const [reportDate, setReportDate] = useState("");
  const [dayWeather, setDayWeather] = useState("");
  const [weatherNote, setWeatherNote] = useState("");
  const [paperReport, setPaperReport] = useState(null);
  const [sitePhotos, setSitePhotos] = useState([]);
  const [aiStatus, setAiStatus] = useState("idle");
  const [aiMessage, setAiMessage] = useState("");
  const [aiSummary, setAiSummary] = useState(null);
  const [savedReports, setSavedReports] = useState([]);

  const upd = (set, id, key, value) =>
    set((items) => items.map((x) => (x.id === id ? { ...x, [key]: value } : x)));
  const add = (set, obj) => set((items) => [...items, { id: Date.now(), ...obj }]);
  const rem = (set, id) => set((items) => (items.length === 1 ? items : items.filter((x) => x.id !== id)));

  function resetDaily() {
    setReportDate("");
    setDayWeather("");
    setWeatherNote("");
    setPaperReport(null);
    setSitePhotos([]);
    setAiStatus("idle");
    setAiMessage("");
    setAiSummary(null);
    setWork([{ id: Date.now(), ...empty.work }]);
    setMat([{ id: Date.now() + 1, ...empty.mat }]);
    setEq([{ id: Date.now() + 2, ...empty.eq }]);
  }

  function selectPaperReport(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setAiStatus("error");
      setAiMessage("目前紙本日報 AI 判讀先支援圖片格式，請上傳 JPG、PNG 或手機拍照圖片。");
      return;
    }

    if (file.size > DAILY_AI_SOURCE_MAX_BYTES) {
      setAiStatus("error");
      setAiMessage("紙本日報圖片請先壓縮到 3MB 以下；之後接 Vercel Blob 後可改支援較大的原圖。");
      return;
    }

    setPaperReport(toImageAttachments([file], { kind: "daily-source", keepFile: true })[0]);
    setAiStatus("idle");
    setAiMessage("");
    setAiSummary(null);
  }

  function applyAiReport(report) {
    if (report.date) setReportDate(report.date);
    if (report.weather) setDayWeather(report.weather);
    setWeatherNote(report.weatherNote || "");
    setWork(withRowIds(report.work, empty.work));
    setMat(withRowIds(report.materials, empty.mat));
    setEq(withRowIds(report.equipment, empty.eq));
    setAiSummary(report);
    setAiStatus("applied");
    setAiMessage("AI 判讀已填入下方表單，請確認每一格內容後再儲存。");
  }

  async function analyzePaperReport() {
    if (!paperReport?.file) {
      setAiStatus("error");
      setAiMessage("請先上傳紙本日報圖片。");
      return;
    }

    setAiStatus("reading");
    setAiMessage("AI 正在判讀紙本日報，完成後會把資料填入下方表格。");

    try {
      const dataUrl = await fileToDataUrl(paperReport.file);
      const data = await apiFetch("/api/ai/daily-report", {
        method: "POST",
        body: JSON.stringify({
          projectName: p.name,
          image: {
            name: paperReport.name,
            type: paperReport.file.type,
            dataUrl,
          },
        }),
      });
      applyAiReport(data.report || {});
    } catch (error) {
      setAiStatus("error");
      setAiMessage(error.message || "AI 判讀失敗，請稍後再試。");
    }
  }

  function saveDaily() {
    const totalWorkers = work.reduce((total, row) => total + Number(row.workers || 0), 0);
    const next = {
      id: Date.now(),
      date: reportDate || "未填日期",
      weather: dayWeather || "未選擇",
      weatherNote,
      workers: totalWorkers,
      workCount: work.length,
      materialCount: mat.length,
      equipmentCount: eq.length,
      work: work.map(({ id, ...row }) => row),
      materials: mat.map(({ id, ...row }) => row),
      equipment: eq.map(({ id, ...row }) => row),
      sourceAttachment: paperReport,
      attachments: sitePhotos,
      aiSummary,
    };

    setSavedReports([next, ...savedReports]);
    resetDaily();
  }

  return (
    <div>
      <Header
        title="施工日報紀錄"
        sub={`目前工地：${p.name}`}
        btn="新增日報"
        onAdd={resetDaily}
      />
      <Card>
        <CardContent className="grid gap-4 p-5 md:grid-cols-2">
          <div className="md:col-span-2 rounded-2xl border bg-white p-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge>AI 匯入</Badge>
                  <p className="text-sm font-bold text-slate-900">紙本日報表判讀</p>
                </div>
                <p className="mt-2 text-sm text-slate-500">
                  上傳紙本日報照片後，AI 會先將日期、天氣、工班、材料與機具填入下方表格；儲存前仍可自行修正每個欄位。
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  id={paperInputId}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={selectPaperReport}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById(paperInputId)?.click()}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  上傳紙本日報
                </Button>
                <Button
                  type="button"
                  disabled={!paperReport || aiStatus === "reading"}
                  onClick={analyzePaperReport}
                >
                  {aiStatus === "reading" ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <CheckSquare className="mr-2 h-4 w-4" />
                  )}
                  AI 判讀填入
                </Button>
              </div>
            </div>
            {paperReport ? (
              <div className="mt-4 flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                <img
                  src={paperReport.url}
                  alt={paperReport.name}
                  className="h-16 w-16 rounded-lg border object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{paperReport.name}</p>
                  <p className="text-xs text-slate-500">{Math.ceil(paperReport.size / 1024)} KB</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPaperReport(null);
                    setAiStatus("idle");
                    setAiMessage("");
                    setAiSummary(null);
                  }}
                  className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                  aria-label={`移除 ${paperReport.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ) : null}
            {aiMessage ? (
              <div
                className={`mt-3 rounded-xl border px-3 py-2 text-sm ${
                  aiStatus === "error"
                    ? "border-red-200 bg-red-50 text-red-700"
                    : "border-emerald-200 bg-emerald-50 text-emerald-700"
                }`}
              >
                {aiMessage}
              </div>
            ) : null}
            {Array.isArray(aiSummary?.notes) && aiSummary.notes.length ? (
              <div className="mt-3 rounded-xl border bg-slate-50 p-3 text-sm text-slate-600">
                <p className="font-medium text-slate-900">AI 備註</p>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  {aiSummary.notes.map((note) => (
                    <li key={note}>{note}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
          <Input type="date" value={reportDate} onChange={setReportDate} />
          <Input value={p.name} ro />
          <CustomSelect
            value={dayWeather}
            onChange={setDayWeather}
            options={weather}
            placeholder="請選擇天氣"
            className="space-y-2"
            otherPlaceholder="請輸入自訂天氣"
          />
          <Input value={weatherNote} onChange={setWeatherNote} ph="天氣備註" />
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
          <ImageAttachments
            className="md:col-span-2"
            title="現場施工照"
            description="附掛在本日報內，之後查閱指定日期時會一起顯示。暫時限制最多 10 張。"
            buttonLabel="上傳施工照"
            maxFiles={10}
            meta={{ kind: "site-photo" }}
            value={sitePhotos}
            onChange={setSitePhotos}
          />
          <div className="flex justify-end md:col-span-2">
            <Button type="button" onClick={saveDaily}>
              <Save className="mr-2 h-4 w-4" />
              確認並儲存日報
            </Button>
          </div>
        </CardContent>
      </Card>
      {savedReports.length ? (
        <div className="mt-4 grid gap-3">
          {savedReports.map((report) => (
            <Card key={report.id}>
              <CardContent className="flex flex-col justify-between gap-3 p-4 sm:flex-row sm:items-center">
                <div>
                  <h3 className="font-bold">{report.date} 施工日報</h3>
                  <p className="text-sm text-slate-500">
                    天氣：{report.weather}｜工班 {report.workCount} 筆｜總人數 {report.workers}
                  </p>
                  <p className="text-sm text-slate-500">
                    材料 {report.materialCount} 筆｜機具 {report.equipmentCount} 筆
                  </p>
                  {report.sourceAttachment ? (
                    <div className="mt-2">
                      <Badge>已附紙本日報來源</Badge>
                    </div>
                  ) : null}
                  <AttachmentSummary attachments={report.attachments} />
                </div>
                <Badge>已暫存</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}
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
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({
    location: "",
    type: "",
    vendor: "",
    due: "",
    status: "待改善",
    level: "一般",
    attachments: [],
  });

  function saveDefect() {
    const next = {
      id: Date.now(),
      location: draft.location || "未填寫位置",
      type: draft.type || "未分類",
      vendor: draft.vendor || "未指定",
      due: draft.due || "未設定",
      status: draft.status,
      level: draft.level,
      attachments: draft.attachments || [],
    };

    setItems([next, ...items]);
    setDraft({
      location: "",
      type: "",
      vendor: "",
      due: "",
      status: "待改善",
      level: "一般",
      attachments: [],
    });
    setAdding(false);
  }

  return (
    <div>
      <Header
        title="缺失改善"
        sub={`目前工地：${p.name}`}
        onAdd={() => setAdding(true)}
      />

      {adding ? (
        <Card className="mb-4">
          <CardContent className="grid gap-4 p-5 md:grid-cols-2">
            <label>
              <span className="text-sm font-medium">缺失位置</span>
              <div className="mt-2">
                <Input
                  value={draft.location}
                  onChange={(value) => setDraft({ ...draft, location: value })}
                  ph="例如：3F 主臥浴室"
                />
              </div>
            </label>
            <label>
              <span className="text-sm font-medium">類型</span>
              <div className="mt-2">
                <Input
                  value={draft.type}
                  onChange={(value) => setDraft({ ...draft, type: value })}
                  ph="例如：防水、油漆、磁磚"
                />
              </div>
            </label>
            <label>
              <span className="text-sm font-medium">負責廠商</span>
              <div className="mt-2">
                <Input
                  value={draft.vendor}
                  onChange={(value) => setDraft({ ...draft, vendor: value })}
                  ph="例如：永信防水"
                />
              </div>
            </label>
            <label>
              <span className="text-sm font-medium">改善期限</span>
              <div className="mt-2">
                <Input
                  type="date"
                  value={draft.due}
                  onChange={(value) => setDraft({ ...draft, due: value })}
                />
              </div>
            </label>
            <label>
              <span className="text-sm font-medium">狀態</span>
              <CustomSelect
                value={draft.status}
                onChange={(value) => setDraft({ ...draft, status: value })}
                options={["待改善", "改善中", "待複驗", "已完成"]}
                className="mt-2 space-y-2"
                otherPlaceholder="請輸入自訂狀態"
              />
            </label>
            <label>
              <span className="text-sm font-medium">嚴重程度</span>
              <CustomSelect
                value={draft.level}
                onChange={(value) => setDraft({ ...draft, level: value })}
                options={["一般", "重要", "重大"]}
                className="mt-2 space-y-2"
                otherPlaceholder="請輸入自訂嚴重程度"
              />
            </label>
            <ImageAttachments
              className="md:col-span-2"
              value={draft.attachments}
              onChange={(attachments) => setDraft({ ...draft, attachments })}
            />
            <div className="flex justify-end gap-3 md:col-span-2">
              <Button type="button" variant="outline" onClick={() => setAdding(false)}>
                取消
              </Button>
              <Button type="button" onClick={saveDefect}>
                <Save className="mr-2 h-4 w-4" />
                儲存缺失
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4">
        {items.map((x) => (
          <Card key={x.id || `${x.location}-${x.type}`}>
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
              <AttachmentSummary attachments={x.attachments} />
            </div>
            <Del label={`${x.location} ${x.type}`} onClick={() => setItems(items.filter((i) => i !== x))} />
          </CardContent>
        </Card>
        ))}
      </div>
    </div>
  );
}

function ListPage({ title, sub, items, render, onAdd, btn, children }) {
  return (
    <div>
      <Header title={title} sub={sub} btn={btn} onAdd={onAdd} />
      {children}
      <div className="grid gap-4">{items.map(render)}</div>
    </div>
  );
}

function Todos({ p, items, onSave, onDelete }) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({
    title: "",
    owner: "",
    date: todayKey(),
    status: "一般",
    note: "",
    attachments: [],
  });

  function resetDraft() {
    setDraft({
      title: "",
      owner: "",
      date: todayKey(),
      status: "一般",
      note: "",
      attachments: [],
    });
  }

  function saveTodo() {
    onSave({
      id: Date.now(),
      projectId: p.id,
      projectName: p.name,
      title: draft.title || "未命名待辦",
      owner: draft.owner || "未指定",
      date: draft.date || todayKey(),
      status: draft.status || "一般",
      note: draft.note,
      attachments: draft.attachments || [],
    });
    resetDraft();
    setAdding(false);
  }

  return (
    <ListPage
      title="待辦事項"
      sub={`目前工地：${p.name}`}
      btn="新增待辦"
      onAdd={() => setAdding(true)}
      items={items}
      render={(todo) => (
        <Card key={todo.id}>
          <CardContent className="flex flex-col justify-between gap-4 p-5 sm:flex-row">
            <div>
              <div className="flex flex-wrap gap-2">
                <h3 className="text-lg font-bold">{todo.title}</h3>
                <Badge>{todo.status}</Badge>
              </div>
              <p className="mt-2 text-sm text-slate-500">
                負責人：{todo.owner}｜日期：{todo.date}
              </p>
              {todo.note ? <p className="text-sm text-slate-500">{todo.note}</p> : null}
              <AttachmentSummary attachments={todo.attachments} />
            </div>
            <Del label={todo.title} onClick={() => onDelete(todo.id)} />
          </CardContent>
        </Card>
      )}
    >
      {adding ? (
        <Card className="mb-4">
          <CardContent className="grid gap-4 p-5 md:grid-cols-2">
            <label>
              <span className="text-sm font-medium">待辦事項</span>
              <div className="mt-2">
                <Input
                  value={draft.title}
                  onChange={(value) => setDraft({ ...draft, title: value })}
                  ph="例如：確認浴室門檻收邊"
                />
              </div>
            </label>
            <label>
              <span className="text-sm font-medium">負責人</span>
              <div className="mt-2">
                <Input
                  value={draft.owner}
                  onChange={(value) => setDraft({ ...draft, owner: value })}
                  ph="例如：李工務"
                />
              </div>
            </label>
            <label>
              <span className="text-sm font-medium">日期</span>
              <div className="mt-2">
                <Input
                  type="date"
                  value={draft.date}
                  onChange={(value) => setDraft({ ...draft, date: value })}
                />
              </div>
            </label>
            <label>
              <span className="text-sm font-medium">優先度</span>
              <CustomSelect
                value={draft.status}
                onChange={(value) => setDraft({ ...draft, status: value })}
                options={["一般", "重要", "緊急"]}
                className="mt-2 space-y-2"
                otherPlaceholder="請輸入自訂優先度"
              />
            </label>
            <label className="md:col-span-2">
              <span className="text-sm font-medium">備註</span>
              <textarea
                value={draft.note}
                onChange={(event) => setDraft({ ...draft, note: event.target.value })}
                className="mt-2 min-h-24 w-full rounded-xl border px-3 py-2 outline-none"
                placeholder="補充提醒、聯絡資訊或處理條件"
              />
            </label>
            <ImageAttachments
              className="md:col-span-2"
              value={draft.attachments}
              onChange={(attachments) => setDraft({ ...draft, attachments })}
            />
            <div className="flex justify-end gap-3 md:col-span-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  resetDraft();
                  setAdding(false);
                }}
              >
                取消
              </Button>
              <Button type="button" onClick={saveTodo}>
                <Save className="mr-2 h-4 w-4" />
                儲存待辦
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </ListPage>
  );
}

function createScheduleDraft(project) {
  const startDate = project.startDate || todayKey();
  return {
    trade: "",
    name: "",
    startDate,
    endDate: startDate,
    percent: 0,
    status: "未開始",
    note: "",
    attachments: [],
  };
}

function scheduleChartRange(project, items) {
  const starts = [project.startDate, ...items.map((item) => item.startDate)]
    .filter(Boolean)
    .sort();
  const ends = [project.endDate, ...items.map((item) => item.endDate)]
    .filter(Boolean)
    .sort();
  const start = starts[0] || todayKey();
  const end = ends[ends.length - 1] || start;
  return normalizeDateRange(start, end);
}

function Schedule({ p, items, onSave, onDelete }) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState(() => createScheduleDraft(p));

  const chartRange = useMemo(() => scheduleChartRange(p, items), [p, items]);
  const dates = useMemo(
    () => workDateRows(chartRange.start, chartRange.end),
    [chartRange.start, chartRange.end],
  );
  const trades = useMemo(() => {
    const names = items.map((item) => item.trade || "未分類工種");
    return Array.from(new Set(names));
  }, [items]);
  const chartTrades = trades.length ? trades : ["尚無工種"];
  const itemsByTrade = useMemo(
    () =>
      chartTrades.map((trade) => ({
        trade,
        items: items.filter((item) => (item.trade || "未分類工種") === trade),
      })),
    [chartTrades, items],
  );
  const chartDayCount = Math.max(dates.length, 1);
  const gridTemplateColumns = `minmax(132px, 160px) repeat(${chartDayCount}, minmax(96px, 1fr))`;
  const chartMinWidth = 132 + chartDayCount * 96;

  function resetDraft() {
    setDraft(createScheduleDraft(p));
  }

  function saveSchedule() {
    const { start, end } = normalizeDateRange(draft.startDate, draft.endDate);
    const trade = draft.trade || "未分類工種";
    const next = {
      id: Date.now(),
      projectId: p.id,
      projectName: p.name,
      ...draft,
      trade,
      startDate: start,
      endDate: end,
      percent: clampPercent(draft.percent),
      name: draft.name || `${trade}預定進度`,
    };

    onSave(next);
    resetDraft();
    setAdding(false);
  }

  return (
    <div>
      <Header
        title="預定進度"
        sub={`目前工地：${p.name}，表單儲存後會立即更新下方甘特圖`}
        btn="新增進度節點"
        onAdd={() => setAdding(true)}
      />

      <div className="mb-4 grid gap-4 sm:grid-cols-3">
        <Stat
          title="預定工期"
          value={`${dates.length} 天`}
          desc={`${formatDate(chartRange.start)} - ${formatDate(chartRange.end)}`}
          icon={CalendarDays}
        />
        <Stat title="工種數" value={trades.length || 0} desc="甘特圖 Y 軸分類" icon={ListChecks} />
        <Stat title="進度節點" value={items.length} desc="已登錄的預定進度" icon={ClipboardList} />
      </div>

      {adding ? (
        <Card className="mb-4">
          <CardContent className="grid gap-4 p-5 md:grid-cols-2">
            <label>
              <span className="text-sm font-medium">工種</span>
              <div className="mt-2">
                <SelectGroup
                  type="trade"
                  value={draft.trade}
                  onChange={(value) => setDraft({ ...draft, trade: value })}
                  placeholder="請選擇工種"
                />
              </div>
            </label>
            <label>
              <span className="text-sm font-medium">進度項目</span>
              <div className="mt-2">
                <Input
                  value={draft.name}
                  onChange={(value) => setDraft({ ...draft, name: value })}
                  ph="例如：3F 防水完成"
                />
              </div>
            </label>
            <label>
              <span className="text-sm font-medium">預定開始</span>
              <div className="mt-2">
                <Input
                  type="date"
                  value={draft.startDate}
                  onChange={(value) => setDraft({ ...draft, startDate: value })}
                />
              </div>
            </label>
            <label>
              <span className="text-sm font-medium">預定完成</span>
              <div className="mt-2">
                <Input
                  type="date"
                  value={draft.endDate}
                  onChange={(value) => setDraft({ ...draft, endDate: value })}
                />
              </div>
            </label>
            <label>
              <span className="text-sm font-medium">預定進度 %</span>
              <div className="mt-2">
                <Input
                  type="number"
                  value={draft.percent}
                  onChange={(value) => setDraft({ ...draft, percent: value })}
                  ph="例如：65"
                />
              </div>
            </label>
            <label>
              <span className="text-sm font-medium">狀態</span>
              <CustomSelect
                value={draft.status}
                onChange={(value) => setDraft({ ...draft, status: value })}
                options={scheduleStatusOptions}
                className="mt-2 space-y-2"
                otherPlaceholder="請輸入自訂狀態"
              />
            </label>
            <label className="md:col-span-2">
              <span className="text-sm font-medium">備註</span>
              <textarea
                value={draft.note}
                onChange={(event) => setDraft({ ...draft, note: event.target.value })}
                className="mt-2 min-h-24 w-full rounded-xl border px-3 py-2 outline-none"
                placeholder="進度說明或前置條件"
              />
            </label>
            <ImageAttachments
              className="md:col-span-2"
              value={draft.attachments}
              onChange={(attachments) => setDraft({ ...draft, attachments })}
            />
            <div className="flex justify-end gap-3 md:col-span-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  resetDraft();
                  setAdding(false);
                }}
              >
                取消
              </Button>
              <Button type="button" onClick={saveSchedule}>
                <Save className="mr-2 h-4 w-4" />
                儲存並更新圖表
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Card className="mb-4">
        <CardContent className="p-5">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-bold">預定進度甘特圖</h2>
              <p className="mt-1 text-sm text-slate-500">
                X 軸為工作天與日期，Y 軸為工種。
              </p>
            </div>
            <Badge>{formatDate(chartRange.start)} - {formatDate(chartRange.end)}</Badge>
          </div>
          <div className="grid gap-3 md:hidden">
            {items.length ? (
              itemsByTrade.map(({ trade, items: tradeItems }) => (
                <div key={trade} className="rounded-2xl border bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="min-w-0 break-words text-sm font-bold">{trade}</h3>
                    <Badge>{tradeItems.length} 項</Badge>
                  </div>
                  <div className="mt-3 space-y-2">
                    {tradeItems.map((item) => (
                      <div key={item.id} className="rounded-xl border bg-white p-3 text-sm">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="break-words font-bold">{item.name}</p>
                            <p className="mt-1 text-xs text-slate-500">
                              {shortDateLabel(item.startDate)} - {shortDateLabel(item.endDate)}
                            </p>
                          </div>
                          <Badge>{item.status}</Badge>
                        </div>
                        <div className="mt-3 h-2 rounded-full bg-slate-100">
                          <div
                            className="h-2 rounded-full bg-slate-900"
                            style={{ width: `${item.percent}%` }}
                          />
                        </div>
                        <p className="mt-1 text-right text-xs font-medium text-slate-500">
                          {item.percent}%
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed p-6 text-center text-sm text-slate-500">
                尚無預定進度，新增後會在這裡顯示手機版摘要。
              </div>
            )}
          </div>
          <div className="hidden max-h-[min(64vh,560px)] overflow-auto rounded-2xl border md:block">
            <div className="grid" style={{ gridTemplateColumns, minWidth: `${chartMinWidth}px` }}>
              <div className="sticky left-0 top-0 z-20 border-b border-r bg-slate-900 p-3 text-sm font-bold text-white">
                工種
              </div>
              {dates.map((row) => (
                <div
                  key={row.date}
                  className="sticky top-0 z-10 border-b border-r bg-slate-900 p-2 text-center text-white"
                >
                  <p className="text-xs font-bold">第 {row.workDay} 天</p>
                  <p className="mt-1 text-[11px] text-slate-300">{row.label}</p>
                </div>
              ))}
              {chartTrades.map((trade) => (
                <React.Fragment key={trade}>
                  <div className="sticky left-0 z-10 border-b border-r bg-white p-3">
                    <p className="break-words text-sm font-bold">{trade}</p>
                    <p className="text-xs text-slate-500">工種 / 分包</p>
                  </div>
                  {dates.map((row) => {
                    const activeItems = items.filter(
                      (item) =>
                        (item.trade || "未分類工種") === trade &&
                        item.startDate <= row.date &&
                        item.endDate >= row.date,
                    );

                    return (
                      <div key={`${trade}-${row.date}`} className="min-h-20 border-b border-r bg-slate-50 p-2">
                        {activeItems.length ? (
                          <div className="space-y-2">
                            {activeItems.map((item) => (
                              <div
                                key={item.id}
                                className={`rounded-lg border px-2 py-1 text-xs ${
                                  scheduleStatusClass[item.status] || scheduleStatusClass.未開始
                                }`}
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <span className="truncate font-medium">
                                    {row.date === item.startDate ? item.name : "進行中"}
                                  </span>
                                  <span className="shrink-0">{item.percent}%</span>
                                </div>
                                <div className="mt-1 h-1.5 rounded-full bg-white/70">
                                  <div
                                    className="h-1.5 rounded-full bg-slate-900/80"
                                    style={{ width: `${item.percent}%` }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-300">-</span>
                        )}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {items.length ? (
          items.map((item) => (
            <Card key={item.id}>
              <CardContent className="flex flex-col justify-between gap-4 p-5 sm:flex-row">
                <div>
                  <div className="flex flex-wrap gap-2">
                    <h3 className="text-lg font-bold">{item.name}</h3>
                    <Badge>{item.trade}</Badge>
                    <Badge>{item.status}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">
                    {item.startDate} - {item.endDate}｜預定進度 {item.percent}%
                  </p>
                  {item.note ? <p className="text-sm text-slate-500">{item.note}</p> : null}
                  <AttachmentSummary attachments={item.attachments} />
                </div>
                <Del label={item.name} onClick={() => onDelete(item.id)} />
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-8 text-center text-slate-500">
              尚無預定進度資料，請點右上角新增。
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function Manual() {
  const manualSections = [
    {
      title: "開始使用",
      desc: "從選擇工地開始，把每一筆資料都歸到正確案場。",
      items: [
        "進入系統後先創建或選擇工地。",
        "左側深色工地卡可查看目前案場、狀態、開工日期與累計天數。",
        "使用功能列表切換總覽、日報、請款、缺失與其他模組。",
      ],
    },
    {
      title: "日常紀錄",
      desc: "適合每天巡場、整理現場狀況與留下照片附件。",
      items: [
        "施工日報可記錄天氣、工班人數、材料與機具，也可上傳紙本日報照片交由 AI 先行填入。",
        "AI 判讀結果會先進入可編輯表格，確認無誤後再自行儲存。",
        "現場施工照可附掛在日報內，暫時限制每份日報最多 10 張。",
        "工項 Memo 用來記錄需要追蹤或與業主確認的事項。",
        "缺失改善可登錄位置、類型、負責廠商、期限與嚴重程度。",
      ],
    },
    {
      title: "合約與廠商",
      desc: "把廠商聯絡資料、合約與請款資訊集中查找。",
      items: [
        "工程合約可建立廠商、聯絡人、電話與合約金額。",
        "廠商請款可依期別、月份、工種與狀態記錄。",
        "總覽的廠商資訊會聯動工程合約，方便快速查找電話與聯絡人。",
      ],
    },
    {
      title: "進度與行程",
      desc: "將待辦、Memo 與預定進度轉成更容易比較的時間視圖。",
      items: [
        "總覽月曆會顯示待辦事項與工項 Memo。",
        "預定進度表單儲存後會同步更新甘特圖。",
        "甘特圖 X 軸為工作天與日期，Y 軸為工種。",
      ],
    },
    {
      title: "帳號管理",
      desc: "一般使用者可管理自己的帳號；系統管理員另有完整管理中心。",
      items: [
        "右上角帳號設定可修改暱稱、變更密碼或登出。",
        "系統管理員可進入系統管理中心查詢與管理所有註冊帳號。",
        "帳號會記錄所屬單位，註冊與新增帳號時都需先選擇分組。",
        "帳號列表採收合式呈現，展開後可重設密碼、調整權限或重寄驗證信。",
        "工地總覽可管理工地成員，只有被加入該工地的帳號能看到與操作資料。",
      ],
    },
  ];
  const versionNotes = [
    {
      version: APP_VERSION,
      title: "一般帳號設定與註冊驗證調整",
      items: [
        "一般帳號右上角新增帳號設定，可自行修改暱稱、變更密碼與登出。",
        "工地選擇頁簡化權限說明文字。",
        "註冊帳號新增所屬單位下拉選單，目前提供測試分組1、測試分組2、測試分組3。",
        "正式環境預設要求註冊後完成信箱驗證才能登入。",
      ],
    },
    {
      version: "eztodo_26052503",
      title: "獨立系統管理中心",
      items: [
        "右上角系統管理改為全頁管理中心，僅系統管理員可使用。",
        "帳號管理新增搜尋、帳號總覽統計、建立工地數與最後登入時間。",
        "點開帳號後可查看帳號建立時間、信箱驗證狀態並調整權限或重設密碼。",
      ],
    },
    {
      version: "eztodo_26052502",
      title: "多客戶工地隔離與共同管理",
      items: [
        "新增工地建立者與 project_members 成員權限模型。",
        "工地列表改為只顯示自己建立或被邀請加入的工地。",
        "工地總覽新增成員管理，可邀請已註冊帳號成為共同管理者、可編輯或僅閱覽。",
        "選擇工地頁新增刷新工地按鈕，讓被邀請人可立即重新讀取新工地。",
      ],
    },
    {
      version: "eztodo_26052501",
      title: "公開上線前信箱驗證",
      items: [
        "新增信箱驗證資料欄位、驗證連結與重寄驗證信 API。",
        "登入時若一般帳號尚未完成信箱驗證，系統會阻擋登入並提供重寄驗證信。",
        "帳號管理列表會顯示信箱驗證狀態，管理員可替未驗證帳號重寄驗證信。",
      ],
    },
    {
      version: "eztodo_26052402",
      title: "施工日報 AI 匯入與照片附件",
      items: [
        "施工日報新增紙本日報圖片上傳與 AI 判讀填入功能。",
        "AI 判讀後會先填入表格，使用者可修正欄位後再確認儲存。",
        "施工日報新增現場施工照附件區，暫時限制最多 10 張。",
      ],
    },
    {
      version: "eztodo_26052401",
      title: "初始操作手冊版本",
      items: [
        "新增版本號顯示，登入頁與登入後介面底部皆可核對版本。",
        "保留單一範例工地，並在工地卡上標示範例備註。",
        "新增操作手冊頁，後續每次版本更新都在此補充新增功能操作說明。",
      ],
    },
  ];

  return (
    <div>
      <Header
        title="操作手冊"
        sub={`目前版本：${APP_VERSION}。此頁會隨版本更新補充新增功能與操作說明。`}
      />
      <div className="grid gap-4 lg:grid-cols-2">
        {manualSections.map((section) => (
          <Card key={section.title}>
            <CardContent className="p-5">
              <h2 className="text-lg font-bold">{section.title}</h2>
              <p className="mt-1 text-sm text-slate-500">{section.desc}</p>
              <div className="mt-4 space-y-2">
                {section.items.map((item, index) => (
                  <div key={item} className="flex gap-3 rounded-xl border bg-slate-50 p-3 text-sm">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                      {index + 1}
                    </span>
                    <span className="leading-6 text-slate-700">{item}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="mt-4">
        <CardContent className="p-5">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-bold">版本更新紀錄</h2>
              <p className="mt-1 text-sm text-slate-500">
                新增功能上線時，請同步在此補上操作入口與注意事項。
              </p>
            </div>
            <Badge>{APP_VERSION}</Badge>
          </div>
          <div className="mt-4 grid gap-3">
            {versionNotes.map((note) => (
              <div key={note.version} className="rounded-2xl border p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-bold">{note.title}</h3>
                  <Badge>{note.version}</Badge>
                </div>
                <div className="mt-3 space-y-2">
                  {note.items.map((item) => (
                    <p key={item} className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-600">
                      {item}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Placeholder({ title }) {
  const schema =
    {
      重要公告: {
        btn: "新增公告",
        fields: [
          { key: "name", label: "公告標題", ph: "例如：明日停水施工通知" },
          { key: "owner", label: "發布人", ph: "例如：王主任" },
          { key: "status", label: "重要程度", options: ["一般", "重要", "緊急"] },
          { key: "note", label: "公告內容", ph: "輸入需要通知工班或業主的重要事項", wide: true },
        ],
      },
      工程合約: {
        btn: "新增合約",
        fields: [
          { key: "name", label: "合約名稱", ph: "例如：水電配管工程" },
          { key: "vendor", label: "廠商", ph: "例如：宏鑫水電" },
          { key: "amount", label: "合約金額", ph: "例如：1200000", type: "number" },
          { key: "date", label: "簽約日期", type: "date" },
          { key: "status", label: "狀態", options: ["草稿", "待簽核", "執行中", "已結案"] },
        ],
      },
      材料庫存: {
        btn: "新增材料",
        fields: [
          { key: "name", label: "材料名稱", ph: "例如：PVC 管" },
          { key: "category", label: "分類", ph: "例如：水電材料" },
          { key: "quantity", label: "數量", ph: "例如：50", type: "number" },
          { key: "unit", label: "單位", ph: "例如：支" },
          { key: "location", label: "存放位置", ph: "例如：1F 倉庫" },
        ],
      },
      預定進度: {
        btn: "新增進度節點",
        fields: [
          { key: "name", label: "進度項目", ph: "例如：3F 防水完成" },
          { key: "startDate", label: "預定開始", type: "date" },
          { key: "endDate", label: "預定完成", type: "date" },
          { key: "percent", label: "預定進度 %", ph: "例如：65", type: "number" },
          { key: "status", label: "狀態", options: ["未開始", "進行中", "延遲", "已完成"] },
          { key: "note", label: "備註", ph: "進度說明或前置條件", wide: true },
        ],
      },
      待辦事項: {
        btn: "新增待辦",
        fields: [
          { key: "name", label: "待辦事項", ph: "例如：確認浴室門檻收邊" },
          { key: "owner", label: "負責人", ph: "例如：李工務" },
          { key: "date", label: "到期日", type: "date" },
          { key: "status", label: "優先度", options: ["一般", "重要", "緊急"] },
        ],
      },
      照片中心: {
        btn: "新增照片紀錄",
        fields: [
          { key: "name", label: "照片標題", ph: "例如：3F 防水試水" },
          { key: "location", label: "拍攝位置", ph: "例如：3F 主臥浴室" },
          { key: "status", label: "分類", options: ["施工前", "施工中", "完工", "缺失", "材料"] },
          { key: "note", label: "備註", ph: "照片上傳功能後續接雲端儲存", wide: true },
        ],
      },
    }[title] || {
      btn: "新增資料",
      fields: [
        { key: "name", label: "名稱", ph: "請輸入名稱" },
        { key: "status", label: "狀態", options: ["待處理", "進行中", "已完成"] },
        { key: "note", label: "備註", ph: "補充說明", wide: true },
      ],
    };
  const emptyDraft = schema.fields.reduce((draft, field) => {
    draft[field.key] = field.options ? field.options[0] : "";
    return draft;
  }, { attachments: [] });
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState(emptyDraft);
  const [records, setRecords] = useState([]);

  function saveRecord() {
    const next = {
      id: Date.now(),
      ...draft,
      name: draft.name || `${title}資料`,
    };

    setRecords([next, ...records]);
    setDraft(emptyDraft);
    setAdding(false);
  }

  return (
    <div>
      <Header
        title={title}
        sub="此頁先建立互動表單，後續接資料庫"
        btn={schema.btn}
        onAdd={() => setAdding(true)}
      />
      {adding ? (
        <Card className="mb-4">
          <CardContent className="grid gap-4 p-5 md:grid-cols-2">
            {schema.fields.map((field) => (
              <label key={field.key} className={field.wide ? "md:col-span-2" : ""}>
                <span className="text-sm font-medium">{field.label}</span>
                {field.options ? (
                  <CustomSelect
                    value={draft[field.key]}
                    onChange={(value) => setDraft({ ...draft, [field.key]: value })}
                    options={field.options}
                    className="mt-2 space-y-2"
                    otherPlaceholder={`請輸入自訂${field.label}`}
                  />
                ) : field.wide ? (
                  <textarea
                    value={draft[field.key]}
                    onChange={(event) => setDraft({ ...draft, [field.key]: event.target.value })}
                    className="mt-2 min-h-24 w-full rounded-xl border px-3 py-2 outline-none"
                    placeholder={field.ph}
                  />
                ) : (
                  <div className="mt-2">
                    <Input
                      type={field.type || "text"}
                      value={draft[field.key]}
                      onChange={(value) => setDraft({ ...draft, [field.key]: value })}
                      ph={field.ph}
                    />
                  </div>
                )}
              </label>
            ))}
            <ImageAttachments
              className="md:col-span-2"
              value={draft.attachments}
              onChange={(attachments) => setDraft({ ...draft, attachments })}
            />
            <div className="flex justify-end gap-3 md:col-span-2">
              <Button type="button" variant="outline" onClick={() => setAdding(false)}>
                取消
              </Button>
              <Button type="button" onClick={saveRecord}>
                <Save className="mr-2 h-4 w-4" />
                儲存
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}
      <div className="grid gap-4">
        {records.length ? (
          records.map((record) => (
            <Card key={record.id}>
              <CardContent className="flex flex-col justify-between gap-4 p-5 sm:flex-row">
                <div>
                  <div className="flex flex-wrap gap-2">
                    <h3 className="text-lg font-bold">{record.name}</h3>
                    {record.status ? <Badge>{record.status}</Badge> : null}
                  </div>
                  <p className="mt-2 text-sm text-slate-500">
                    {schema.fields
                      .filter((field) => field.key !== "name" && record[field.key])
                      .slice(0, 4)
                      .map((field) => `${field.label}：${record[field.key]}`)
                      .join("｜")}
                  </p>
                  <AttachmentSummary attachments={record.attachments} />
                </div>
                <Del label={record.name} onClick={() => setRecords(records.filter((item) => item !== record))} />
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-8 text-center text-slate-500">
              尚無{title}資料，請點右上角新增。
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function AdminPanel({ currentUser, onLogout, onUserUpdate, open, onOpenChange }) {
  const panelRef = useRef(null);
  const triggerRef = useRef(null);
  const [users, setUsers] = useState(adminSeedUsers.map(normalizeAccountPermissions));
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState("");
  const [accountQuery, setAccountQuery] = useState("");
  const [draft, setDraft] = useState(defaultAccountDraft);
  const [profileName, setProfileName] = useState(currentUser?.name || "");
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [sections, setSections] = useState({
    account: false,
    create: false,
    users: true,
  });
  const [openUserId, setOpenUserId] = useState("");
  const [passwordDraft, setPasswordDraft] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [resetDrafts, setResetDrafts] = useState({});

  useEffect(() => {
    setProfileName(currentUser?.name || "");
  }, [currentUser?.name]);

  const isSystemAdmin = useLocalPreview || currentUser?.role === "admin";

  useEffect(() => {
    if (!open || useLocalPreview || currentUser?.role !== "admin") return;

    let active = true;
    apiFetch("/api/users")
      .then((data) => {
        if (active) setUsers((data.users || []).map(normalizeAccountPermissions));
      })
      .catch((err) => {
        if (active) setError(err.message);
      });

    return () => {
      active = false;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event) {
      const target = event.target;
      if (panelRef.current?.contains(target) || triggerRef.current?.contains(target)) {
        return;
      }
      onOpenChange(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open, onOpenChange]);

  const filteredUsers = users.filter((user) => {
    const keyword = accountQuery.trim().toLowerCase();
    if (!keyword) return true;
    return [
      user.name,
      user.email,
      user.organizationName,
      user.role,
      user.emailVerified ? "verified" : "unverified",
    ]
      .join(" ")
      .toLowerCase()
      .includes(keyword);
  });
  const totalProjects = users.reduce((total, user) => total + Number(user.createdProjectCount || 0), 0);
  const verifiedCount = users.filter((user) => user.emailVerified).length;
  const activeCount = users.filter((user) => user.lastLoginAt).length;

  function toggleSection(section) {
    setSections((current) => ({ ...current, [section]: !current[section] }));
  }

  async function saveUser() {
    setError("");
    setNotice("");

    if (!draft.password || draft.password.length < 8) {
      setError("初始密碼至少需要 8 碼");
      return;
    }
    if (!draft.organizationName) {
      setError("請選擇所屬單位");
      return;
    }

    const next = normalizeAccountPermissions({
      ...draft,
      id: `user-${Date.now()}`,
      name: draft.name || "未命名使用者",
      email: draft.email || `user-${Date.now()}@example.com`,
    });

    if (useLocalPreview) {
      setUsers([next, ...users]);
      setDraft(defaultAccountDraft());
      setNotice("已新增預覽帳號");
      return;
    }

    try {
      setBusy("create-user");
      const data = await apiFetch("/api/users", {
        method: "POST",
        body: JSON.stringify(next),
      });
      setUsers([normalizeAccountPermissions(data.user), ...users]);
      setDraft(defaultAccountDraft());
      setNotice(data.verificationEmailSent ? "帳號已新增，驗證信已寄出" : "帳號已新增");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy("");
    }
  }

  async function resendUserVerification(user) {
    setError("");
    setNotice("");

    if (useLocalPreview) {
      setNotice(`已模擬寄送 ${user.email} 的驗證信`);
      return;
    }

    try {
      setBusy(`verify-${user.id}`);
      const data = await apiFetch("/api/auth/resend-verification", {
        method: "POST",
        body: JSON.stringify({ email: user.email }),
      });
      setNotice(data.message || `已寄送 ${user.email} 的驗證信`);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy("");
    }
  }

  async function updatePermission(user, patch) {
    if (user.role === "admin") return;
    setError("");
    setNotice("");
    const updated = normalizeAccountPermissions({ ...user, ...patch });
    setUsers(users.map((item) => (item.id === user.id ? updated : item)));

    if (useLocalPreview) return;

    try {
      await apiFetch(`/api/users/${user.id}`, {
        method: "PATCH",
        body: JSON.stringify(patch),
      });
    } catch (err) {
      setError(err.message);
      setUsers(users);
    }
  }

  async function changeOwnPassword() {
    setError("");
    setNotice("");

    if (passwordDraft.newPassword.length < 8) {
      setError("新密碼至少需要 8 碼");
      return;
    }
    if (passwordDraft.newPassword !== passwordDraft.confirmPassword) {
      setError("兩次輸入的新密碼不一致");
      return;
    }

    if (useLocalPreview) {
      setPasswordDraft({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setNotice("本機預覽已模擬更新密碼");
      return;
    }

    try {
      setBusy("change-password");
      await apiFetch("/api/auth/password", {
        method: "POST",
        body: JSON.stringify({
          currentPassword: passwordDraft.currentPassword,
          newPassword: passwordDraft.newPassword,
        }),
      });
      setPasswordDraft({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setNotice("密碼已更新，下次登入請使用新密碼");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy("");
    }
  }

  async function saveProfileName() {
    const name = profileName.trim();
    setError("");
    setNotice("");

    if (!name) {
      setError("請輸入暱稱");
      return;
    }

    if (useLocalPreview) {
      onUserUpdate?.({ ...currentUser, name });
      setNotice("本機預覽已模擬更新暱稱");
      return;
    }

    try {
      setBusy("profile-name");
      const data = await apiFetch("/api/auth/profile", {
        method: "PATCH",
        body: JSON.stringify({ name }),
      });
      setUsers(
        users.map((user) =>
          user.id === data.user.id ? normalizeAccountPermissions({ ...user, ...data.user }) : user,
        ),
      );
      onUserUpdate?.(data.user);
      setNotice("暱稱已更新，重新整理或下次登入後會套用到全站");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy("");
    }
  }

  async function resetUserPassword(user) {
    const password = resetDrafts[user.id] || "";
    setError("");
    setNotice("");

    if (password.length < 8) {
      setError("重設密碼至少需要 8 碼");
      return;
    }

    if (useLocalPreview) {
      setResetDrafts({ ...resetDrafts, [user.id]: "" });
      setNotice(`已模擬重設 ${user.email} 的密碼`);
      return;
    }

    try {
      setBusy(`reset-${user.id}`);
      await apiFetch(`/api/users/${user.id}`, {
        method: "PATCH",
        body: JSON.stringify({ password }),
      });
      setResetDrafts({ ...resetDrafts, [user.id]: "" });
      setNotice(`已重設 ${user.email} 的密碼`);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy("");
    }
  }

  async function removeUser(user) {
    if (user.role === "admin") return;
    if (!window.confirm(`確定刪除帳號「${user.email}」？`)) return;

    setError("");
    setNotice("");
    setUsers(users.filter((item) => item.id !== user.id));

    if (useLocalPreview) return;

    try {
      await apiFetch(`/api/users/${user.id}`, { method: "DELETE" });
    } catch (err) {
      setError(err.message);
      setUsers(users);
    }
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => onOpenChange(!open)}
        className="fixed right-4 top-4 z-50 inline-flex items-center gap-2 rounded-full border bg-white px-4 py-2 text-sm font-medium text-slate-900 shadow-lg hover:bg-slate-50"
      >
        {isSystemAdmin ? <ShieldCheck className="h-4 w-4" /> : <UserRound className="h-4 w-4" />}
        {isSystemAdmin ? "系統管理" : "帳號設定"}
      </button>

      {open ? isSystemAdmin ? (
        <div ref={panelRef} className="fixed inset-0 z-50 overflow-auto bg-slate-50">
          <div className="sticky top-0 z-10 border-b bg-white/95 p-4 shadow-sm backdrop-blur">
            <div className="mx-auto flex max-w-7xl items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold">系統管理中心</h2>
                <p className="mt-1 text-sm text-slate-500">
                  僅最高權限系統管理員可使用｜目前管理者：{currentUser?.name || "管理員"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="rounded-xl border bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                返回系統
              </button>
            </div>
          </div>

          <div className="mx-auto max-w-7xl p-4">
            {error ? (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            ) : null}
            {notice ? (
              <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                {notice}
              </div>
            ) : null}

            <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Stat title="註冊帳號" value={users.length} desc="系統內全部帳號" icon={UserRound} />
              <Stat title="已驗證信箱" value={verifiedCount} desc="包含系統管理員" icon={ShieldCheck} />
              <Stat title="有登入紀錄" value={activeCount} desc="依最後登入時間統計" icon={LogIn} />
              <Stat title="建立工地" value={totalProjects} desc="所有帳號建立總數" icon={Building2} />
            </div>

            <Card className="mb-4">
              <CardContent className="grid gap-3 p-4 lg:grid-cols-[1fr_auto]">
                <div className="flex items-center gap-3 rounded-2xl border bg-slate-50 px-3 py-2">
                  <Search className="h-5 w-5 text-slate-400" />
                  <input
                    value={accountQuery}
                    onChange={(event) => setAccountQuery(event.target.value)}
                    className="w-full bg-transparent text-sm outline-none"
                    placeholder="搜尋暱稱、Email、所屬單位、角色或驗證狀態"
                  />
                </div>
                <Button type="button" variant="outline" onClick={() => setAccountQuery("")}>
                  清除搜尋
                </Button>
              </CardContent>
            </Card>

            <div className="grid gap-3">
              <AccordionSection
                title="目前帳號設定"
                desc={`${currentUser?.name || "使用者"}｜${currentUser?.organizationName || "未設定單位"}｜${currentUser?.email || "未登入"}`}
                open={sections.account}
                onToggle={() => toggleSection("account")}
              >
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                  <div>
                    <h3 className="font-bold">個人設定</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      修改暱稱、變更密碼或登出目前帳號。
                    </p>
                  </div>
                  <Button type="button" variant="outline" onClick={onLogout} className="w-full sm:w-auto">
                    <LogOut className="mr-2 h-4 w-4" />
                    登出帳號
                  </Button>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
                  <Input
                    value={profileName}
                    onChange={setProfileName}
                    ph="暱稱"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={saveProfileName}
                    disabled={busy === "profile-name"}
                  >
                    {busy === "profile-name" ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    儲存暱稱
                  </Button>
                </div>
                <div className="mt-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setPasswordOpen(!passwordOpen)}
                    className="w-full sm:w-auto"
                  >
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    {passwordOpen ? "收合密碼變更" : "變更密碼"}
                  </Button>
                </div>
                {passwordOpen ? (
                  <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                    <div className="grid gap-3 md:grid-cols-3">
                      <Input
                        type="password"
                        value={passwordDraft.currentPassword}
                        onChange={(value) =>
                          setPasswordDraft({ ...passwordDraft, currentPassword: value })
                        }
                        ph="目前密碼"
                      />
                      <Input
                        type="password"
                        value={passwordDraft.newPassword}
                        onChange={(value) =>
                          setPasswordDraft({ ...passwordDraft, newPassword: value })
                        }
                        ph="新密碼，至少 8 碼"
                      />
                      <Input
                        type="password"
                        value={passwordDraft.confirmPassword}
                        onChange={(value) =>
                          setPasswordDraft({ ...passwordDraft, confirmPassword: value })
                        }
                        ph="再次輸入新密碼"
                      />
                    </div>
                    <div className="mt-3 flex justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={changeOwnPassword}
                        disabled={busy === "change-password"}
                      >
                        {busy === "change-password" ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <ShieldCheck className="mr-2 h-4 w-4" />
                        )}
                        更新密碼
                      </Button>
                    </div>
                  </div>
                ) : null}
              </AccordionSection>

              <AccordionSection
                title="新增帳號"
                desc="建立新使用者並設定初始權限"
                meta={draft.role === "admin" ? "管理員" : "一般帳號"}
                open={sections.create}
                onToggle={() => toggleSection("create")}
              >
                <div className="grid gap-3 rounded-2xl bg-slate-50 p-4 md:grid-cols-2">
                  <Input
                    value={draft.name}
                    onChange={(value) => setDraft({ ...draft, name: value })}
                    ph="暱稱"
                  />
                  <Input
                    value={draft.email}
                    onChange={(value) => setDraft({ ...draft, email: value })}
                    ph="Email 帳號"
                  />
                  <select
                    value={draft.organizationName}
                    onChange={(event) =>
                      setDraft({ ...draft, organizationName: event.target.value })
                    }
                    className="w-full rounded-xl border bg-white px-3 py-2 outline-none"
                  >
                    {organizationOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <Input
                    type="password"
                    value={draft.password}
                    onChange={(value) => setDraft({ ...draft, password: value })}
                    ph="初始密碼"
                  />
                  <select
                    value={draft.role}
                    onChange={(event) =>
                      setDraft(normalizeAccountPermissions({ ...draft, role: event.target.value }))
                    }
                    className="w-full rounded-xl border bg-white px-3 py-2 outline-none"
                  >
                    <option value="member">一般帳號</option>
                    <option value="admin">管理員</option>
                  </select>
                  <label className="flex items-center gap-2 rounded-xl border bg-white px-3 py-2 text-sm">
                    <input
                      type="checkbox"
                      checked={draft.role === "admin" || draft.canView}
                      disabled={draft.role === "admin"}
                      onChange={(event) =>
                        setDraft(normalizeAccountPermissions({ ...draft, canView: event.target.checked }))
                      }
                    />
                    開啟閱覽
                  </label>
                  <label className="flex items-center gap-2 rounded-xl border bg-white px-3 py-2 text-sm">
                    <input
                      type="checkbox"
                      checked={draft.role === "admin" || draft.canEdit}
                      disabled={draft.role === "admin" || !draft.canView}
                      onChange={(event) =>
                        setDraft(normalizeAccountPermissions({ ...draft, canEdit: event.target.checked }))
                      }
                    />
                    開啟編輯
                  </label>
                  <div className="md:col-span-2">
                    <Button type="button" onClick={saveUser} disabled={busy === "create-user"}>
                      {busy === "create-user" ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Plus className="mr-2 h-4 w-4" />
                      )}
                      新增帳號
                    </Button>
                  </div>
                </div>
              </AccordionSection>

              <AccordionSection
                title="帳號列表"
                desc="搜尋、查看帳號建立工地數與最後登入時間，並調整角色、權限或密碼"
                meta={`${filteredUsers.length}/${users.length} 個帳號`}
                open={sections.users}
                onToggle={() => toggleSection("users")}
              >
                <div className="grid gap-3">
              {filteredUsers.map((user) => {
                const isAdmin = user.role === "admin";
                const userOpen = openUserId === user.id;
                return (
                <div key={user.id} className="rounded-2xl border p-4">
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                    <button
                      type="button"
                      onClick={() => setOpenUserId(userOpen ? "" : user.id)}
                      className="min-w-0 flex-1 text-left"
                      aria-expanded={userOpen}
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold">{user.name}</h3>
                        {user.organizationName ? <Badge>{user.organizationName}</Badge> : null}
                        <Badge>{isAdmin ? "管理員" : "一般帳號"}</Badge>
                        {isAdmin ? <Badge>最高權限</Badge> : null}
                        {!isAdmin ? <Badge>{user.canEdit ? "可編輯" : user.canView ? "僅閱覽" : "未開放"}</Badge> : null}
                        {!isAdmin ? (
                          <Badge>{user.emailVerified ? "信箱已驗證" : "待信箱驗證"}</Badge>
                        ) : null}
                      </div>
                      <p className="mt-1 text-sm text-slate-500">{user.email}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        所屬單位：{user.organizationName || "未設定"}｜建立工地 {Number(user.createdProjectCount || 0)} 個｜最後登入：{formatDateTime(user.lastLoginAt)}
                      </p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setOpenUserId(userOpen ? "" : user.id)}
                      className="flex items-center justify-center rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                      aria-label={userOpen ? "收合帳號設定" : "展開帳號設定"}
                    >
                      <ChevronRight className={`h-5 w-5 transition ${userOpen ? "rotate-90" : ""}`} />
                    </button>
                  </div>
                  {userOpen ? (
                  <>
                  <div className="mt-4 grid gap-2 rounded-2xl bg-slate-50 p-4 text-sm sm:grid-cols-2 xl:grid-cols-5">
                    <div>
                      <p className="text-xs font-medium text-slate-500">建立工地</p>
                      <p className="mt-1 font-bold">{Number(user.createdProjectCount || 0)} 個</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500">所屬單位</p>
                      <p className="mt-1 font-bold">{user.organizationName || "未設定"}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500">最後登入</p>
                      <p className="mt-1 font-bold">{formatDateTime(user.lastLoginAt)}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500">建立帳號時間</p>
                      <p className="mt-1 font-bold">{formatDateTime(user.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500">信箱驗證</p>
                      <p className="mt-1 font-bold">{user.emailVerified ? "已驗證" : "尚未驗證"}</p>
                    </div>
                  </div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-3">
                    <select
                      value={user.role}
                      onChange={(event) => updatePermission(user, { role: event.target.value })}
                      disabled={isAdmin}
                      className="rounded-xl border bg-white px-3 py-2 text-sm outline-none disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
                    >
                      <option value="member">一般帳號</option>
                      <option value="admin">管理員</option>
                    </select>
                    <label className="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm">
                      <input
                        type="checkbox"
                        checked={isAdmin || Boolean(user.canView)}
                        disabled={isAdmin}
                        onChange={(event) => updatePermission(user, { canView: event.target.checked })}
                      />
                      閱覽
                    </label>
                    <label className="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm">
                      <input
                        type="checkbox"
                        checked={isAdmin || Boolean(user.canEdit)}
                        disabled={isAdmin || !user.canView}
                        onChange={(event) => updatePermission(user, { canEdit: event.target.checked })}
                      />
                      編輯
                    </label>
                  </div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto]">
                    <Input
                      type="password"
                      value={resetDrafts[user.id] || ""}
                      onChange={(value) =>
                        setResetDrafts({ ...resetDrafts, [user.id]: value })
                      }
                      ph="重設密碼，至少 8 碼"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => resetUserPassword(user)}
                      disabled={busy === `reset-${user.id}`}
                    >
                      {busy === `reset-${user.id}` ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <ShieldCheck className="mr-2 h-4 w-4" />
                      )}
                      重設密碼
                    </Button>
                  </div>
                  {!isAdmin && !user.emailVerified ? (
                    <div className="mt-3 flex justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => resendUserVerification(user)}
                        disabled={busy === `verify-${user.id}`}
                      >
                        {busy === `verify-${user.id}` ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <ShieldCheck className="mr-2 h-4 w-4" />
                        )}
                        重寄驗證信
                      </Button>
                    </div>
                  ) : null}
                  <div className="mt-3 flex justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => removeUser(user)}
                      disabled={isAdmin}
                      className="h-8 rounded-lg px-2 text-xs text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Trash2 className="mr-1 h-3.5 w-3.5" />
                      刪除帳號
                    </Button>
                  </div>
                  </>
                  ) : null}
                </div>
                );
              })}
                </div>
              </AccordionSection>
            </div>
          </div>
        </div>
      ) : (
        <div ref={panelRef} className="fixed right-4 top-16 z-50 w-[calc(100vw-2rem)] max-w-md rounded-2xl border bg-white shadow-xl">
          <div className="border-b p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold">帳號設定</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {currentUser?.name || "使用者"}｜{currentUser?.organizationName || "未設定單位"}｜{currentUser?.email || "未登入"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="rounded-lg px-2 py-1 text-sm text-slate-500 hover:bg-slate-100"
              >
                關閉
              </button>
            </div>
          </div>
          <div className="p-4">
            {error ? (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            ) : null}
            {notice ? (
              <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                {notice}
              </div>
            ) : null}
            <div className="grid gap-3">
              <label>
                <span className="text-sm font-medium">暱稱</span>
                <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_auto]">
                  <Input value={profileName} onChange={setProfileName} ph="暱稱" />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={saveProfileName}
                    disabled={busy === "profile-name"}
                  >
                    {busy === "profile-name" ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    儲存
                  </Button>
                </div>
              </label>

              <Button
                type="button"
                variant="outline"
                onClick={() => setPasswordOpen(!passwordOpen)}
                className="w-full"
              >
                <ShieldCheck className="mr-2 h-4 w-4" />
                {passwordOpen ? "收合密碼變更" : "變更密碼"}
              </Button>

              {passwordOpen ? (
                <div className="grid gap-3 rounded-2xl bg-slate-50 p-4">
                  <Input
                    type="password"
                    value={passwordDraft.currentPassword}
                    onChange={(value) =>
                      setPasswordDraft({ ...passwordDraft, currentPassword: value })
                    }
                    ph="目前密碼"
                  />
                  <Input
                    type="password"
                    value={passwordDraft.newPassword}
                    onChange={(value) =>
                      setPasswordDraft({ ...passwordDraft, newPassword: value })
                    }
                    ph="新密碼，至少 8 碼"
                  />
                  <Input
                    type="password"
                    value={passwordDraft.confirmPassword}
                    onChange={(value) =>
                      setPasswordDraft({ ...passwordDraft, confirmPassword: value })
                    }
                    ph="再次輸入新密碼"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={changeOwnPassword}
                    disabled={busy === "change-password"}
                  >
                    {busy === "change-password" ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <ShieldCheck className="mr-2 h-4 w-4" />
                    )}
                    更新密碼
                  </Button>
                </div>
              ) : null}

              <Button type="button" variant="outline" onClick={onLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                登出帳號
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

export default function App() {
  const [auth, setAuth] = useState(
    useLocalPreview
      ? { loading: false, user: previewUser }
      : { loading: true, user: null },
  );
  const [active, setActive] = useState("dashboard");
  const [p, setP] = useState(null);
  const [claims, setClaims] = useState(claimSeed);
  const [contractItems, setContractItems] = useState(contractSeed);
  const [memoItems, setMemoItems] = useState(memos);
  const [scheduleItems, setScheduleItems] = useState(scheduleSeed);
  const [todoItems, setTodoItems] = useState(todoSeed);
  const [moduleListOpen, setModuleListOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);

  useEffect(() => {
    if (useLocalPreview) return;

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
    if (useLocalPreview) {
      setP(null);
      setActive("dashboard");
      setModuleListOpen(false);
      setAdminOpen(false);
      return;
    }

    await apiFetch("/api/auth/logout", { method: "POST" }).catch(() => null);
    setP(null);
    setActive("dashboard");
    setModuleListOpen(false);
    setAdminOpen(false);
    setAuth({ loading: false, user: null });
  }

  function closeAdminPanel() {
    if (adminOpen) setAdminOpen(false);
  }

  const page = useMemo(() => {
    if (!p) return null;
    const projectContracts = contractItems.filter((item) => matchesProject(item, p));
    const projectClaims = claims.filter((item) => matchesProject(item, p));
    const projectMemos = memoItems.filter((item) => matchesProject(item, p));
    const projectScheduleItems = scheduleItems.filter((item) => matchesProject(item, p));
    const projectTodoItems = todoItems.filter((item) => matchesProject(item, p));

    if (active === "manual") return <Manual />;
    if (active === "dashboard") {
      return (
        <Dashboard
          p={p}
          claims={projectClaims}
          memoItems={projectMemos}
          todoItems={projectTodoItems}
          contractItems={projectContracts}
        />
      );
    }
    if (active === "claims") return <Claims p={p} claims={projectClaims} setClaims={setClaims} allClaims={claims} />;
    if (active === "contracts") {
      return (
        <Contracts
          p={p}
          items={projectContracts}
          onSave={(item) => setContractItems([item, ...contractItems])}
          onDelete={(id) => setContractItems(contractItems.filter((item) => item.id !== id))}
        />
      );
    }
    if (active === "memos") {
      return (
        <Memos
          p={p}
          items={projectMemos}
          onSave={(item) => setMemoItems([item, ...memoItems])}
          onDelete={(id) => setMemoItems(memoItems.filter((item) => item.id !== id))}
        />
      );
    }
    if (active === "checklists") return <Checklists p={p} />;
    if (active === "schedule") {
      return (
        <Schedule
          p={p}
          items={projectScheduleItems}
          onSave={(item) => setScheduleItems([item, ...scheduleItems])}
          onDelete={(id) => setScheduleItems(scheduleItems.filter((item) => item.id !== id))}
        />
      );
    }
    if (active === "daily") return <Daily p={p} />;
    if (active === "defects") return <Defects p={p} />;
    if (active === "todos") {
      return (
        <Todos
          p={p}
          items={projectTodoItems}
          onSave={(item) => setTodoItems([item, ...todoItems])}
          onDelete={(id) => setTodoItems(todoItems.filter((item) => item.id !== id))}
        />
      );
    }
    return <Placeholder title={mods.find((x) => x.id === active)?.label || "模組"} />;
  }, [active, p, claims, contractItems, memoItems, scheduleItems, todoItems]);

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
      <>
        <AdminPanel
          currentUser={auth.user}
          onLogout={handleLogout}
          onUserUpdate={(user) => setAuth((current) => ({ ...current, user }))}
          open={adminOpen}
          onOpenChange={setAdminOpen}
        />
        <div onPointerDownCapture={closeAdminPanel}>
          <ProjectSelect
            onSelect={(project) => {
              setP(project);
              setActive("dashboard");
              setModuleListOpen(false);
            }}
          />
        </div>
      </>
    );
  }

  const activeModule = mods.find((x) => x.id === active) || mods[0];
  const ActiveModuleIcon = activeModule.icon;

  return (
    <>
      <AdminPanel
        currentUser={auth.user}
        onLogout={handleLogout}
        onUserUpdate={(user) => setAuth((current) => ({ ...current, user }))}
        open={adminOpen}
        onOpenChange={setAdminOpen}
      />
      <div onPointerDownCapture={closeAdminPanel} className="min-h-screen bg-slate-50 text-slate-900">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 p-4 lg:flex-row">
        <aside className="lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)] lg:w-72">
          <Card className="h-full rounded-2xl">
            <CardContent className="flex h-full flex-col p-4">
              <div className="mb-4 overflow-hidden rounded-2xl bg-slate-950 text-white shadow-sm">
                <div className="border-b border-white/10 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-2 text-xs font-medium text-slate-300">
                      <Building2 className="h-4 w-4" />
                      目前工地
                    </span>
                  </div>
                  <h2 className="mt-3 break-words text-xl font-bold leading-snug">{p.name}</h2>
                  <p className="mt-2 flex items-start gap-1.5 text-xs leading-5 text-slate-300">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span>{p.address || "未填寫地址"}</span>
                  </p>
                  <p className="mt-2 flex items-start gap-1.5 text-xs leading-5 text-slate-300">
                    <UserRound className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span>
                      建立者：{p.createdByName || "系統管理員"}
                      {p.memberRole ? `｜我的權限：${projectMemberRoleLabel(p.memberRole)}` : ""}
                    </span>
                  </p>
                  <label className="mt-4 block">
                    <span className="text-xs font-medium text-slate-400">工地狀態</span>
                    <CustomSelect
                      value={p.status}
                      onChange={(status) => setP({ ...p, status })}
                      options={projectStatusOptions}
                      className="mt-2 space-y-2"
                      selectClassName="border-white/10 bg-white/10 text-sm text-white"
                      otherPlaceholder="請輸入自訂工地狀態"
                    />
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-2 p-4 text-xs">
                  <div className="rounded-xl bg-white/10 p-3">
                    <p className="text-slate-400">開工日期</p>
                    <p className="mt-1 font-semibold text-slate-50">{formatDate(p.startDate)}</p>
                  </div>
                  <div className="rounded-xl bg-white/10 p-3">
                    <p className="text-slate-400">預計完工</p>
                    <p className="mt-1 font-semibold text-slate-50">{formatDate(p.endDate)}</p>
                  </div>
                  <div className="rounded-xl bg-white/10 p-3">
                    <p className="text-slate-400">累計天數</p>
                    <p className="mt-1 font-semibold text-slate-50">{countWorkDays(p.startDate)} 天</p>
                  </div>
                  <div className="rounded-xl bg-white/10 p-3">
                    <p className="text-slate-400">目前功能</p>
                    <p className="mt-1 truncate font-semibold text-slate-50">{activeModule.label}</p>
                  </div>
                </div>
                {!useLocalPreview ? (
                  <div className="mx-4 mb-3 flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-xs text-slate-300">
                    <UserRound className="h-3.5 w-3.5" />
                    <span className="truncate">{auth.user.name}｜{auth.user.role}</span>
                  </div>
                ) : null}
                <div className="px-4 pb-4">
                  <button
                    type="button"
                    onClick={() => setP(null)}
                    className="group flex w-full items-center justify-between gap-3 rounded-xl bg-white px-3 py-3 text-left text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                  >
                    <span>
                      <span className="block">返回主頁切換工地</span>
                      <span className="mt-0.5 block text-xs font-normal text-slate-500">
                        選擇其他案場或新增工地
                      </span>
                    </span>
                    <ChevronRight className="h-5 w-5 shrink-0 text-slate-500 transition group-hover:translate-x-0.5" />
                  </button>
                </div>
              </div>
              <button
                type="button"
                aria-expanded={moduleListOpen}
                onClick={() => setModuleListOpen(!moduleListOpen)}
                className="flex w-full items-center justify-between rounded-xl border bg-white px-3 py-3 text-left text-sm font-medium text-slate-900 hover:bg-slate-50"
              >
                <span className="flex min-w-0 items-center gap-3">
                  <ActiveModuleIcon className="h-5 w-5 shrink-0" />
                  <span className="min-w-0">
                    <span className="block text-xs text-slate-500">功能列表</span>
                    <span className="block truncate">{activeModule.label}</span>
                  </span>
                </span>
                <ChevronRight
                  className={`h-5 w-5 shrink-0 text-slate-500 transition ${
                    moduleListOpen ? "rotate-90" : ""
                  }`}
                />
              </button>
              <nav className={`${moduleListOpen ? "grid" : "hidden"} mt-3 gap-2`}>
                {mods.map((m) => {
                  const Icon = m.icon;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        setActive(m.id);
                        setModuleListOpen(false);
                      }}
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
              <VersionFooter className="mt-auto pt-4" />
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
    </>
  );
}
