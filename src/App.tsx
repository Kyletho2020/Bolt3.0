/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react'
import { Bot, FileText, History, Trash2, Save, Plus, Search, Calendar, Building, User, Phone, Mail, MapPin, Package, Truck, AlertCircle, CheckCircle, Eye, X, Edit3 } from 'lucide-react'
import AIExtractorModal from './components/AIExtractorModal'
import PreviewTemplates from './components/PreviewTemplates'
import SimpleApiKeyManager from './components/SimpleApiKeyManager'
import { useSessionId } from './hooks/useSessionId'
import { supabase } from './lib/supabase'
import { QuoteService, QuoteListItem } from './services/quoteService'
import { HubSpotService, HubSpotContact } from './services/hubspotService'
import { HubSpotService, HubSpotContact } from './services/hubspotService'

interface FormData {
  // Equipment form fields
  projectName: string
  companyName: string
  contactName: string
  email: string
  phone: string
  projectAddress: string
  city: string
  state: string
  zipCode: string
  projectDescription: string
  specialInstructions: string
  
  // Logistics form fields
  pieces: Array<{
    description: string
    length: string
    width: string
    height: string
    weight: string
  }>
  pickupAddress: string
  pickupCity: string
  pickupState: string
  pickupZip: string
  deliveryAddress: string
  deliveryCity: string
  deliveryState: string
  deliveryZip: string
  serviceType: string
  specialHandling: string
}

const initialFormData: FormData = {
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
  specialInstructions: '',
  pieces: [{ description: '', length: '', width: '', height: '', weight: '' }],
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
}

function App() {
  const [activeTab, setActiveTab] = useState<'equipment' | 'logistics' | 'history'>('equipment')
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [showAIModal, setShowAIModal] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [hasApiKey, setHasApiKey] = useState(false)
  const [apiKeyId, setApiKeyId] = useState<string | null>(null)
  const [quotes, setQuotes] = useState<QuoteListItem[]>([])
  const [loadingQuotes, setLoadingQuotes] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [savingQuote, setSavingQuote] = useState(false)
  const [editingQuote, setEditingQuote] = useState<string | null>(null)
  const [hubspotContacts, setHubspotContacts] = useState<HubSpotContact[]>([])
  const [showContactSearch, setShowContactSearch] = useState(false)
  const [contactSearchTerm, setContactSearchTerm] = useState('')
  const [searchingContacts, setSearchingContacts] = useState(false)
  const [hubspotContacts, setHubspotContacts] = useState<HubSpotContact[]>([])
  const [showContactSearch, setShowContactSearch] = useState(false)
  const [contactSearchTerm, setContactSearchTerm] = useState('')
  const [searchingContacts, setSearchingContacts] = useState(false)

  const sessionId = useSessionId()

  useEffect(() => {
    if (sessionId) {
      loadTempData()
      if (activeTab === 'history') {
        loadQuotes()
      }
    }
  }, [sessionId, activeTab])

  const loadTempData = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-temp-data?sessionId=${encodeURIComponent(sessionId)}`, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data) {
          const equipmentData = result.data.equipment_data || {}
          const logisticsData = result.data.logistics_data || {}
          
          setFormData(prev => ({
            ...prev,
            ...equipmentData,
            ...logisticsData,
            pieces: logisticsData.pieces || prev.pieces
          }))
        }
      }
    } catch (error) {
      console.error('Error loading temp data:', error)
    }
  }

  const loadQuotes = async () => {
    if (!sessionId) return
    
    setLoadingQuotes(true)
    try {
      const quoteList = await QuoteService.listQuotes(sessionId)
      setQuotes(quoteList)
    } catch (error) {
      console.error('Error loading quotes:', error)
      setSaveMessage({ type: 'error', text: 'Failed to load quote history' })
      setTimeout(() => setSaveMessage(null), 3000)
    } finally {
      setLoadingQuotes(false)
    }
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handlePieceChange = (index: number, field: keyof FormData['pieces'][0], value: string) => {
    setFormData(prev => ({
      ...prev,
      pieces: prev.pieces.map((piece, i) => 
        i === index ? { ...piece, [field]: value } : piece
      )
    }))
  }

  const addPiece = () => {
    setFormData(prev => ({
      ...prev,
      pieces: [...prev.pieces, { description: '', length: '', width: '', height: '', weight: '' }]
    }))
  }

  const removePiece = (index: number) => {
    setFormData(prev => ({
      ...prev,
      pieces: prev.pieces.filter((_, i) => i !== index)
    }))
  }

  const handleAIExtraction = (equipmentData: any, logisticsData: any) => {
    setFormData(prev => ({
      ...prev,
      ...equipmentData,
      ...logisticsData,
      pieces: logisticsData?.pieces || prev.pieces
    }))
    setShowAIModal(false)
  }

  const generateQuoteNumber = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const time = String(now.getHours()).padStart(2, '0') + String(now.getMinutes()).padStart(2, '0')
    return `OM-${year}${month}${day}-${time}`
  }

  const saveQuote = async (quoteNumber?: string) => {
    if (!sessionId) {
      setSaveMessage({ type: 'error', text: 'Session not ready' })
      return
    }

    const finalQuoteNumber = quoteNumber || generateQuoteNumber()
    setSavingQuote(true)
    setSaveMessage(null)

    try {
      await QuoteService.saveQuote(sessionId, finalQuoteNumber, formData)
      setSaveMessage({ type: 'success', text: `Quote ${finalQuoteNumber} saved successfully!` })
      setEditingQuote(null)
      if (activeTab === 'history') {
        loadQuotes()
      }
    } catch (error) {
      console.error('Error saving quote:', error)
      setSaveMessage({ type: 'error', text: 'Failed to save quote' })
    } finally {
      setSavingQuote(false)
      setTimeout(() => setSaveMessage(null), 3000)
    }
  }

  const loadQuote = async (quoteId: string) => {
    try {
      const { data, error } = await supabase
        .from('quotes')
        .select('*')
        .eq('id', quoteId)
        .single()

      if (error) throw error

      if (data) {
        const snapshot = data.form_snapshot as FormData
        setFormData(snapshot)
        setEditingQuote(data.quote_number)
        setActiveTab('equipment')
      }
    } catch (error) {
      console.error('Error loading quote:', error)
      setSaveMessage({ type: 'error', text: 'Failed to load quote' })
      setTimeout(() => setSaveMessage(null), 3000)
    }
  }

  const deleteQuote = async (quoteId: string, quoteName: string) => {
    if (!confirm(`Are you sure you want to delete quote "${quoteName}"?`)) return

    try {
      const { error } = await supabase
        .from('quotes')
        .delete()
        .eq('id', quoteId)

      if (error) throw error

      setSaveMessage({ type: 'success', text: 'Quote deleted successfully' })
      loadQuotes()
    } catch (error) {
      console.error('Error deleting quote:', error)
      setSaveMessage({ type: 'error', text: 'Failed to delete quote' })
    } finally {
      setTimeout(() => setSaveMessage(null), 3000)
    }
  }

  const searchHubSpotContacts = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setHubspotContacts([])
      return
    }

    setSearchingContacts(true)
    try {
      const contacts = await HubSpotService.searchContactsByName(searchTerm, true)
      setHubspotContacts(contacts)
    } catch (error) {
      console.error('Error searching contacts:', error)
      setHubspotContacts([])
    } finally {
      setSearchingContacts(false)
    }
  }

  const selectContact = (contact: HubSpotContact) => {
    setFormData(prev => ({
      ...prev,
      contactName: `${contact.firstName} ${contact.lastName}`.trim(),
      email: contact.email,
      phone: contact.phone,
      companyName: contact.companyName || prev.companyName,
      projectAddress: contact.contactAddress || contact.companyAddress || prev.projectAddress,
      city: contact.contactCity || contact.companyCity || prev.city,
      state: contact.contactState || contact.companyState || prev.state,
      zipCode: contact.contactZip || contact.companyZip || prev.zipCode,
    }))
    setShowContactSearch(false)
    setContactSearchTerm('')
    setHubspotContacts([])
  }

  const filteredQuotes = quotes.filter(quote => 
    quote.quote_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (quote.customer_name && quote.customer_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (quote.company_name && quote.company_name.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const clearForm = () => {
    if (confirm('Are you sure you want to clear all form data?')) {
      setFormData(initialFormData)
      setEditingQuote(null)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">OM Quote Generator</h1>
          <p className="text-white">Professional quote generation with AI assistance</p>
        </div>

        {saveMessage && (
          <div className={`mb-6 p-4 rounded-lg flex items-center ${
            saveMessage.type === 'success'
              ? 'bg-gray-900 text-white border border-accent'
              : 'bg-gray-900 text-white border border-accent'
          }`}>
            {saveMessage.type === 'success' ? (
              <CheckCircle className="w-5 h-5 mr-2" />
            ) : (
              <AlertCircle className="w-5 h-5 mr-2" />
            )}
            {saveMessage.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <SimpleApiKeyManager onApiKeySet={(hasKey, keyId) => {
              setHasApiKey(hasKey)
              setApiKeyId(keyId || null)
            }} />
            
            <div className="mt-6 space-y-3">
              <button
                onClick={() => setShowAIModal(true)}
                disabled={!hasApiKey || !sessionId}
                className="w-full flex items-center justify-center px-4 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Bot className="w-5 h-5 mr-2" />
                AI Extract
              </button>
              
              <button
                onClick={() => setShowPreview(true)}
                className="w-full flex items-center justify-center px-4 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 hover:text-white transition-colors"
              >
                <Eye className="w-5 h-5 mr-2" />
                Preview Templates
              </button>

              <button
                onClick={() => saveQuote(editingQuote || undefined)}
                disabled={savingQuote || !sessionId}
                className="w-full flex items-center justify-center px-4 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Save className="w-5 h-5 mr-2" />
                {savingQuote ? 'Saving...' : editingQuote ? 'Update Quote' : 'Save Quote'}
              </button>

              <button
                onClick={clearForm}
                className="w-full flex items-center justify-center px-4 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 hover:text-white transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                New Quote
              </button>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="bg-gray-900 rounded-2xl border-2 border-accent overflow-hidden">
              <div className="flex border-b-2 border-accent">
                <button
                  onClick={() => setActiveTab('equipment')}
                  className={`flex-1 flex items-center justify-center px-6 py-4 transition-colors ${
                    activeTab === 'equipment'
                      ? 'bg-gray-900 text-white border-b-2 border-accent'
                      : 'text-white hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <FileText className="w-5 h-5 mr-2" />
                  Equipment Form
                </button>
                <button
                  onClick={() => setActiveTab('logistics')}
                  className={`flex-1 flex items-center justify-center px-6 py-4 transition-colors ${
                    activeTab === 'logistics'
                      ? 'bg-gray-900 text-white border-b-2 border-accent'
                      : 'text-white hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <Truck className="w-5 h-5 mr-2" />
                  Logistics Form
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`flex-1 flex items-center justify-center px-6 py-4 transition-colors ${
                    activeTab === 'history'
                      ? 'bg-gray-900 text-white border-b-2 border-accent'
                      : 'text-white hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <History className="w-5 h-5 mr-2" />
                  Quote History
                </button>
              </div>

              <div className="p-8">
                {editingQuote && (
                  <div className="mb-6 p-4 bg-gray-900 border border-accent rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Edit3 className="w-5 h-5 text-white mr-2" />
                        <span className="text-white font-medium">Editing Quote: {editingQuote}</span>
                      </div>
                      <button
                        onClick={() => setEditingQuote(null)}
                        className="text-white hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === 'equipment' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-white">Equipment Quote Form</h2>
                      <button
                        onClick={() => setShowContactSearch(!showContactSearch)}
                        className="flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 hover:text-white transition-colors"
                      >
                        <Search className="w-4 h-4 mr-2" />
                        Search Contacts
                      </button>
                    </div>

                    {showContactSearch && (
                      <div className="mb-6 p-4 bg-gray-900 border border-accent rounded-lg">
                        <div className="flex items-center space-x-4 mb-4">
                          <div className="flex-1">
                            <input
                              type="text"
                              value={contactSearchTerm}
                              onChange={(e) => {
                                setContactSearchTerm(e.target.value)
                                searchHubSpotContacts(e.target.value)
                              }}
                              placeholder="Search contacts by name..."
                              className="w-full px-4 py-2 bg-black border border-accent rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-white placeholder-white"
                            />
                          </div>
                          <button
                            onClick={() => setShowContactSearch(false)}
                            className="p-2 text-white hover:text-white"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>

                        {searchingContacts && (
                          <div className="text-center py-4">
                            <div className="inline-flex items-center text-white">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Searching contacts...
                            </div>
                          </div>
                        )}

                        {hubspotContacts.length > 0 && (
                          <div className="space-y-2 max-h-60 overflow-y-auto">
                            {hubspotContacts.map((contact) => (
                              <div
                                key={contact.id}
                                onClick={() => selectContact(contact)}
                                className="p-3 bg-black border border-accent rounded-lg cursor-pointer hover:bg-gray-800 transition-colors"
                              >
                                <div className="font-medium text-white">
                                  {contact.firstName} {contact.lastName}
                                </div>
                                <div className="text-sm text-white">
                                  {contact.companyName && <span>{contact.companyName} • </span>}
                                  {contact.email}
                                </div>
                                {contact.contactAddress && (
                                  <div className="text-sm text-white">{contact.contactAddress}</div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                      <h2 className="text-2xl font-bold text-white">Equipment Quote Form</h2>
                      <button
                        onClick={() => setShowContactSearch(!showContactSearch)}
                        className="flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 hover:text-white transition-colors"
                      >
                        <Search className="w-4 h-4 mr-2" />
                        Search Contacts
                      </button>
                    </div>

                    {showContactSearch && (
                      <div className="mb-6 p-4 bg-gray-900 border border-accent rounded-lg">
                        <div className="flex items-center space-x-4 mb-4">
                          <div className="flex-1">
                            <input
                              type="text"
                              value={contactSearchTerm}
                              onChange={(e) => {
                                setContactSearchTerm(e.target.value)
                                searchHubSpotContacts(e.target.value)
                              }}
                              placeholder="Search contacts by name..."
                              className="w-full px-4 py-2 bg-black border border-accent rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-white placeholder-white"
                            />
                          </div>
                          <button
                            onClick={() => setShowContactSearch(false)}
                            className="p-2 text-white hover:text-white"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>

                        {searchingContacts && (
                          <div className="text-center py-4">
                            <div className="inline-flex items-center text-white">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Searching contacts...
                            </div>
                          </div>
                        )}

                        {hubspotContacts.length > 0 && (
                          <div className="space-y-2 max-h-60 overflow-y-auto">
                            {hubspotContacts.map((contact) => (
                              <div
                                key={contact.id}
                                onClick={() => selectContact(contact)}
                                className="p-3 bg-black border border-accent rounded-lg cursor-pointer hover:bg-gray-800 transition-colors"
                              >
                                <div className="font-medium text-white">
                                  {contact.firstName} {contact.lastName}
                                </div>
                                <div className="text-sm text-white">
                                  {contact.companyName && <span>{contact.companyName} • </span>}
                                  {contact.email}
                                </div>
                                {contact.contactAddress && (
                                  <div className="text-sm text-white">{contact.contactAddress}</div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="flex items-center text-sm font-medium text-white mb-2">
                          <FileText className="w-4 h-4 mr-2" />
                          Project Name
                        </label>
                        <input
                          type="text"
                          value={formData.projectName}
                          onChange={(e) => handleInputChange('projectName', e.target.value)}
                          className="w-full px-4 py-3 bg-black border border-accent rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-white placeholder-white"
                          placeholder="Enter project name"
                        />
                      </div>

                      <div>
                        <label className="flex items-center text-sm font-medium text-white mb-2">
                          <Building className="w-4 h-4 mr-2" />
                          Company Name
                        </label>
                        <input
                          type="text"
                          value={formData.companyName}
                          onChange={(e) => handleInputChange('companyName', e.target.value)}
                          className="w-full px-4 py-3 bg-black border border-accent rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-white placeholder-white"
                          placeholder="Enter company name"
                        />
                      </div>

                      <div>
                        <label className="flex items-center text-sm font-medium text-white mb-2">
                          <User className="w-4 h-4 mr-2" />
                          Contact Name
                        </label>
                        <input
                          type="text"
                          value={formData.contactName}
                          onChange={(e) => handleInputChange('contactName', e.target.value)}
                          className="w-full px-4 py-3 bg-black border border-accent rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-white placeholder-white"
                          placeholder="Enter contact name"
                        />
                      </div>

                      <div>
                        <label className="flex items-center text-sm font-medium text-white mb-2">
                          <Mail className="w-4 h-4 mr-2" />
                          Email
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className="w-full px-4 py-3 bg-black border border-accent rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-white placeholder-white"
                          placeholder="Enter email address"
                        />
                      </div>

                      <div>
                        <label className="flex items-center text-sm font-medium text-white mb-2">
                          <Phone className="w-4 h-4 mr-2" />
                          Phone
                        </label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className="w-full px-4 py-3 bg-black border border-accent rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-white placeholder-white"
                          placeholder="Enter phone number"
                        />
                      </div>

                      <div>
                        <label className="flex items-center text-sm font-medium text-white mb-2">
                          <MapPin className="w-4 h-4 mr-2" />
                          Project Address
                        </label>
                        <input
                          type="text"
                          value={formData.projectAddress}
                          onChange={(e) => handleInputChange('projectAddress', e.target.value)}
                          className="w-full px-4 py-3 bg-black border border-accent rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-white placeholder-white"
                          placeholder="Enter project address"
                        />
                      </div>

                      <div>
                        <label className="flex items-center text-sm font-medium text-white mb-2">
                          <MapPin className="w-4 h-4 mr-2" />
                          City
                        </label>
                        <input
                          type="text"
                          value={formData.city}
                          onChange={(e) => handleInputChange('city', e.target.value)}
                          className="w-full px-4 py-3 bg-black border border-accent rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-white placeholder-white"
                          placeholder="Enter city"
                        />
                      </div>

                      <div>
                        <label className="flex items-center text-sm font-medium text-white mb-2">
                          <MapPin className="w-4 h-4 mr-2" />
                          State
                        </label>
                        <input
                          type="text"
                          value={formData.state}
                          onChange={(e) => handleInputChange('state', e.target.value)}
                          className="w-full px-4 py-3 bg-black border border-accent rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-white placeholder-white"
                          placeholder="Enter state"
                        />
                      </div>

                      <div>
                        <label className="flex items-center text-sm font-medium text-white mb-2">
                          <MapPin className="w-4 h-4 mr-2" />
                          Zip Code
                        </label>
                        <input
                          type="text"
                          value={formData.zipCode}
                          onChange={(e) => handleInputChange('zipCode', e.target.value)}
                          className="w-full px-4 py-3 bg-black border border-accent rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-white placeholder-white"
                          placeholder="Enter zip code"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="flex items-center text-sm font-medium text-white mb-2">
                        <FileText className="w-4 h-4 mr-2" />
                        Project Description
                      </label>
                      <textarea
                        value={formData.projectDescription}
                        onChange={(e) => handleInputChange('projectDescription', e.target.value)}
                        rows={4}
                        className="w-full px-4 py-3 bg-black border border-accent rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent resize-none text-white placeholder-white"
                        placeholder="Describe the project details..."
                      />
                    </div>

                    <div>
                      <label className="flex items-center text-sm font-medium text-white mb-2">
                        <AlertCircle className="w-4 h-4 mr-2" />
                        Special Instructions
                      </label>
                      <textarea
                        value={formData.specialInstructions}
                        onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 bg-black border border-accent rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent resize-none text-white placeholder-white"
                        placeholder="Any special instructions or requirements..."
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'logistics' && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-white mb-6">Logistics Quote Form</h2>

                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <label className="flex items-center text-sm font-medium text-white">
                          <Package className="w-4 h-4 mr-2" />
                          Items to Transport
                        </label>
                        <button
                          onClick={addPiece}
                          className="flex items-center px-3 py-1 bg-gray-900 text-white rounded-lg hover:bg-gray-800 hover:text-white transition-colors"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add Item
                        </button>
                      </div>

                      <div className="space-y-4">
                        {formData.pieces.map((piece, index) => (
                          <div key={index} className="p-4 bg-black border border-accent rounded-lg">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-sm font-medium text-white">Item {index + 1}</span>
                              {formData.pieces.length > 1 && (
                                <button
                                  onClick={() => removePiece(index)}
                                  className="text-white hover:text-white"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                              <div className="md:col-span-2">
                                <input
                                  type="text"
                                  value={piece.description}
                                  onChange={(e) => handlePieceChange(index, 'description', e.target.value)}
                                  placeholder="Description"
                                  className="w-full px-3 py-2 bg-gray-900 border border-accent rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-white placeholder-white"
                                />
                              </div>
                              <div>
                                <input
                                  type="text"
                                  value={piece.length}
                                  onChange={(e) => handlePieceChange(index, 'length', e.target.value)}
                                  placeholder="Length"
                                  className="w-full px-3 py-2 bg-gray-900 border border-accent rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-white placeholder-white"
                                />
                              </div>
                              <div>
                                <input
                                  type="text"
                                  value={piece.width}
                                  onChange={(e) => handlePieceChange(index, 'width', e.target.value)}
                                  placeholder="Width"
                                  className="w-full px-3 py-2 bg-gray-900 border border-accent rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-white placeholder-white"
                                />
                              </div>
                              <div>
                                <input
                                  type="text"
                                  value={piece.height}
                                  onChange={(e) => handlePieceChange(index, 'height', e.target.value)}
                                  placeholder="Height"
                                  className="w-full px-3 py-2 bg-gray-900 border border-accent rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-white placeholder-white"
                                />
                              </div>
                              <div>
                                <input
                                  type="text"
                                  value={piece.weight}
                                  onChange={(e) => handlePieceChange(index, 'weight', e.target.value)}
                                  placeholder="Weight"
                                  className="w-full px-3 py-2 bg-gray-900 border border-accent rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-white placeholder-white"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white">Pickup Location</h3>
                        
                        <div>
                          <label className="flex items-center text-sm font-medium text-white mb-2">
                            <MapPin className="w-4 h-4 mr-2" />
                            Pickup Address
                          </label>
                          <input
                            type="text"
                            value={formData.pickupAddress}
                            onChange={(e) => handleInputChange('pickupAddress', e.target.value)}
                            className="w-full px-4 py-3 bg-black border border-accent rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-white placeholder-white"
                            placeholder="Enter pickup address"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-sm font-medium text-white mb-2 block">City</label>
                            <input
                              type="text"
                              value={formData.pickupCity}
                              onChange={(e) => handleInputChange('pickupCity', e.target.value)}
                              className="w-full px-4 py-3 bg-black border border-accent rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-white placeholder-white"
                              placeholder="City"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-white mb-2 block">State</label>
                            <input
                              type="text"
                              value={formData.pickupState}
                              onChange={(e) => handleInputChange('pickupState', e.target.value)}
                              className="w-full px-4 py-3 bg-black border border-accent rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-white placeholder-white"
                              placeholder="State"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-white mb-2 block">Zip Code</label>
                          <input
                            type="text"
                            value={formData.pickupZip}
                            onChange={(e) => handleInputChange('pickupZip', e.target.value)}
                            className="w-full px-4 py-3 bg-black border border-accent rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-white placeholder-white"
                            placeholder="Zip code"
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white">Delivery Location</h3>
                        
                        <div>
                          <label className="flex items-center text-sm font-medium text-white mb-2">
                            <MapPin className="w-4 h-4 mr-2" />
                            Delivery Address
                          </label>
                          <input
                            type="text"
                            value={formData.deliveryAddress}
                            onChange={(e) => handleInputChange('deliveryAddress', e.target.value)}
                            className="w-full px-4 py-3 bg-black border border-accent rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-white placeholder-white"
                            placeholder="Enter delivery address"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-sm font-medium text-white mb-2 block">City</label>
                            <input
                              type="text"
                              value={formData.deliveryCity}
                              onChange={(e) => handleInputChange('deliveryCity', e.target.value)}
                              className="w-full px-4 py-3 bg-black border border-accent rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-white placeholder-white"
                              placeholder="City"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-white mb-2 block">State</label>
                            <input
                              type="text"
                              value={formData.deliveryState}
                              onChange={(e) => handleInputChange('deliveryState', e.target.value)}
                              className="w-full px-4 py-3 bg-black border border-accent rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-white placeholder-white"
                              placeholder="State"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-white mb-2 block">Zip Code</label>
                          <input
                            type="text"
                            value={formData.deliveryZip}
                            onChange={(e) => handleInputChange('deliveryZip', e.target.value)}
                            className="w-full px-4 py-3 bg-black border border-accent rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-white placeholder-white"
                            placeholder="Zip code"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="flex items-center text-sm font-medium text-white mb-2">
                          <Truck className="w-4 h-4 mr-2" />
                          Service Type
                        </label>
                        <select
                          value={formData.serviceType}
                          onChange={(e) => handleInputChange('serviceType', e.target.value)}
                          className="w-full px-4 py-3 bg-black border border-accent rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-white"
                        >
                          <option value="Standard Delivery">Standard Delivery</option>
                          <option value="White Glove">White Glove</option>
                          <option value="Inside Delivery">Inside Delivery</option>
                          <option value="Curbside">Curbside</option>
                        </select>
                      </div>

                      <div>
                        <label className="flex items-center text-sm font-medium text-white mb-2">
                          <AlertCircle className="w-4 h-4 mr-2" />
                          Special Handling
                        </label>
                        <input
                          type="text"
                          value={formData.specialHandling}
                          onChange={(e) => handleInputChange('specialHandling', e.target.value)}
                          className="w-full px-4 py-3 bg-black border border-accent rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-white placeholder-white"
                          placeholder="Special handling requirements"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'history' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold text-white">Quote History</h2>
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white w-4 h-4" />
                          <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search quotes..."
                            className="pl-10 pr-4 py-2 bg-black border border-accent rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-white placeholder-white"
                          />
                        </div>
                      </div>
                    </div>

                    {loadingQuotes ? (
                      <div className="text-center py-8">
                        <div className="inline-flex items-center text-white">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                          Loading quotes...
                        </div>
                      </div>
                    ) : filteredQuotes.length === 0 ? (
                      <div className="text-center py-8">
                        <FileText className="w-12 h-12 text-white mx-auto mb-4" />
                        <p className="text-white">No quotes found</p>
                        <p className="text-sm text-white mt-2">
                          {searchTerm ? 'Try adjusting your search terms' : 'Create your first quote to get started'}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {filteredQuotes.map((quote) => (
                          <div key={quote.id} className="bg-black border border-accent rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-4 mb-2">
                                  <h3 className="font-semibold text-white">{quote.quote_number}</h3>
                                  <div className="flex items-center text-sm text-white">
                                    <Calendar className="w-4 h-4 mr-1" />
                                    {new Date(quote.created_at).toLocaleDateString()}
                                  </div>
                                </div>
                                <div className="flex items-center space-x-4 text-sm text-white">
                                  {quote.customer_name && (
                                    <div className="flex items-center">
                                      <User className="w-4 h-4 mr-1" />
                                      {quote.customer_name}
                                    </div>
                                  )}
                                  {quote.company_name && (
                                    <div className="flex items-center">
                                      <Building className="w-4 h-4 mr-1" />
                                      {quote.company_name}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => loadQuote(quote.id)}
                                  className="flex items-center px-3 py-1 bg-gray-900 text-white rounded-lg hover:bg-gray-800 hover:text-white transition-colors"
                                >
                                  <Edit3 className="w-4 h-4 mr-1" />
                                  Edit
                                </button>
                                <button
                                  onClick={() => deleteQuote(quote.id, quote.quote_number)}
                                  className="flex items-center px-3 py-1 bg-gray-900 text-white rounded-lg hover:bg-gray-800 hover:text-white transition-colors"
                                >
                                  <Trash2 className="w-4 h-4 mr-1" />
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <AIExtractorModal
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
        onExtract={handleAIExtraction}
        sessionId={sessionId}
      />

      <PreviewTemplates
        equipmentData={formData}
        logisticsData={formData}
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
      />
    </div>
  )
}

export default App