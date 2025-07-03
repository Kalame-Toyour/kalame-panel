import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { linkCode, user_id } = await req.json()
    if (!linkCode || !user_id) {
      return NextResponse.json({ error: 'Missing linkCode or user_id' }, { status: 400 })
    }
    // Simulate logging (replace with DB logic as needed)
    console.log('Campaign entry logged:', { linkCode, user_id })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error logging campaign entry:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 