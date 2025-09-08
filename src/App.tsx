/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react'
import {
  FileText,
  X,
  Bot,
  Archive,
  Plus,
  Minus,
  Package,
  Truck,
  Key,
  Trash2,
  Copy,
  CheckCircle,
  Mail
} from 'lucide-react'
import { useSessionId } from './hooks/useSessionId'
import { useApiKey } from './hooks/useApiKey'
import AIExtractorModal from './components/AIExtractorModal'
import {
  generateEmailTemplate,
  generateScopeTemplate
} from './components/PreviewTemplates'
import QuoteSaveManager from './components/QuoteSaveManager'
import ApiKeySetup from './components/ApiKeySetup'
import ProjectDetails from './components/ProjectDetails'
import { HubSpotContact } from './services/hubspotService'
import EquipmentRequired, { EquipmentRequirements } from './components/EquipmentRequired'
import ClarificationsSection from './components/ClarificationsSection'

const App: React.FC = () => {
  // State for equipment form
  const initialEquipmentRequirements: EquipmentRequirements = {
    crewSize: '',
    forklifts: [],
    tractors: [],
    trailers: []
  }

  const [equipmentData, setEquipmentData] = useState({
    projectName: '',
    companyName: '',
    contactName: '',
    siteAddress: '',
    sitePhone: '',
    shopLocation: 'Shop',
    scopeOfWork: '',
    email: '',
    equipmentRequirements: initialEquipmentRequirements
  })

  // State for logistics form
  const [logisticsData, setLogisticsData] = useState({
    pieces: [{ description: '', quantity: 1, length: '', width: '', height: '', weight: '' }],
    pickupAddress: '',
    pickupCity: '',
    pickupState: '',
    pickupZip: '',
    deliveryAddress: '',
    deliveryCity: '',
    deliveryState: '',
    deliveryZip: '',
    shipmentType: '',
    truckType: '',
    storageType: '',
    storageSqFt: ''
  })

  const [selectedPieces, setSelectedPieces] = useState<number[]>([])

  // Modal states
  const [showAIExtractor, setShowAIExtractor] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [showApiKeySetup, setShowApiKeySetup] = useState(false)


  // Hooks
  const sessionId = useSessionId()
  const { hasApiKey, refetch: refetchApiKey } = useApiKey()

  // Auto-populate pickup address from project address
  useEffect(() => {
    if (equipmentData.siteAddress && !logisticsData.pickupAddress) {
      setLogisticsData(prev => ({
        ...prev,
        pickupAddress: equipmentData.siteAddress
      }))
    }
  }, [equipmentData.siteAddress])

  const handleSelectHubSpotContact = (contact: HubSpotContact) => {
    setEquipmentData(prev => ({
      ...prev,
      contactName: `${contact.firstName} ${contact.lastName}`.trim(),
      email: contact.email,
      sitePhone: contact.phone || prev.sitePhone,
      companyName: contact.companyName || prev.companyName,
      siteAddress: contact.contactAddress || contact.companyAddress || prev.siteAddress
    }))
  }

  const handleEquipmentChange = (field: string, value: string) => {
    setEquipmentData(prev => ({ ...prev, [field]: value }))
  }

  const handleLogisticsChange = (field: string, value: string) => {
    setLogisticsData(prev => ({ ...prev, [field]: value }))
  }

  const handlePieceChange = (index: number, field: string, value: string | number) => {
    setLogisticsData(prev => ({
      ...prev,
      pieces: prev.pieces.map((piece, i) => 
        i === index ? { ...piece, [field]: value } : piece
      )
    }))
  }

  const addPiece = () => {
    setLogisticsData(prev => ({
      ...prev,
      pieces: [...prev.pieces, { description: '', quantity: 1, length: '', width: '', height: '', weight: '' }]
    }))
  }

  const removePiece = (index: number) => {
    if (logisticsData.pieces.length > 1) {
      setLogisticsData(prev => ({
        ...prev,
        pieces: prev.pieces.filter((_, i) => i !== index)
      }))
      setSelectedPieces(prev =>
        prev
          .filter(i => i !== index)
          .map(i => (i > index ? i - 1 : i))
      )
    }
  }

  const togglePieceSelection = (index: number) => {
    setSelectedPieces(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    )
  }

  const deleteSelectedPieces = () => {
    if (selectedPieces.length === 0) return
    setLogisticsData(prev => ({
      ...prev,
      pieces: prev.pieces.filter((_, i) => !selectedPieces.includes(i))
    }))
    setSelectedPieces([])
  }

  const handleEquipmentRequirementsChange = (data: EquipmentRequirements) => {
    setEquipmentData(prev => ({ ...prev, equipmentRequirements: data }))
  }

  const handleAIExtraction = (extractedEquipmentData: any, extractedLogisticsData: any) => {
    if (extractedEquipmentData) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { projectDescription, ...rest } = extractedEquipmentData
      setEquipmentData(prev => ({ ...prev, ...rest }))
    }
    if (extractedLogisticsData) {
      setLogisticsData(prev => ({ ...prev, ...extractedLogisticsData }))
    }
  }

  const handleLoadQuote = (
    loadedEquipmentData: any,
    loadedLogisticsData: any,
    loadedEquipmentRequirements?: EquipmentRequirements
  ) => {
    setEquipmentData({
      ...loadedEquipmentData,
      equipmentRequirements: loadedEquipmentRequirements || initialEquipmentRequirements
    })
    setLogisticsData({
      truckType: '',
      shipmentType: '',
      storageType: '',
      storageSqFt: '',
      ...loadedLogisticsData
    })
  }

  const handleApiKeyChange = () => {
    refetchApiKey()
  }

  const [copiedTemplate, setCopiedTemplate] = useState<string | null>(null)

  const emailTemplate = generateEmailTemplate(
    equipmentData,
    logisticsData,
    equipmentData.equipmentRequirements
  )

  const scopeTemplate = generateScopeTemplate(
    equipmentData,
    logisticsData,
    equipmentData.equipmentRequirements
  )

  const copyToClipboard = async (
    text: string,
    templateType: 'email' | 'scope'
  ) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedTemplate(templateType)
      setTimeout(() => setCopiedTemplate(null), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">OM Quote Generator</h1>
          <p className="text-white">Professional quote generation system for Omega Morgan</p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <button
            onClick={() => setShowApiKeySetup(true)}
            className="flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors border border-accent"
          >
            <Key className="w-4 h-4 mr-2" />
            API Key Setup
          </button>
          
          <button
            onClick={() => setShowAIExtractor(true)}
            disabled={!hasApiKey}
            className="flex items-center px-4 py-2 bg-accent text-black rounded-lg hover:bg-green-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Bot className="w-4 h-4 mr-2" />
            AI Extractor
          </button>
          
            <button
              onClick={() => setShowHistory(true)}
              className="flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors border border-accent"
            >
              <Archive className="w-4 h-4 mr-2" />
              Quote History
            </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Equipment Quote Form */}
          <div className="bg-gray-900 rounded-lg border-2 border-accent p-6">
            <div className="flex items-center mb-6">
              <FileText className="w-6 h-6 text-white mr-2" />
              <h2 className="text-2xl font-bold text-white">Equipment Quote</h2>
            </div>

            <ProjectDetails
              data={equipmentData}
              onChange={handleEquipmentChange}
              onSelectContact={handleSelectHubSpotContact}
            />

            <EquipmentRequired
              data={equipmentData.equipmentRequirements}
              onChange={handleEquipmentRequirementsChange}
            />
          </div>

          {/* Logistics Quote Form */}
          <div className="bg-gray-900 rounded-lg border-2 border-accent p-6">
            <div className="flex items-center mb-6">
              <Truck className="w-6 h-6 text-white mr-2" />
              <h2 className="text-2xl font-bold text-white">Logistics Quote</h2>
            </div>

            <div className="space-y-6">
              {/* Items to Transport */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium text-white">
                    <Package className="w-4 h-4 inline mr-1" />
                    Items to Transport
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={deleteSelectedPieces}
                      disabled={selectedPieces.length === 0}
                      className="flex items-center px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete Selected
                    </button>
                    <button
                      onClick={addPiece}
                      className="flex items-center px-3 py-1 bg-accent text-black rounded-lg hover:bg-green-400 transition-colors"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Item
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {logisticsData.pieces.map((piece, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-end">
                      <div className="col-span-1 flex justify-center">
                        <input
                          type="checkbox"
                          checked={selectedPieces.includes(index)}
                          onChange={() => togglePieceSelection(index)}
                          className="form-checkbox h-4 w-4 text-accent"
                        />
                      </div>
                      <div className="col-span-4">
                        <input
                          type="text"
                          value={piece.description}
                          onChange={(e) => handlePieceChange(index, 'description', e.target.value)}
                          className="w-full px-3 py-2 bg-black border border-accent rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-white text-sm"
                          placeholder="Description"
                        />
                      </div>
                      <div className="col-span-1">
                        <input
                          type="number"
                          value={piece.quantity}
                          onChange={(e) => handlePieceChange(index, 'quantity', parseInt(e.target.value) || 1)}
                         className="w-16 px-2 py-2 bg-black border border-accent rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-white text-sm text-center"
                          placeholder="Qty"
                          min="1"
                          max="99"
                        />
                      </div>
                      <div className="col-span-1">
                        <input
                          type="text"
                          value={piece.length}
                          onChange={(e) => handlePieceChange(index, 'length', e.target.value)}
                          className="w-full px-2 py-2 bg-black border border-accent rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-white text-sm"
                          placeholder="L"
                        />
                      </div>
                      <div className="col-span-1">
                        <input
                          type="text"
                          value={piece.width}
                          onChange={(e) => handlePieceChange(index, 'width', e.target.value)}
                          className="w-full px-2 py-2 bg-black border border-accent rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-white text-sm"
                          placeholder="W"
                        />
                      </div>
                      <div className="col-span-1">
                        <input
                          type="text"
                          value={piece.height}
                          onChange={(e) => handlePieceChange(index, 'height', e.target.value)}
                          className="w-full px-2 py-2 bg-black border border-accent rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-white text-sm"
                          placeholder="H"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="text"
                          value={piece.weight}
                          onChange={(e) => handlePieceChange(index, 'weight', e.target.value)}
                          className="w-full px-2 py-2 bg-black border border-accent rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-white text-sm"
                          placeholder="Weight (lbs)"
                        />
                      </div>
                      <div className="col-span-1">
                        {logisticsData.pieces.length > 1 && (
                          <button
                            onClick={() => removePiece(index)}
                            className="w-full p-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pickup Location */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Pickup Location</label>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={logisticsData.pickupAddress}
                    onChange={(e) => handleLogisticsChange('pickupAddress', e.target.value)}
                    className="w-full px-3 py-2 bg-black border border-accent rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-white"
                    placeholder="Pickup address"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input
                      type="text"
                      value={logisticsData.pickupCity}
                      onChange={(e) => handleLogisticsChange('pickupCity', e.target.value)}
                      className="w-full px-3 py-2 bg-black border border-accent rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-white"
                      placeholder="City"
                    />
                    <input
                      type="text"
                      value={logisticsData.pickupState}
                      onChange={(e) => handleLogisticsChange('pickupState', e.target.value)}
                      className="w-full px-3 py-2 bg-black border border-accent rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-white"
                      placeholder="State"
                    />
                    <input
                      type="text"
                      value={logisticsData.pickupZip}
                      onChange={(e) => handleLogisticsChange('pickupZip', e.target.value)}
                      className="w-full px-3 py-2 bg-black border border-accent rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-white"
                      placeholder="Zip"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Location */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Delivery Location</label>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={logisticsData.deliveryAddress}
                    onChange={(e) => handleLogisticsChange('deliveryAddress', e.target.value)}
                    className="w-full px-3 py-2 bg-black border border-accent rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-white"
                    placeholder="Delivery address"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input
                      type="text"
                      value={logisticsData.deliveryCity}
                      onChange={(e) => handleLogisticsChange('deliveryCity', e.target.value)}
                      className="w-full px-3 py-2 bg-black border border-accent rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-white"
                      placeholder="City"
                    />
                    <input
                      type="text"
                      value={logisticsData.deliveryState}
                      onChange={(e) => handleLogisticsChange('deliveryState', e.target.value)}
                      className="w-full px-3 py-2 bg-black border border-accent rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-white"
                      placeholder="State"
                    />
                    <input
                      type="text"
                      value={logisticsData.deliveryZip}
                      onChange={(e) => handleLogisticsChange('deliveryZip', e.target.value)}
                      className="w-full px-3 py-2 bg-black border border-accent rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-white"
                      placeholder="Zip"
                    />
                  </div>
                </div>
              </div>

              {/* Shipment Type */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Shipment Type</label>
                <select
                  value={logisticsData.shipmentType}
                  onChange={(e) => handleLogisticsChange('shipmentType', e.target.value)}
                  className="w-full px-3 py-2 bg-black border border-accent rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-white"
                >
                  <option value="LTL">LTL</option>
                  <option value="FTL">FTL</option>
                </select>
              </div>

              {/* Truck Type Requested */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Truck Type Requested</label>
                <select
                  value={logisticsData.truckType}
                  onChange={(e) => handleLogisticsChange('truckType', e.target.value)}
                  className="w-full px-3 py-2 bg-black border border-accent rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-white"
                >
                  <option value="">Select truck type</option>
                  <option value="Flatbed">Flatbed</option>
                  <option value="Flatbed with tarp">Flatbed with tarp</option>
                  <option value="Conestoga">Conestoga</option>
                </select>
              </div>

              {/* Storage Requirements */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Storage</label>
                <select
                  value={logisticsData.storageType}
                  onChange={(e) => handleLogisticsChange('storageType', e.target.value)}
                  className="w-full px-3 py-2 bg-black border border-accent rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-white"
                >
                  <option value="">No Storage</option>
                  <option value="inside">Inside Storage ($1.50/sq ft)</option>
                  <option value="outside">Outside Storage ($0.75/sq ft)</option>
                </select>
                {logisticsData.storageType && (
                  <input
                    type="number"
                    value={logisticsData.storageSqFt}
                    onChange={(e) => handleLogisticsChange('storageSqFt', e.target.value)}
                    className="mt-2 w-full px-3 py-2 bg-black border border-accent rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-white"
                    placeholder="Square footage"
                    min="0"
                  />
                )}
              </div>

            </div>
          </div>
        </div>

        {/* Templates */}
        <div className="mt-8 space-y-8">
          <div className="bg-gray-900 rounded-lg border-2 border-accent p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <FileText className="w-6 h-6 text-white mr-2" />
                <h2 className="text-2xl font-bold text-white">Scope of Work Template</h2>
              </div>
              <button
                onClick={() => copyToClipboard(scopeTemplate, 'scope')}
                className="flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors border border-accent"
              >
                {copiedTemplate === 'scope' ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </>
                )}
              </button>
            </div>
            <div className="bg-black rounded-lg p-4 border border-accent">
              <pre className="whitespace-pre-wrap text-sm text-white font-mono leading-relaxed">
                {scopeTemplate}
              </pre>
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg border-2 border-accent p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Mail className="w-6 h-6 text-white mr-2" />
                <h2 className="text-2xl font-bold text-white">Email Template</h2>
              </div>
              <button
                onClick={() => copyToClipboard(emailTemplate, 'email')}
                className="flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors border border-accent"
              >
                {copiedTemplate === 'email' ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </>
                )}
              </button>
            </div>
            <div className="bg-black rounded-lg p-4 border border-accent">
              <pre className="whitespace-pre-wrap text-sm text-white font-mono leading-relaxed">
                {emailTemplate}
              </pre>
            </div>
          </div>

          <p className="text-sm text-white">
            Templates are automatically populated with extracted data. Fields in brackets [ ] need manual completion.
          </p>
        </div>

        {/* Clarifications */}
        <div className="mt-8 space-y-8">
          <ClarificationsSection
            title="Machinery Moving"
            initialItems={[
              'Any change to the job will require approval in writing prior to completion of work.',
              'Customer is to supply clear pathway for all items to be loaded onto trailers',
              'Quote is based on no site visit and is not responsible for cracks in pavement or other unforeseen causes to not be able to perform work'
            ]}
          />
          <ClarificationsSection
            title="Crane"
            initialItems={[
              'Crew to take half hour meal break between 4 - 5 hour start of shift in yard.',
              'Customer may work crew through first meal break and pay missed meal charge of $175 per crew member.',
              '60 ton boom truck quoted and 6 and 8 hour minimums. 8 hour quoted for budget.',
              'Quoted straight time and portal to portal.',
              'Overtime overtime to be charged $65/hour.',
              'Straight time is the first 8 hours worked between 5am - 6pm Monday through Friday including travel and dismantle.',
              'Customer may work crew through meal with signature on work ticket and pay missed meal charge of $175 per crew member per missed meal.',
              'Mandatory missed meal charge at 10 hours from start of shift.'
            ]}
          />
        </div>

        {/* Modals */}
        <AIExtractorModal
          isOpen={showAIExtractor}
          onClose={() => setShowAIExtractor(false)}
          onExtract={handleAIExtraction}
          sessionId={sessionId}
        />

        <QuoteSaveManager
          equipmentData={equipmentData}
          equipmentRequirements={equipmentData.equipmentRequirements}
          logisticsData={logisticsData}
          isOpen={showHistory}
          onClose={() => setShowHistory(false)}
          onLoadQuote={handleLoadQuote}
        />

        {showApiKeySetup && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 border-2 border-accent rounded-2xl shadow-2xl w-full max-w-md">
              <div className="flex items-center justify-between p-6 border-b-2 border-accent">
                <h3 className="text-xl font-bold text-white">API Key Setup</h3>
                <button
                  onClick={() => setShowApiKeySetup(false)}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
              <div className="p-6">
                <ApiKeySetup onApiKeyChange={handleApiKeyChange} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App