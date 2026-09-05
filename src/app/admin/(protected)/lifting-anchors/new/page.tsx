import { getLiftingAnchorFormOptions } from "../options";
import LiftingAnchorForm from "../LiftingAnchorForm";

export default async function NewLiftingAnchorPage() {
  const options = await getLiftingAnchorFormOptions();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-lp-navy-dark">
        New Lifting Anchor
      </h1>
      <LiftingAnchorForm {...options} />
    </div>
  );
}
