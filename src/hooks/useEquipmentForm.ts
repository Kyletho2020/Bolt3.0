import { useState } from 'react';
import { HubSpotContact } from '../services/hubspotService';
import { EquipmentRequirements } from '../components/EquipmentRequired';

export const useEquipmentForm = () => {
  const initialEquipmentRequirements: EquipmentRequirements = {
    crewSize: '',
    forklifts: [],
    tractors: [],
    trailers: [],
    additionalEquipment: []
  };

  const initialEquipmentData = {
    projectName: '',
    companyName: '',
    contactName: '',
    siteAddress: '',
    sitePhone: '',
    shopLocation: 'Shop',
    scopeOfWork: '',
    email: '',
    equipmentRequirements: initialEquipmentRequirements
  };

  const [equipmentData, setEquipmentData] = useState(initialEquipmentData);

  const handleEquipmentChange = (field: string, value: string) => {
    setEquipmentData(prev => ({ ...prev, [field]: value }));
  };

  const handleEquipmentRequirementsChange = (data: EquipmentRequirements) => {
    setEquipmentData(prev => ({ ...prev, equipmentRequirements: data }));
  };

  const handleSelectHubSpotContact = (contact: HubSpotContact) => {
    setEquipmentData(prev => ({
      ...prev,
      contactName: `${contact.firstName} ${contact.lastName}`.trim(),
      email: contact.email,
      sitePhone: contact.phone || prev.sitePhone,
      companyName: contact.companyName || prev.companyName,
      siteAddress: contact.contactAddress || contact.companyAddress || prev.siteAddress
    }));
  };

  return {
    equipmentData,
    setEquipmentData,
    initialEquipmentData,
    handleEquipmentChange,
    handleEquipmentRequirementsChange,
    handleSelectHubSpotContact
  };
};

export default useEquipmentForm;
