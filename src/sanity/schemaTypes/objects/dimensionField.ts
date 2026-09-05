import { defineType, defineField } from 'sanity'

/**
 * A single labeled dimension (e.g. "W" = 5-1/4", "FD" = 15/16").
 * Catalogue drawings label dimensions differently per product family
 * (W/H/D/FD/EH/ED for anchors, A/B/D/H/L for coil inserts, etc.), so
 * rather than hard-coding fixed fields we store a flexible ordered list
 * per product. `key` should match the letter used on the catalogue
 * drawing so the Studio content mirrors the PDF exactly.
 */
export default defineType({
  name: 'dimensionField',
  title: 'Dimension',
  type: 'object',
  fields: [
    defineField({
      name: 'key',
      title: 'Label (as shown on drawing)',
      description: 'e.g. W, H, D, FD, EH, ED, WD, RD, HD, L, A, B',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'value',
      title: 'Value',
      description: 'e.g. 5-1/4", .444", 15/16"',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'valueIn',
      title: 'Value (decimal inches)',
      description: 'Numeric equivalent used for calculations, e.g. 5.25',
      type: 'number',
    }),
  ],
  preview: {
    select: { title: 'key', subtitle: 'value' },
  },
})
