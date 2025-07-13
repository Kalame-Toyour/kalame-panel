import { auth } from '@/auth'
import { NextResponse } from 'next/server'
import { AppConfig } from '@/utils/AppConfig'

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { text, chatId } = body

    console.log('Incoming POST /api/chat/stream body:', body)

    if (!text) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create a ReadableStream for streaming response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Call external API with streaming
          const outgoingBody = {
            prompt: text,
            chatId,
            chatCode: chatId,
            modelType: body.modelType || 'gpt-4',
            subModel: 'gpt4_standard',
            stream: true, // Request streaming from external API
          }

          const response = await fetch(
            `${AppConfig.baseApiUrl}/process-text-stream`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.user.accessToken}`,
              },
              body: JSON.stringify(outgoingBody),
            }
          )

          if (!response.ok) {
            const errorData = await response.json()
            console.error('External API error:', errorData, 'Status:', response.status)
            controller.enqueue(
              `data: ${JSON.stringify({
                error: errorData.error || errorData.message || 'خطا در ثبت پیام',
                details: errorData,
                status: response.status,
              })}\n\n`
            )
            controller.close()
            return
          }

          // Get the response body as a readable stream
          const reader = response.body?.getReader()
          if (!reader) {
            controller.enqueue(`data: ${JSON.stringify({ error: 'No response body' })}\n\n`)
            controller.close()
            return
          }

          let buffer = ''
          let partialData = ''

          while (true) {
            const { done, value } = await reader.read()

            if (done) {
              // Send final message
              controller.enqueue(`data: [DONE]\n\n`)
              break
            }

            // Convert Uint8Array to string
            const chunk = new TextDecoder().decode(value)
            buffer += chunk

            // Process complete lines
            const lines = buffer.split('\n')
            buffer = lines.pop() || '' // Keep incomplete line in buffer

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6)

                if (data === '[DONE]') {
                  controller.enqueue(`data: [DONE]\n\n`)
                  controller.close()
                  return
                }

                try {
                  partialData += data
                  let parsed
                  try {
                    parsed = JSON.parse(partialData)
                    partialData = ''
                  } catch {
                    continue
                  }

                  // اضافه کردن console.log برای debug
                  console.log('Parsed data from backend:', parsed);

                  // اگر خطا یا پیام خاصی داشت
                  if (
                    parsed.success === false ||
                    parsed.errorType ||
                    (parsed.message && !parsed.content) ||
                    (parsed.errorType === 'credit_error')
                  ) {
                    console.log('Error detected:', parsed);
                    // اگر خطا مربوط به اتمام اعتبار بود (credit_error)
                    if (
                      parsed.errorType === 'NO_CREDIT' ||
                      parsed.error === 'NO_CREDIT' ||
                      parsed.errorType === 'credit_error'
                    ) {
                      console.log('Credit error detected, sending formatted message');
                      controller.enqueue(
                        `data: ${JSON.stringify({
                          error: 'اعتبار شما به پایان رسیده است. برای ادامه مکالمه باید حساب خود را شارژ کنید.',
                          errorType: 'no_credit',
                          details: parsed,
                          remainingCredit: parsed.remainingCredit
                        })}\n\n`
                      )
                    } else {
                      controller.enqueue(
                        `data: ${JSON.stringify({
                          error: parsed.message || 'خطا',
                          errorType: parsed.errorType,
                          details: parsed,
                        })}\n\n`
                      )
                    }
                    controller.enqueue(`data: [DONE]\n\n`)
                    controller.close()
                    return
                  }

                  // اگر JSON response شامل credit_error است اما در شرط‌های بالا قرار نگرفت
                  if (parsed.errorType === 'credit_error' || parsed.message?.includes('اعتبار')) {
                    console.log('Credit error detected in fallback check');
                    controller.enqueue(
                      `data: ${JSON.stringify({
                        error: 'اعتبار شما به پایان رسیده است. برای ادامه مکالمه باید حساب خود را شارژ کنید.',
                        errorType: 'no_credit',
                        details: parsed,
                        remainingCredit: parsed.remainingCredit
                      })}\n\n`
                    )
                    controller.enqueue(`data: [DONE]\n\n`)
                    controller.close()
                    return
                  }

                  // اگر فقط content داشت
                  if (parsed.content) {
                    controller.enqueue(`data: ${JSON.stringify({ content: parsed.content })}\n\n`)
                  }
                  // اگر ساختار choices داشت (OpenAI)
                  else if (parsed.choices && parsed.choices[0]?.delta?.content) {
                    const content = parsed.choices[0].delta.content
                    controller.enqueue(`data: ${JSON.stringify({ content })}\n\n`)
                  }
                } catch (parseError) {
                  console.error('Error parsing chunk data:', parseError)
                  continue
                }
              }
            }
          }

          controller.close()
        } catch (error) {
          console.error('Error in streaming:', error)
          controller.enqueue(`data: ${JSON.stringify({ error: 'Internal server error' })}\n\n`)
          controller.close()
        }
      },
    })

    // Return streaming response
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  } catch (error) {
    console.error('Error creating streaming chat message:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}