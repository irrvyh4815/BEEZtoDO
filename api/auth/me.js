import { publicUser, requireUser } from "../_lib/auth.js";
import { ensureSchema, findUserById } from "../_lib/db.js";
import { ApiError, json, jsonError, methodNotAllowed } from "../_lib/http.js";

export default {
  async fetch(request) {
    if (request.method !== "GET") return methodNotAllowed(["GET"]);

    try {
      const sessionUser = requireUser(request);
      await ensureSchema();

      const user = await findUserById(sessionUser.id);
      if (!user) {
        throw new ApiError(401, "請重新登入", "SESSION_USER_NOT_FOUND");
      }

      return json({ user: publicUser(user) });
    } catch (error) {
      return jsonError(error);
    }
  },
};
