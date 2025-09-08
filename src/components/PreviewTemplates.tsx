/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react'
import { FileText, Mail, Copy, CheckCircle, Eye, X } from 'lucide-react'

export const generateEmailTemplate = (
  equipmentData: any,
  logisticsData: any,
  equipmentRequirements: any
) => {
  const projectName = equipmentData.projectName || '[project name]'
  const companyName = equipmentData.companyName || '[Company Name]'
  const contactName = equipmentData.contactName || '[Contact Name]'
  const siteAddress = equipmentData.siteAddress || '[Site Address]'
  const sitePhone = equipmentData.sitePhone || '[Site Phone]'
  const shopLocation = equipmentData.shopLocation || '[Shop Location]'
  const scopeOfWork = equipmentData.scopeOfWork || ''

  const crewSize = equipmentRequirements.crewSize || ''
  const forklifts = (equipmentRequirements.forkliftModels || []).filter((f: string) => f)
  const tractors = (equipmentRequirements.tractors || []).filter((t: string) => t)
  const trailers = (equipmentRequirements.trailers || []).filter((t: string) => t)

  const equipmentLines =
    crewSize || forklifts.length || tractors.length || trailers.length
      ? `EQUIPMENT REQUIREMENTS:\n${
          crewSize ? `• Crew Size: ${crewSize}\n` : ''
        }${forklifts.length ? `• Forklifts: ${forklifts.join(', ')}\n` : ''}${
          tractors.length ? `• Tractors: ${tractors.join(', ')}\n` : ''
        }${trailers.length ? `• Trailers: ${trailers.join(', ')}\n` : ''}\n`
      : ''

  const pickupAddress = logisticsData.pickupAddress || siteAddress
  const deliveryAddress = logisticsData.deliveryAddress || ''

  const logisticsLines = [
    pickupAddress ? `• Pickup Location: ${pickupAddress}` : '',
    deliveryAddress ? `• Delivery Location: ${deliveryAddress}` : '',
    logisticsData.serviceType ? `• Service Type: ${logisticsData.serviceType}` : '',
    logisticsData.shipmentType ? `• Shipment Type: ${logisticsData.shipmentType}` : '',
    logisticsData.truckType ? `• Truck Type: ${logisticsData.truckType}` : '',
    logisticsData.storageType
      ? `• Storage: ${
          logisticsData.storageType === 'inside' ? 'Inside' : 'Outside'
        } (${logisticsData.storageSqFt || '[Sq Ft]'} sq ft)`
      : ''
  ]
    .filter(Boolean)
    .join('\n')

  const logisticsSection = logisticsLines
    ? `LOGISTICS REQUIREMENTS:\n${logisticsLines}\n\n`
    : ''

  const itemsSection =
    logisticsData.pieces && logisticsData.pieces.length > 0
      ? `ITEMS TO TRANSPORT:\n${logisticsData.pieces
          .map(
            (piece: any, index: number) =>
              `${index + 1}. (Qty: ${piece.quantity || 1}) ${
                piece.description || '[Description]'
              } - ${piece.length || '[L]'}"L x ${piece.width || '[W]'}"W x ${
                piece.height || '[H]'
              }"H, ${piece.weight || '[Weight]'} lbs`
          )
          .join('\n')}\n\n`
      : ''

  return `Subject: Quote Request - ${projectName}

Dear Omega Morgan Team,

I hope this email finds you well. I am writing to request a quote for an upcoming project that requires your specialized equipment and logistics services.

PROJECT DETAILS:
• Project Name: ${projectName}
• Company: ${companyName}
• Contact: ${contactName}
• Site Phone: ${sitePhone}
• Site Address: ${siteAddress}
• Shop Location: ${shopLocation}

${scopeOfWork ? `SCOPE OF WORK:\n${scopeOfWork}\n\n` : ''}${equipmentLines}${logisticsSection}${itemsSection}Please provide a detailed quote including all equipment, labor, and transportation costs. We would appreciate receiving this quote at your earliest convenience.

Thank you for your time and consideration. I look forward to hearing from you soon.

Best regards,
${contactName}
${companyName}
${equipmentData.email || '[Email]'}
${sitePhone}`
}

export const generateScopeTemplate = (
  equipmentData: any,
  logisticsData: any,
  equipmentRequirements: any
) => {
  const siteAddress = equipmentData.siteAddress || '[Site Address]'
  const contactName = equipmentData.contactName || '[Site Contact]'
  const phone = equipmentData.sitePhone || '[Site Contact Phone Number]'
  const shopLocation = equipmentData.shopLocation || '[Shop]'
  const scopeOfWork = equipmentData.scopeOfWork || ''

  const crewSize = equipmentRequirements.crewSize || ''
  const forklifts = (equipmentRequirements.forkliftModels || []).filter((f: string) => f)
  const tractors = (equipmentRequirements.tractors || []).filter((t: string) => t)
  const trailers = (equipmentRequirements.trailers || []).filter((t: string) => t)

  const equipmentSummary = [
    crewSize ? `${crewSize} crew` : '',
    forklifts.length ? `${forklifts.join(', ')} forklift(s)` : '',
    tractors.length ? `${tractors.join(', ')} tractor(s)` : '',
    trailers.length ? `${trailers.join(', ')} trailer(s)` : ''
  ]
    .filter(Boolean)
    .join(', ')

  const shipmentLine = logisticsData.shipmentType
    ? `Shipment Type: ${logisticsData.shipmentType}\n`
    : ''
  const truckLine = logisticsData.truckType
    ? `Truck Type Requested: ${logisticsData.truckType}\n`
    : ''
  const storageLine = logisticsData.storageType
    ? `Storage: ${
        logisticsData.storageType === 'inside' ? 'Inside Storage' : 'Outside Storage'
      } - ${logisticsData.storageSqFt || '[Sq Ft]'} sq ft\n`
    : ''

  const logisticsSection =
    shipmentLine || truckLine || storageLine
      ? `\n${shipmentLine}${truckLine}${storageLine}`
      : '\n'

  const itemsSection =
    logisticsData.pieces && logisticsData.pieces.length > 0
      ? `ITEMS TO HANDLE:\n${logisticsData.pieces
          .map(
            (piece: any) =>
              `• (Qty: ${piece.quantity || 1}) ${
                piece.description || '[Item Description]'
              } - ${piece.length || '[L]'}"L x ${piece.width || '[W]'}"W x ${
                piece.height || '[H]'
              }"H, ${piece.weight || '[Weight]'} lbs`
          )
          .join('\n')}\n`
      : ''

  return `SCOPE OF WORK

Mobilize crew and Omega Morgan equipment to site: ${siteAddress}

${contactName}
${phone}

Omega Morgan to supply ${equipmentSummary || 'necessary crew and equipment'}.
${logisticsSection}${scopeOfWork ? `${scopeOfWork}\n\n` : ''}${itemsSection}When job is complete clean up debris and return to ${shopLocation}.`
}

interface PreviewTemplatesProps {
  equipmentData: any
  logisticsData: any
  equipmentRequirements: any
  isOpen: boolean
  onClose: () => void
}

const PreviewTemplates: React.FC<PreviewTemplatesProps> = ({
  equipmentData,
  logisticsData,
  equipmentRequirements,
  isOpen,
  onClose
}) => {
  const [activeTemplate, setActiveTemplate] = useState<'email' | 'scope'>('email')
  const [copiedTemplate, setCopiedTemplate] = useState<string | null>(null)

  const emailTemplate = generateEmailTemplate(
    equipmentData,
    logisticsData,
    equipmentRequirements
  )
  const scopeTemplate = generateScopeTemplate(
    equipmentData,
    logisticsData,
    equipmentRequirements
  )

  const copyToClipboard = async (text: string, templateType: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedTemplate(templateType)
      setTimeout(() => setCopiedTemplate(null), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border-2 border-accent rounded-2xl text-white shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-2 border-accent">
          <div className="flex items-center">
            <Eye className="w-6 h-6 text-white mr-2" />
            <h3 className="text-xl font-bold text-white">Preview Templates</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Template Tabs */}
        <div className="flex border-b-2 border-accent">
          <button
            onClick={() => setActiveTemplate('email')}
            className={`flex-1 flex items-center justify-center px-6 py-3 transition-colors ${
              activeTemplate === 'email'
                ? 'bg-gray-900 text-white border-b-2 border-accent'
                : 'text-white hover:text-white hover:bg-gray-800'
            }`}
          >
            <Mail className="w-4 h-4 mr-2" />
            Email Template
          </button>
          <button
            onClick={() => setActiveTemplate('scope')}
            className={`flex-1 flex items-center justify-center px-6 py-3 transition-colors ${
              activeTemplate === 'scope'
                ? 'bg-gray-900 text-white border-b-2 border-accent'
                : 'text-white hover:text-white hover:bg-gray-800'
            }`}
          >
            <FileText className="w-4 h-4 mr-2" />
            Scope Template
          </button>
        </div>

        {/* Template Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="p-6 border-b-2 border-accent">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold text-white">
                {activeTemplate === 'email' ? 'Email Template' : 'Scope of Work Template'}
              </h4>
              <button
                onClick={() =>
                  copyToClipboard(
                    activeTemplate === 'email' ? emailTemplate : scopeTemplate,
                    activeTemplate
                  )
                }
                className="flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 hover:text-white transition-colors"
              >
                {copiedTemplate === activeTemplate ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Template
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <div className="bg-black rounded-lg p-4 border border-accent">
              <pre className="whitespace-pre-wrap text-sm text-white font-mono leading-relaxed">
                {activeTemplate === 'email' ? emailTemplate : scopeTemplate}
              </pre>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t-2 border-accent bg-gray-900">
          <p className="text-sm text-white">
            Templates are automatically populated with extracted data. Fields in brackets [ ] need manual completion.
          </p>
        </div>
      </div>
    </div>
  )
}

export default PreviewTemplates
