import "server-only"
import { cookies } from "next/headers"
import { ADMIN_SESSION_COOKIE, isValidAdminSessionToken } from "@/lib/admin-auth"

export async function requireAdmin() {
  const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value
  return isValidAdminSessionToken(token)
}
