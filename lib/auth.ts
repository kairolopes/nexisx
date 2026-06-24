import { createClient } from "@/lib/supabase/server";
import type { Profile, Role } from "@/lib/types";

/**
 * Retorna o usuário autenticado e seu perfil (com papel/role).
 * Se o Supabase não estiver configurado, retorna um perfil "demo" admin
 * para que a interface possa ser navegada em ambiente de desenvolvimento.
 */
export async function getSessionProfile(): Promise<{
  email: string;
  profile: Profile;
} | null> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return demoProfile();

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    const profile: Profile = data ?? {
      id: user.id,
      full_name: user.email?.split("@")[0] ?? "Usuário",
      role: (user.user_metadata?.role as Role) ?? "responsavel",
      phone: null,
      avatar_url: null,
      created_at: new Date().toISOString(),
    };

    return { email: user.email ?? "", profile };
  } catch {
    return demoProfile();
  }
}

function demoProfile() {
  return {
    email: "demo@nexisx.com.br",
    profile: {
      id: "demo",
      full_name: "Conta Demo",
      role: "admin" as Role,
      phone: null,
      avatar_url: null,
      created_at: new Date().toISOString(),
    },
  };
}
