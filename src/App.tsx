import React, { useState, useEffect } from 'react'
import {
  FileText,
  X,
  Bot,
  Archive,
  Plus,
  Key,
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
import ClarificationsSection from './components/ClarificationsSection'
import EquipmentForm from './components/EquipmentForm'
import LogisticsForm from './components/LogisticsForm'
import useEquipmentForm from './hooks/useEquipmentForm'
import useLogisticsForm from './hooks/useLogisticsForm'
import useModals from './hooks/useModals'
import { EquipmentRequirements } from './components/EquipmentRequired'
import { EquipmentData, LogisticsData } from './types'

const App: React.FC = () => {
  const {
    equipmentData,
    setEquipmentData,
    initialEquipmentData,
    handleEquipmentChange,
    handleEquipmentRequirementsChange,
    handleSelectHubSpotContact
  } = useEquipmentForm()

  const {
    logisticsData,
    setLogisticsData,
    selectedPieces,
    setSelectedPieces,
    initialLogisticsData,
    handleLogisticsChange,
    handlePieceChange,
    addPiece,
    removePiece,
    togglePieceSelection,
    deleteSelectedPieces
  } = useLogisticsForm()

  const {
    showAIExtractor,
    openAIExtractor,
    closeAIExtractor,
    showHistory,
    openHistory,
    closeHistory,
    showApiKeySetup,
    openApiKeySetup,
    closeApiKeySetup
  } = useModals()

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


  const handleAIExtraction = (
    extractedEquipmentData: Partial<EquipmentData>,
    extractedLogisticsData: Partial<LogisticsData>
  ) => {
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
    loadedEquipmentData: EquipmentData,
    loadedLogisticsData: LogisticsData,
    loadedEquipmentRequirements?: EquipmentRequirements
  ) => {
    setEquipmentData({
      ...loadedEquipmentData,
      equipmentRequirements:
        loadedEquipmentRequirements || initialEquipmentData.equipmentRequirements
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

  const handleNewQuote = () => {
    setEquipmentData(initialEquipmentData)
    setLogisticsData(initialLogisticsData)
    setSelectedPieces([])
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
            onClick={handleNewQuote}
            className="flex items-center px-4 py-2 bg-accent text-black rounded-lg hover:bg-green-400 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Quote
          </button>

          <button
            onClick={openApiKeySetup}
            className="flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors border border-accent"
          >
            <Key className="w-4 h-4 mr-2" />
            API Key Setup
          </button>

          <button
            onClick={openAIExtractor}
            disabled={!hasApiKey}
            className="flex items-center px-4 py-2 bg-accent text-black rounded-lg hover:bg-green-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Bot className="w-4 h-4 mr-2" />
            AI Extractor
          </button>

          <button
            onClick={openHistory}
            className="flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors border border-accent"
          >
            <Archive className="w-4 h-4 mr-2" />
            Quote History
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Equipment Quote Form */}
          <EquipmentForm
            data={equipmentData}
            onFieldChange={handleEquipmentChange}
            onRequirementsChange={handleEquipmentRequirementsChange}
            onSelectContact={handleSelectHubSpotContact}
          />

          {/* Logistics Quote Form */}
          <LogisticsForm
            data={logisticsData}
            selectedPieces={selectedPieces}
            onFieldChange={handleLogisticsChange}
            onPieceChange={handlePieceChange}
            addPiece={addPiece}
            removePiece={removePiece}
            togglePieceSelection={togglePieceSelection}
            deleteSelectedPieces={deleteSelectedPieces}
          />
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
          onClose={closeAIExtractor}
          onExtract={handleAIExtraction}
          sessionId={sessionId}
        />

        <QuoteSaveManager
          equipmentData={equipmentData}
          equipmentRequirements={equipmentData.equipmentRequirements}
          logisticsData={logisticsData}
          isOpen={showHistory}
          onClose={closeHistory}
          onLoadQuote={handleLoadQuote}
        />

        {showApiKeySetup && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 border-2 border-accent rounded-2xl shadow-2xl w-full max-w-md">
              <div className="flex items-center justify-between p-6 border-b-2 border-accent">
                <h3 className="text-xl font-bold text-white">API Key Setup</h3>
                <button
                  onClick={closeApiKeySetup}
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
