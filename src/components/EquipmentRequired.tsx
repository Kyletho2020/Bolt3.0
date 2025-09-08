import React from 'react'
import { Plus, Minus, X } from 'lucide-react'

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
    index: number,
    value: string
  ) => {
    const updated = [...data[field]]
    updated[index] = value
    handleFieldChange(field, updated)
  }

  const addItem = (field: 'forkliftModels' | 'tractors' | 'trailers') => {
    handleFieldChange(field, [...data[field], ''])
  }

  const removeItem = (field: 'forkliftModels' | 'tractors' | 'trailers', index: number) => {
    const updated = data[field].filter((_, i) => i !== index)
    handleFieldChange(field, updated)
  }

  const clearSection = () => {
    onChange({ crewSize: '', forkliftModels: [''], tractors: [''], trailers: [''] })
  }

  const renderList = (label: string, field: 'forkliftModels' | 'tractors' | 'trailers') => (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-white">{label}</label>
        <button
          type="button"
          onClick={() => addItem(field)}
          className="p-1 bg-accent text-black rounded hover:bg-green-400 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      <div className="space-y-2">
        {data[field].map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              type="text"
              value={item}
              onChange={(e) => handleArrayChange(field, index, e.target.value)}
              className="flex-1 px-3 py-2 bg-black border border-accent rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-white"
              placeholder={`Enter ${label.toLowerCase().slice(0, -1)}`}
            />
            <button
              type="button"
              onClick={() => removeItem(field, index)}
              className="p-1 bg-gray-900 border border-accent rounded hover:bg-gray-800"
            >
              <Minus className="w-4 h-4 text-white" />
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
        <input
          type="text"
          value={data.crewSize}
          onChange={(e) => handleFieldChange('crewSize', e.target.value)}
          className="w-full px-3 py-2 bg-black border border-accent rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-white"
          placeholder="Enter crew size"
        />
      </div>

      {renderList('Forklift Models', 'forkliftModels')}
      {renderList('Tractors', 'tractors')}
      {renderList('Trailers', 'trailers')}
    </div>
  )
}

export default EquipmentRequired
