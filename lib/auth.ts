import { createClient } from "@/lib/supabase/server";
import type { Profile, Role } from "@/lib/types";

const isProduction = process.env.NODE_ENV === "production";

export interface SessionProfile {
  email: string;
  profile: Profile;
}

/**
 * Retorna o usuário autenticado e seu perfil (com papel/role) — ou `null`.
 *
 * SEGURANÇA:
 * - O papel é lido EXCLUSIVAMENTE da tabela `profiles` (fonte de verdade). Nunca de
 *   `user_metadata`, que é controlável pelo cliente e poderia forjar `admin`.
 * - Em produção, na ausência de sessão/perfil real ou em qualquer erro, retorna
 *   `null` (a área protegida então redireciona para /login). NUNCA cai em admin.
 * - O perfil "demo" (admin) existe apenas em desenvolvimento, para permitir navegar
 *   a interface sem backend configurado.
 */
export async function getSessionProfile(): Promise<SessionProfile | null> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return devDemoProfile();

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    // Sem linha em `profiles`: assume o papel de menor privilégio. O papel real só
    // passa a valer quando a linha existir (criada pela trigger handle_new_user).
    const profile: Profile = data ?? {
      id: user.id,
      full_name: user.email?.split("@")[0] ?? "Usuário",
      role: "responsavel" as Role,
      phone: null,
      avatar_url: null,
      created_at: new Date().toISOString(),
    };

    return { email: user.email ?? "", profile };
  } catch {
    // Falha de conexão/config do Supabase: em produção bloqueia; em dev, demo.
    return devDemoProfile();
  }
}

/** Perfil demo (admin) — APENAS em desenvolvimento. Em produção retorna null. */
function devDemoProfile(): SessionProfile | null {
  if (isProduction) return null;
  return {
    email: "demo@nexisx.com.br",
    profile: {
      id: "demo",
      full_name: "Conta Demo (dev)",
      role: "admin" as Role,
      phone: null,
      avatar_url: null,
      created_at: new Date().toISOString(),
    },
  };
}
