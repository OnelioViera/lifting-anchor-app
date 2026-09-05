import { type SchemaTypeDefinition } from 'sanity'

import dimensionField from './objects/dimensionField'
import capacityRow from './objects/capacityRow'

import brand from './documents/brand'
import anchorFamily from './documents/anchorFamily'
import elementType from './documents/elementType'
import liftingEye from './documents/liftingEye'
import recessSystem from './documents/recessSystem'
import loadReductionTable from './documents/loadReductionTable'
import liftingAnchor from './documents/liftingAnchor'
import calculatorSettings from './documents/calculatorSettings'

export const schemaTypes: SchemaTypeDefinition[] = [
  // objects
  dimensionField,
  capacityRow,
  // documents
  brand,
  anchorFamily,
  elementType,
  liftingEye,
  recessSystem,
  loadReductionTable,
  liftingAnchor,
  calculatorSettings,
]
