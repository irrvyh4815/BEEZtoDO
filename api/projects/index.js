import { ensureSchema, insertProject, listProjects } from "../_lib/db.js";
import {
  ApiError,
  json,
  jsonError,
  methodNotAllowed,
  readJson,
} from "../_lib/http.js";
import { requirePermission } from "../_lib/permissions.js";

export default {
  async fetch(request) {
    if (!["GET", "POST"].includes(request.method)) {
      return methodNotAllowed(["GET", "POST"]);
    }

    try {
      await ensureSchema();
      await requirePermission(request, request.method === "GET" ? "view" : "edit");

      if (request.method === "GET") {
        return json({ projects: await listProjects() });
      }

      const body = await readJson(request);
      if (!body.name?.trim()) {
        throw new ApiError(400, "請輸入工地名稱", "PROJECT_NAME_REQUIRED");
      }

      return json({ project: await insertProject(body) }, 201);
    } catch (error) {
      return jsonError(error);
    }
  },
};
