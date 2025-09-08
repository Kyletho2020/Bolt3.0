/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react'
import { FileText, Mail, Copy, CheckCircle, Eye, X } from 'lucide-react'

interface PreviewTemplatesProps {
  equipmentData: any
  logisticsData: any
  isOpen: boolean
  onClose: () => void
}

const PreviewTemplates: React.FC<PreviewTemplatesProps> = ({ 
  equipmentData, 
  logisticsData, 
  isOpen, 
  onClose 
}) => {
  const [activeTemplate, setActiveTemplate] = useState<'email' | 'scope'>('email')
  const [copiedTemplate, setCopiedTemplate] = useState<string | null>(null)

  const generateEmailTemplate = () => {
    const projectName = equipmentData.projectName || '[project name]'
    const companyName = equipmentData.companyName || '[Company Name]'
    const contactName = equipmentData.contactName || '[Contact Name]'
    const projectAddress = equipmentData.projectAddress || '[Project Address]'
    const city = equipmentData.city || '[City]'
    const state = equipmentData.state || '[State]'
    const projectDescription = equipmentData.projectDescription || '[Project Description]'
    
    const pickupAddress = logisticsData.pickupAddress || projectAddress
    const pickupCity = logisticsData.pickupCity || city
    const pickupState = logisticsData.pickupState || state
    
    const deliveryAddress = logisticsData.deliveryAddress || '[Delivery Address]'
    const deliveryCity = logisticsData.deliveryCity || '[Delivery City]'
    const deliveryState = logisticsData.deliveryState || '[Delivery State]'


    return `Subject: Quote Request - ${projectName}

Dear Omega Morgan Team,

I hope this email finds you well. I am writing to request a quote for an upcoming project that requires your specialized equipment and logistics services.

PROJECT DETAILS:
• Project Name: ${projectName}
• Company: ${companyName}
• Contact: ${contactName}
• Project Location: ${projectAddress}, ${city}, ${state}

PROJECT DESCRIPTION:
${projectDescription}

LOGISTICS REQUIREMENTS:
• Pickup Location: ${pickupAddress}, ${pickupCity}, ${pickupState}
• Delivery Location: ${deliveryAddress}, ${deliveryCity}, ${deliveryState}
• Service Type: ${logisticsData.serviceType || 'Standard Delivery'}
${logisticsData.truckType ? `• Truck Type: ${logisticsData.truckType}` : ''}

    ${logisticsData.pieces && logisticsData.pieces.length > 0 ? `ITEMS TO TRANSPORT:
    ${logisticsData.pieces.map((piece: any, index: number) =>
      `${index + 1}. (Qty: ${piece.quantity || 1}) ${piece.description || '[Description]'} - ${piece.length || '[L]'}"L x ${piece.width || '[W]'}"W x ${piece.height || '[H]'}"H, ${piece.weight || '[Weight]'} lbs`
    ).join('\n')}` : ''}

Please provide a detailed quote including all equipment, labor, and transportation costs. We would appreciate receiving this quote at your earliest convenience.


Thank you for your time and consideration. I look forward to hearing from you soon.

Best regards,
${contactName}
${companyName}
${equipmentData.email || '[Email]'}
${equipmentData.phone || '[Phone]'}`
  }

  const generateScopeTemplate = () => {
    const projectAddress = equipmentData.projectAddress || '[Project Address]'
    const city = equipmentData.city || '[City]'
    const state = equipmentData.state || '[State]'
    const contactName = equipmentData.contactName || '[Site Contact]'
    const phone = equipmentData.phone || '[Site Contact Phone Number]'
    
    return `SCOPE OF WORK

Mobilize crew and Omega Morgan equipment to site: ${projectAddress}, ${city}, ${state}

${contactName}
${phone}

Omega Morgan to supply 3-man crew, Gear Truck and Trailer.

${logisticsData.truckType ? `Truck Type Requested: ${logisticsData.truckType}\n\n` : ''}

${equipmentData.projectDescription ? `PROJECT DESCRIPTION:
${equipmentData.projectDescription}

` : ''}${logisticsData.pieces && logisticsData.pieces.length > 0 ? `ITEMS TO HANDLE:
${logisticsData.pieces.map((piece: any) =>
  `• (Qty: ${piece.quantity || 1}) ${piece.description || '[Item Description]'} - ${piece.length || '[L]'}"L x ${piece.width || '[W]'}"W x ${piece.height || '[H]'}"H, ${piece.weight || '[Weight]'} lbs`
).join('\n')}

` : ''}When job is complete clean up debris and return to [Shop].`
  }

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

  const emailTemplate = generateEmailTemplate()
  const scopeTemplate = generateScopeTemplate()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border-2 border-accent rounded-2xl text-white shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-2 border-accent">
          <div className="flex items-center">
            <Eye className="w-6 h-6 text-white mr-2" />
            <h3 className="text-xl font-bold text-white">Preview Te</h3>
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
                onClick={() => copyToClipboard(
                  activeTemplate === 'email' ? emailTemplate : scopeTemplate,
                  activeTemplate
                )}
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
