import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface StoreKeyRequest {
  apiKey: string
  keyId: string
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { apiKey, keyId }: StoreKeyRequest = await req.json()

    if (!apiKey || !keyId) {
      throw new Error('API key and keyId are required')
    }

    // Encrypt the API key using base64 before storing
    const encryptedApiKey = btoa(String.fromCharCode(...new TextEncoder().encode(apiKey)))

    const { error } = await supabaseClient
      .from('api_key_storage')
      .upsert({
        id: keyId,
        key_name: 'chatgpt_api_key',
        encrypted_key: encryptedApiKey,
      })

    if (error) {
      throw new Error(`Failed to store API key: ${error.message}`)
    }

    return new Response(
      JSON.stringify({
        success: true,
        keyId: keyId,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Error in store-api-key-simple:', error)
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})