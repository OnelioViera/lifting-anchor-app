import { signIn } from "@/lib/admin/auth-actions";
import { buttonPrimaryClass, inputClass, labelClass } from "@/components/admin/formStyles";

export default async function LoginPage(props: PageProps<"/admin/login">) {
  const searchParams = await props.searchParams;
  const error =
    typeof searchParams.error === "string" ? searchParams.error : undefined;
  const redirectTo =
    typeof searchParams.redirectTo === "string" ? searchParams.redirectTo : "/admin";

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 px-4">
      <div>
        <h1 className="text-xl font-semibold text-lp-navy-dark">Team sign in</h1>
        <p className="mt-1 text-sm text-black/60">
          Sign in with the account your Supabase project admin created for
          you (Supabase dashboard → Authentication → Users).
        </p>
      </div>
      <form
        action={signIn}
        className="flex flex-col gap-4 rounded-lg border border-black/10 bg-white p-6"
      >
        <input type="hidden" name="redirectTo" value={redirectTo} />
        <label className="flex flex-col gap-1.5">
          <span className={labelClass}>Email</span>
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className={labelClass}>Password</span>
          <input
            type="password"
            name="password"
            required
            autoComplete="current-password"
            className={inputClass}
          />
        </label>
        {error && <p className="text-xs text-lp-red">{error}</p>}
        <button type="submit" className={buttonPrimaryClass}>
          Sign in
        </button>
      </form>
    </div>
  );
}
