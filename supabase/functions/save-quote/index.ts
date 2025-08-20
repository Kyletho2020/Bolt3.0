import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface SaveQuoteRequest {
  sessionId: string
  quoteNumber: string
  formData: Record<string, unknown>
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const body = (await req.json()) as SaveQuoteRequest
    const { sessionId, quoteNumber, formData } = body

    if (!sessionId || !quoteNumber || !formData) {
      return new Response(JSON.stringify({ error: 'Missing sessionId, quoteNumber, or formData' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const customerName = String(formData['contactName'] || '')
    const companyName = String(formData['companyName'] || '')
    const email = String(formData['email'] || '')
    const phone = String(formData['phone'] || '')
    const siteAddress = String(formData['projectAddress'] || '')
    const pickupAddress = String(formData['pickupAddress'] || '')
    const pickupCity = String(formData['pickupCity'] || '')
    const pickupState = String(formData['pickupState'] || '')
    const pickupZip = String(formData['pickupZip'] || '')

    // Check if quote already exists (for updates)
    const { data: existingQuote } = await supabase
      .from('quotes')
      .select('id')
      .eq('quote_number', quoteNumber)
      .single()

    let error
    if (existingQuote) {
      // Update existing quote
      const result = await supabase
        .from('quotes')
        .update({
          session_id: sessionId,
          customer_name: customerName,
          company_name: companyName,
          email,
          phone,
          site_address: siteAddress,
          pickup_address: pickupAddress,
          pickup_city: pickupCity,
          pickup_state: pickupState,
          pickup_zip: pickupZip,
          form_snapshot: formData,
        })
        .eq('quote_number', quoteNumber)
      error = result.error
    } else {
      // Insert new quote
      const result = await supabase
        .from('quotes')
        .insert({
          session_id: sessionId,
          quote_number: quoteNumber,
          customer_name: customerName,
          company_name: companyName,
          email,
          phone,
          site_address: siteAddress,
          pickup_address: pickupAddress,
          pickup_city: pickupCity,
          pickup_state: pickupState,
          pickup_zip: pickupZip,
          form_snapshot: formData,
        })
      error = result.error
    }

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ 
      success: true, 
      action: existingQuote ? 'updated' : 'created' 
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})


