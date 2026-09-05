import Image from "next/image";

export default function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-black/10 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <Image
              src="/logos/lindsay-precast.png"
              alt="Lindsay Precast"
              width={161}
              height={81}
              className="h-8 w-auto"
            />
            <span className="text-black/20">×</span>
            <Image
              src="/logos/alp-supply.png"
              alt="ALP Supply"
              width={274}
              height={194}
              className="h-8 w-auto"
            />
          </div>
          <p className="max-w-lg text-xs leading-relaxed text-black/50">
            Anchor capacities and edge-distance requirements are sourced from
            manufacturer published data (ALP Supply 2026 Precast Accessories
            Technical Manual &amp; Catalog). This tool assists with anchor
            selection only — final rigging plans and anchor selections must be
            reviewed and approved by a qualified engineer for the specific
            application.
          </p>
        </div>
      </div>
    </footer>
  );
}
