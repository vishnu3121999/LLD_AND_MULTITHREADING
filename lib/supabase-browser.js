import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseConfig } from "./supabase-config";

let client;

export function getSupabaseBrowserClient() {
  const { url, anonKey, configured } = getSupabaseConfig();
  if (!configured) return null;
  if (!client) client = createBrowserClient(url, anonKey);
  return client;
}
