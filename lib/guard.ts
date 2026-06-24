import { redirect } from "next/navigation";
import { getSessionProfile, type SessionProfile } from "@/lib/auth";
import type { Role } from "@/lib/types";

/**
 * Garante que existe sessão + perfil. Sem sessão → redireciona para /login.
 * Use no topo de Server Components da área protegida.
 */
export async function requireSession(): Promise<SessionProfile> {
  const session = await getSessionProfile();
  if (!session) redirect("/login");
  return session;
}

/**
 * Garante que o usuário autenticado possui um dos papéis permitidos.
 * - Sem sessão/perfil → /login
 * - Papel não permitido → /app (volta ao dashboard, sem vazar a página restrita)
 *
 * A segurança de DADOS é garantida pelo RLS; este guard impede que a UI de uma
 * rota restrita seja renderizada por quem digita a URL diretamente.
 */
export async function requireRole(roles: Role[]): Promise<SessionProfile> {
  const session = await requireSession();
  if (!roles.includes(session.profile.role)) {
    redirect("/app");
  }
  return session;
}
