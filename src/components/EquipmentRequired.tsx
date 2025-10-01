import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { X, Plus, Minus, ChevronDown, ChevronRight } from 'lucide-react'

import {
  EquipmentField,
  EquipmentRequirements,
  createEmptyEquipmentRequirements,
  equipmentSections
} from '../lib/equipmentCatalog'

interface EquipmentRequiredProps {
  data: EquipmentRequirements
  onChange: (data: EquipmentRequirements) => void
}

const EquipmentRequired: React.FC<EquipmentRequiredProps> = ({ data, onChange }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [showAllOptions, setShowAllOptions] = useState(false)
  const [activeCategory, setActiveCategory] = useState<EquipmentField | null>(() => {
    const firstSelected = equipmentSections.find((section) => data[section.field].length > 0)

    return firstSelected ? firstSelected.field : null
  })

  const handleFieldChange = useCallback(
    <K extends keyof EquipmentRequirements>(field: K, value: EquipmentRequirements[K]) => {
      onChange({ ...data, [field]: value })
    },
    [data, onChange]
  )

  const adjustQuantity = useCallback(
    (field: EquipmentField, name: string, delta: number) => {
      const items = data[field]
      const index = items.findIndex((item) => item.name === name)

      if (index >= 0) {
        const newQty = items[index].quantity + delta

        if (newQty <= 0) {
          handleFieldChange(
            field,
            items.filter((_, itemIndex) => itemIndex !== index)
          )
        } else {
          const newItems = [...items]
          newItems[index] = { name, quantity: newQty }
          handleFieldChange(field, newItems)
        }

        return
      }

      if (delta > 0) {
        handleFieldChange(field, [...items, { name, quantity: 1 }])
      }
    },
    [data, handleFieldChange]
  )

  const getQuantity = useCallback(
    (field: EquipmentField, name: string) =>
      data[field].find((item) => item.name === name)?.quantity || 0,
    [data]
  )

  const normalizedQuery = searchQuery.trim().toLowerCase()

  const filteredSections = useMemo(
    () =>
      equipmentSections.map((section) => ({
        ...section,
        options: section.options.filter((option) => option.toLowerCase().includes(normalizedQuery))
      })),
    [normalizedQuery]
  )

  const totalsByField = useMemo(
    () =>
      equipmentSections.reduce<Record<EquipmentField, number>>((acc, section) => {
        acc[section.field] = data[section.field].reduce((total, item) => total + item.quantity, 0)
        return acc
      }, {} as Record<EquipmentField, number>),
    [data]
  )

  const selectedItems = useMemo(
    () =>
      equipmentSections.flatMap((section) =>
        data[section.field].map((item) => ({
          ...item,
          field: section.field,
          label: section.label
        }))
      ),
    [data]
  )

  const handleToggleCategory = useCallback((field: EquipmentField) => {
    setActiveCategory((previous) => (previous === field ? null : field))
  }, [])

  const handleClearCategory = useCallback(
    (field: EquipmentField) => {
      if (data[field].length === 0) {
        return
      }

      handleFieldChange(field, [])
    },
    [data, handleFieldChange]
  )

  const handleShowAllOptions = useCallback(() => {
    setShowAllOptions((previous) => !previous)
  }, [])

  useEffect(() => {
    if (!showAllOptions) {
      return
    }

    const sectionWithMatches = filteredSections.find((section) => section.options.length > 0)

    if (sectionWithMatches) {
      setActiveCategory((previous) => {
        if (
          previous &&
          filteredSections.some((section) => section.field === previous && section.options.length > 0)
        ) {
          return previous
        }

        return sectionWithMatches.field
      })

      return
    }

    const sectionWithSelections = equipmentSections.find((section) => data[section.field].length > 0)

    setActiveCategory(sectionWithSelections ? sectionWithSelections.field : null)
  }, [showAllOptions, filteredSections, data])

  const clearSection = useCallback(() => {
    onChange(createEmptyEquipmentRequirements())
  }, [onChange])

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
          onChange={(event) => handleFieldChange('crewSize', event.target.value)}
          className="w-full px-3 py-2 bg-black border border-accent rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-white"
        >
          <option value="" disabled>
            Select crew size
          </option>
          {Array.from({ length: 9 }, (_, index) => index + 2).map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-4">
        <div className="bg-gray-900 border border-accent rounded-lg p-4 text-white">
          <h4 className="text-lg font-semibold mb-3">Selected Equipment</h4>
          {selectedItems.length > 0 ? (
            <div className="space-y-2">
              {selectedItems.map((item) => (
                <div
                  key={`${item.field}-${item.name}`}
                  className="flex items-center justify-between bg-black/40 border border-accent/60 rounded-lg px-3 py-2"
                >
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-xs text-gray-300">{item.label}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => adjustQuantity(item.field, item.name, -1)}
                      className="p-1 bg-gray-800 rounded hover:bg-gray-700"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => adjustQuantity(item.field, item.name, 1)}
                      className="p-1 bg-gray-800 rounded hover:bg-gray-700"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-300">No equipment selected yet.</p>
          )}
          <button
            type="button"
            onClick={handleShowAllOptions}
            className="mt-4 inline-flex items-center px-3 py-1 bg-black border border-accent rounded-lg hover:bg-gray-800 transition-colors"
          >
            {showAllOptions ? 'Hide equipment list' : 'Add or adjust equipment'}
          </button>
        </div>

        {showAllOptions && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">Search Equipment</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Type to filter equipment"
                className="w-full px-3 py-2 bg-black border border-accent rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-white"
              />
            </div>

            <div className="space-y-2">
              {filteredSections.map((section) => {
                const isActive = activeCategory === section.field
                const hasOptions = section.options.length > 0
                const selectedCount = totalsByField[section.field]

                return (
                  <div key={section.field} className="border border-accent rounded-lg overflow-hidden">
                    <button
                      type="button"
                      onClick={() => handleToggleCategory(section.field)}
                      className="w-full flex items-center justify-between gap-3 px-4 py-2 bg-gray-900 text-white hover:bg-gray-800"
                    >
                      <span className="flex items-center gap-2">
                        {isActive ? (
                          <ChevronDown className="w-4 h-4" aria-hidden="true" />
                        ) : (
                          <ChevronRight className="w-4 h-4" aria-hidden="true" />
                        )}
                        {section.label}
                      </span>
                      <span className="text-sm text-gray-300">{selectedCount} selected</span>
                    </button>
                    {isActive && (
                      <div className="bg-black/50 px-4 py-3 space-y-2">
                        <div className="flex items-center justify-between pb-2">
                          <p className="text-sm text-gray-300">
                            {hasOptions
                              ? 'Adjust quantities below.'
                              : normalizedQuery
                              ? 'No equipment matches your search.'
                              : 'No catalog options available.'}
                          </p>
                          <button
                            type="button"
                            onClick={() => handleClearCategory(section.field)}
                            className="text-xs text-accent hover:underline disabled:opacity-40"
                            disabled={selectedCount === 0}
                          >
                            Clear selected
                          </button>
                        </div>
                        {hasOptions &&
                          section.options.map((option) => {
                            const quantity = getQuantity(section.field, option)
                            return (
                              <div
                                key={option}
                                className="flex items-center justify-between bg-gray-900 border border-accent rounded-lg px-3 py-2 text-white"
                              >
                                <span>{option}</span>
                                <div className="flex items-center space-x-2">
                                  <button
                                    type="button"
                                    onClick={() => adjustQuantity(section.field, option, -1)}
                                    className="p-1 bg-gray-800 rounded hover:bg-gray-700"
                                    aria-label={`Decrease ${option}`}
                                  >
                                    <Minus className="w-4 h-4" />
                                  </button>
                                  <span aria-live="polite">{quantity}</span>
                                  <button
                                    type="button"
                                    onClick={() => adjustQuantity(section.field, option, 1)}
                                    className="p-1 bg-gray-800 rounded hover:bg-gray-700"
                                    aria-label={`Increase ${option}`}
                                  >
                                    <Plus className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            )
                          })}
                      </div>
                    )}
                  </div>
                )
              })}
              {filteredSections.every((section) => section.options.length === 0) && (
                <p className="text-sm text-gray-300 text-center py-4">No equipment matches your search.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default EquipmentRequired
