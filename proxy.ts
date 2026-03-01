import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

/**
 * 对 (main) 下需要登录的页面做鉴权，未登录重定向到 /login。
 * 文档建议在页面/路由内再做一次 session 校验，此处仅做乐观重定向。
 */
export async function proxy(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // 排除登录、API、Next 静态资源，其余路径均需登录
  matcher: ["/((?!login|api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
