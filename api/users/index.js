import { hashPassword, requireUser } from "../_lib/auth.js";
import { ensureSchema, insertUser, listUsers, mapUser } from "../_lib/db.js";
import {
  ApiError,
  json,
  jsonError,
  methodNotAllowed,
  readJson,
} from "../_lib/http.js";

function requireAdmin(request) {
  const user = requireUser(request);
  if (user.role !== "admin") {
    throw new ApiError(403, "需要管理員權限", "ADMIN_REQUIRED");
  }
  return user;
}

export default {
  async fetch(request) {
    if (!["GET", "POST"].includes(request.method)) {
      return methodNotAllowed(["GET", "POST"]);
    }

    try {
      requireAdmin(request);
      await ensureSchema();

      if (request.method === "GET") {
        return json({ users: await listUsers() });
      }

      const body = await readJson(request);
      if (!body.email?.trim() || !body.name?.trim() || !body.password) {
        throw new ApiError(400, "請輸入姓名、帳號與密碼", "USER_FIELDS_REQUIRED");
      }

      const user = await insertUser({
        email: body.email,
        name: body.name,
        passwordHash: await hashPassword(body.password),
        role: body.role || "member",
        canView: body.canView ?? true,
        canEdit: body.canEdit ?? false,
      });

      return json({ user: mapUser(user) }, 201);
    } catch (error) {
      return jsonError(error);
    }
  },
};
