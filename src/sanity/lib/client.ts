import { createClient } from 'next-sanity'

import { apiVersion, dataset, projectId } from '../env'

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  // `false` in development so edits show up immediately without a CDN cache;
  // Vercel/production builds can flip this to `true` once content is stable.
  useCdn: process.env.NODE_ENV === 'production',
})
