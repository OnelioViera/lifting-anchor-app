import { defineType, defineField } from 'sanity'

/**
 * A product "system" or family from the catalogue, e.g. ALP's
 * "Utility Lift™ System", "Lifting Pin™ System", "R-Anchors™ and Lift Loops",
 * or "Coil Inserts & Accessories". Individual sellable parts (liftingAnchor
 * documents) belong to one of these families and inherit its general
 * safety/handling rules.
 */
export default defineType({
  name: 'anchorFamily',
  title: 'Anchor Family / System',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Family name', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title' }, validation: (Rule) => Rule.required() }),
    defineField({ name: 'brand', title: 'Brand', type: 'reference', to: [{ type: 'brand' }] }),
    defineField({
      name: 'anchorType',
      title: 'Anchor type',
      type: 'string',
      options: {
        list: [
          { title: 'Recessed wire anchor (e.g. Utility Lift)', value: 'recessedWireAnchor' },
          { title: 'Cast-in pin anchor (e.g. Lifting Pin)', value: 'pinAnchor' },
          { title: 'Face lift loop', value: 'liftLoop' },
          { title: 'Coil insert', value: 'coilInsert' },
          { title: 'Other', value: 'other' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: 'description', title: 'Description', type: 'array', of: [{ type: 'block' }] }),
    defineField({ name: 'safetyNotes', title: 'Safety / installation notes', type: 'array', of: [{ type: 'block' }] }),
    defineField({ name: 'diagramImage', title: 'Diagram image', type: 'image', options: { hotspot: true } }),
    defineField({ name: 'allowableLoadZoneDegrees', title: 'Allowable load zone (± degrees from vertical/axis)', type: 'number' }),
    defineField({
      name: 'minEdgeDistanceFormula',
      title: 'Minimum edge distance formula',
      description: 'e.g. "1.5 × Embedded Depth" or "see per-part capacity table"',
      type: 'string',
    }),
    defineField({
      name: 'minSpacingFormula',
      title: 'Minimum anchor spacing formula',
      description: 'e.g. "3 × Insert Length" or "2 × published edge distance"',
      type: 'string',
    }),
    defineField({
      name: 'sourceCatalogRef',
      title: 'Source catalog reference',
      description: 'e.g. "ALP Supply 2026 Precast Accessories Technical Manual & Catalog"',
      type: 'string',
    }),
  ],
  preview: {
    select: { title: 'title', media: 'diagramImage' },
  },
})
