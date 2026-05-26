import { json, jsonError, methodNotAllowed } from "../_lib/http.js";
import { requirePermission } from "../_lib/permissions.js";

export default {
  async fetch(request) {
    if (!["GET", "POST"].includes(request.method)) {
      return methodNotAllowed(["GET", "POST"]);
    }

    try {
      if (request.method === "GET") {
        return json({
          provider: "reserved",
          status: "pending",
          message: "圖片上傳接口已預留，後續可接 Vercel Blob、S3 或 Cloudflare R2。",
          maxFiles: 10,
          acceptedTypes: ["image/jpeg", "image/png", "image/webp"],
        });
      }

      await requirePermission(request, "edit");
      return json(
        {
          provider: "reserved",
          status: "pending",
          message: "尚未串接雲端圖片儲存；目前前端會先保留附件 metadata。",
        },
        501,
      );
    } catch (error) {
      return jsonError(error);
    }
  },
};
