import { defineType, defineField } from 'sanity'

/**
 * The hook/bail component (e.g. ALP Lifting Eye) that engages a cast-in
 * Lifting Pin Anchor. Matched to an anchor by tonnage rating.
 */
export default defineType({
  name: 'liftingEye',
  title: 'Lifting Eye',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Name', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({ name: 'partNumber', title: 'Part #', type: 'string' }),
    defineField({ name: 'brand', title: 'Brand', type: 'reference', to: [{ type: 'brand' }] }),
    defineField({
      name: 'tonnageRangeLabel',
      title: 'Tonnage rating label',
      description: 'e.g. "3-5T" as marked on the bail',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: 'minTonnage', title: 'Minimum tonnage', type: 'number' }),
    defineField({ name: 'maxTonnage', title: 'Maximum tonnage', type: 'number' }),
    defineField({ name: 'image', title: 'Image', type: 'image', options: { hotspot: true } }),
    defineField({ name: 'weightLbs', title: 'Weight (lbs)', type: 'number' }),
    defineField({
      name: 'compatibleAnchors',
      title: 'Compatible Lifting Pin Anchors',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'liftingAnchor' }] }],
    }),
    defineField({ name: 'notes', title: 'Notes', type: 'text' }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'tonnageRangeLabel', media: 'image' },
  },
})
