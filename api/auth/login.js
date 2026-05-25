import {
  createSessionToken,
  emailVerificationRequired,
  publicUser,
  sessionMaxAgeSeconds,
  verifyPassword,
} from "../_lib/auth.js";
import { ensureSchema, findUserByEmail } from "../_lib/db.js";
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
      const { email, password } = await readJson(request);

      if (!email || !password) {
        throw new ApiError(400, "請輸入帳號與密碼", "LOGIN_FIELDS_REQUIRED");
      }

      await ensureSchema();

      const user = await findUserByEmail(email);
      const valid = user && (await verifyPassword(password, user.password_hash));

      if (!valid) {
        throw new ApiError(401, "帳號或密碼錯誤", "INVALID_CREDENTIALS");
      }

      if (
        emailVerificationRequired() &&
        user.role !== "admin" &&
        !user.email_verified
      ) {
        throw new ApiError(
          403,
          "請先完成信箱驗證，再登入系統。",
          "EMAIL_NOT_VERIFIED",
        );
      }

      return json(
        { user: publicUser(user) },
        200,
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
