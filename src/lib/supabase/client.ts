"use client";

import { createBrowserClient } from "@supabase/ssr";
import { supabaseAnonKey, supabaseUrl } from "./env";

// Browser client — used by client components (e.g. the admin login form,
// image upload widget) that need to call Supabase directly from the page.
export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
