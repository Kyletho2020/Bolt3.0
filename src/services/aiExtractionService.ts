/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApiKeyService } from './apiKeyService'

interface ExtractionResult {
  equipmentData?: any
  logisticsData?: any
  success: boolean
  error?: string
}

export class AIExtractionService {
  private static readonly SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || ''
  private static readonly SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

  static async extractProjectInfo(text: string, sessionId: string): Promise<ExtractionResult> {
    try {
      // Check if environment variables are available
      if (!this.SUPABASE_URL || !this.SUPABASE_ANON_KEY) {
        throw new Error('Supabase configuration missing. Please check environment variables.')
      }

      // Validate inputs
      if (!text?.trim()) {
        throw new Error('Text is required')
      }

      if (!sessionId?.trim()) {
        throw new Error('Session ID is required')
      }

      // Check if API key exists
      const hasKey = await ApiKeyService.hasApiKey()
      if (!hasKey) {
        throw new Error('OpenAI API key not configured. Please set up your API key first.')
      }

      // Call the edge function
      const response = await fetch(`${this.SUPABASE_URL}/functions/v1/ai-extract-project`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text.trim(),
          sessionId: sessionId
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Network error' }))
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Extraction failed')
      }

      return {
        success: true,
        equipmentData: result.equipmentData,
        logisticsData: result.logisticsData
      }

    } catch (error) {
      console.error('AI Extraction Error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown extraction error'
      }
    }
  }
}
