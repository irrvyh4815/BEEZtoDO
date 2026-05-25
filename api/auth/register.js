import {
  createSessionToken,
  emailVerificationRequired,
  hashPassword,
  publicUser,
  sessionMaxAgeSeconds,
} from "../_lib/auth.js";
import {
  emailProviderConfigured,
  sendVerificationEmail,
  verificationUrl,
} from "../_lib/email.js";
import {
  createEmailVerificationToken,
  ensureSchema,
  findUserByEmail,
  insertUser,
} from "../_lib/db.js";
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

      const requireVerification = emailVerificationRequired();
      if (requireVerification && !emailProviderConfigured()) {
        throw new ApiError(
          400,
          "尚未設定寄信服務，請先設定 RESEND_API_KEY 與 EMAIL_FROM。",
          "EMAIL_PROVIDER_MISSING",
        );
      }

      const user = await insertUser({
        email,
        name,
        passwordHash: await hashPassword(password),
        canView: true,
        canEdit: true,
        emailVerified: !requireVerification,
      });

      if (requireVerification) {
        const { token } = await createEmailVerificationToken(user.id);
        await sendVerificationEmail({
          to: user.email,
          name: user.name,
          url: verificationUrl(request, token),
        });

        return json(
          {
            user: publicUser(user),
            emailVerificationRequired: true,
            verificationEmailSent: true,
          },
          201,
        );
      }

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
