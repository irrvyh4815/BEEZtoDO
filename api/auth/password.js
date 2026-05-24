import {
  hashPassword,
  requireUser,
  verifyPassword,
} from "../_lib/auth.js";
import {
  ensureSchema,
  findUserById,
  updateUserPassword,
} from "../_lib/db.js";
import {
  ApiError,
  json,
  jsonError,
  methodNotAllowed,
  readJson,
} from "../_lib/http.js";

export default {
  async fetch(request) {
    if (request.method !== "POST") return methodNotAllowed(["POST"]);

    try {
      const sessionUser = requireUser(request);
      await ensureSchema();

      const { currentPassword, newPassword } = await readJson(request);
      if (!currentPassword || !newPassword) {
        throw new ApiError(400, "請輸入目前密碼與新密碼", "PASSWORD_FIELDS_REQUIRED");
      }
      if (newPassword.length < 8) {
        throw new ApiError(400, "新密碼至少需要 8 碼", "PASSWORD_TOO_SHORT");
      }

      const user = await findUserById(sessionUser.id);
      if (!user) {
        throw new ApiError(401, "請重新登入", "SESSION_USER_NOT_FOUND");
      }

      const valid = await verifyPassword(currentPassword, user.password_hash);
      if (!valid) {
        throw new ApiError(401, "目前密碼不正確", "INVALID_CURRENT_PASSWORD");
      }

      return json({
        user: await updateUserPassword(user.id, await hashPassword(newPassword)),
      });
    } catch (error) {
      return jsonError(error);
    }
  },
};
