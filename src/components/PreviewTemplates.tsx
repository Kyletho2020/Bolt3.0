/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react'
import { FileText, Mail, Copy, CheckCircle, Eye, X, Truck } from 'lucide-react'

export const generateEmailTemplate = (
  equipmentData: any,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _logisticsData: any,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _equipmentRequirements: any
) => {
  const projectName = equipmentData.projectName || '[project name]'
  const contactName = equipmentData.contactName || '[contact name]'
  const siteAddress = equipmentData.siteAddress || '[site address]'
  const scopeOfWork = equipmentData.scopeOfWork || '[Scope of Work]'

  return `Subject: Quote Request - ${projectName}\n\nDear ${contactName},\n\nI hope this email finds you well. Thank you for considering Omega Morgan for the scope of work attached and summarized below.\n\nPROJECT DETAILS:\n• Project Name: ${projectName}\n• Contact Name: ${contactName}\n• Project Location: ${siteAddress}\n\nSCOPE OF WORK:\n\n${scopeOfWork}\n\nThank you for your time and consideration. I look forward to hearing from you soon.\n\nBest regards,`
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
  const forklifts = (equipmentRequirements.forklifts || []).filter((f: any) => f.quantity > 0)
  const tractors = (equipmentRequirements.tractors || []).filter((t: any) => t.quantity > 0)
  const trailers = (equipmentRequirements.trailers || []).filter((t: any) => t.quantity > 0)

  const formatEquipmentItem = (quantity: number, name: string) => {
    const needsPlural = quantity > 1 && !name.toLowerCase().endsWith('s')
    return quantity > 1
      ? `${quantity} ${needsPlural ? `${name}s` : name}`
      : name
  }

  const crewDescription = crewSize
    ? `${crewSize === '8' ? 'an' : 'a'} ${crewSize}-man crew`
    : ''

  const equipmentItems = [
    crewDescription,
    ...forklifts.map((f: any) => formatEquipmentItem(f.quantity, f.name)),
    ...tractors.map((t: any) => formatEquipmentItem(t.quantity, t.name)),
    ...trailers.map((t: any) =>
      formatEquipmentItem(
        t.quantity,
        t.name.toLowerCase().includes('trailer')
          ? t.name
          : `${t.name} trailer`
      )
    )
  ].filter(Boolean)

  const equipmentSummary = (() => {
    if (equipmentItems.length === 0) return ''
    if (equipmentItems.length === 1) return equipmentItems[0]
    if (equipmentItems.length === 2)
      return `${equipmentItems[0]} and ${equipmentItems[1]}`
    return `${equipmentItems.slice(0, -1).join(', ')} and ${
      equipmentItems[equipmentItems.length - 1]
    }`
  })()

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

export const generateLogisticsTemplate = (
  equipmentData: any,
  logisticsData: any
) => {
  const shipmentType = logisticsData.shipmentType || '[shipment type]'
  const pickupZip = logisticsData.pickupZip || '[pickup location zip code]'
  const deliveryZip = logisticsData.deliveryZip || '[delivery location zip code]'

  const pieces = logisticsData.pieces || []
  const totalPieces = pieces.length
    ? pieces.reduce(
        (sum: number, piece: any) => sum + (piece.quantity || 1),
        0
      )
    : '[total number of items to transport]'
  const itemsSection = pieces.length
    ? pieces
        .map(
          (piece: any, index: number) =>
            `${index + 1}. (Qty: ${piece.quantity || 1}) ${
              piece.description || '[Description]'
            } - ${piece.length || '[L]'}"L x ${piece.width || '[W]'}"W x ${
              piece.height || '[H]'
            }"H, ${piece.weight || '[Weight]'} lbs`
        )
        .join('\n')
    : '[list all items with dimensions and weights]'
  const totalWeight = pieces.length
    ? `${pieces.reduce(
        (sum: number, piece: any) =>
          sum + (piece.weight || 0) * (piece.quantity || 1),
        0
      )} lbs`
    : '[total weight]'

  const pickupLocation = logisticsData.pickupAddress || '[pickup location]'
  const deliveryLocation = logisticsData.deliveryAddress || '[delivery location]'
  const truckType = logisticsData.truckType || '[truck type requested]'
  const contactName = equipmentData.contactName || ''
  const companyName = equipmentData.companyName || ''

  return `To: Logistics@omegamorgan.com; MachineryLogistics@omegamorgan.com

Subject: Quote for Truck Request for ${shipmentType} - ${pickupZip} - ${deliveryZip}

Hello Team,

I'm reaching out to request a logistics quote for an upcoming project. Please see the load and transport details below:

Number of Pieces: ${totalPieces}

${itemsSection}

Total Load Weight: ${totalWeight}

Pick-Up Location: ${pickupLocation}

Delivery/Set Location: ${deliveryLocation}

Truck Type Requested: ${truckType}

Shipment Type: ${shipmentType}

Please let me know if you need any additional information or documents to complete the quote.

Looking forward to your response.

Thanks,
${contactName}${companyName ? `\n${companyName}` : ''}`
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
  const [activeTemplate, setActiveTemplate] = useState<
    'email' | 'scope' | 'logistics'
  >('email')
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
  const logisticsTemplate = generateLogisticsTemplate(
    equipmentData,
    logisticsData
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
          <button
            onClick={() => setActiveTemplate('logistics')}
            className={`flex-1 flex items-center justify-center px-6 py-3 transition-colors ${
              activeTemplate === 'logistics'
                ? 'bg-gray-900 text-white border-b-2 border-accent'
                : 'text-white hover:text-white hover:bg-gray-800'
            }`}
          >
            <Truck className="w-4 h-4 mr-2" />
            Logistics Template
          </button>
        </div>

        {/* Template Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="p-6 border-b-2 border-accent">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold text-white">
                {activeTemplate === 'email'
                  ? 'Email Template'
                  : activeTemplate === 'scope'
                  ? 'Scope of Work Template'
                  : 'Logistics Template'}
              </h4>
              <button
                onClick={() =>
                  copyToClipboard(
                    activeTemplate === 'email'
                      ? emailTemplate
                      : activeTemplate === 'scope'
                      ? scopeTemplate
                      : logisticsTemplate,
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
                {activeTemplate === 'email'
                  ? emailTemplate
                  : activeTemplate === 'scope'
                  ? scopeTemplate
                  : logisticsTemplate}
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
