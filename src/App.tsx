/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react'
import { 
  FileText, 
  Mail, 
  Eye, 
  X, 
  Bot,
  Archive,
  Plus,
  Minus,
  Building,
  User,
  Phone,
  MapPin,
  Package,
  Truck,
  Key
} from 'lucide-react'
import { useSessionId } from './hooks/useSessionId'
import { useApiKey } from './hooks/useApiKey'
import AIExtractorModal from './components/AIExtractorModal'
import PreviewTemplates from './components/PreviewTemplates'
import QuoteHistoryModal from './components/QuoteHistoryModal'
import ApiKeySetup from './components/ApiKeySetup'
import HubSpotContactSearch from './components/HubSpotContactSearch'
import { HubSpotContact } from './services/hubspotService'

const App: React.FC = () => {
  // State for equipment form
  const [equipmentData, setEquipmentData] = useState({
    projectName: '',
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    projectAddress: '',
    city: '',
    state: '',
    zipCode: '',
    projectDescription: '',
    additionalDetails: '',
    specialInstructions: '',
    crewSize: '',
    equipmentList: [] as string[]
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
    serviceType: 'Standard Delivery',
    specialHandling: ''
  })

  // Modal states
  const [showAIExtractor, setShowAIExtractor] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [showApiKeySetup, setShowApiKeySetup] = useState(false)


  // Hooks
  const sessionId = useSessionId()
  const { hasApiKey, refetch: refetchApiKey } = useApiKey()

  // Auto-populate pickup address from project address
  useEffect(() => {
    if (equipmentData.projectAddress && !logisticsData.pickupAddress) {
      setLogisticsData(prev => ({
        ...prev,
        pickupAddress: equipmentData.projectAddress,
        pickupCity: equipmentData.city,
        pickupState: equipmentData.state,
        pickupZip: equipmentData.zipCode
      }))
    }
  }, [equipmentData.projectAddress, equipmentData.city, equipmentData.state, equipmentData.zipCode])

  const handleSelectHubSpotContact = (contact: HubSpotContact) => {
    setEquipmentData(prev => ({
      ...prev,
      contactName: `${contact.firstName} ${contact.lastName}`.trim(),
      email: contact.email,
      phone: contact.phone,
      companyName: contact.companyName || prev.companyName,
      projectAddress: contact.contactAddress || contact.companyAddress || prev.projectAddress,
      city: contact.contactCity || contact.companyCity || prev.city,
      state: contact.contactState || contact.companyState || prev.state,
      zipCode: contact.contactZip || contact.companyZip || prev.zipCode
    }))
  }

  const handleEquipmentChange = (field: string, value: string) => {
    setEquipmentData(prev => ({ ...prev, [field]: value }))
  }

  const addEquipmentItem = (item: string) => {
    setEquipmentData(prev => ({
      ...prev,
      equipmentList: prev.equipmentList.includes(item)
        ? prev.equipmentList
        : [...prev.equipmentList, item]
    }))
  }

  const removeEquipmentItem = (item: string) => {
    setEquipmentData(prev => ({
      ...prev,
      equipmentList: prev.equipmentList.filter((eq: string) => eq !== item)
    }))
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
    }
  }

  const handleAIExtraction = (extractedEquipmentData: any, extractedLogisticsData: any) => {
    if (extractedEquipmentData) {
      setEquipmentData(prev => ({ ...prev, ...extractedEquipmentData }))
    }
    if (extractedLogisticsData) {
      setLogisticsData(prev => ({ ...prev, ...extractedLogisticsData }))
    }
  }

  const handleLoadQuote = (loadedEquipmentData: any, loadedLogisticsData: any) => {
    setEquipmentData(loadedEquipmentData)
    setLogisticsData(loadedLogisticsData)
  }

  const handleApiKeyChange = () => {
    refetchApiKey()
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
            onClick={() => setShowPreview(true)}
            className="flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors border border-accent"
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview Templates
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

            <HubSpotContactSearch onSelectContact={handleSelectHubSpotContact} />

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    <FileText className="w-4 h-4 inline mr-1" />
                    Project Name
                  </label>
                  <input
                    type="text"
                    value={equipmentData.projectName}
                    onChange={(e) => handleEquipmentChange('projectName', e.target.value)}
                    className="w-full px-3 py-2 bg-black border border-accent rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-white"
                    placeholder="Enter project name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    <Building className="w-4 h-4 inline mr-1" />
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={equipmentData.companyName}
                    onChange={(e) => handleEquipmentChange('companyName', e.target.value)}
                    className="w-full px-3 py-2 bg-black border border-accent rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-white"
                    placeholder="Enter company name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    <User className="w-4 h-4 inline mr-1" />
                    Contact Name
                  </label>
                  <input
                    type="text"
                    value={equipmentData.contactName}
                    onChange={(e) => handleEquipmentChange('contactName', e.target.value)}
                    className="w-full px-3 py-2 bg-black border border-accent rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-white"
                    placeholder="Enter contact name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    <Mail className="w-4 h-4 inline mr-1" />
                    Email
                  </label>
                  <input
                    type="email"
                    value={equipmentData.email}
                    onChange={(e) => handleEquipmentChange('email', e.target.value)}
                    className="w-full px-3 py-2 bg-black border border-accent rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-white"
                    placeholder="Enter email"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    <Phone className="w-4 h-4 inline mr-1" />
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={equipmentData.phone}
                    onChange={(e) => handleEquipmentChange('phone', e.target.value)}
                    className="w-full px-3 py-2 bg-black border border-accent rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-white"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Project Address
                </label>
                <input
                  type="text"
                  value={equipmentData.projectAddress}
                  onChange={(e) => handleEquipmentChange('projectAddress', e.target.value)}
                  className="w-full px-3 py-2 bg-black border border-accent rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-white"
                  placeholder="Enter project address"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">City</label>
                  <select
                    value={equipmentData.city}
                    onChange={(e) => handleEquipmentChange('city', e.target.value)}
                    className="w-full px-3 py-2 bg-black border border-accent rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-white"
                  >
                    <option value="">Select city</option>
                    <option value="Portland">Portland</option>
                    <option value="Seattle">Seattle</option>
                    <option value="Spokane">Spokane</option>
                    <option value="Tacoma">Tacoma</option>
                    <option value="Vancouver">Vancouver</option>
                    <option value="Bellevue">Bellevue</option>
                    <option value="Everett">Everett</option>
                    <option value="Kent">Kent</option>
                    <option value="Renton">Renton</option>
                    <option value="Yakima">Yakima</option>
                    <option value="Bellingham">Bellingham</option>
                    <option value="Olympia">Olympia</option>
                    <option value="Beaverton">Beaverton</option>
                    <option value="Gresham">Gresham</option>
                    <option value="Hillsboro">Hillsboro</option>
                    <option value="Bend">Bend</option>
                    <option value="Medford">Medford</option>
                    <option value="Springfield">Springfield</option>
                    <option value="Corvallis">Corvallis</option>
                    <option value="Albany">Albany</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white mb-2">State</label>
                  <select
                    value={equipmentData.state}
                    onChange={(e) => handleEquipmentChange('state', e.target.value)}
                    className="w-full px-3 py-2 bg-black border border-accent rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-white"
                  >
                    <option value="">Select state</option>
                    <option value="WA">Washington</option>
                    <option value="OR">Oregon</option>
                    <option value="CA">California</option>
                    <option value="ID">Idaho</option>
                    <option value="MT">Montana</option>
                    <option value="NV">Nevada</option>
                    <option value="UT">Utah</option>
                    <option value="AZ">Arizona</option>
                    <option value="CO">Colorado</option>
                    <option value="WY">Wyoming</option>
                    <option value="AK">Alaska</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Zip Code</label>
                  <input
                    type="text"
                    value={equipmentData.zipCode}
                    onChange={(e) => handleEquipmentChange('zipCode', e.target.value)}
                    className="w-full px-3 py-2 bg-black border border-accent rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-white"
                    placeholder="Enter zip code"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Project Description</label>
                <select
                  value={equipmentData.projectDescription}
                  onChange={(e) => handleEquipmentChange('projectDescription', e.target.value)}
                  className="w-full px-3 py-2 bg-black border border-accent rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent resize-none text-white"
                >
                  <option value="">Select project type</option>
                  <option value="Heavy Equipment Transport">Heavy Equipment Transport</option>
                  <option value="Machinery Rigging & Installation">Machinery Rigging & Installation</option>
                  <option value="Industrial Plant Relocation">Industrial Plant Relocation</option>
                  <option value="Construction Equipment Moving">Construction Equipment Moving</option>
                  <option value="Manufacturing Equipment Setup">Manufacturing Equipment Setup</option>
                  <option value="Warehouse Equipment Installation">Warehouse Equipment Installation</option>
                  <option value="Medical Equipment Transport">Medical Equipment Transport</option>
                  <option value="Server Room Equipment Moving">Server Room Equipment Moving</option>
                  <option value="Laboratory Equipment Relocation">Laboratory Equipment Relocation</option>
                  <option value="HVAC System Installation">HVAC System Installation</option>
                  <option value="Generator Installation">Generator Installation</option>
                  <option value="Transformer Installation">Transformer Installation</option>
                  <option value="Crane Services">Crane Services</option>
                  <option value="Millwright Services">Millwright Services</option>
                  <option value="Custom Project">Custom Project</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Additional Project Details</label>
                <textarea
                  value={equipmentData.additionalDetails || ''}
                  onChange={(e) => handleEquipmentChange('additionalDetails', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-black border border-accent rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent resize-none text-white"
                  placeholder="Additional details about the project and work to be performed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Special Instructions</label>
                <textarea
                  value={equipmentData.specialInstructions}
                  onChange={(e) => handleEquipmentChange('specialInstructions', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-black border border-accent rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent resize-none text-white"
                  placeholder="Any special instructions or requirements"
                />
              </div>

              <div className="border-2 border-accent rounded-lg p-4">
                <h3 className="text-lg font-medium text-white mb-4">Equipment Required</h3>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-white mb-2">Crew Size</label>
                  <select
                    value={equipmentData.crewSize}
                    onChange={(e) => handleEquipmentChange('crewSize', e.target.value)}
                    className="w-full px-3 py-2 bg-black border border-accent rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-white"
                  >
                    <option value="">Select crew size</option>
                    <option value="2-man crew">2 man crew</option>
                    <option value="3-man crew">3 man crew</option>
                    <option value="4-man crew">4 man crew</option>
                    <option value="5-man crew">5 man crew</option>
                    <option value="6-man crew">6 man crew</option>
                  </select>
                </div>

                <div className="mb-4">
                  <p className="text-sm font-medium text-white mb-2">Forklifts</p>
                  <div className="flex flex-wrap gap-2">
                    {['Forklift 3K','Forklift 5K','Forklift 6K','Forklift 8K','Versalift 25/35','Versalift 40','Versalift 60','Versalift 80','Versalift 88','Versalift 93'].map(item => (
                      <button
                        key={item}
                        onClick={() => addEquipmentItem(item)}
                        className="px-3 py-1 bg-accent text-black rounded-lg hover:bg-green-400 text-sm"
                      >
                        + {item}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm font-medium text-white mb-2">Tractors</p>
                  <div className="flex flex-wrap gap-2">
                    {['3 axle tractor','4 axle tractor','Rollback'].map(item => (
                      <button
                        key={item}
                        onClick={() => addEquipmentItem(item)}
                        className="px-3 py-1 bg-accent text-black rounded-lg hover:bg-green-400 text-sm"
                      >
                        + {item}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-white mb-2">Trailers</p>
                  <div className="flex flex-wrap gap-2">
                    {['Double Drop','Flatbed','Landoll','Step Deck'].map(item => (
                      <button
                        key={item}
                        onClick={() => addEquipmentItem(item)}
                        className="px-3 py-1 bg-accent text-black rounded-lg hover:bg-green-400 text-sm"
                      >
                        + {item}
                      </button>
                    ))}
                  </div>
                </div>

                {equipmentData.equipmentList.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-white mb-2">Selected Equipment</p>
                    <div className="flex flex-wrap gap-2">
                      {equipmentData.equipmentList.map(item => (
                        <span key={item} className="flex items-center bg-gray-800 px-2 py-1 rounded-lg text-sm">
                          {item}
                          <button
                            onClick={() => removeEquipmentItem(item)}
                            className="ml-1 text-red-400 hover:text-red-300"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
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
                  <button
                    onClick={addPiece}
                    className="flex items-center px-3 py-1 bg-accent text-black rounded-lg hover:bg-green-400 transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Item
                  </button>
                </div>

                <div className="space-y-3">
                  {logisticsData.pieces.map((piece, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-end">
                      <div className="col-span-5">
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

              {/* Service Type */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Service Type</label>
                <select
                  value={logisticsData.serviceType}
                  onChange={(e) => handleLogisticsChange('serviceType', e.target.value)}
                  className="w-full px-3 py-2 bg-black border border-accent rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-white"
                >
                  <option value="Standard Delivery">Standard Delivery</option>
                  <option value="White Glove">White Glove</option>
                  <option value="Inside Delivery">Inside Delivery</option>
                  <option value="Curbside">Curbside</option>
                </select>
              </div>

              {/* Special Handling */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Special Handling</label>
                <textarea
                  value={logisticsData.specialHandling}
                  onChange={(e) => handleLogisticsChange('specialHandling', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-black border border-accent rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent resize-none text-white"
                  placeholder="Any special handling requirements"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Modals */}
        <AIExtractorModal
          isOpen={showAIExtractor}
          onClose={() => setShowAIExtractor(false)}
          onExtract={handleAIExtraction}
          sessionId={sessionId}
        />

        <PreviewTemplates
          equipmentData={equipmentData}
          logisticsData={logisticsData}
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
        />

        <QuoteHistoryModal
          isOpen={showHistory}
          onClose={() => setShowHistory(false)}
          onLoadQuote={handleLoadQuote}
          currentEquipmentData={equipmentData}
          currentLogisticsData={logisticsData}
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