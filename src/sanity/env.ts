export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-01-01'

// These fall back to harmless placeholders (rather than throwing) so the
// app and Studio can boot before you've created a real Sanity project.
// See README.md → "Connect Sanity" for how to fill in the real values.
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'placeholder-project-id'

export const isSanityConfigured = Boolean(
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID &&
    process.env.NEXT_PUBLIC_SANITY_PROJECT_ID !== 'placeholder-project-id'
)
