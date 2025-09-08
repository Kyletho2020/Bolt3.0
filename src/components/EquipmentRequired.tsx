import React from 'react'
import { Plus, X } from 'lucide-react'

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

  const addItem = (
    field: 'forkliftModels' | 'tractors' | 'trailers',
    label: string
  ) => {
    const newItem = window.prompt(`Enter ${label.slice(0, -1)}`)
    if (newItem && newItem.trim()) {
      handleArrayChange(field, [...data[field], newItem.trim()])
    }
  }

  const removeItem = (
    field: 'forkliftModels' | 'tractors' | 'trailers',
    index: number
  ) => {
    const updated = data[field].filter((_, i) => i !== index)
    handleArrayChange(field, updated)
  }

  const clearSection = () => {
    onChange({ crewSize: '', forkliftModels: [], tractors: [], trailers: [] })
  }

  const renderList = (label: string, field: 'forkliftModels' | 'tractors' | 'trailers') => (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-white">{label}</label>
        <button
          type="button"
          onClick={() => addItem(field, label)}
          className="p-1 bg-accent text-black rounded hover:bg-green-400 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {data[field].map((item, index) => (
          <div
            key={index}
            className="flex items-center bg-gray-900 border border-accent text-white rounded-full px-3 py-1"
          >
            <span className="mr-1">+ {item}</span>
            <button
              type="button"
              onClick={() => removeItem(field, index)}
              className="p-0.5 rounded-full hover:bg-accent hover:text-black"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
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

      {renderList('Forklift Models', 'forkliftModels')}
      {renderList('Tractors', 'tractors')}
      {renderList('Trailers', 'trailers')}
    </div>
  )
}

export default EquipmentRequired
