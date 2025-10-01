import { useState } from 'react'
import { HubSpotContact } from '../services/hubspotService'
import {
  EquipmentRequirements,
  createEmptyEquipmentRequirements
} from '../lib/equipmentCatalog'
import { EquipmentData } from '../types'

export const useEquipmentForm = () => {
  const createInitialEquipmentData = (): EquipmentData => ({
    projectName: '',
    companyName: '',
    contactName: '',
    siteAddress: '',
    sitePhone: '',
    shopLocation: 'Shop',
    scopeOfWork: '',
    email: '',
    equipmentRequirements: createEmptyEquipmentRequirements()
  })

  const [equipmentData, setEquipmentData] = useState<EquipmentData>(createInitialEquipmentData)

  const handleEquipmentChange = (field: string, value: string) => {
    setEquipmentData((prev) => ({ ...prev, [field]: value }))
  }

  const handleEquipmentRequirementsChange = (equipment: EquipmentRequirements) => {
    setEquipmentData((prev) => ({ ...prev, equipmentRequirements: equipment }))
  }

  const handleSelectHubSpotContact = (contact: HubSpotContact) => {
    setEquipmentData((prev) => ({
      ...prev,
      contactName: `${contact.firstName} ${contact.lastName}`.trim(),
      email: contact.email,
      sitePhone: contact.phone || prev.sitePhone,
      companyName: contact.companyName || prev.companyName,
      siteAddress: contact.contactAddress || contact.companyAddress || prev.siteAddress
    }))
  }

  return {
    equipmentData,
    setEquipmentData,
    initialEquipmentData: createInitialEquipmentData(),
    handleEquipmentChange,
    handleEquipmentRequirementsChange,
    handleSelectHubSpotContact
  }
}

export default useEquipmentForm
