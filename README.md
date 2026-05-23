# EZtoDO 工程管理 React 原型

這是一個以 Vite、React、Tailwind CSS、framer-motion、lucide-react 整理出的可執行前端專案。

## 開發

```bash
npm install
npm run dev
```

預設開發網址：

```text
http://127.0.0.1:5173
```

如果 Windows PowerShell 擋住 `npm.ps1`，可改用：

```powershell
npm.cmd run dev
```

本專案的登入與資料庫 API 放在 `api/`，部署到 Vercel 後會以 Vercel Functions 執行。若要在本機完整測試 `/api`，請使用 Vercel CLI：

```bash
vercel dev
```

## 建置

```bash
npm run build
```

## Vercel 環境變數

在 Vercel 專案的 Environment Variables 設定以下變數：

```text
DATABASE_URL=postgres://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require
AUTH_SECRET=一串很長的隨機字串
ADMIN_EMAIL=admin@eztodo.local
ADMIN_PASSWORD=Admin@123456
ADMIN_NAME=系統管理員
SESSION_DAYS=7
```

`DATABASE_URL` 可來自 Vercel Marketplace 的 Postgres 服務，例如 Neon、Supabase 或其他 PostgreSQL provider。部分 provider 也會注入 `POSTGRES_URL`，程式會同時支援 `DATABASE_URL` 與 `POSTGRES_URL`。

第一次登入時，系統會自動建立資料表，並建立預設管理員。

預設管理員：

```text
帳號：admin@eztodo.local
密碼：Admin@123456
```

正式上線前請務必在 Vercel 將 `ADMIN_PASSWORD` 改成自己的強密碼，並使用新的 `AUTH_SECRET`。
