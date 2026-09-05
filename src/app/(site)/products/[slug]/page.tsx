import Image from "next/image";
import { notFound } from "next/navigation";
import { getAnchorBySlug } from "@/lib/data";

export const revalidate = 60;

export default async function ProductDetailPage(
  props: PageProps<"/products/[slug]">
) {
  const { slug } = await props.params;
  const anchor = await getAnchorBySlug(slug);

  if (!anchor) return notFound();

  return (
    <div className="flex flex-col gap-10">
      <div className="grid gap-8 sm:grid-cols-[280px_1fr]">
        {anchor.imageUrl ? (
          <Image
            src={anchor.imageUrl}
            alt={anchor.title}
            width={560}
            height={420}
            className="w-full rounded-lg border border-black/10 bg-white object-contain p-4"
          />
        ) : (
          <div className="aspect-square w-full rounded-lg border border-black/10 bg-black/[.03]" />
        )}

        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium text-lp-red">
            {anchor.family?.title}
            {anchor.brand?.title ? ` · ${anchor.brand.title}` : ""}
          </p>
          <h1 className="text-2xl font-semibold text-lp-navy-dark">
            {anchor.title}
          </h1>
          <p className="font-mono text-sm text-black/60">
            {anchor.partNumber}
            {anchor.sizeLabel ? ` · ${anchor.sizeLabel}` : ""}
          </p>

          <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            {anchor.finish && (
              <>
                <dt className="text-black/50">Finish</dt>
                <dd>{anchor.finish}</dd>
              </>
            )}
            {anchor.weightLbs && (
              <>
                <dt className="text-black/50">Weight</dt>
                <dd>{anchor.weightLbs} lbs</dd>
              </>
            )}
            {anchor.tonnageRating && (
              <>
                <dt className="text-black/50">Tonnage rating</dt>
                <dd>{anchor.tonnageRating}T</dd>
              </>
            )}
            {anchor.typicalElementThicknessIn && (
              <>
                <dt className="text-black/50">Typical thickness</dt>
                <dd>{anchor.typicalElementThicknessIn}&quot;</dd>
              </>
            )}
            {anchor.safetyFactor && (
              <>
                <dt className="text-black/50">Safety factor</dt>
                <dd>{anchor.safetyFactor}:1</dd>
              </>
            )}
          </dl>

          {anchor.elementTypes && anchor.elementTypes.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {anchor.elementTypes.map((el) => (
                <span
                  key={el.slug}
                  className="rounded-full bg-lp-navy/5 px-3 py-1 text-xs font-medium text-lp-navy-dark"
                >
                  {el.title}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {anchor.dimensions && anchor.dimensions.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold text-lp-navy-dark">
            Dimensions
          </h2>
          <div className="flex flex-wrap gap-3">
            {anchor.dimensions.map((d) => (
              <div
                key={d.key}
                className="rounded-md border border-black/10 bg-white px-3 py-2 text-sm"
              >
                <span className="font-mono text-black/50">{d.key}</span>{" "}
                <span className="font-semibold">{d.value}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-lg font-semibold text-lp-navy-dark">
          Capacity table
        </h2>
        <div className="overflow-x-auto rounded-lg border border-black/10 bg-white">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-lp-navy/5 text-left text-xs uppercase tracking-wide text-black/50">
              <tr>
                <th className="px-4 py-3">Concrete strength</th>
                <th className="px-4 py-3">Min. thickness</th>
                <th className="px-4 py-3">Edge dist. (tension)</th>
                <th className="px-4 py-3">Edge dist. (shear)</th>
                <th className="px-4 py-3">SWL tension</th>
                <th className="px-4 py-3">SWL shear</th>
              </tr>
            </thead>
            <tbody>
              {anchor.capacityTable.map((row, i) => (
                <tr key={i} className="border-t border-black/5">
                  <td className="px-4 py-3">
                    {row.concreteStrengthPsi
                      ? `${row.concreteStrengthPsi.toLocaleString()} psi`
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {row.slabMinThicknessIn ? `${row.slabMinThicknessIn}"` : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {row.edgeDistanceTensionIn
                      ? `${row.edgeDistanceTensionIn}"`
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {row.edgeDistanceShearIn ? `${row.edgeDistanceShearIn}"` : "—"}
                  </td>
                  <td className="px-4 py-3 font-semibold text-lp-navy-dark">
                    {row.swlTensionLbs.toLocaleString()} lbs
                  </td>
                  <td className="px-4 py-3">
                    {row.swlShearLbs ? `${row.swlShearLbs.toLocaleString()} lbs` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {(anchor.compatibleLiftingEyes?.length ||
        anchor.compatibleRecessSystems?.length) && (
        <section className="grid gap-6 sm:grid-cols-2">
          {anchor.compatibleLiftingEyes && anchor.compatibleLiftingEyes.length > 0 && (
            <div>
              <h2 className="mb-3 text-lg font-semibold text-lp-navy-dark">
                Compatible lifting eyes
              </h2>
              <ul className="flex flex-col gap-2">
                {anchor.compatibleLiftingEyes.map((eye) => (
                  <li
                    key={eye.title}
                    className="rounded-md border border-black/10 bg-white px-3 py-2 text-sm"
                  >
                    {eye.title} — {eye.tonnageRangeLabel}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {anchor.compatibleRecessSystems && anchor.compatibleRecessSystems.length > 0 && (
            <div>
              <h2 className="mb-3 text-lg font-semibold text-lp-navy-dark">
                Compatible recess systems
              </h2>
              <ul className="flex flex-col gap-2">
                {anchor.compatibleRecessSystems.map((rs) => (
                  <li
                    key={rs.title}
                    className="rounded-md border border-black/10 bg-white px-3 py-2 text-sm"
                  >
                    {rs.title} ({rs.tonnageRating}T)
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {anchor.family?.safetyNotes ? (
        <section className="rounded-lg border border-lp-red/20 bg-lp-red/5 p-6">
          <h2 className="mb-3 text-lg font-semibold text-lp-red">
            Safety &amp; installation notes
          </h2>
          <div className="prose prose-sm max-w-none whitespace-pre-line text-black/70">
            {anchor.family.safetyNotes}
          </div>
        </section>
      ) : null}
    </div>
  );
}
