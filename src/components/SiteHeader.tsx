import Image from "next/image";
import Link from "next/link";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Anchor Catalog" },
  { href: "/calculator", label: "Anchor Calculator" },
];

export default function SiteHeader() {
  return (
    <header className="border-b border-black/10 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logos/lindsay-precast.png"
            alt="Lindsay Precast"
            width={161}
            height={81}
            className="h-10 w-auto"
            priority
          />
          <span className="hidden text-sm font-medium text-lp-navy-dark/70 sm:block">
            Lifting Anchor Calculator
          </span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-lp-navy-dark hover:bg-lp-navy/5"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
