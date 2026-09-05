import { defineType, defineField } from 'sanity'

/**
 * One row of a capacity table, e.g.:
 *   LUA44G | 4" min thickness | 9" edge distance | 3,200 lbs tension | 5,800 lbs shear
 * or, for products whose SWL varies by concrete strength (Lifting Pin
 * Anchors, Steel Core Lift Loops):
 *   LPA1T238G | 2,500 psi | 1,350 lbs tension | edge dist (tension) 8" | edge dist (shear) 12"
 *
 * A product can have multiple rows to cover multiple concrete strengths.
 * Leave concreteStrengthPsi empty when the manufacturer publishes a single
 * capacity regardless of strength (e.g. Utility Lift Anchors @ 4,000 psi only).
 */
export default defineType({
  name: 'capacityRow',
  title: 'Capacity Row',
  type: 'object',
  fields: [
    defineField({
      name: 'concreteStrengthPsi',
      title: 'Concrete strength (psi)',
      description: 'Leave blank if the published capacity does not vary by concrete strength.',
      type: 'number',
    }),
    defineField({
      name: 'slabMinThicknessIn',
      title: 'Minimum slab/wall thickness (in)',
      type: 'number',
    }),
    defineField({
      name: 'edgeDistanceTensionIn',
      title: 'Minimum edge distance — tension (in)',
      type: 'number',
    }),
    defineField({
      name: 'edgeDistanceShearIn',
      title: 'Minimum edge distance — shear (in)',
      type: 'number',
    }),
    defineField({
      name: 'minCornerDistanceIn',
      title: 'Minimum corner distance (in)',
      description: 'Used by some coil inserts (CI-53 / CI-56 / CI-63 families).',
      type: 'number',
    }),
    defineField({
      name: 'minSpacingIn',
      title: 'Minimum anchor-to-anchor spacing (in)',
      type: 'number',
    }),
    defineField({
      name: 'swlTensionLbs',
      title: 'Safe Working Load — tension @ 90° (lbs)',
      description: 'Typically a 4:1 factor of safety on the ultimate mechanical/concrete capacity.',
      type: 'number',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'swlShearLbs',
      title: 'Safe Working Load — shear @ 90° (lbs)',
      type: 'number',
    }),
    defineField({
      name: 'ultimateMechanicalTensionLbs',
      title: 'Ultimate mechanical capacity — tension (lbs)',
      type: 'number',
    }),
    defineField({
      name: 'notes',
      title: 'Notes',
      type: 'string',
    }),
  ],
  preview: {
    select: {
      psi: 'concreteStrengthPsi',
      swl: 'swlTensionLbs',
      thickness: 'slabMinThicknessIn',
    },
    prepare({ psi, swl, thickness }) {
      const parts = [
        psi ? `${psi} psi` : 'all strengths',
        thickness ? `min ${thickness}" thick` : null,
        swl ? `${swl.toLocaleString()} lb SWL (tension)` : null,
      ].filter(Boolean)
      return { title: parts.join(' · ') }
    },
  },
})
