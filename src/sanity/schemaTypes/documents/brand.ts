import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'brand',
  title: 'Brand',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Name', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title' }, validation: (Rule) => Rule.required() }),
    defineField({ name: 'logo', title: 'Logo', type: 'image', options: { hotspot: true } }),
    defineField({ name: 'website', title: 'Website', type: 'url' }),
    defineField({ name: 'phone', title: 'Phone', type: 'string' }),
    defineField({ name: 'email', title: 'Email', type: 'string' }),
  ],
  preview: {
    select: { title: 'title', media: 'logo' },
  },
})
