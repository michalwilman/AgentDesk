import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendContactRequestEmail } from '@/lib/email/resend'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { fullName, email, company, message } = body

    // Validate required fields
    if (!fullName || !email || !message) {
      return NextResponse.json(
        { error: 'Full name, email, and message are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Insert contact request into database
    console.log('Attempting to insert contact request for user:', user.id)
    console.log('Data to insert:', {
      user_id: user.id,
      full_name: fullName,
      email: email,
      company: company || null,
      message: message,
      status: 'pending'
    })

    const { data, error: insertError } = await supabase
      .from('contact_requests')
      .insert({
        user_id: user.id,
        full_name: fullName,
        email: email,
        company: company || null,
        message: message,
        status: 'pending'
      })
      .select()
      .single()

    if (insertError) {
      console.error('Detailed Supabase error:', {
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint,
        code: insertError.code
      })
      return NextResponse.json(
        { 
          error: 'Failed to save contact request',
          details: insertError.message,
          hint: insertError.hint
        },
        { status: 500 }
      )
    }

    console.log('Successfully inserted contact request:', data)

    // Send notification email to admin
    try {
      const emailResult = await sendContactRequestEmail({
        fullName: fullName,
        email: email,
        company: company,
        message: message,
        requestId: data.id
      })

      if (emailResult.success) {
        console.log('✅ Notification email sent successfully')
      } else {
        console.warn('⚠️ Email notification failed:', emailResult.message)
        // Don't fail the request if email fails - the data is already saved
      }
    } catch (emailError: any) {
      console.error('❌ Error sending notification email:', emailError)
      // Continue anyway - the important part is that the request was saved
    }

    return NextResponse.json(
      { 
        success: true, 
        message: 'Contact request submitted successfully',
        requestId: data.id
      },
      { status: 200 }
    )

  } catch (error: any) {
    console.error('Error in contact-sales API:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// Optional: GET endpoint for admins to view all contact requests
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!userData || !['admin', 'super_admin'].includes(userData.role)) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    // Fetch all contact requests
    const { data: requests, error: fetchError } = await supabase
      .from('contact_requests')
      .select('*')
      .order('created_at', { ascending: false })

    if (fetchError) {
      console.error('Error fetching contact requests:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch contact requests' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { requests },
      { status: 200 }
    )

  } catch (error: any) {
    console.error('Error in contact-sales GET API:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

