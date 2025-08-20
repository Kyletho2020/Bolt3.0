/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef } from 'react'
import {
  Building2,
  Truck,
  Package,
  FileText,
  Bot,
  Trash2,
  RotateCcw,
  Plus,
  Minus,
  CheckCircle,
  Search,
  Mail,
  History,
  Archive
} from 'lucide-react'
import { useSessionId } from './hooks/useSessionId'
import AIExtractorModal from './components/AIExtractorModal'
import PreviewTemplates from './components/PreviewTemplates'
import QuoteHistoryModal from './components/QuoteHistoryModal'
import ApiKeySetup from './components/ApiKeySetup'
import { HubSpotService, HubSpotContact } from './services/hubspotService'
import { QuoteService } from './services/quoteService'

interface FormData {
  // Project Details
  projectName: string
  companyName: string
  contactName: string
  phone: string
  email: string
  projectDescription: string
  siteAddress: string
  shopLocation: string


  // Equipment Required
  crewSize: string
  forklifts: Array<{ type: string; quantity: number }>
  tractors: Array<{ type: string; quantity: number }>
  trailers: Array<{ type: string; quantity: number }>

  // Storage/Logistics
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
  truckType: string
  shipmentType: string
  storageEnabled: boolean
  storageType: 'inside' | 'outside'
  storageSqFt: string
}

const initialFormData: FormData = {
  // Project Details
  projectName: '',
  companyName: '',
  contactName: '',
  phone: '',
  email: '',
  projectDescription: '',
  siteAddress: '',
  shopLocation: 'Shop',

  // Equipment Required
  crewSize: '3-man crew',
  forklifts: [],
  tractors: [],
  trailers: [],

  // Storage/Logistics
  pieces: [{ description: '', length: '', width: '', height: '', weight: '' }],
  pickupAddress: '',
  pickupCity: '',
  pickupState: '',
  pickupZip: '',
  deliveryAddress: '',
  deliveryCity: '',
  deliveryState: '',
  deliveryZip: '',
  truckType: 'Flatbed',
  shipmentType: 'LTL (Less Than Truckload)',
  storageEnabled: false,
  storageType: 'inside',
  storageSqFt: ''
}

const getInitialSection = (section: string): Partial<FormData> => {
  switch (section) {
    case 'project':
      return {
        projectName: initialFormData.projectName,
        companyName: initialFormData.companyName,
        contactName: initialFormData.contactName,
        email: initialFormData.email,
        phone: initialFormData.phone,
        projectDescription: initialFormData.projectDescription,
        siteAddress: initialFormData.siteAddress,
        shopLocation: initialFormData.shopLocation,
      }
    case 'equipment':
      return {
        crewSize: initialFormData.crewSize,
        forklifts: [...initialFormData.forklifts],
        tractors: [...initialFormData.tractors],
        trailers: [...initialFormData.trailers],
      }
    case 'storage':
      return {
        pieces: initialFormData.pieces.map(piece => ({ ...piece })),
        pickupAddress: initialFormData.pickupAddress,
        pickupCity: initialFormData.pickupCity,
        pickupState: initialFormData.pickupState,
        pickupZip: initialFormData.pickupZip,
        deliveryAddress: initialFormData.deliveryAddress,
        deliveryCity: initialFormData.deliveryCity,
        deliveryState: initialFormData.deliveryState,
        deliveryZip: initialFormData.deliveryZip,
        truckType: initialFormData.truckType,
        shipmentType: initialFormData.shipmentType,
        storageEnabled: initialFormData.storageEnabled,
        storageType: initialFormData.storageType,
        storageSqFt: initialFormData.storageSqFt,
      }
    default:
      return {}
  }
}

const App: React.FC = () => {
  const [showAIExtractor, setShowAIExtractor] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const [showApiKeySetup, setShowApiKeySetup] = useState(false)
  const [showQuoteHistory, setShowQuoteHistory] = useState(false)
  const sessionId = useSessionId()

  const [formData, setFormData] = useState<FormData>(initialFormData)
  const skipSaveRef = useRef(false)
  const [hubspotResults, setHubspotResults] = useState<HubSpotContact[]>([])
  const [hubspotLoading, setHubspotLoading] = useState(false)
  const [typeaheadOpen, setTypeaheadOpen] = useState(false)
  const [typeaheadLoading, setTypeaheadLoading] = useState(false)
  const [typeaheadResults, setTypeaheadResults] = useState<HubSpotContact[]>([])
  const typeaheadTimerRef = useRef<number | null>(null)
  const typeaheadContainerRef = useRef<HTMLDivElement | null>(null)
  const suppressNextTypeaheadRef = useRef<boolean>(false)
  const [savingQuote, setSavingQuote] = useState(false)
  const [quoteHistoryOpen, setQuoteHistoryOpen] = useState(false)
  const [quoteList, setQuoteList] = useState<Array<{ id: string; quote_number: string; customer_name: string | null; company_name: string | null; created_at: string }>>([])

  useEffect(() => {
    const stored = localStorage.getItem('quote-form')
    if (stored) {
      try {
        setFormData(JSON.parse(stored))
      } catch (err) {
        console.error('Failed to parse saved form data', err)
      }
    }
  }, [])

  useEffect(() => {
    if (skipSaveRef.current) {
      skipSaveRef.current = false
      return
    }
    localStorage.setItem('quote-form', JSON.stringify(formData))
  }, [formData])

  useEffect(() => {
    if (!formData.storageEnabled) return
    const totalSqFt = formData.pieces.reduce((sum, piece) => {
      const length = parseFloat(piece.length) || 0
      const width = parseFloat(piece.width) || 0
      return sum + (length * width) / 144
    }, 0)
    setFormData(prev => {
      const formatted = totalSqFt ? totalSqFt.toFixed(2) : ''
      if (prev.storageSqFt === formatted) return prev
      return { ...prev, storageSqFt: formatted }
    })
  }, [formData.pieces, formData.storageEnabled])

  const formatPhone = (input: string): string => {
    const rawDigits = String(input).replace(/\D/g, '')
    let digits = rawDigits
    if (rawDigits.length === 11 && rawDigits.startsWith('1')) {
      digits = rawDigits.slice(1)
    }
    digits = digits.slice(0, 10)
    const area = digits.slice(0, 3)
    const mid = digits.slice(3, 6)
    const last = digits.slice(6, 10)
    if (digits.length > 6) return `(${area})${mid}-${last}`
    if (digits.length > 3) return `(${area})${mid}`
    return area
  }

  const handleInputChange = (field: keyof FormData, value: any) => {
    if (field === 'phone') {
      setFormData(prev => ({ ...prev, phone: formatPhone(value) }))
      return
    }
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleAIExtract = (equipmentData: any, logisticsData: any) => {
    const next = { ...equipmentData, ...logisticsData }
    if (next.phone) next.phone = formatPhone(next.phone)
    setFormData(prev => ({
      ...prev,
      ...next
    }))
  }

  const applyHubSpotContact = (contact: HubSpotContact) => {
    const fullName = [contact.firstName, contact.lastName].filter(Boolean).join(' ').trim()
    const rawPhone = contact.phone || ''
    const formattedPhone = formatPhone(rawPhone)
    const addressFromCompany = contact.companyAddress && contact.companyAddress.trim().length > 0
      ? contact.companyAddress
      : ''
    const addressFromContact = contact.contactAddress && contact.contactAddress.trim().length > 0
      ? contact.contactAddress
      : ''
    const chosenAddress = addressFromCompany || addressFromContact
    setFormData(prev => ({
      ...prev,
      contactName: fullName || prev.contactName,
      email: contact.email || prev.email,
      phone: formattedPhone || prev.phone,
      companyName: contact.companyName || prev.companyName,
      siteAddress: chosenAddress || prev.siteAddress,
      pickupAddress: chosenAddress || prev.pickupAddress,
      pickupCity: contact.companyCity || contact.contactCity || prev.pickupCity,
      pickupState: contact.companyState || contact.contactState || prev.pickupState,
      pickupZip: contact.companyZip || contact.contactZip || prev.pickupZip,
    }))
  }

  const handleHubSpotSearch = async () => {
    const name = (formData.contactName || '').trim()
    if (!name) return
    try {
      setHubspotLoading(true)
      const results = await HubSpotService.searchContactsByName(name)
      if (results.length === 1) {
        applyHubSpotContact(results[0])
        setHubspotResults([])
      } else {
        setHubspotResults(results.slice(0, 20))
      }
    } catch (err) {
      console.error('HubSpot search failed', err)
      setHubspotResults([])
    } finally {
      setHubspotLoading(false)
    }
  }

  useEffect(() => {
    const name = (formData.contactName || '').trim()
    if (typeaheadTimerRef.current) window.clearTimeout(typeaheadTimerRef.current)
    if (suppressNextTypeaheadRef.current) {
      suppressNextTypeaheadRef.current = false
      return
    }
    if (name.length < 4) {
      setTypeaheadOpen(false)
      setTypeaheadResults([])
      setTypeaheadLoading(false)
      return
    }
    setTypeaheadOpen(true)
    typeaheadTimerRef.current = window.setTimeout(async () => {
      try {
        setTypeaheadLoading(true)
        const results = await HubSpotService.searchContactsByName(name, true)
        setTypeaheadResults(results)
      } catch (e) {
        console.error('Typeahead search failed', e)
        setTypeaheadResults([])
      } finally {
        setTypeaheadLoading(false)
      }
    }, 400)
    return () => {
      if (typeaheadTimerRef.current) window.clearTimeout(typeaheadTimerRef.current)
    }
  }, [formData.contactName])

  const onSelectTypeahead = (contact: HubSpotContact) => {
    suppressNextTypeaheadRef.current = true
    applyHubSpotContact(contact)
    setTypeaheadOpen(false)
    setTypeaheadResults([])
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!typeaheadContainerRef.current) return
      if (!typeaheadContainerRef.current.contains(e.target as Node)) {
        setTypeaheadOpen(false)
        setTypeaheadResults([])
        setHubspotResults([])
      }
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setTypeaheadOpen(false)
        setTypeaheadResults([])
        setHubspotResults([])
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const handleStartEmail = () => {
    const email = (formData.email || '').trim()
    if (!email) return
    const full = generateCustomerEmailTemplate()
    const lines = full.split('\n')
    const subject = (lines[0] || 'Quote').trim()
    const body = lines.slice(1).join('\n')
    const mailto = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    try {
      const a = document.createElement('a')
      a.href = mailto
      a.style.display = 'none'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    } catch {
      try {
        window.location.href = mailto
      } catch {
        // As a last resort, copy the email template to clipboard
        copyToClipboard(full, 'email')
      }
    }
  }

  const lookupZip = async (type: 'pickup' | 'delivery') => {
    const zipField = type === 'pickup' ? 'pickupZip' : 'deliveryZip'
    const cityField = type === 'pickup' ? 'pickupCity' : 'deliveryCity'
    const stateField = type === 'pickup' ? 'pickupState' : 'deliveryState'
    const zip = formData[zipField]
    if (!zip) return
    try {
      const res = await fetch(`https://api.zippopotam.us/us/${zip}`)
      if (!res.ok) return
      const data = await res.json()
      const place = data.places && data.places[0]
      if (place) {
        setFormData(prev => ({
          ...prev,
          [cityField]: place['place name'],
          [stateField]: place['state abbreviation']
        }))
      }
    } catch (err) {
      console.error('ZIP lookup failed', err)
    }
  }

  const clearAllData = () => {
    setFormData(initialFormData)
  }

  const resetSavedData = () => {
    localStorage.removeItem('quote-form')
    skipSaveRef.current = true
    clearAllData()
  }

  const clearSection = (section: string) => {
    setFormData(prev => ({
      ...prev,
      ...getInitialSection(section)
    }))
  }

  const addPiece = () => {
    setFormData(prev => ({
      ...prev,
      pieces: [...prev.pieces, { description: '', length: '', width: '', height: '', weight: '' }]
    }))
  }

  const updatePiece = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      pieces: prev.pieces.map((piece, i) => 
        i === index ? { ...piece, [field]: value } : piece
      )
    }))
  }

  const removePiece = (index: number) => {
    if (formData.pieces.length > 1) {
      setFormData(prev => ({
        ...prev,
        pieces: prev.pieces.filter((_, i) => i !== index)
      }))
    }
  }

  const forkliftAutoSelections: Record<string, {
    tractors?: string[]
    trailers?: string[]
    forklifts?: string[]
  }> = {
    'Forklift (5k)': { tractors: ['Rollback'] },
    'Forklift (8k)': { tractors: ['Rollback'] },
    'Forklift (15k)': { tractors: ['Rollback'] },
    'Forklift (30k)': { tractors: ['3-axle tractor'], trailers: ['Dovetail'] },
    'Forklift - Hoist 18/26': { tractors: ['3-axle tractor'], trailers: ['Dovetail'] },
    'Versalift 25/35': { tractors: ['3-axle tractor'], trailers: ['Dovetail'] },
    'Versalift 40/60': { tractors: ['4-axle tractor'], trailers: ['Lowboy'] },
    'Versalift 60/80': {
      tractors: ['4-axle tractor', '3-axle tractor'],
      trailers: ['Dovetail', 'Lowboy'],
      forklifts: ['Forklift (15k)']
    },
    'Trilifter': { tractors: ['4-axle tractor'], trailers: ['Lowboy'] }
  }

  const rollbackForkliftTypes = ['Forklift (5k)', 'Forklift (8k)', 'Forklift (15k)']

  useEffect(() => {
    const rollbackCount = formData.forklifts
      .filter(f => rollbackForkliftTypes.includes(f.type))
      .reduce((sum, f) => sum + f.quantity, 0)
    const smallForkliftGroups = rollbackCount > 1 ? Math.ceil(rollbackCount / 3) : 0

    let require3Axle = false
    let requireDovetail = false
    formData.forklifts.forEach(f => {
      const auto = forkliftAutoSelections[f.type]
      if (auto?.tractors?.includes('3-axle tractor')) require3Axle = true
      if (auto?.trailers?.includes('Dovetail')) requireDovetail = true
    })

    const required3Axle = Math.max(require3Axle ? 1 : 0, smallForkliftGroups)
    const requiredDovetail = Math.max(requireDovetail ? 1 : 0, smallForkliftGroups)

    setFormData(prev => {
      let tractors = prev.tractors
      let trailers = prev.trailers
      let changed = false

      // Handle Rollback tractor
      const existingRollback = tractors.find(t => t.type === 'Rollback')
      if (rollbackCount === 1) {
        if (!existingRollback) {
          tractors = [...tractors, { type: 'Rollback', quantity: 1 }]
          changed = true
        } else if (existingRollback.quantity !== 1) {
          tractors = tractors.map(t =>
            t.type === 'Rollback' ? { ...t, quantity: 1 } : t
          )
          changed = true
        }
      } else if (existingRollback) {
        tractors = tractors.filter(t => t.type !== 'Rollback')
        changed = true
      }

      // Handle 3-axle tractors
      const existing3Axle = tractors.find(t => t.type === '3-axle tractor')
      if (required3Axle > 0) {
        if (!existing3Axle) {
          tractors = [...tractors, { type: '3-axle tractor', quantity: required3Axle }]
          changed = true
        } else if (existing3Axle.quantity !== required3Axle) {
          tractors = tractors.map(t =>
            t.type === '3-axle tractor' ? { ...t, quantity: required3Axle } : t
          )
          changed = true
        }
      } else if (existing3Axle) {
        tractors = tractors.filter(t => t.type !== '3-axle tractor')
        changed = true
      }

      // Handle Dovetail trailers
      const existingDovetail = trailers.find(t => t.type === 'Dovetail')
      if (requiredDovetail > 0) {
        if (!existingDovetail) {
          trailers = [...trailers, { type: 'Dovetail', quantity: requiredDovetail }]
          changed = true
        } else if (existingDovetail.quantity !== requiredDovetail) {
          trailers = trailers.map(t =>
            t.type === 'Dovetail' ? { ...t, quantity: requiredDovetail } : t
          )
          changed = true
        }
      } else if (existingDovetail) {
        trailers = trailers.filter(t => t.type !== 'Dovetail')
        changed = true
      }

      return changed ? { ...prev, tractors, trailers } : prev
    })
  }, [formData.forklifts]) // eslint-disable-line react-hooks/exhaustive-deps

  const addEquipment = (type: 'forklifts' | 'tractors' | 'trailers', equipmentType: string) => {
    setFormData(prev => {
      const existing = prev[type].find(item => item.type === equipmentType)
      if (existing) {
        return {
          ...prev,
          [type]: prev[type].map(item =>
            item.type === equipmentType
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        }
      } else {
        return {
          ...prev,
          [type]: [...prev[type], { type: equipmentType, quantity: 1 }]
        }
      }
    })

    if (type === 'forklifts') {
      const auto = forkliftAutoSelections[equipmentType]
      if (auto) {
        auto.tractors?.forEach(t => addEquipment('tractors', t))
        auto.trailers?.forEach(t => addEquipment('trailers', t))
        auto.forklifts?.forEach(f => addEquipment('forklifts', f))
      }
    }
  }

  const changeEquipmentQuantity = (
    type: 'forklifts' | 'tractors' | 'trailers',
    equipmentType: string,
    delta: number
  ) => {
    setFormData(prev => {
      const existing = prev[type].find(item => item.type === equipmentType)
      if (!existing) return prev

      const newQuantity = existing.quantity + delta
      if (newQuantity <= 0) {
        return {
          ...prev,
          [type]: prev[type].filter(item => item.type !== equipmentType)
        }
      }

      return {
        ...prev,
        [type]: prev[type].map(item =>
          item.type === equipmentType ? { ...item, quantity: newQuantity } : item
        )
      }
    })
  }

  const removeEquipment = (type: 'forklifts' | 'tractors' | 'trailers', equipmentType: string) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].filter(item => item.type !== equipmentType)
    }))
  }

  const capitalizeEquipment = (str: string) =>
    str.replace(/\b\w/g, char => char.toUpperCase())

  const formatEquipmentList = (items: string[]) => {
    if (items.length === 2) return items.join(', ')
    const firstTwo = items.slice(0, 2).join(', ')
    const rest = items.slice(2)
    if (rest.length === 0) return firstTwo
    if (rest.length === 1) return `${firstTwo}, and ${rest[0]}`
    return `${firstTwo}, ${rest.slice(0, -1).join(', ')}, and ${rest[rest.length - 1]}`
  }

  const [copiedTemplate, setCopiedTemplate] = useState<string | null>(null)

  const copyToClipboard = async (
    text: string,
    templateType: string,
    isHtml = false
  ) => {
    try {
      if (
        isHtml &&
        'ClipboardItem' in window &&
        navigator.clipboard &&
        'write' in navigator.clipboard
      ) {
        const plain = text.replace(/<[^>]*>/g, '')
        const item = new (window as any).ClipboardItem({
          'text/html': new Blob([text], { type: 'text/html' }),
          'text/plain': new Blob([plain], { type: 'text/plain' })
        })
        await navigator.clipboard.write([item])
      } else {
        await navigator.clipboard.writeText(text)
      }
      setCopiedTemplate(templateType)
      setTimeout(() => setCopiedTemplate(null), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  const handleSaveQuote = async () => {
    try {
      const quoteNumber = QuoteService.generateQuoteNumber(
        formData.projectName,
        formData.companyName
      )
      
      const result = await QuoteService.saveQuote(
        quoteNumber,
        formData,
        formData
      )
      
      if (result.success) {
        alert('Quote saved successfully!')
      } else {
        alert(`Failed to save quote: ${result.error}`)
      }
    } catch (error) {
      alert('Error saving quote')
      console.error('Save quote error:', error)
    }
  }

  const handleLoadQuote = (loadedEquipmentData: any, loadedLogisticsData: any) => {
    setFormData({ ...loadedEquipmentData, ...loadedLogisticsData })
    setShowQuoteHistory(false)
  }

  const navigation = [
    { id: 'project', name: 'Project Details', icon: Building2 },
    { id: 'equipment', name: 'Equipment Required', icon: Truck },
    { id: 'storage', name: 'Storage & Logistics', icon: Package },
    { id: 'templates', name: 'Templates', icon: FileText },
  ]

  const renderProjectDetails = () => (
    <div className="bg-gray-900 rounded-xl border-2 border-accent">
      <div className="p-6 border-b-2 border-accent flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Project Details</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSaveQuote}
            className="flex items-center px-3 py-1.5 text-sm bg-white text-black rounded-lg border border-white hover:bg-white disabled:opacity-50"
            disabled={savingQuote}
          >
            {savingQuote ? 'Saving…' : 'Save Quote'}
          </button>
          <button
            onClick={() => clearSection('project')}
            className="flex items-center px-3 py-1.5 text-sm text-white hover:bg-black rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Clear Section
          </button>
        </div>
      </div>
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-white mb-2">Project Name</label>
            <input
              type="text"
              value={formData.projectName}
              onChange={(e) => handleInputChange('projectName', e.target.value)}
              className="w-full px-4 py-3 bg-black border border-white rounded-lg focus:ring-2 focus:ring-white focus:border-transparent text-white placeholder-white"
              placeholder="Enter project name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-2">Company Name</label>
            <input
              type="text"
              value={formData.companyName}
              onChange={(e) => handleInputChange('companyName', e.target.value)}
              className="w-full px-4 py-3 bg-black border border-white rounded-lg focus:ring-2 focus:ring-white focus:border-transparent text-white placeholder-white"
              placeholder="Enter company name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-2">Contact Name</label>
            <div className="flex gap-2" ref={typeaheadContainerRef as any}>
              <input
                type="text"
                value={formData.contactName}
                onChange={(e) => handleInputChange('contactName', e.target.value)}
                className="flex-1 px-4 py-3 bg-black border border-white rounded-lg focus:ring-2 focus:ring-white focus:border-transparent text-white placeholder-white"
                placeholder="Enter contact name"
              />
              <button
                type="button"
                onClick={handleHubSpotSearch}
                disabled={hubspotLoading || !formData.contactName.trim()}
                className="px-3 py-3 bg-white text-black rounded-lg border border-white hover:bg-white disabled:opacity-50"
                title="Search HubSpot"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
            {typeaheadOpen && (
              <div className="relative" onMouseDown={(e) => e.stopPropagation()}>
                <div className="absolute z-50 mt-2 w-full bg-black border border-white rounded-lg max-h-64 overflow-y-auto shadow-lg" onMouseDown={(e) => e.stopPropagation()}>
                  {typeaheadLoading ? (
                    <div className="p-3 text-white text-sm">Searching…</div>
                  ) : typeaheadResults.length === 0 ? (
                    <div className="p-3 text-white text-sm">No matches</div>
                  ) : (
                    typeaheadResults.map((c) => {
                      const label = `${[c.firstName, c.lastName].filter(Boolean).join(' ')}${c.email ? ' — ' + c.email : ''}`
                      const addr = c.companyAddress || c.contactAddress || ''
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => onSelectTypeahead(c)}
                          className="w-full text-left px-3 py-2 hover:bg-gray-800 text-white text-sm border-b border-gray-800 last:border-b-0"
                          onMouseDown={(e) => e.stopPropagation()}
                        >
                          <div className="font-medium">{label}</div>
                          {addr ? <div className="text-xs opacity-80">{addr}</div> : null}
                        </button>
                      )
                    })
                  )}
                </div>
              </div>
            )}
            {hubspotResults.length > 0 && (
              <div className="mt-2">
                <label className="block text-xs text-white mb-1">Select a contact (max 20)</label>
                <select
                  className="w-full px-3 py-2 bg-black border border-white rounded-lg text-white"
                  onChange={(e) => {
                    const id = e.target.value
                    const selected = hubspotResults.find(r => r.id === id)
                    if (selected) {
                      applyHubSpotContact(selected)
                      setHubspotResults([])
                    }
                  }}
                  defaultValue=""
                >
                  <option value="" disabled>Choose a contact…</option>
                  {hubspotResults.map(c => (
                    <option key={c.id} value={c.id}>{`${c.firstName} ${c.lastName}`.trim()}${c.email ? ` — ${c.email}` : ''}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-2">Site Address</label>
            <input
              type="text"
              value={formData.siteAddress}
              onChange={(e) => handleInputChange('siteAddress', e.target.value)}
              className="w-full px-4 py-3 bg-black border border-white rounded-lg focus:ring-2 focus:ring-white focus:border-transparent text-white placeholder-white"
              placeholder="Enter full site address"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-2">Site Phone Number</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="w-full px-4 py-3 bg-black border border-white rounded-lg focus:ring-2 focus:ring-white focus:border-transparent text-white placeholder-white"
              placeholder="Enter site phone number"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-2">Email</label>
            <div className="flex gap-2">
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="flex-1 px-4 py-3 bg-black border border-white rounded-lg focus:ring-2 focus:ring-white focus:border-transparent text-white placeholder-white"
                placeholder="Enter email address"
              />
              <button
                type="button"
                onClick={handleStartEmail}
                disabled={!formData.email.trim()}
                className="px-3 py-3 bg-white text-black rounded-lg border border-white hover:bg-white disabled:opacity-50"
                title="Start email with template"
              >
                <Mail className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-2">Shop Location</label>
            <select
              value={formData.shopLocation}
              onChange={(e) => handleInputChange('shopLocation', e.target.value)}
              className="w-full px-4 py-3 bg-black border border-white rounded-lg focus:ring-2 focus:ring-white focus:border-transparent text-white"
            >
              <option value="Shop">Shop</option>
              <option value="Mukilteo">Mukilteo</option>
              <option value="Fife">Fife</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-white mb-2">Scope of Work</label>
          <textarea
            value={formData.projectDescription}
            onChange={(e) => handleInputChange('projectDescription', e.target.value)}
            rows={4}
            className="w-full px-4 py-3 bg-black border border-white rounded-lg focus:ring-2 focus:ring-white focus:border-transparent text-white placeholder-white"
            placeholder="Describe the scope of work..."
          />
        </div>
      </div>
    </div>
  )


  const renderEquipmentRequired = () => (
    <div className="bg-gray-900 rounded-xl border-2 border-accent">
      <div className="p-6 border-b-2 border-accent flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Equipment Required</h3>
        <button
          onClick={() => clearSection('equipment')}
          className="flex items-center px-3 py-1.5 text-sm text-white hover:bg-black rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4 mr-1" />
          Clear Section
        </button>
      </div>
      <div className="p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-white mb-2">Crew Size</label>
          <select
            value={formData.crewSize}
            onChange={(e) => handleInputChange('crewSize', e.target.value)}
            className="w-full px-4 py-3 bg-black border border-white rounded-lg focus:ring-2 focus:ring-white focus:border-transparent text-white"
          >
            <option value="2-man crew">2-man crew</option>
            <option value="3-man crew">3-man crew</option>
            <option value="4-man crew">4-man crew</option>
            <option value="5-man crew">5-man crew</option>
          </select>
        </div>

        {/* Forklifts */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">Forklifts</label>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {['Forklift (5k)', 'Forklift (8k)', 'Forklift (15k)', 'Forklift (30k)', 'Forklift - Hoist 18/26', 'Versalift 25/35', 'Versalift 40/60', 'Versalift 60/80', 'Trilifter'].map((type) => (
                <button
                  key={type}
                  onClick={() => addEquipment('forklifts', type)}
                  className="flex items-center px-3 py-2 bg-white text-black rounded-lg hover:bg-white transition-colors"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  {type}
                </button>
              ))}
            </div>
            {formData.forklifts.length > 0 && (
              <div className="space-y-2">
                {formData.forklifts.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-black rounded-lg">
                    <span className="text-sm font-medium text-white">{capitalizeEquipment(item.type)}</span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => changeEquipmentQuantity('forklifts', item.type, -1)}
                        className="text-white hover:text-white"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="text-sm font-medium text-white">{item.quantity}</span>
                      <button
                        onClick={() => changeEquipmentQuantity('forklifts', item.type, 1)}
                        className="text-white hover:text-white"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removeEquipment('forklifts', item.type)}
                        className="text-white hover:text-white"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tractors */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">Tractors</label>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {['3-axle tractor', '4-axle tractor', 'Rollback'].map((type) => (
                <button
                  key={type}
                  onClick={() => addEquipment('tractors', type)}
                  className="flex items-center px-3 py-2 bg-white text-black rounded-lg hover:bg-white transition-colors"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  {type}
                </button>
              ))}
            </div>
            {formData.tractors.length > 0 && (
              <div className="space-y-2">
                {formData.tractors.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-black rounded-lg">
                    <span className="text-sm font-medium text-white">{capitalizeEquipment(item.type)}</span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => changeEquipmentQuantity('tractors', item.type, -1)}
                        className="text-white hover:text-white"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="text-sm font-medium text-white">{item.quantity}</span>
                      <button
                        onClick={() => changeEquipmentQuantity('tractors', item.type, 1)}
                        className="text-white hover:text-white"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removeEquipment('tractors', item.type)}
                        className="text-white hover:text-white"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Trailers */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">Trailers</label>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {['Dovetail', 'Flatbed', 'Lowboy', 'Step Deck'].map((type) => (
                <button
                  key={type}
                  onClick={() => addEquipment('trailers', type)}
                  className="flex items-center px-3 py-2 bg-white text-black rounded-lg hover:bg-white transition-colors"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  {type}
                </button>
              ))}
            </div>
            {formData.trailers.length > 0 && (
              <div className="space-y-2">
                {formData.trailers.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-black rounded-lg">
                    <span className="text-sm font-medium text-white">{capitalizeEquipment(item.type === 'Dovetail' ? 'Dovetail Trailer' : item.type)}</span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => changeEquipmentQuantity('trailers', item.type, -1)}
                        className="text-white hover:text-white"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="text-sm font-medium text-white">{item.quantity}</span>
                      <button
                        onClick={() => changeEquipmentQuantity('trailers', item.type, 1)}
                        className="text-white hover:text-white"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removeEquipment('trailers', item.type)}
                        className="text-white hover:text-white"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  const renderStorageLogistics = () => (
    <div className="bg-gray-900 rounded-xl border-2 border-accent">
      <div className="p-6 border-b-2 border-accent flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Storage & Logistics</h3>
        <button
          onClick={() => clearSection('storage')}
          className="flex items-center px-3 py-1.5 text-sm text-white hover:bg-black rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4 mr-1" />
          Clear Section
        </button>
      </div>
      <div className="p-6 space-y-6">
        {/* Items to Transport */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <label className="block text-sm font-medium text-white">Items to Transport</label>
            <button
              onClick={addPiece}
              className="flex items-center px-3 py-1.5 text-sm text-black hover:bg-black rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Item
            </button>
          </div>
          <div className="space-y-4">
            {formData.pieces.map((piece, index) => (
              <div key={index} className="p-4 border border-white rounded-lg bg-black">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-white">Item {index + 1}</h4>
                  {formData.pieces.length > 1 && (
                    <button
                      onClick={() => removePiece(index)}
                      className="text-white hover:text-white"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="md:col-span-1">
                    <input
                      type="text"
                      value={piece.description}
                      onChange={(e) => updatePiece(index, 'description', e.target.value)}
                      placeholder="Description"
                      className="w-full px-3 py-2 bg-black border border-white rounded-lg focus:ring-2 focus:ring-white focus:border-transparent text-white placeholder-white"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={piece.length}
                      onChange={(e) => updatePiece(index, 'length', e.target.value)}
                      placeholder="Length"
                      className="w-full px-3 py-2 bg-black border border-white rounded-lg focus:ring-2 focus:ring-white focus:border-transparent text-white placeholder-white"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={piece.width}
                      onChange={(e) => updatePiece(index, 'width', e.target.value)}
                      placeholder="Width"
                      className="w-full px-3 py-2 bg-black border border-white rounded-lg focus:ring-2 focus:ring-white focus:border-transparent text-white placeholder-white"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={piece.height}
                      onChange={(e) => updatePiece(index, 'height', e.target.value)}
                      placeholder="Height"
                      className="w-full px-3 py-2 bg-black border border-white rounded-lg focus:ring-2 focus:ring-white focus:border-transparent text-white placeholder-white"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={piece.weight}
                      onChange={(e) => updatePiece(index, 'weight', e.target.value)}
                      placeholder="Weight"
                      className="w-full px-3 py-2 bg-black border border-white rounded-lg focus:ring-2 focus:ring-white focus:border-transparent text-white placeholder-white"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pickup Location */}
        <div>
          <h4 className="text-sm font-medium text-white mb-4">Pickup Location</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <input
                type="text"
                value={formData.pickupAddress}
                onChange={(e) => handleInputChange('pickupAddress', e.target.value)}
                placeholder="Pickup Address"
                className="w-full px-4 py-3 bg-black border border-white rounded-lg focus:ring-2 focus:ring-white focus:border-transparent text-white placeholder-white"
              />
            </div>
            <div>
              <input
                type="text"
                value={formData.pickupCity}
                onChange={(e) => handleInputChange('pickupCity', e.target.value)}
                placeholder="City"
                className="w-full px-4 py-3 bg-black border border-white rounded-lg focus:ring-2 focus:ring-white focus:border-transparent text-white placeholder-white"
              />
            </div>
            <div>
              <input
                type="text"
                value={formData.pickupState}
                onChange={(e) => handleInputChange('pickupState', e.target.value)}
                placeholder="State"
                className="w-full px-4 py-3 bg-black border border-white rounded-lg focus:ring-2 focus:ring-white focus:border-transparent text-white placeholder-white"
              />
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.pickupZip}
                onChange={(e) => handleInputChange('pickupZip', e.target.value)}
                placeholder="ZIP Code"
                className="flex-1 px-4 py-3 bg-black border border-white rounded-lg focus:ring-2 focus:ring-white focus:border-transparent text-white placeholder-white"
              />
              <button
                type="button"
                onClick={() => lookupZip('pickup')}
                className="px-4 py-3 bg-white text-black rounded-lg"
              >
                Lookup
              </button>
            </div>
          </div>
        </div>

        {/* Delivery Location */}
        <div>
          <h4 className="text-sm font-medium text-white mb-4">Delivery Location</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <input
                type="text"
                value={formData.deliveryAddress}
                onChange={(e) => handleInputChange('deliveryAddress', e.target.value)}
                placeholder="Delivery Address"
                className="w-full px-4 py-3 bg-black border border-white rounded-lg focus:ring-2 focus:ring-white focus:border-transparent text-white placeholder-white"
              />
            </div>
            <div>
              <input
                type="text"
                value={formData.deliveryCity}
                onChange={(e) => handleInputChange('deliveryCity', e.target.value)}
                placeholder="City"
                className="w-full px-4 py-3 bg-black border border-white rounded-lg focus:ring-2 focus:ring-white focus:border-transparent text-white placeholder-white"
              />
            </div>
            <div>
              <input
                type="text"
                value={formData.deliveryState}
                onChange={(e) => handleInputChange('deliveryState', e.target.value)}
                placeholder="State"
                className="w-full px-4 py-3 bg-black border border-white rounded-lg focus:ring-2 focus:ring-white focus:border-transparent text-white placeholder-white"
              />
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.deliveryZip}
                onChange={(e) => handleInputChange('deliveryZip', e.target.value)}
                placeholder="ZIP Code"
                className="flex-1 px-4 py-3 bg-black border border-white rounded-lg focus:ring-2 focus:ring-white focus:border-transparent text-white placeholder-white"
              />
              <button
                type="button"
                onClick={() => lookupZip('delivery')}
                className="px-4 py-3 bg-white text-black rounded-lg"
              >
                Lookup
              </button>
            </div>
          </div>
        </div>

        {/* Storage Calculation */}
        <div className="border-t border-white pt-6">
          <div className="flex items-center justify-between mb-4">
            <label className="text-sm font-medium text-white">Include Storage</label>
            <button
              type="button"
              onClick={() => handleInputChange('storageEnabled', !formData.storageEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.storageEnabled ? 'bg-white' : 'bg-black'}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.storageEnabled ? 'translate-x-6' : 'translate-x-1'}`}
              />
            </button>
          </div>
          {formData.storageEnabled && (
            <div className="space-y-4">
              <div className="flex space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="storageType"
                    value="inside"
                    checked={formData.storageType === 'inside'}
                    onChange={(e) => handleInputChange('storageType', e.target.value)}
                    className="text-black"
                  />
                  <span className="text-sm text-white">Inside</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="storageType"
                    value="outside"
                    checked={formData.storageType === 'outside'}
                    onChange={(e) => handleInputChange('storageType', e.target.value)}
                    className="text-black"
                  />
                  <span className="text-sm text-white">Outside</span>
                </label>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Square Feet</label>
                  <input
                    type="number"
                    value={formData.storageSqFt}
                    onChange={(e) => handleInputChange('storageSqFt', e.target.value)}
                    placeholder="Sq Ft"
                    className="w-full px-4 py-3 bg-black border border-white rounded-lg focus:ring-2 focus:ring-white focus:border-transparent text-white placeholder-white"
                  />
                </div>
                <div className="md:col-span-2 flex items-end">
                  <p className="text-sm text-white">
                    Cost: $
                    {((parseFloat(formData.storageSqFt) || 0) * (formData.storageType === 'inside' ? 3.5 : 2.5)).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Truck Type and Shipment Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-white mb-2">Truck Type Requested</label>
            <select
              value={formData.truckType}
              onChange={(e) => handleInputChange('truckType', e.target.value)}
              className="w-full px-4 py-3 bg-black border border-white rounded-lg focus:ring-2 focus:ring-white focus:border-transparent text-white"
            >
              <option value="Flatbed">Flatbed</option>
              <option value="Flatbed with tarp">Flatbed with tarp</option>
              <option value="Conestoga">Conestoga</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-2">Shipment Type</label>
            <select
              value={formData.shipmentType}
              onChange={(e) => handleInputChange('shipmentType', e.target.value)}
              className="w-full px-4 py-3 bg-black border border-white rounded-lg focus:ring-2 focus:ring-white focus:border-transparent text-white"
            >
              <option value="LTL (Less Than Truckload)">LTL (Less Than Truckload)</option>
              <option value="FTL (Full Truck Load)">FTL (Full Truck Load)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )

  const generateScopeTemplate = () => {
    const contactName = formData.contactName || '[Contact Name]'
    const phone = formData.phone || '[phone]'
    const scopeOfWork = formData.projectDescription || '[scope of work]'
    const siteAddress = formData.siteAddress || '[Site Address]'
    const shopLocation = formData.shopLocation || 'Shop'
    
    let itemsText = ''
    if (formData.pieces && formData.pieces.length > 0 && formData.pieces[0].description) {
      itemsText = formData.pieces.map(piece => 
        `${piece.description || '[description]'} - ${piece.length || '[L]'}"L x ${piece.width || '[W]'}"W x ${piece.height || '[H]'}"H, ${piece.weight || '[weight]'} lbs`
      ).join('\n\n')
    }

    // Generate equipment list
    const additionalEquipment = [
      ...formData.forklifts.map(
        item => `${item.quantity > 1 ? `(${item.quantity}) ` : ''}${capitalizeEquipment(item.type)}`
      ),
      ...formData.tractors.map(
        item => `${item.quantity > 1 ? `(${item.quantity}) ` : ''}${capitalizeEquipment(item.type)}`
      ),
      ...formData.trailers.map(
        item => `${
          item.quantity > 1 ? `(${item.quantity}) ` : ''
        }${capitalizeEquipment(item.type === 'Dovetail' ? 'Dovetail Trailer' : item.type)}`
      )
    ]

    const equipmentItems = [
      formData.crewSize || '3-man crew',
      'Gear Truck and Trailer',
      ...additionalEquipment
    ]

    const equipmentList = formatEquipmentList(equipmentItems)

    return `Mobilize crew and Omega Morgan equipment to site:
${siteAddress}

${contactName}
${phone}

Omega Morgan to supply ${equipmentList}.

${scopeOfWork}

${itemsText}

When job is complete clean up debris and return to ${shopLocation}.`
  }

  const getLogisticsDetails = () => {
    const pickupZip = formData.pickupZip || '98275'
    const deliveryZip = formData.deliveryZip || '98021'
    const pickupCity = formData.pickupCity || 'Mukilteo'
    const pickupState = formData.pickupState || 'WA'
    const deliveryCity = formData.deliveryCity || 'Bothell'
    const deliveryState = formData.deliveryState || 'WA'
    const pickupAddress = formData.pickupAddress
    const deliveryAddress = formData.deliveryAddress
    const pickupLocation = pickupAddress
      ? `${pickupAddress}, ${pickupCity}, ${pickupState} ${pickupZip}`
      : `${pickupCity}, ${pickupState} ${pickupZip}`
    const deliveryLocation = deliveryAddress
      ? `${deliveryAddress}, ${deliveryCity}, ${deliveryState} ${deliveryZip}`
      : `${deliveryCity}, ${deliveryState} ${deliveryZip}`
    const truckType = formData.truckType || 'Flatbed'
    const shipmentType = formData.shipmentType || 'LTL (Less Than Truckload)'

    let piecesText = `53" x 53" x 106" – approx. 2000 lbs\n\n58" x 36" x 75" – approx. 400 lbs`
    let totalWeight = '2,400 lbs'
    let pieceCount = '2'

    if (formData.pieces && formData.pieces.length > 0 && formData.pieces[0].description) {
      piecesText = formData.pieces.map(piece =>
        `${piece.length || '[L]'}" x ${piece.width || '[W]'}" x ${piece.height || '[H]'}" – approx. ${piece.weight || '[Weight]'} lbs`
      ).join('\n\n')

      pieceCount = formData.pieces.length.toString()

      const totalWeightNum = formData.pieces.reduce((sum, piece) => {
        const weight = parseInt(piece.weight) || 0
        return sum + weight
      }, 0)
      totalWeight = totalWeightNum > 0 ? `${totalWeightNum.toLocaleString()} lbs` : '2,400 lbs'
    }

    const storageRate = formData.storageType === 'inside' ? 3.5 : 2.5
    const storageCost = (parseFloat(formData.storageSqFt) || 0) * storageRate
    const storageLine = formData.storageEnabled && formData.storageSqFt
      ? `Storage Required: ${formData.storageType === 'inside' ? 'Inside' : 'Outside'} - ${formData.storageSqFt} sq ft @ $${storageRate.toFixed(2)}/sq ft (Est. Cost: $${storageCost.toFixed(2)})`
      : ''

    return {
      pickupZip,
      deliveryZip,
      pickupLocation,
      deliveryLocation,
      truckType,
      shipmentType,
      piecesText,
      totalWeight,
      pieceCount,
      storageLine
    }
  }

  const generateLogisticsEmail = () => {
    const {
      pickupZip,
      deliveryZip,
      pickupLocation,
      deliveryLocation,
      truckType,
      shipmentType,
      piecesText,
      totalWeight,
      pieceCount,
      storageLine
    } = getLogisticsDetails()

    const subject = `Quote for Truck Request for ${shipmentType} - ${pickupZip} - ${deliveryZip}`

    const piecesHtml = piecesText.split('\n').join('<br>')
    const storageHtml = storageLine
      ? `<strong>Storage Required:</strong> ${storageLine.replace(/^Storage Required:\s*/, '')}<br><br>`
      : ''

    const body =
      `Hello Team,<br><br>` +
      `I'm reaching out to request a logistics quote for an upcoming project. Please see the load and transport details below:<br><br>` +
      `<strong>Number of Pieces:</strong> ${pieceCount}<br><br>` +
      `${piecesHtml}<br><br>` +
      `<strong>Total Load Weight:</strong> ${totalWeight}<br><br>` +
      `<strong>Pick-Up Location:</strong> ${pickupLocation}<br><br>` +
      `<strong>Delivery/Set Location:</strong> ${deliveryLocation}<br><br>` +
      `<strong>Truck Type Requested:</strong> ${truckType}<br><br>` +
      `<strong>Shipment Type:</strong> ${shipmentType}<br><br>` +
      `${storageHtml}` +
      `Please let me know if you need any additional information or documents to complete the quote.<br><br>` +
      `Looking forward to your response.<br><br>` +
      `Thanks,`

    return { subject, body }
  }

  const generateLogisticsTemplate = () => {
    const { subject, body } = generateLogisticsEmail()
    return `<strong>Subject:</strong> ${subject}<br><br>${body}`
  }

  const sendLogisticsEmail = () => {
    const { subject, body } = generateLogisticsEmail()
    const mailto = `mailto:Logistics@omegamorgan.com;MachineryLogistics@omegamorgan.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.location.href = mailto
  }

  const generateCustomerEmailTemplate = () => {
    const contactName = formData.contactName || '[site contact]'
    const projectName = formData.projectName || '[project name]'

    return `${contactName} - Omega Morgan - ${projectName} - Quote\n\nHello ${contactName},\n\nThank you for considering Omega Morgan for the opportunity to provide your company with ${projectName}.\n\nShould you have any questions or require further clarification, please don't hesitate to reach out.\n\nIf you are ready to proceed, kindly sign and return the documents via email.\n\nWe appreciate your time and consideration.\n\nThank you,\n`
  }

  const renderTemplates = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Scope Template */}
      <div className="bg-gray-900 rounded-xl border-2 border-accent">
        <div className="p-6 border-b-2 border-accent flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Scope Template</h3>
          <button
            onClick={() => copyToClipboard(generateScopeTemplate(), 'scope')}
            className="flex items-center px-3 py-1.5 bg-white text-black text-sm font-medium rounded-lg hover:bg-white transition-colors"
          >
            {copiedTemplate === 'scope' ? (
              <>
                <CheckCircle className="w-4 h-4 mr-1" />
                Copied!
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 mr-1" />
                Copy Text
              </>
            )}
          </button>
        </div>
        <div className="p-6">
          <div className="bg-black rounded-lg p-4 border border-white h-96 overflow-y-auto">
            <pre className="whitespace-pre-wrap text-sm text-white font-mono leading-relaxed">
              {generateScopeTemplate()}
            </pre>
          </div>
        </div>
      </div>

      {/* Customer Email Template */}
      <div className="bg-gray-900 rounded-xl border-2 border-accent">
        <div className="p-6 border-b-2 border-accent flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Customer Email Template</h3>
          <button
            onClick={() => copyToClipboard(generateCustomerEmailTemplate(), 'email')}
            className="flex items-center px-3 py-1.5 bg-white text-black text-sm font-medium rounded-lg hover:bg-white transition-colors"
          >
            {copiedTemplate === 'email' ? (
              <>
                <CheckCircle className="w-4 h-4 mr-1" />
                Copied!
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 mr-1" />
                Copy Text
              </>
            )}
          </button>
        </div>
        <div className="p-6">
          <div className="bg-black rounded-lg p-4 border border-white h-64 overflow-y-auto">
            <pre className="whitespace-pre-wrap text-sm text-white font-mono leading-relaxed">
              {generateCustomerEmailTemplate()}
            </pre>
          </div>
        </div>
      </div>

      {/* Logistics Quote Template */}
      <div className="bg-gray-900 rounded-xl border-2 border-accent lg:col-span-2">
        <div className="p-6 border-b-2 border-accent flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Logistics Quote Template</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => copyToClipboard(generateLogisticsTemplate(), 'logistics', true)}
              className="flex items-center px-3 py-1.5 bg-white text-black text-sm font-medium rounded-lg hover:bg-white transition-colors"
            >
              {copiedTemplate === 'logistics' ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Copied!
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-1" />
                  Copy Text
                </>
              )}
            </button>
            <button
              onClick={sendLogisticsEmail}
              className="flex items-center px-3 py-1.5 bg-white text-black text-sm font-medium rounded-lg hover:bg-white transition-colors"
            >
              <Mail className="w-4 h-4 mr-1" />
              Email
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="bg-black rounded-lg p-4 border border-white h-96 overflow-y-auto">
            <div
              className="whitespace-pre-wrap text-sm text-white font-mono leading-relaxed"
              dangerouslySetInnerHTML={{ __html: generateLogisticsTemplate() }}
            />
          </div>
        </div>
      </div>
    </div>
  )

  const renderContent = () => {
    return (
      <div className="space-y-8">
        <div id="project">{renderProjectDetails()}</div>
        <div id="equipment">{renderEquipmentRequired()}</div>
        <div id="storage">{renderStorageLogistics()}</div>
        <div id="templates">{renderTemplates()}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 border-r-2 border-accent flex flex-col h-screen sticky top-0">
        {/* Logo */}
        <div className="p-6 border-b-2 border-accent">
          <h1 className="text-xl font-bold text-white">OM Quote</h1>
          <p className="text-sm text-white">Quote Generator</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' })}
                className="w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors text-white hover:bg-gray-800 hover:text-white"
              >
                <Icon className="w-5 h-5 mr-3 text-white" />
                {item.name}
              </button>
            )
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t-2 border-accent space-y-2">
          <button
            onClick={() => setShowAIExtractor(true)}
            className="w-full flex items-center px-4 py-3 text-left text-white hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
          >
            <Bot className="w-5 h-5 mr-3 text-white" />
            AI Extractor
          </button>
          <button
            onClick={() => setShowQuoteHistory(true)}
            className="w-full flex items-center px-4 py-3 text-left text-white hover:bg-gray-800 transition-colors rounded-lg"
          >
            <Archive className="w-4 h-4 mr-2" />
            Quote History
          </button>
          <button
            onClick={() => setShowApiKeySetup(true)}
            className="w-full flex items-center px-4 py-3 text-left text-white hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
          >
            <Bot className="w-5 h-5 mr-3 text-white" />
            API Setup
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-gray-900 border-b-2 border-accent px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Quote Generator</h2>
              <p className="text-sm text-white">
                Complete all sections to generate your quote templates
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowAIExtractor(true)}
                className="flex items-center px-4 py-2 bg-white text-black rounded-lg hover:bg-white transition-colors"
              >
                <Bot className="w-4 h-4 mr-2" />
                AI Extractor
              </button>
              <button
                onClick={resetSavedData}
                className="flex items-center px-4 py-2 text-white hover:bg-black rounded-lg transition-colors"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset Saved Data
              </button>
              <button
                onClick={() => setShowTemplates(true)}
                className="flex items-center px-4 py-2 bg-white text-black font-medium rounded-lg hover:bg-white transition-colors"
              >
                <FileText className="w-4 h-4 mr-2" />
                Preview Templa
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 bg-gray-950">
          {renderContent()}
          {quoteHistoryOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onMouseDown={() => setQuoteHistoryOpen(false)}>
              <div className="bg-black rounded-2xl shadow-2xl w-full max-w-xl border border-white" onMouseDown={(e) => e.stopPropagation()}>
                <div className="p-4 border-b-2 border-accent flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Quote History</h3>
                  <button className="text-white" onClick={() => setQuoteHistoryOpen(false)}>Close</button>
                </div>
                <div className="p-4 max-h-96 overflow-y-auto">
                  {quoteList.length === 0 ? (
                    <div className="text-white text-sm">No quotes saved yet.</div>
                  ) : (
                    <ul className="divide-y divide-gray-800">
                      {quoteList.map(q => (
                        <li key={q.id} className="py-3 text-white text-sm">
                          <div className="font-mono">{q.quote_number}</div>
                          <div className="opacity-80">{q.customer_name || 'Unnamed'} — {q.company_name || ''}</div>
                          <div className="text-xs opacity-60">{new Date(q.created_at).toLocaleString()}</div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
        <AIExtractorModal
          onExtract={handleAIExtract}
          isOpen={showAIExtractor}
          onClose={() => setShowAIExtractor(false)}
          sessionId={sessionId}
        />

      <PreviewTemplates
        equipmentData={formData}
        logisticsData={formData}
        isOpen={showTemplates}
        onClose={() => setShowTemplates(false)}
      />

      <QuoteHistoryModal
        isOpen={showQuoteHistory}
        onClose={() => setShowQuoteHistory(false)}
        onLoadQuote={handleLoadQuote}
        currentEquipmentData={formData}
        currentLogisticsData={formData}
      />

      {showApiKeySetup && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-black rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b-2 border-accent">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">API Key Setup</h3>
                <button
                  onClick={() => setShowApiKeySetup(false)}
                  className="p-2 hover:bg-black rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <ApiKeySetup onApiKeyChange={() => {}} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App