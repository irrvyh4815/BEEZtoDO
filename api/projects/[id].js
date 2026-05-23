import { requireUser } from "../_lib/auth.js";
import { deleteProject, ensureSchema } from "../_lib/db.js";
import { ApiError, json, jsonError, methodNotAllowed } from "../_lib/http.js";

export default {
  async fetch(request) {
    if (request.method !== "DELETE") return methodNotAllowed(["DELETE"]);

    try {
      requireUser(request);
      await ensureSchema();

      const id = new URL(request.url).pathname.split("/").pop();
      const deleted = await deleteProject(id);

      if (!deleted) {
        throw new ApiError(404, "找不到工地資料", "PROJECT_NOT_FOUND");
      }

      return json({ ok: true });
    } catch (error) {
      return jsonError(error);
    }
  },
};
