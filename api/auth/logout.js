import { json, jsonError, methodNotAllowed, sessionCookie } from "../_lib/http.js";

export default {
  async fetch(request) {
    if (request.method !== "POST") return methodNotAllowed(["POST"]);

    try {
      return json(
        { ok: true },
        200,
        {
          "Set-Cookie": sessionCookie("", 0),
        },
      );
    } catch (error) {
      return jsonError(error);
    }
  },
};
