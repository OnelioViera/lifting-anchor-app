import { defineType, defineField } from 'sanity'

/**
 * A generic lookup table for safe-working-load reduction factors, used
 * e.g. by Coil Inserts for free-edge and thin-wall conditions. Multiply a
 * part's published SWL by the looked-up factor to get the reduced SWL for
 * a given edge distance / wall thickness.
 *
 * Rows are the varying input (edge distance "De", or wall thickness "WT"),
 * columns are the product variants (e.g. CI-16 4", CI-16 6", CI-18 9" ...),
 * and each cell is the multiplier (0–1).
 */
export default defineType({
  name: 'loadReductionTable',
  title: 'Load Reduction Table',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({
      name: 'conditionType',
      title: 'Condition',
      type: 'string',
      options: {
        list: [
          { title: 'Free edge (shear cone on 1 side)', value: 'freeEdge' },
          { title: 'Thin wall (shear cone on 2 sides)', value: 'thinWall' },
          { title: 'Other', value: 'other' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: 'family', title: 'Applies to family', type: 'reference', to: [{ type: 'anchorFamily' }] }),
    defineField({
      name: 'rowLabel',
      title: 'Row axis label',
      description: 'e.g. "De (in)" or "WT (in)"',
      type: 'string',
    }),
    defineField({
      name: 'columns',
      title: 'Column labels',
      description: 'e.g. "CI-16 4\"", "CI-16 6\"", "CI-18 9\""',
      type: 'array',
      of: [{ type: 'string' }],
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'rows',
      title: 'Rows',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'reductionRow',
          fields: [
            defineField({ name: 'rowValue', title: 'Row value', description: 'e.g. 4 (inches)', type: 'number', validation: (Rule) => Rule.required() }),
            defineField({
              name: 'factors',
              title: 'Factors (same order as Column labels)',
              type: 'array',
              of: [{ type: 'number' }],
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: {
            select: { title: 'rowValue', subtitle: 'factors' },
            prepare({ title, subtitle }) {
              return { title: `${title}"`, subtitle: Array.isArray(subtitle) ? subtitle.join(', ') : undefined }
            },
          },
        },
      ],
    }),
    defineField({
      name: 'notes',
      title: 'Notes',
      type: 'text',
      description: 'e.g. minimum edge distance / spacing formulas, ACI reference, based-upon assumptions',
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'conditionType' },
  },
})
