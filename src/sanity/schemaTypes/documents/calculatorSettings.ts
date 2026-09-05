import { defineType, defineField } from 'sanity'

/**
 * Singleton document holding the rigging-angle and dynamic/shock load
 * factors published in the ALP Supply safety guidelines. These apply
 * across all anchor families and are used by the calculator to inflate
 * the load applied to each anchor before comparing it to a part's SWL.
 */
export default defineType({
  name: 'calculatorSettings',
  title: 'Calculator Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      initialValue: 'Global Calculator Settings',
      readOnly: true,
    }),
    defineField({
      name: 'slingAngleLoadFactors',
      title: 'Sling angle load factors',
      description: 'Load multiplier by rigging spread angle (SPA). From the "Lifting Angle Load Factors" table.',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'slingAngleRow',
          fields: [
            defineField({ name: 'slingAngleDeg', title: 'Sling angle (SLA, °)', type: 'number', validation: (Rule) => Rule.required() }),
            defineField({ name: 'verticalCableAngleDeg', title: 'Vertical cable angle (VCA, °)', type: 'number' }),
            defineField({ name: 'spreadAngleDeg', title: 'Spread angle (SPA, °)', type: 'number' }),
            defineField({ name: 'loadIncreasePercent', title: 'Load increase (%)', type: 'number' }),
            defineField({ name: 'loadFactor', title: 'Load factor (multiplier)', type: 'number', validation: (Rule) => Rule.required() }),
            defineField({
              name: 'riskLevel',
              title: 'Risk level',
              type: 'string',
              options: { list: ['typical', 'maxAllowedCaution', 'doNotUse'] },
            }),
          ],
          preview: {
            select: { sla: 'slingAngleDeg', factor: 'loadFactor' },
            prepare({ sla, factor }) {
              return { title: `${sla}° SLA`, subtitle: `× ${factor}` }
            },
          },
        },
      ],
    }),
    defineField({
      name: 'dynamicLoadFactors',
      title: 'Dynamic / shock load factors',
      description: 'Multipliers for cable vs. chain rigging under different handling conditions.',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'dynamicLoadRow',
          fields: [
            defineField({
              name: 'condition',
              title: 'Condition',
              type: 'string',
              options: {
                list: [
                  { title: 'Stationary crane', value: 'stationaryCrane' },
                  { title: 'Lifting/transporting on a smooth surface', value: 'smoothSurface' },
                  { title: 'Lifting/transporting on an uneven surface', value: 'unevenSurface' },
                ],
              },
              validation: (Rule) => Rule.required(),
            }),
            defineField({ name: 'cableRiggingFactor', title: 'Cable rigging factor (min)', type: 'number' }),
            defineField({ name: 'chainRiggingFactor', title: 'Chain rigging factor (min)', type: 'number' }),
          ],
          preview: {
            select: { title: 'condition', cable: 'cableRiggingFactor', chain: 'chainRiggingFactor' },
            prepare({ title, cable, chain }) {
              return { title, subtitle: `cable ≥${cable}, chain ≥${chain}` }
            },
          },
        },
      ],
    }),
    defineField({
      name: 'notes',
      title: 'Notes',
      type: 'array',
      of: [{ type: 'block' }],
      description: 'e.g. "Lifting with chains is not recommended", area-reduction method reference, etc.',
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Global Calculator Settings' }
    },
  },
})
