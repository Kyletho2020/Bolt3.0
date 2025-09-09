import React from 'react'
import { FileText, Building, User, Phone, MapPin, ClipboardList, X } from 'lucide-react'
import HubSpotContactSearch from './HubSpotContactSearch'
import { HubSpotContact } from '../services/hubspotService'
import { UseFormRegister, FieldErrors } from 'react-hook-form'

export interface ProjectDetailsData {
  projectName: string
  companyName: string
  contactName: string
  siteAddress: string
  sitePhone: string
  shopLocation: string
  scopeOfWork: string
  email?: string
}

interface ProjectDetailsProps {
  data: ProjectDetailsData
  onChange: (field: keyof ProjectDetailsData, value: string) => void
  onSelectContact: (contact: HubSpotContact) => void
  register: UseFormRegister<ProjectDetailsData>
  errors: FieldErrors<ProjectDetailsData>
}

const ProjectDetails: React.FC<ProjectDetailsProps> = ({ data, onChange, onSelectContact, register, errors }) => {
  const handleFieldChange = (field: keyof ProjectDetailsData, value: string) => {
    onChange(field, value)
  }

  const clearSection = () => {
    ;(['projectName', 'companyName', 'contactName', 'siteAddress', 'sitePhone', 'scopeOfWork', 'email'] as (keyof ProjectDetailsData)[]).forEach(field => {
      onChange(field, '')
    })
    onChange('shopLocation', 'Shop')
  }

  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white">Project Details</h3>
        <button
          type="button"
          onClick={clearSection}
          className="flex items-center px-3 py-1 bg-gray-900 border border-accent rounded-lg hover:bg-gray-800 transition-colors text-white"
        >
          <X className="w-4 h-4 mr-1" />
          Clear Section
        </button>
      </div>

      <HubSpotContactSearch onSelectContact={onSelectContact} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            <FileText className="w-4 h-4 inline mr-1" />
            Project Name
          </label>
          {(() => {
            const field = register('projectName')
            return (
              <>
                <input
                  type="text"
                  value={data.projectName}
                  onChange={(e) => {
                    field.onChange(e)
                    handleFieldChange('projectName', e.target.value)
                  }}
                  className="w-full px-3 py-2 bg-black border border-accent rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-white"
                  placeholder="Enter project name"
                />
                {errors.projectName && (
                  <p className="text-red-500 text-xs mt-1">{String(errors.projectName.message)}</p>
                )}
              </>
            )
          })()}
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            <Building className="w-4 h-4 inline mr-1" />
            Company Name
          </label>
          {(() => {
            const field = register('companyName')
            return (
              <>
                <input
                  type="text"
                  value={data.companyName}
                  onChange={(e) => {
                    field.onChange(e)
                    handleFieldChange('companyName', e.target.value)
                  }}
                  className="w-full px-3 py-2 bg-black border border-accent rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-white"
                  placeholder="Enter company name"
                />
                {errors.companyName && (
                  <p className="text-red-500 text-xs mt-1">{String(errors.companyName.message)}</p>
                )}
              </>
            )
          })()}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            <User className="w-4 h-4 inline mr-1" />
            Site Contact
          </label>
          {(() => {
            const field = register('contactName')
            return (
              <>
                <input
                  type="text"
                  value={data.contactName}
                  onChange={(e) => {
                    field.onChange(e)
                    handleFieldChange('contactName', e.target.value)
                  }}
                  className="w-full px-3 py-2 bg-black border border-accent rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-white"
                  placeholder="Enter site contact"
                />
                {errors.contactName && (
                  <p className="text-red-500 text-xs mt-1">{String(errors.contactName.message)}</p>
                )}
              </>
            )
          })()}
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            <Phone className="w-4 h-4 inline mr-1" />
            Site Phone
          </label>
          {(() => {
            const field = register('sitePhone')
            return (
              <>
                <input
                  type="tel"
                  value={data.sitePhone}
                  onChange={(e) => {
                    field.onChange(e)
                    handleFieldChange('sitePhone', e.target.value)
                  }}
                  className="w-full px-3 py-2 bg-black border border-accent rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-white"
                  placeholder="Enter site phone"
                />
                {errors.sitePhone && (
                  <p className="text-red-500 text-xs mt-1">{String(errors.sitePhone.message)}</p>
                )}
              </>
            )
          })()}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-2">
          <MapPin className="w-4 h-4 inline mr-1" />
          Site Address
        </label>
        {(() => {
          const field = register('siteAddress')
          return (
            <>
              <input
                type="text"
                value={data.siteAddress}
                onChange={(e) => {
                  field.onChange(e)
                  handleFieldChange('siteAddress', e.target.value)
                }}
                className="w-full px-3 py-2 bg-black border border-accent rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-white"
                placeholder="Enter site address"
              />
              {errors.siteAddress && (
                <p className="text-red-500 text-xs mt-1">{String(errors.siteAddress.message)}</p>
              )}
            </>
          )
        })()}
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-2">
          <MapPin className="w-4 h-4 inline mr-1" />
          Shop Location
        </label>
        {(() => {
          const field = register('shopLocation')
          return (
            <>
              <select
                value={data.shopLocation}
                onChange={(e) => {
                  field.onChange(e)
                  handleFieldChange('shopLocation', e.target.value)
                }}
                className="w-full px-3 py-2 bg-black border border-accent rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-white"
              >
                <option value="Shop">Shop</option>
                <option value="Mukilteo">Mukilteo</option>
                <option value="Fife">Fife</option>
              </select>
              {errors.shopLocation && (
                <p className="text-red-500 text-xs mt-1">{String(errors.shopLocation.message)}</p>
              )}
            </>
          )
        })()}
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-2">
          <ClipboardList className="w-4 h-4 inline mr-1" />
          Scope of Work
        </label>
        {(() => {
          const field = register('scopeOfWork')
          return (
            <>
              <textarea
                value={data.scopeOfWork}
                onChange={(e) => {
                  field.onChange(e)
                  handleFieldChange('scopeOfWork', e.target.value)
                }}
                rows={3}
                className="w-full px-3 py-2 bg-black border border-accent rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent resize-none text-white"
                placeholder="Describe scope of work"
              />
              {errors.scopeOfWork && (
                <p className="text-red-500 text-xs mt-1">{String(errors.scopeOfWork.message)}</p>
              )}
            </>
          )
        })()}
      </div>
    </div>
  )
}

export default ProjectDetails

