import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()

    // Verify user authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get request body
    const body = await request.json()

    // Extract channel configuration fields
    const updateData: any = {}

    if ('telegram_token' in body) {
      updateData.telegram_token = body.telegram_token || null
    }
    if ('telegram_bot_username' in body) {
      updateData.telegram_bot_username = body.telegram_bot_username || null
    }
    if ('whatsapp_sid' in body) {
      updateData.whatsapp_sid = body.whatsapp_sid || null
    }
    if ('whatsapp_auth_token' in body) {
      updateData.whatsapp_auth_token = body.whatsapp_auth_token || null
    }
    if ('whatsapp_phone_number' in body) {
      updateData.whatsapp_phone_number = body.whatsapp_phone_number || null
    }

    // Update bot in database
    const { data: bot, error } = await supabase
      .from('bots')
      .update(updateData)
      .eq('id', params.id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating bot channels:', error)
      return NextResponse.json(
        { error: 'Failed to update bot channels' },
        { status: 500 }
      )
    }

    if (!bot) {
      return NextResponse.json({ error: 'Bot not found' }, { status: 404 })
    }

    // If Telegram token is provided, set up webhook
    if (body.telegram_token && body.telegram_bot_username) {
      try {
        const webhookUrl = `${process.env.NEXT_PUBLIC_API_URL}/webhooks/telegram`
        
        // Set up Telegram webhook
        const telegramResponse = await fetch(
          `https://api.telegram.org/bot${body.telegram_token}/setWebhook`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              url: webhookUrl,
              allowed_updates: ['message'],
            }),
          }
        )

        const telegramData = await telegramResponse.json()
        
        if (!telegramData.ok) {
          console.error('Failed to set Telegram webhook:', telegramData)
          // Don't fail the entire request, just log the error
        }
      } catch (webhookError) {
        console.error('Error setting up Telegram webhook:', webhookError)
        // Continue anyway
      }
    }

    return NextResponse.json({ success: true, bot })
  } catch (error) {
    console.error('Error in channels API route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

