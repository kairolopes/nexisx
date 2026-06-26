import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Rota de callback de autenticação.
 * Supabase redireciona aqui após:
 *   - Convite de usuário (type=invite)
 *   - Magic link / recuperação de senha (type=recovery)
 *   - OAuth (code=...)
 *
 * Configure no Supabase Dashboard → Authentication → URL Configuration:
 *   Site URL: NEXT_PUBLIC_SITE_URL
 *   Redirect URLs: {SITE_URL}/auth/callback
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = searchParams.get("next") ?? "/app";

  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(toSet: { name: string; value: string; options?: object }[]) {
          try {
            toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {}
        },
      },
    }
  );

  if (tokenHash && type) {
    // Convite ou magic link via token_hash (fluxo PKCE do Supabase SSR)
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as Parameters<typeof supabase.auth.verifyOtp>[0]["type"],
    });
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  }

  if (code) {
    // OAuth code exchange
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  }

  return NextResponse.redirect(`${origin}/login?error=link_invalido_ou_expirado`);
}
