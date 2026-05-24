# EZtoDO 資料庫與 API 對接筆記

這份文件描述目前專案整理好的資料模型。前端表單先用本機暫存，正式部署時可逐步改成呼叫這裡的 API。

## 核心資料表

### `users`

帳號資料與登入驗證。

| 欄位 | 型別 | 說明 |
| --- | --- | --- |
| `id` | `text` | 使用者 ID |
| `email` | `text` | 登入帳號，唯一 |
| `name` | `text` | 使用者姓名 |
| `password_hash` | `text` | bcrypt hash 後的密碼 |
| `role` | `text` | `admin` 或 `member` |
| `can_view` | `boolean` | 是否可閱覽資料 |
| `can_edit` | `boolean` | 是否可新增、修改、刪除資料 |
| `created_at` | `timestamptz` | 建立時間 |

`admin` 永遠視為最高權限，後端會強制 `can_view = true`、`can_edit = true`，且不可透過權限管理降權或刪除。`member` 才會依照 `can_view` / `can_edit` 控制閱覽與編輯；若 `can_view = false`，後端也會一併關閉 `can_edit`。

### `projects`

工地主檔。

| 欄位 | 型別 | 前端欄位 |
| --- | --- | --- |
| `id` | `text` | `project.id` |
| `name` | `text` | 工地名稱 |
| `owner` | `text` | 業主 / 客戶 |
| `status` | `text` | `籌備中`、`進行中`、`收尾中`、`暫停`、`結案` |
| `address` | `text` | 工地地址 |
| `defects` | `integer` | 缺失數 |
| `daily_photos` | `integer` | 照片數 |
| `next_claim` | `text` | 請款期 |
| `start_date` | `text` | 開工日期 |
| `end_date` | `text` | 預計完工日期 |
| `manager` | `text` | 工地主任 |
| `note` | `text` | 備註 |
| `created_at` | `timestamptz` | 建立時間 |

### `project_records`

工地內所有分項表單統一存這張表。這是為了先讓資料能快速落庫，等流程穩定後再決定是否拆成專表。

| 欄位 | 型別 | 說明 |
| --- | --- | --- |
| `id` | `text` | 紀錄 ID |
| `project_id` | `text` | 對應 `projects.id` |
| `module` | `text` | 模組代號，例如 `claims`、`memos`、`defects` |
| `title` | `text` | 卡片標題 / 搜尋用標題 |
| `status` | `text` | 狀態 |
| `payload` | `jsonb` | 該模組自己的表單欄位 |
| `attachments` | `jsonb` | 圖片附件 metadata |
| `created_by` | `text` | 建立者 `users.id` |
| `created_at` | `timestamptz` | 建立時間 |
| `updated_at` | `timestamptz` | 更新時間 |

## 模組代號建議

| 模組 | `module` |
| --- | --- |
| 工程合約 | `contracts` |
| 廠商請款 | `claims` |
| 工項 Memo | `memos` |
| 階段檢核表 | `checklists` |
| 預定進度 | `schedule` |
| 施工日報 | `daily` |
| 缺失改善 | `defects` |
| 材料庫存 | `materials` |
| 待辦事項 | `todos` |
| 照片中心 | `photos` |
| 重要公告 | `announcements` |

## 通用紀錄 payload 範例

### 廠商請款

```json
{
  "module": "claims",
  "title": "宏鑫水電 第 1 期",
  "status": "待付款",
  "payload": {
    "period": "第 1 期",
    "month": "2026/05",
    "trade": "水電工程",
    "vendor": "宏鑫水電",
    "contract": "水電配管工程",
    "amount": 185000
  },
  "attachments": []
}
```

### 工程合約

```json
{
  "module": "contracts",
  "title": "水電配管工程",
  "status": "執行中",
  "payload": {
    "name": "水電配管工程",
    "vendor": "宏鑫水電",
    "trade": "水電工程",
    "amount": 1200000,
    "contact": "張先生",
    "phone": "04-2222-1688",
    "email": "service@hongxin.example",
    "address": "台中市東區進德路 88 號",
    "note": "現場窗口負責配管與弱電協調。"
  },
  "attachments": []
}
```

總覽的「廠商資訊」會讀取 `contracts` 模組中的 `vendor`、`contact`、`phone`、`email` 等欄位，作為快速查找聯絡資訊的來源。

### 工項 Memo

```json
{
  "module": "memos",
  "title": "2F 管線路徑待確認",
  "status": "待確認",
  "payload": {
    "trade": "水電工程",
    "date": "2026-05-26",
    "note": "廚房排水與弱電箱位置需與業主確認後再封板。"
  },
  "attachments": []
}
```

總覽月曆會使用 `memos` 的 `payload.date` 顯示工項 Memo，並與待辦事項一起呈現。

### 缺失改善

```json
{
  "module": "defects",
  "title": "3F 主臥浴室 防水",
  "status": "待改善",
  "payload": {
    "location": "3F 主臥浴室",
    "type": "防水",
    "vendor": "永信防水",
    "due": "2026-05-25",
    "level": "重大"
  },
  "attachments": []
}
```

### 施工日報

```json
{
  "module": "daily",
  "title": "2026-05-24 施工日報",
  "status": "已暫存",
  "payload": {
    "date": "2026-05-24",
    "weather": "晴",
    "weatherNote": "",
    "work": [],
    "materials": [],
    "equipment": []
  },
  "attachments": []
}
```

### 預定進度

```json
{
  "module": "schedule",
  "title": "3F 防水完成",
  "status": "進行中",
  "payload": {
    "trade": "防水工班",
    "startDate": "2026-05-01",
    "endDate": "2026-05-10",
    "percent": 65,
    "note": "等試水完成後複驗"
  },
  "attachments": []
}
```

甘特圖會使用 `payload.trade` 作為 Y 軸工種列，並用 `payload.startDate` / `payload.endDate` 轉成 X 軸的工作天與日期。前端儲存預定進度表單後，會以同一份資料立即更新圖表。

## 圖片附件格式

目前前端使用 `blob:` 暫存網址，只能本機預覽。正式接資料庫時，圖片本體不要存進 Postgres，建議上傳到 Vercel Blob、S3、Supabase Storage 等物件儲存，再把 metadata 存進 `attachments`。

建議格式：

```json
[
  {
    "id": "uuid",
    "name": "3f-bathroom.jpg",
    "size": 245760,
    "mimeType": "image/jpeg",
    "url": "https://storage.example.com/3f-bathroom.jpg"
  }
]
```

## API

### 註冊帳號

`POST /api/auth/register`

```json
{
  "name": "Renault",
  "email": "renault@example.com",
  "password": "至少 8 碼"
}
```

### 登入

`POST /api/auth/login`

```json
{
  "email": "admin@eztodo.local",
  "password": "Admin@123456"
}
```

成功後會設定 HTTP-only cookie。

### 帳號與權限管理

需管理員登入。

`GET /api/users`

`POST /api/users`

```json
{
  "name": "王主任",
  "email": "site-manager@example.com",
  "password": "至少 8 碼",
  "role": "member",
  "canView": true,
  "canEdit": false
}
```

更新權限：

`PATCH /api/users/:id`

```json
{
  "canView": true,
  "canEdit": true,
  "role": "member"
}
```

管理員帳號即使送出 `canView: false` 或 `canEdit: false`，後端仍會回傳最高權限。一般帳號可由管理員切換閱覽與編輯權限。

刪除帳號：

`DELETE /api/users/:id`

### 工地

`GET /api/projects`

`POST /api/projects`

`DELETE /api/projects/:id`

### 工地內表單資料

查詢某工地全部紀錄：

`GET /api/projects/:projectId/records`

查詢某工地特定模組：

`GET /api/projects/:projectId/records?module=defects`

新增紀錄：

`POST /api/projects/:projectId/records`

```json
{
  "module": "defects",
  "title": "3F 主臥浴室 防水",
  "status": "待改善",
  "payload": {
    "location": "3F 主臥浴室",
    "type": "防水"
  },
  "attachments": []
}
```

刪除紀錄：

`DELETE /api/projects/:projectId/records/:recordId`

## 前端接 API 時的建議順序

1. 帳號註冊/登入：把本機預覽模式關閉，讓 `/api/auth/me` 成為進入系統的依據。
2. 工地主檔：`ProjectSelect` 改為完全讀寫 `/api/projects`。
3. 單一模組先接：建議先接 `defects`，因為欄位最明確。
4. 其他模組逐步改為 `project_records`。
5. 圖片附件最後接物件儲存，再把檔案 URL 寫回 `attachments`。
