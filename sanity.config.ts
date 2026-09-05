'use client'

import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'

import { apiVersion, dataset, projectId } from './src/sanity/env'
import { schemaTypes } from './src/sanity/schemaTypes'
import { structure } from './src/sanity/structure'

export default defineConfig({
  name: 'default',
  title: 'Lindsay Precast — Lifting Anchor Calculator',

  projectId,
  dataset,

  basePath: '/studio',

  plugins: [
    structureTool({ structure }),
    // Vision lets you run raw GROQ queries inside the Studio — handy while
    // building out the calculator's data queries.
    visionTool({ defaultApiVersion: apiVersion }),
  ],

  schema: {
    types: schemaTypes,
  },
})
