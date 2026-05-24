import { requireUser } from "./auth.js";
import { findUserById } from "./db.js";
import { ApiError } from "./http.js";

export async function requirePermission(request, permission) {
  const sessionUser = requireUser(request);
  const user = await findUserById(sessionUser.id);

  if (!user) {
    throw new ApiError(401, "請重新登入", "SESSION_USER_NOT_FOUND");
  }

  if (user.role === "admin") return user;

  if (permission === "view" && !user.can_view) {
    throw new ApiError(403, "此帳號尚未開啟閱覽權限", "VIEW_PERMISSION_REQUIRED");
  }

  if (permission === "edit" && !user.can_edit) {
    throw new ApiError(403, "此帳號尚未開啟編輯權限", "EDIT_PERMISSION_REQUIRED");
  }

  return user;
}
