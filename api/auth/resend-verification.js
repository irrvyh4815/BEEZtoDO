import { emailVerificationRequired } from "../_lib/auth.js";
import { createEmailVerificationToken, ensureSchema, findUserByEmail } from "../_lib/db.js";
import { sendVerificationEmail, verificationUrl } from "../_lib/email.js";
import { ApiError, json, jsonError, methodNotAllowed, readJson } from "../_lib/http.js";

export default {
  async fetch(request) {
    if (request.method !== "POST") return methodNotAllowed(["POST"]);

    try {
      const { email } = await readJson(request);
      if (!email?.trim()) {
        throw new ApiError(400, "請輸入要驗證的 Email", "EMAIL_REQUIRED");
      }

      await ensureSchema();

      const user = await findUserByEmail(email);
      if (!user || user.email_verified || user.role === "admin" || !emailVerificationRequired()) {
        return json({
          ok: true,
          message: "如果此信箱需要驗證，系統會寄出驗證信。",
        });
      }

      const { token } = await createEmailVerificationToken(user.id);
      await sendVerificationEmail({
        to: user.email,
        name: user.name,
        url: verificationUrl(request, token),
      });

      return json({ ok: true, message: "驗證信已寄出，請到信箱收信。" });
    } catch (error) {
      return jsonError(error);
    }
  },
};
