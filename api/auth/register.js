import {
  createSessionToken,
  hashPassword,
  publicUser,
  sessionMaxAgeSeconds,
} from "../_lib/auth.js";
import { ensureSchema, findUserByEmail, insertUser } from "../_lib/db.js";
import {
  ApiError,
  json,
  jsonError,
  methodNotAllowed,
  readJson,
  sessionCookie,
} from "../_lib/http.js";

export default {
  async fetch(request) {
    if (request.method !== "POST") return methodNotAllowed(["POST"]);

    try {
      const { email, password, name } = await readJson(request);

      if (!email?.trim() || !password || !name?.trim()) {
        throw new ApiError(400, "請輸入姓名、帳號與密碼", "REGISTER_FIELDS_REQUIRED");
      }

      if (password.length < 8) {
        throw new ApiError(400, "密碼至少需要 8 碼", "PASSWORD_TOO_SHORT");
      }

      await ensureSchema();

      const existing = await findUserByEmail(email);
      if (existing) {
        throw new ApiError(409, "此帳號已註冊", "EMAIL_ALREADY_EXISTS");
      }

      const user = await insertUser({
        email,
        name,
        passwordHash: await hashPassword(password),
      });

      return json(
        { user: publicUser(user) },
        201,
        {
          "Set-Cookie": sessionCookie(
            createSessionToken(user),
            sessionMaxAgeSeconds(),
          ),
        },
      );
    } catch (error) {
      return jsonError(error);
    }
  },
};
