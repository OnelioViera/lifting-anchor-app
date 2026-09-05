import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { supabaseAnonKey, supabaseUrl } from "./env";

// Server client — used in Server Components, Route Handlers, and Server
// Actions. Reads the signed-in user's session from cookies, so RLS
// policies that check auth.role() work the same as they would client-side.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component (not a Server Action/Route
          // Handler) — cookies can't be written here. The middleware
          // below refreshes the session on every request, so this is
          // safe to ignore.
        }
      },
    },
  });
}
