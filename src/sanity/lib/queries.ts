import { groq } from 'next-sanity'

export const ALL_ANCHORS_QUERY = groq`
  *[_type == "liftingAnchor"] | order(family->title asc, partNumber asc) {
    _id,
    title,
    partNumber,
    slug,
    sizeLabel,
    image,
    finish,
    colorCode,
    weightLbs,
    tonnageRating,
    wireDiameterIn,
    boltDiameterIn,
    typicalElementThicknessIn,
    dimensions,
    capacityTable,
    safetyFactor,
    "brand": brand->{title, slug, logo},
    "family": family->{title, slug, anchorType},
    "elementTypes": elementTypes[]->{title, slug},
  }
`

export const ANCHOR_BY_SLUG_QUERY = groq`
  *[_type == "liftingAnchor" && slug.current == $slug][0] {
    ...,
    "brand": brand->{title, slug, logo, website},
    "family": family->{
      title, slug, anchorType, description, safetyNotes, diagramImage,
      minEdgeDistanceFormula, minSpacingFormula
    },
    "elementTypes": elementTypes[]->{title, slug},
    "compatibleLiftingEyes": compatibleLiftingEyes[]->{title, partNumber, tonnageRangeLabel, image},
    "compatibleRecessSystems": compatibleRecessSystems[]->{title, systemType, tonnageRating, image},
    "reductionTables": reductionTables[]->,
  }
`

export const ELEMENT_TYPES_QUERY = groq`
  *[_type == "elementType"] | order(title asc) {
    _id, title, slug, geometryType, description, diagramImage, typicalPickPatterns
  }
`

export const ANCHOR_FAMILIES_QUERY = groq`
  *[_type == "anchorFamily"] | order(title asc) {
    _id, title, slug, anchorType, "brand": brand->{title, slug}
  }
`

export const CALCULATOR_SETTINGS_QUERY = groq`
  *[_type == "calculatorSettings"][0] {
    slingAngleLoadFactors,
    dynamicLoadFactors,
  }
`
