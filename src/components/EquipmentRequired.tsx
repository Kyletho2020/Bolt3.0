import React from 'react'
import { X, Plus, Minus } from 'lucide-react'

export interface EquipmentItem {
  name: string
  quantity: number
}

export interface EquipmentRequirements {
  crewSize: string
  forklifts: EquipmentItem[]
  tractors: EquipmentItem[]
  trailers: EquipmentItem[]
  additionalEquipment: EquipmentItem[]
}

interface EquipmentRequiredProps {
  data: EquipmentRequirements
  onChange: (data: EquipmentRequirements) => void
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
  'Trilifter',
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

type EquipmentField =
  | 'forklifts'
  | 'tractors'
  | 'trailers'
  | 'additionalEquipment'

const EquipmentRequired: React.FC<EquipmentRequiredProps> = ({ data, onChange }) => {
  const handleFieldChange = <K extends keyof EquipmentRequirements>(
    field: K,
    value: EquipmentRequirements[K]
  ) => {
    onChange({ ...data, [field]: value })
  }

  const adjustQuantity = (
    field: EquipmentField,
    name: string,
    delta: number
  ) => {
    const items = data[field]
    const index = items.findIndex((i) => i.name === name)
    if (index >= 0) {
      const newQty = items[index].quantity + delta
      if (newQty <= 0) {
        handleFieldChange(
          field,
          items.filter((_, i) => i !== index)
        )
      } else {
        const newItems = [...items]
        newItems[index] = { name, quantity: newQty }
        handleFieldChange(field, newItems)
      }
    } else if (delta > 0) {
      handleFieldChange(field, [...items, { name, quantity: 1 }])
    }
  }

  const getQuantity = (
    field: EquipmentField,
    name: string
  ) => data[field].find((i) => i.name === name)?.quantity || 0

  const clearSection = () => {
    onChange({
      crewSize: '',
      forklifts: [],
      tractors: [],
      trailers: [],
      additionalEquipment: []
    })
  }

  const renderOptionList = (
    label: string,
    field: EquipmentField,
    options: string[]
  ) => (
    <div>
      <label className="block text-sm font-medium text-white mb-2">{label}</label>
      <div className="space-y-2">
        {options.map((option) => {
          const qty = getQuantity(field, option)
          return (
            <div
              key={option}
              className="flex items-center justify-between bg-gray-900 border border-accent rounded-lg px-3 py-1 text-white"
            >
              <span>{option}</span>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => adjustQuantity(field, option, -1)}
                  className="p-1 bg-gray-800 rounded hover:bg-gray-700"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span>{qty}</span>
                <button
                  type="button"
                  onClick={() => adjustQuantity(field, option, 1)}
                  className="p-1 bg-gray-800 rounded hover:bg-gray-700"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )

  return (
    <div className="mt-6 space-y-6">
      <div className="flex items-center justify-between">
      <h3 className="text-xl font-bold text-white">Equipment Requirements</h3>
        <button
          type="button"
          onClick={clearSection}
          className="flex items-center px-3 py-1 bg-gray-900 border border-accent rounded-lg hover:bg-gray-800 transition-colors text-white"
        >
          <X className="w-4 h-4 mr-1" />
          Clear Section
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-2">Crew Size</label>
        <select
          value={data.crewSize}
          onChange={(e) => handleFieldChange('crewSize', e.target.value)}
          className="w-full px-3 py-2 bg-black border border-accent rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-white"
        >
          <option value="" disabled>
            Select crew size
          </option>
          {Array.from({ length: 9 }, (_, i) => i + 2).map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>

      {renderOptionList('Forklifts', 'forklifts', forkliftOptions)}
      {renderOptionList('Tractors', 'tractors', tractorOptions)}
      {renderOptionList('Trailers', 'trailers', trailerOptions)}
      {renderOptionList('Material Handling & Rigging', 'additionalEquipment', additionalEquipmentOptions)}
    </div>
  )
}

export default EquipmentRequired
