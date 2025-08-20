import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { AppConfig } from '@/utils/AppConfig'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { messageId, feedbackType, feedbackText } = body

    // Validate required fields
    if (!messageId) {
      return NextResponse.json(
        { error: 'messageId is required' },
        { status: 400 }
      )
    }

    if (!feedbackType || !['like', 'dislike'].includes(feedbackType)) {
      return NextResponse.json(
        { error: 'feedbackType must be either "like" or "dislike"' },
        { status: 400 }
      )
    }

    // For dislike feedback, feedbackText is required
    if (feedbackType === 'dislike' && !feedbackText?.trim()) {
      return NextResponse.json(
        { error: 'feedbackText is required for dislike feedback' },
        { status: 400 }
      )
    }

    // Send feedback to backend API
    const response = await fetch(`${AppConfig.baseApiUrl}/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.user.accessToken}`,
      },
      body: JSON.stringify({
        messageId,
        feedbackType,
        feedbackText: feedbackText || ''
          }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Backend feedback API error:', errorData)
      return NextResponse.json(
        { error: errorData.error || 'Failed to submit feedback' },
        { status: response.status }
      )
    }

    const data = await response.json()
    
    return NextResponse.json({
      success: true,
      message: 'Feedback submitted successfully',
      data
    })

  } catch (error) {
    console.error('Feedback API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 