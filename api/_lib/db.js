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

export function mapRecord(row) {
  return {
    id: row.id,
    projectId: row.project_id,
    module: row.module,
    title: row.title,
    status: row.status,
    payload: row.payload || {},
    attachments: row.attachments || [],
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapUser(row) {
  const isAdmin = row.role === "admin";
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    canView: isAdmin ? true : row.can_view,
    canEdit: isAdmin ? true : row.can_edit,
    createdAt: row.created_at,
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
    `insert into users (id, email, name, password_hash, role, can_view, can_edit)
     values ($1, lower($2), $3, $4, 'admin', true, true)`,
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
      role text not null default 'member',
      can_view boolean not null default true,
      can_edit boolean not null default false,
      created_at timestamptz not null default now()
    )
  `);

  await query("alter table users add column if not exists can_view boolean not null default true");
  await query("alter table users add column if not exists can_edit boolean not null default false");

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

  await query(`
    create table if not exists project_records (
      id text primary key,
      project_id text not null references projects(id) on delete cascade,
      module text not null,
      title text not null,
      status text not null default '',
      payload jsonb not null default '{}'::jsonb,
      attachments jsonb not null default '[]'::jsonb,
      created_by text references users(id) on delete set null,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )
  `);

  await query(`
    create index if not exists project_records_project_module_idx
    on project_records (project_id, module, created_at desc)
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

export async function findUserById(id) {
  const result = await query("select * from users where id = $1", [id]);
  return result.rows[0] || null;
}

export async function insertUser({
  email,
  name,
  passwordHash,
  role = "member",
  canView = true,
  canEdit = false,
}) {
  const normalizedRole = role === "admin" ? "admin" : "member";
  const normalizedCanView = normalizedRole === "admin" ? true : Boolean(canView);
  const normalizedCanEdit =
    normalizedRole === "admin" ? true : normalizedCanView && Boolean(canEdit);
  const result = await query(
    `insert into users (id, email, name, password_hash, role, can_view, can_edit)
     values ($1, lower($2), $3, $4, $5, $6, $7)
     returning *`,
    [
      randomUUID(),
      email,
      name,
      passwordHash,
      normalizedRole,
      normalizedCanView,
      normalizedCanEdit,
    ],
  );

  return result.rows[0];
}

export async function listUsers() {
  const result = await query(
    "select * from users order by role = 'admin' desc, created_at asc",
  );
  return result.rows.map(mapUser);
}

export async function updateUserPermissions(id, { role, canView, canEdit }) {
  const current = await findUserById(id);
  if (!current) return null;

  const nextRole =
    current.role === "admin" ? "admin" : role === "admin" ? "admin" : role || current.role;
  const requestedCanView = canView ?? current.can_view;
  const requestedCanEdit = canEdit ?? current.can_edit;
  const nextCanView = nextRole === "admin" ? true : Boolean(requestedCanView);
  const nextCanEdit =
    nextRole === "admin" ? true : nextCanView && Boolean(requestedCanEdit);

  const result = await query(
    `update users
     set role = $2,
         can_view = $3,
         can_edit = $4
     where id = $1
     returning *`,
    [id, nextRole, nextCanView, nextCanEdit],
  );

  return result.rows[0] ? mapUser(result.rows[0]) : null;
}

export async function deleteUser(id) {
  const result = await query("delete from users where id = $1 and role <> 'admin'", [id]);
  return result.rowCount > 0;
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

export async function listProjectRecords(projectId, module) {
  const params = [projectId];
  let where = "where project_id = $1";

  if (module) {
    params.push(module);
    where += " and module = $2";
  }

  const result = await query(
    `select * from project_records ${where} order by created_at desc`,
    params,
  );

  return result.rows.map(mapRecord);
}

export async function insertProjectRecord(projectId, record, userId) {
  const payload = record.payload || {};
  const attachments = record.attachments || [];
  const result = await query(
    `insert into project_records (
      id, project_id, module, title, status, payload, attachments, created_by
    )
    values ($1, $2, $3, $4, $5, $6::jsonb, $7::jsonb, $8)
    returning *`,
    [
      randomUUID(),
      projectId,
      record.module,
      record.title,
      record.status || "",
      JSON.stringify(payload),
      JSON.stringify(attachments),
      userId,
    ],
  );

  return mapRecord(result.rows[0]);
}

export async function deleteProjectRecord(projectId, recordId) {
  const result = await query(
    "delete from project_records where project_id = $1 and id = $2",
    [projectId, recordId],
  );
  return result.rowCount > 0;
}
