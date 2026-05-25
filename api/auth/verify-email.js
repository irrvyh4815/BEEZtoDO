import { ensureSchema, verifyEmailToken } from "../_lib/db.js";
import { appOrigin } from "../_lib/email.js";
import { methodNotAllowed } from "../_lib/http.js";

function htmlPage({ title, message, href, ok }) {
  return `<!doctype html>
<html lang="zh-Hant">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>${title}</title>
  </head>
  <body style="margin:0;background:#f8fafc;font-family:Arial,'Noto Sans TC',sans-serif;color:#0f172a">
    <main style="min-height:100vh;display:grid;place-items:center;padding:24px">
      <section style="max-width:480px;width:100%;border:1px solid #e2e8f0;border-radius:20px;background:white;padding:28px;box-shadow:0 10px 30px rgba(15,23,42,.08)">
        <p style="margin:0 0 12px;color:${ok ? "#047857" : "#b91c1c"};font-weight:700">${ok ? "驗證成功" : "驗證失敗"}</p>
        <h1 style="margin:0 0 12px;font-size:24px">EZtoDO工程管理程式</h1>
        <p style="margin:0 0 20px;line-height:1.7;color:#475569">${message}</p>
        <a href="${href}" style="display:inline-block;border-radius:12px;background:#0f172a;color:white;padding:10px 16px;text-decoration:none;font-weight:700">返回登入頁</a>
      </section>
    </main>
  </body>
</html>`;
}

export default {
  async fetch(request) {
    if (request.method !== "GET") return methodNotAllowed(["GET"]);

    const origin = appOrigin(request);

    try {
      await ensureSchema();
      const token = new URL(request.url).searchParams.get("token") || "";
      const user = await verifyEmailToken(token);

      if (!user) {
        return new Response(
          htmlPage({
            title: "信箱驗證失敗",
            message: "驗證連結已失效或不存在，請回登入頁重新寄送驗證信。",
            href: origin,
            ok: false,
          }),
          {
            status: 400,
            headers: { "Content-Type": "text/html; charset=utf-8" },
          },
        );
      }

      return new Response(
        htmlPage({
          title: "信箱驗證成功",
          message: "你的信箱已完成驗證，現在可以回到系統登入。",
          href: origin,
          ok: true,
        }),
        { headers: { "Content-Type": "text/html; charset=utf-8" } },
      );
    } catch {
      return new Response(
        htmlPage({
          title: "信箱驗證失敗",
          message: "伺服器暫時無法完成驗證，請稍後再試。",
          href: origin,
          ok: false,
        }),
        {
          status: 500,
          headers: { "Content-Type": "text/html; charset=utf-8" },
        },
      );
    }
  },
};
