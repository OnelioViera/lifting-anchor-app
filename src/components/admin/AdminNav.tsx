import Link from "next/link";
import { signOut } from "@/lib/admin/auth-actions";
import { listResourceConfigs } from "@/lib/admin/simple-resources";

export default function AdminNav({ userEmail }: { userEmail?: string }) {
  const resources = listResourceConfigs();
  const linkClass =
    "rounded-md px-3 py-2 text-sm text-lp-navy-dark hover:bg-lp-navy/5";

  return (
    <nav className="flex w-full flex-col gap-1 border-b border-black/10 bg-white p-4 sm:w-56 sm:border-b-0 sm:border-r">
      <Link href="/admin" className={`${linkClass} font-semibold`}>
        Dashboard
      </Link>
      <Link href="/admin/lifting-anchors" className={linkClass}>
        Lifting Anchors
      </Link>
      {resources.map((r) => (
        <Link key={r.key} href={`/admin/${r.key}`} className={linkClass}>
          {r.labelPlural}
        </Link>
      ))}
      <Link href="/admin/calculator-settings" className={linkClass}>
        Calculator Settings
      </Link>

      <div className="mt-4 flex flex-col gap-2 border-t border-black/10 pt-4">
        {userEmail && (
          <p className="truncate px-3 text-xs text-black/40">{userEmail}</p>
        )}
        <form action={signOut}>
          <button
            type="submit"
            className="w-full rounded-md px-3 py-2 text-left text-sm text-black/60 hover:bg-black/5"
          >
            Sign out
          </button>
        </form>
      </div>
    </nav>
  );
}
