import { supabase } from '../lib/supabase'

export interface QuoteListItem {
  id: string
  quote_number: string
  contact_name: string | null
  company_name: string | null
  created_at: string
}

export class QuoteService {
  private static readonly SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
  private static readonly SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

  static async saveQuote(sessionId: string, quoteNumber: string, formData: Record<string, unknown>): Promise<void> {
    const response = await fetch(`${this.SUPABASE_URL}/functions/v1/save-quote`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sessionId, quoteNumber, formData }),
    })
    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: 'Network error' }))
      throw new Error(err.error || 'Failed to save quote')
    }
  }

  static async listQuotes(sessionId: string): Promise<QuoteListItem[]> {
    const url = `${this.SUPABASE_URL}/functions/v1/list-quotes?sessionId=${encodeURIComponent(sessionId)}`
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${this.SUPABASE_ANON_KEY}` },
    })
    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: 'Network error' }))
      throw new Error(err.error || 'Failed to list quotes')
    }
    const data = await response.json()
    return data.results || []
  }
}


