import { defineType, defineField } from 'sanity'

/**
 * The recess former used at the concrete face with a Lifting Pin Anchor
 * (Rubber Recess, Plus Recess, or Disposable Recess), sized by tonnage.
 */
export default defineType({
  name: 'recessSystem',
  title: 'Recess System',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Name', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({
      name: 'systemType',
      title: 'System type',
      type: 'string',
      options: {
        list: [
          { title: 'Rubber Recess', value: 'rubber' },
          { title: 'Plus Recess', value: 'plus' },
          { title: 'Disposable Recess', value: 'disposable' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: 'tonnageRating', title: 'Tonnage rating', description: 'e.g. 1, 2, 4, 8, 16, 20', type: 'number', validation: (Rule) => Rule.required() }),
    defineField({ name: 'image', title: 'Image', type: 'image', options: { hotspot: true } }),
    defineField({
      name: 'dimensions',
      title: 'Recess dimensions',
      type: 'array',
      of: [{ type: 'dimensionField' }],
    }),
  ],
  preview: {
    select: { title: 'title', tonnage: 'tonnageRating', media: 'image' },
    prepare({ title, tonnage, media }) {
      return { title, subtitle: tonnage ? `${tonnage}T` : undefined, media }
    },
  },
})
