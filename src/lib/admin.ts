// src/lib/admin.ts
import { supabase } from "@/lib/supabaseClient";

export async function isCurrentUserAdmin(): Promise<boolean> {
  const { data: authData, error: authErr } = await supabase.auth.getUser();
  if (authErr) throw authErr;
  if (!authData.user) return false;

  const { data, error } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", authData.user.id)
    .single();

  if (error) {
    // If profile row doesn't exist, treat as non-admin
    return false;
  }
  return Boolean(data?.is_admin);
}
