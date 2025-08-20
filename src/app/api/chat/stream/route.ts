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
    const { text, chatId, modelType, webSearch, reasoning } = body

    console.log('Incoming POST /api/chat/stream body:', body)

    if (!text) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Retry configuration
    const MAX_RETRIES = 3;
    const STREAMING_MAX_RETRIES = 5; // More retries for streaming
    const RETRY_DELAY = 1000; // 1 second
    const STREAMING_TIMEOUT = 120000; // 2 minutes for streaming

    // Create a ReadableStream for streaming response
    const stream = new ReadableStream({
      async start(controller) {
        let response;
        let retryCount = 0;
        
        // Retry logic for external API calls
        while (retryCount < MAX_RETRIES) {
          try {
            // Call external API with streaming
            const outgoingBody = {
              prompt: text,
              chatId,
              chatCode: chatId,
              modelType: modelType || 'GPT-4',
              subModel: modelType || 'gpt4_standard',
              webSearch: webSearch || false,
              reasoning: reasoning || false,
              stream: true, // Request streaming from external API
            }

            console.log(`Attempt ${retryCount + 1}/${MAX_RETRIES} to call external API`);
            
            response = await fetch(
              `${AppConfig.baseApiUrl}/process-text-stream`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${session.user.accessToken}`,
                },
                body: JSON.stringify(outgoingBody),
                // Add timeout to prevent hanging
                signal: AbortSignal.timeout(STREAMING_TIMEOUT), // 2 minutes timeout for streaming
              }
            )
            
            // If successful, break out of retry loop
            break;
            
          } catch (fetchError: any) {
            retryCount++;
            console.error(`Attempt ${retryCount} failed:`, fetchError);
            
            if (retryCount >= MAX_RETRIES) {
              // All retries exhausted
              if (fetchError.name === 'TimeoutError') {
                controller.enqueue(`data: ${JSON.stringify({
                  error: 'درخواست شما به دلیل کندی شبکه ناموفق بود. لطفاً دوباره تلاش کنید.',
                  errorType: 'timeout',
                  details: 'Network timeout after multiple retries'
                })}\n\n`);
              } else if (fetchError.code === 'UND_ERR_SOCKET') {
                controller.enqueue(`data: ${JSON.stringify({
                  error: 'اتصال شبکه قطع شد. لطفاً اتصال اینترنت خود را بررسی کرده و دوباره تلاش کنید.',
                  errorType: 'network_error',
                  details: 'Socket connection error after multiple retries'
                })}\n\n`);
              } else {
                controller.enqueue(`data: ${JSON.stringify({
                  error: 'خطا در اتصال به سرور. لطفاً دوباره تلاش کنید.',
                  errorType: 'connection_error',
                  details: fetchError.message || 'Unknown connection error'
                })}\n\n`);
              }
              controller.enqueue(`data: [DONE]\n\n`);
              controller.close();
              return;
            }
            
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * retryCount));
          }
        }

        if (!response || !response.ok) {
          const errorData = response ? await response.json() : { error: 'No response received' };
          console.error('External API error:', errorData, 'Status:', response?.status || 'No status');
          controller.enqueue(
            `data: ${JSON.stringify({
              error: errorData.error || errorData.message || 'خطا در ثبت پیام',
              details: errorData,
              status: response?.status || 'No status',
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
        let streamingRetryCount = 0;
        let lastSuccessfulChunk = '';

        // Function to retry streaming from last successful point
        const retryStreaming = async (): Promise<boolean> => {
          if (streamingRetryCount >= STREAMING_MAX_RETRIES) {
            controller.enqueue(`data: ${JSON.stringify({
              error: 'اتصال قطع شد و تلاش‌های مجدد ناموفق بود. لطفاً دوباره تلاش کنید.',
              errorType: 'streaming_failed',
              details: 'Streaming failed after multiple retries'
            })}\n\n`);
            controller.enqueue(`data: [DONE]\n\n`);
            controller.close();
            return false;
          }

          streamingRetryCount++;
          console.log(`Retrying streaming attempt ${streamingRetryCount}/${STREAMING_MAX_RETRIES}`);
          
          try {
            // Exponential backoff for retries
            const backoffDelay = RETRY_DELAY * Math.pow(2, streamingRetryCount - 1);
            console.log(`Waiting ${backoffDelay}ms before retry attempt ${streamingRetryCount}`);
            await new Promise(resolve => setTimeout(resolve, backoffDelay));
            
            // Try to continue streaming from where we left off
            const continueResponse = await fetch(
              `${AppConfig.baseApiUrl}/process-text-stream`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${session.user.accessToken}`,
                },
                body: JSON.stringify({
                  prompt: text,
                  chatId,
                  chatCode: chatId,
                  modelType: modelType || 'GPT-4',
                  subModel: modelType || 'gpt4_standard',
                  webSearch: webSearch || false,
                  reasoning: reasoning || false,
                  stream: true,
                  continueFrom: lastSuccessfulChunk, // Send last successful chunk to continue
                  isContinuation: true
                }),
                signal: AbortSignal.timeout(STREAMING_TIMEOUT),
              }
            );

            if (continueResponse.ok) {
              const continueReader = continueResponse.body?.getReader();
              if (continueReader) {
                console.log(`Retry attempt ${streamingRetryCount} successful, continuing stream`);
                // Continue streaming with new reader
                return await continueStreaming(continueReader);
              }
            } else {
              console.log(`Retry attempt ${streamingRetryCount} failed with status:`, continueResponse.status);
            }
          } catch (retryError: any) {
            console.error(`Streaming retry ${streamingRetryCount} failed:`, retryError);
            
            // If it's a socket error, wait a bit longer before next retry
            if (retryError.code === 'UND_ERR_SOCKET') {
              console.log('Socket error in retry, waiting longer before next attempt');
              await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * 3));
            }
          }
          
          return false;
        };

        // Function to handle streaming with retry capability
        const continueStreaming = async (currentReader: ReadableStreamDefaultReader<Uint8Array>): Promise<boolean> => {
          try {
            while (true) {
              const { done, value } = await currentReader.read()

              if (done) {
                // Send final message
                controller.enqueue(`data: [DONE]\n\n`)
                return true;
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
                    return true;
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

                    // Update last successful chunk for retry purposes
                    if (parsed.content) {
                      lastSuccessfulChunk += parsed.content;
                    }

                    // اضافه کردن console.log برای debug
                    // console.log('Parsed data from backend:', parsed);

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
                      return false;
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
                      return false;
                    }

                    // Handle reasoning chunks
                    if (parsed.type === 'reasoning' && parsed.content) {
                      console.log('Reasoning chunk detected:', parsed.content);
                      controller.enqueue(`data: ${JSON.stringify({ 
                        type: 'reasoning', 
                        content: parsed.content 
                      })}\n\n`)
                    }
                    // اگر فقط content داشت
                    else if (parsed.content) {
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
          } catch (streamError: any) {
            console.error('Error in streaming:', streamError)
            
            // Check if it's a timeout or network error that we can retry
            if (streamError.name === 'TimeoutError' || 
                streamError.code === 'UND_ERR_SOCKET' ||
                streamError.message?.includes('timeout') ||
                streamError.message?.includes('aborted') ||
                streamError.message?.includes('terminated')) {
              
              console.log('Streaming error detected, attempting retry...', {
                errorCode: streamError.code,
                errorName: streamError.name,
                errorMessage: streamError.message
              });
              
              // For socket errors, try to retry with a fresh connection
              if (streamError.code === 'UND_ERR_SOCKET') {
                console.log('Socket error detected, will retry with fresh connection');
                // Wait a bit longer for socket errors
                await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * 2));
              }
              
              return await retryStreaming();
            } else {
              // Non-retryable error
              controller.enqueue(`data: ${JSON.stringify({ 
                error: 'خطا در دریافت پاسخ. لطفاً دوباره تلاش کنید.',
                errorType: 'stream_error',
                details: streamError?.message || 'Streaming error'
              })}\n\n`)
              return false;
            }
          }
        };

        try {
          // Start streaming with retry capability
          await continueStreaming(reader);
        } catch (streamError: any) {
          console.error('Error in streaming:', streamError)
          
          // Classify the error for better handling
          let errorType = 'stream_error';
          let errorMessage = 'خطا در دریافت پاسخ. لطفاً دوباره تلاش کنید.';
          
          if (streamError.code === 'UND_ERR_SOCKET') {
            errorType = 'socket_error';
            errorMessage = 'اتصال شبکه قطع شد. لطفاً اتصال اینترنت خود را بررسی کرده و دوباره تلاش کنید.';
          } else if (streamError.name === 'TimeoutError') {
            errorType = 'timeout_error';
            errorMessage = 'درخواست شما به دلیل کندی شبکه ناموفق بود. لطفاً دوباره تلاش کنید.';
          } else if (streamError.message?.includes('aborted')) {
            errorType = 'aborted_error';
            errorMessage = 'درخواست شما لغو شد. لطفاً دوباره تلاش کنید.';
          }
          
          controller.enqueue(`data: ${JSON.stringify({ 
            error: errorMessage,
            errorType: errorType,
            details: streamError?.message || 'Streaming error'
          })}\n\n`)
        } finally {
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