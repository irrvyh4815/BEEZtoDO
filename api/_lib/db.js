import pg from "pg";
import { randomUUID } from "node:crypto";
import { hashPassword } from "./auth.js";
import { ApiError } from "./http.js";

const { Pool } = pg;

const sampleProjects = [
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

function databaseUrl() {
  return process.env.DATABASE_URL || process.env.POSTGRES_URL;
}

function isProductionLike() {
  return Boolean(process.env.VERCEL || process.env.NODE_ENV === "production");
}

function getPool() {
  const connectionString = databaseUrl();

  if (!connectionString) {
    throw new ApiError(
      500,
      "尚未設定 DATABASE_URL 或 POSTGRES_URL",
      "DATABASE_URL_MISSING",
    );
  }

  if (!globalThis.__eztodoPool) {
    const usesLocalDb = /localhost|127\.0\.0\.1/i.test(connectionString);
    globalThis.__eztodoPool = new Pool({
      connectionString,
      max: 5,
      ssl: usesLocalDb ? false : { rejectUnauthorized: false },
    });
  }

  return globalThis.__eztodoPool;
}

export async function query(text, params = []) {
  return getPool().query(text, params);
}

export function mapProject(row) {
  return {
    id: row.id,
    name: row.name,
    owner: row.owner,
    status: row.status,
    address: row.address,
    defects: row.defects,
    dailyPhotos: row.daily_photos,
    nextClaim: row.next_claim,
    startDate: row.start_date,
    endDate: row.end_date,
    manager: row.manager,
    note: row.note,
  };
}

async function seedAdmin() {
  const email =
    process.env.ADMIN_EMAIL || (!isProductionLike() ? "admin@eztodo.local" : "");
  const password =
    process.env.ADMIN_PASSWORD || (!isProductionLike() ? "Admin@123456" : "");
  const name = process.env.ADMIN_NAME || "系統管理員";

  if (!email || !password) {
    throw new ApiError(
      500,
      "尚未設定預設管理員帳密，請設定 ADMIN_EMAIL 與 ADMIN_PASSWORD",
      "ADMIN_SEED_MISSING",
    );
  }

  const existing = await query("select id from users where lower(email) = lower($1)", [
    email,
  ]);
  if (existing.rowCount > 0) return;

  await query(
    `insert into users (id, email, name, password_hash, role)
     values ($1, lower($2), $3, $4, 'admin')`,
    [randomUUID(), email, name, await hashPassword(password)],
  );
}

async function seedProjects() {
  const existing = await query("select count(*)::int as count from projects");
  if (existing.rows[0].count > 0) return;

  for (const project of sampleProjects) {
    await insertProject(project);
  }
}

async function initializeSchema() {
  await query(`
    create table if not exists users (
      id text primary key,
      email text unique not null,
      name text not null,
      password_hash text not null,
      role text not null default 'admin',
      created_at timestamptz not null default now()
    )
  `);

  await query(`
    create table if not exists projects (
      id text primary key,
      name text not null,
      owner text not null default '',
      status text not null default '進行中',
      address text not null default '',
      defects integer not null default 0,
      daily_photos integer not null default 0,
      next_claim text not null default '',
      start_date text not null default '',
      end_date text not null default '',
      manager text not null default '',
      note text not null default '',
      created_at timestamptz not null default now()
    )
  `);

  await seedAdmin();
  await seedProjects();
}

export async function ensureSchema() {
  if (!globalThis.__eztodoSchemaPromise) {
    globalThis.__eztodoSchemaPromise = initializeSchema();
  }

  try {
    await globalThis.__eztodoSchemaPromise;
  } catch (error) {
    globalThis.__eztodoSchemaPromise = null;
    throw error;
  }
}

export async function findUserByEmail(email) {
  const result = await query("select * from users where lower(email) = lower($1)", [
    email,
  ]);
  return result.rows[0] || null;
}

export async function listProjects() {
  const result = await query("select * from projects order by created_at asc");
  return result.rows.map(mapProject);
}

export async function insertProject(project) {
  const result = await query(
    `insert into projects (
      id, name, owner, status, address, defects, daily_photos, next_claim,
      start_date, end_date, manager, note
    )
    values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    returning *`,
    [
      randomUUID(),
      project.name || "未命名工地",
      project.owner || "未填寫",
      project.status || "進行中",
      project.address || "未填寫地址",
      Number(project.defects || 0),
      Number(project.dailyPhotos || 0),
      project.nextClaim || "2026/05",
      project.startDate || "",
      project.endDate || "",
      project.manager || "",
      project.note || "",
    ],
  );

  return mapProject(result.rows[0]);
}

export async function deleteProject(id) {
  const result = await query("delete from projects where id = $1", [id]);
  return result.rowCount > 0;
}
