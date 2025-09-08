import React from 'react'
import { X } from 'lucide-react'

export interface EquipmentRequirements {
  crewSize: string
  forkliftModels: string[]
  tractors: string[]
  trailers: string[]
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
  'Forklift – Hoist 18/26',
  'Versalift 25/35',
  'Versalift 40/60',
  'Versalift 60/80',
  'Trilifter',
]

const tractorOptions = ['3-axle tractor', '4-axle tractor', 'Rollback']

const trailerOptions = ['Dovetail', 'Flatbed', 'Lowboy', 'Step Deck']

const EquipmentRequired: React.FC<EquipmentRequiredProps> = ({ data, onChange }) => {
  const handleFieldChange = <K extends keyof EquipmentRequirements>(
    field: K,
    value: EquipmentRequirements[K]
  ) => {
    onChange({ ...data, [field]: value })
  }

  const handleArrayChange = (
    field: 'forkliftModels' | 'tractors' | 'trailers',
    items: string[]
  ) => {
    handleFieldChange(field, items)
  }

  const clearSection = () => {
    onChange({ crewSize: '', forkliftModels: [], tractors: [], trailers: [] })
  }

  const renderOptionList = (
    label: string,
    field: 'forkliftModels' | 'tractors' | 'trailers',
    options: string[]
  ) => (
    <div>
      <label className="block text-sm font-medium text-white mb-2">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const checked = data[field].includes(option)
          return (
            <label
              key={option}
              className="flex items-center bg-gray-900 border border-accent text-white rounded-full px-3 py-1 space-x-2"
            >
              <input
                type="checkbox"
                className="form-checkbox h-4 w-4 text-accent"
                checked={checked}
                onChange={(e) => {
                  if (e.target.checked) {
                    handleArrayChange(field, [...data[field], option])
                  } else {
                    handleArrayChange(
                      field,
                      data[field].filter((item) => item !== option)
                    )
                  }
                }}
              />
              <span>{option}</span>
            </label>
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

      {renderOptionList('Forklift Models', 'forkliftModels', forkliftOptions)}
      {renderOptionList('Tractors', 'tractors', tractorOptions)}
      {renderOptionList('Trailers', 'trailers', trailerOptions)}
    </div>
  )
}

export default EquipmentRequired
