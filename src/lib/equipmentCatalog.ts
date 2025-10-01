export interface EquipmentItem {
  name: string
  quantity: number
}

export type EquipmentField =
  | 'forklifts'
  | 'tractors'
  | 'trailers'
  | 'additionalEquipment'

export interface EquipmentRequirements {
  crewSize: string
  forklifts: EquipmentItem[]
  tractors: EquipmentItem[]
  trailers: EquipmentItem[]
  additionalEquipment: EquipmentItem[]
}

export interface EquipmentSection {
  label: string
  field: EquipmentField
  options: string[]
}

const forkliftOptions = [
  'Forklift (5k)',
  'Forklift (8k)',
  'Forklift (15k)',
  'Forklift (30k)',
  'Forklift (12k Reach)',
  'Forklift (20k Reach)',
  'Forklift – Hoist 18/26',
  'Versalift 25/35',
  'Versalift 40/60',
  'Versalift 60/80',
  'Trilifter'
]

const tractorOptions = ['3-axle tractor', '4-axle tractor', 'Rollback']

const trailerOptions = ['Dovetail', 'Flatbed', 'Lowboy', 'Step Deck']

const additionalEquipmentOptions = [
  'Material Handler',
  '1-ton Gantry',
  '5-ton Gantry',
  "8'x20' Metal Plate",
  "8'x10' Metal Plate",
  'Lift Platform'
]

export const equipmentSections: EquipmentSection[] = [
  { label: 'Forklifts', field: 'forklifts', options: forkliftOptions },
  { label: 'Tractors', field: 'tractors', options: tractorOptions },
  { label: 'Trailers', field: 'trailers', options: trailerOptions },
  {
    label: 'Material Handling & Rigging',
    field: 'additionalEquipment',
    options: additionalEquipmentOptions
  }
]

export const createEmptyEquipmentRequirements = (): EquipmentRequirements => ({
  crewSize: '',
  forklifts: [],
  tractors: [],
  trailers: [],
  additionalEquipment: []
})

export const getEquipmentOptions = (field: EquipmentField): string[] => {
  const section = equipmentSections.find((section) => section.field === field)
  return section ? section.options : []
}
