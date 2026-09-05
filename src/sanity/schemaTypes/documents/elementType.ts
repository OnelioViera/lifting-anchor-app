import { defineType, defineField } from 'sanity'

/**
 * A category of precast element the calculator can size anchors for —
 * vaults / box culverts, box-base manholes, pads/slabs, wall panels, etc.
 */
export default defineType({
  name: 'elementType',
  title: 'Precast Element Type',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Name', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title' }, validation: (Rule) => Rule.required() }),
    defineField({
      name: 'geometryType',
      title: 'Geometry type',
      type: 'string',
      options: {
        list: [
          { title: 'Box / vault (4 walls + base/top)', value: 'box' },
          { title: 'Flat slab / pad / lid', value: 'slab' },
          { title: 'Wall panel', value: 'wallPanel' },
          { title: 'Riser / ring', value: 'riser' },
          { title: 'Other', value: 'other' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: 'description', title: 'Description', type: 'text' }),
    defineField({ name: 'diagramImage', title: 'Diagram image', type: 'image', options: { hotspot: true } }),
    defineField({
      name: 'typicalPickPatterns',
      title: 'Typical pick patterns',
      description: 'Rigging layouts commonly used for this element (2/3/4/8-point picks, spreader beams, etc.)',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'pickPattern',
          fields: [
            defineField({ name: 'numberOfPoints', title: 'Number of pick points', type: 'number' }),
            defineField({ name: 'anchorsTakingLoad', title: 'Anchors assumed to take the load', type: 'number' }),
            defineField({ name: 'description', title: 'Description', type: 'text' }),
            defineField({ name: 'diagramImage', title: 'Diagram', type: 'image' }),
          ],
          preview: {
            select: { title: 'numberOfPoints', subtitle: 'description' },
            prepare({ title, subtitle }) {
              return { title: `${title}-point pick`, subtitle }
            },
          },
        },
      ],
    }),
  ],
  preview: {
    select: { title: 'title', media: 'diagramImage' },
  },
})
