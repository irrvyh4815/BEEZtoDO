import { deleteProjectRecord, ensureSchema } from "../../../_lib/db.js";
import { ApiError, json, jsonError, methodNotAllowed } from "../../../_lib/http.js";
import { requireProjectAccess } from "../../../_lib/permissions.js";

function idsFromUrl(url) {
  const parts = new URL(url).pathname.split("/").filter(Boolean);
  const projectIndex = parts.indexOf("projects");
  const recordsIndex = parts.indexOf("records");

  return {
    projectId: projectIndex >= 0 ? decodeURIComponent(parts[projectIndex + 1] || "") : "",
    recordId: recordsIndex >= 0 ? decodeURIComponent(parts[recordsIndex + 1] || "") : "",
  };
}

export default {
  async fetch(request) {
    if (request.method !== "DELETE") return methodNotAllowed(["DELETE"]);

    try {
      await ensureSchema();

      const { projectId, recordId } = idsFromUrl(request.url);
      if (!projectId || !recordId) {
        throw new ApiError(400, "缺少工地或資料 ID", "RECORD_ID_REQUIRED");
      }

      await requireProjectAccess(request, projectId, "edit");

      const deleted = await deleteProjectRecord(projectId, recordId);
      if (!deleted) {
        throw new ApiError(404, "找不到表單資料", "RECORD_NOT_FOUND");
      }

      return json({ ok: true });
    } catch (error) {
      return jsonError(error);
    }
  },
};
