import React from 'react';
import { FileText } from 'lucide-react';
import ProjectDetails from './ProjectDetails';
import EquipmentRequired, { EquipmentRequirements } from './EquipmentRequired';
import { HubSpotContact } from '../services/hubspotService';

interface EquipmentFormProps {
  data: any;
  onFieldChange: (field: string, value: string) => void;
  onRequirementsChange: (data: EquipmentRequirements) => void;
  onSelectContact: (contact: HubSpotContact) => void;
}

const EquipmentForm: React.FC<EquipmentFormProps> = ({
  data,
  onFieldChange,
  onRequirementsChange,
  onSelectContact
}) => {
  return (
    <div className="bg-gray-900 rounded-lg border-2 border-accent p-6">
      <div className="flex items-center mb-6">
        <FileText className="w-6 h-6 text-white mr-2" />
        <h2 className="text-2xl font-bold text-white">Equipment Quote</h2>
      </div>
      <ProjectDetails
        data={data}
        onChange={onFieldChange}
        onSelectContact={onSelectContact}
      />
      <EquipmentRequired
        data={data.equipmentRequirements}
        onChange={onRequirementsChange}
      />
    </div>
  );
};

export default EquipmentForm;
