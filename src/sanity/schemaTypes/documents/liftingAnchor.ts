import { defineType, defineField } from 'sanity'

/**
 * A single sellable lifting anchor / insert part number, e.g. LUA54G,
 * LPA4T312G, LLR, CI16124P. This is the document the calculator ultimately
 * selects from.
 */
export default defineType({
  name: 'liftingAnchor',
  title: 'Lifting Anchor',
  type: 'document',
  groups: [
    { name: 'general', title: 'General', default: true },
    { name: 'dimensions', title: 'Dimensions' },
    { name: 'capacity', title: 'Capacity' },
    { name: 'compatibility', title: 'Compatibility' },
  ],
  fields: [
    defineField({ name: 'title', title: 'Display name', type: 'string', group: 'general', validation: (Rule) => Rule.required() }),
    defineField({ name: 'partNumber', title: 'Part #', type: 'string', group: 'general', validation: (Rule) => Rule.required() }),
    defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'partNumber' }, group: 'general', validation: (Rule) => Rule.required() }),
    defineField({ name: 'brand', title: 'Brand', type: 'reference', to: [{ type: 'brand' }], group: 'general', validation: (Rule) => Rule.required() }),
    defineField({ name: 'family', title: 'Anchor family / system', type: 'reference', to: [{ type: 'anchorFamily' }], group: 'general', validation: (Rule) => Rule.required() }),
    defineField({
      name: 'sizeLabel',
      title: 'Size / ID label',
      description: 'The manufacturer\'s own size code, e.g. "5/4", "1T", "3/4\" x 6\"',
      type: 'string',
      group: 'general',
    }),
    defineField({ name: 'image', title: 'Product image', type: 'image', options: { hotspot: true }, group: 'general' }),
    defineField({ name: 'datasheetPdf', title: 'Datasheet / catalog page (PDF)', type: 'file', group: 'general' }),
    defineField({
      name: 'finish',
      title: 'Finish',
      type: 'string',
      group: 'general',
      options: { list: ['Hot-dipped galvanized', 'Plain', 'Plated', 'Stainless Steel'] },
    }),
    defineField({ name: 'colorCode', title: 'Color code (if color-coded, e.g. lift loops)', type: 'string', group: 'general' }),
    defineField({ name: 'weightLbs', title: 'Weight (lbs)', type: 'number', group: 'general' }),
    defineField({ name: 'qtyPerBag', title: 'Qty / Bag', type: 'number', group: 'general' }),
    defineField({ name: 'qtyPerCrate', title: 'Qty / Crate or Carton', type: 'number', group: 'general' }),
    defineField({
      name: 'sourceCatalogPage',
      title: 'Source catalog page',
      description: 'e.g. "ALP Supply 2026 Catalog, p.78" — for traceability back to the PDF.',
      type: 'string',
      group: 'general',
    }),

    // --- Filterable numeric attributes used for anchor-to-element matching ---
    defineField({ name: 'tonnageRating', title: 'Tonnage rating (tons)', type: 'number', group: 'dimensions' }),
    defineField({ name: 'wireDiameterIn', title: 'Wire diameter (in)', type: 'number', group: 'dimensions' }),
    defineField({ name: 'boltDiameterIn', title: 'Bolt diameter (in)', type: 'number', group: 'dimensions' }),
    defineField({ name: 'numberOfStruts', title: 'Number of struts (coil inserts)', type: 'number', group: 'dimensions' }),
    defineField({ name: 'typicalElementThicknessIn', title: 'Typical slab/wall thickness (in)', type: 'number', group: 'dimensions' }),
    defineField({
      name: 'dimensions',
      title: 'Dimensions (as labeled on drawing)',
      type: 'array',
      of: [{ type: 'dimensionField' }],
      group: 'dimensions',
    }),

    // --- Capacity ---
    defineField({
      name: 'capacityTable',
      title: 'Capacity table',
      type: 'array',
      of: [{ type: 'capacityRow' }],
      group: 'capacity',
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'reductionTables',
      title: 'Applicable load reduction tables',
      description: 'Free-edge / thin-wall SWL reduction factor tables that apply to this part (coil inserts).',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'loadReductionTable' }] }],
      group: 'capacity',
    }),
    defineField({
      name: 'safetyFactor',
      title: 'Published safety factor',
      description: 'e.g. 4 for a 4:1 SWL',
      type: 'number',
      initialValue: 4,
      group: 'capacity',
    }),

    // --- Compatibility ---
    defineField({
      name: 'elementTypes',
      title: 'Suitable precast element types',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'elementType' }] }],
      group: 'compatibility',
    }),
    defineField({
      name: 'compatibleLiftingEyes',
      title: 'Compatible lifting eyes',
      description: 'For cast-in pin anchors that require a matching hook/bail.',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'liftingEye' }] }],
      group: 'compatibility',
    }),
    defineField({
      name: 'compatibleRecessSystems',
      title: 'Compatible recess systems',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'recessSystem' }] }],
      group: 'compatibility',
    }),
    defineField({
      name: 'installationNotes',
      title: 'Installation / orientation notes',
      type: 'array',
      of: [{ type: 'block' }],
      group: 'compatibility',
    }),
  ],
  preview: {
    select: { title: 'title', partNumber: 'partNumber', media: 'image' },
    prepare({ title, partNumber, media }) {
      return { title, subtitle: partNumber, media }
    },
  },
})
