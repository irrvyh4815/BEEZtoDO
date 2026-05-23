import { publicUser, requireUser } from "../_lib/auth.js";
import { json, jsonError, methodNotAllowed } from "../_lib/http.js";

export default {
  async fetch(request) {
    if (request.method !== "GET") return methodNotAllowed(["GET"]);

    try {
      return json({ user: publicUser(requireUser(request)) });
    } catch (error) {
      return jsonError(error);
    }
  },
};
