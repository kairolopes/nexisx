import { createClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase com service_role — bypassa RLS.
 * USE APENAS EM SERVER ACTIONS com getActor(["admin"]) validado antes.
 * Nunca expor no client bundle.
 */
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase service_role não configurado.");
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
