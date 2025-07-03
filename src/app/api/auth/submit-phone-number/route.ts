import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { AppConfig } from '@/utils/AppConfig';


// Retry logic function
const makeRequest = async (mobile: string, retries = 3) => {
  const fullUrl = `${AppConfig.authApiUrl2}/verifyPhoneNumber`;
  
  // Test server connection first
  // const isServerReachable = await testServerConnection(AppConfig.authApiUrl);
  // if (!isServerReachable) {
  //   throw new Error(`سرور ${AppConfig.authApiUrl} در دسترس نیست. لطفاً اتصال اینترنت و آدرس سرور را بررسی کنید.`);
  // }
  
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`Making request to: ${fullUrl}`);
      console.log(`Request payload:`, { mobile });
      console.log(`Attempt ${i + 1} of ${retries}`);
      
      const controller = new AbortController();
      setTimeout(() => controller.abort(), 15000); // Increased timeout to 15 seconds
      
      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'Kariz-App/1.0',
          'Connection': 'keep-alive',
        },
        body: JSON.stringify({ mobile }),
        signal: controller.signal,
        keepalive: true,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`Request successful on attempt ${i + 1}`);
      return data;
    } catch (error) {
      console.error(`Attempt ${i + 1} failed:`, error);
      
      // Log more details about the error
      if (error instanceof Error) {
        console.error(`Error name: ${error.name}`);
        console.error(`Error message: ${error.message}`);
        if (error.cause) {
          console.error(`Error cause:`, error.cause);
        }
      }
      
      if (i === retries - 1) {
        console.error(`All ${retries} attempts failed`);
        throw error;
      }
      
      console.log(`Retrying in ${(i + 1) * 1000}ms...`);
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
};

export async function POST(
  request: NextRequest,
) {
  try {
    // You'll need to extract phoneNumber from the request
    const body = await request.json();
    const mobile = body.mobile;

    if (!mobile || typeof mobile !== 'string' || !/^\d{11}$/.test(mobile)) {
      return NextResponse.json(
        { error: 'پارامتر mobile الزامی است و باید ۱۱ رقم باشد.' },
        { status: 400 }
      );
    }

    console.log(`Processing phone number verification for: ${mobile}`);
    console.log(`Using auth API URL: ${AppConfig.authApiUrl}`);
    
    const data = await makeRequest(mobile);
    return NextResponse.json(data);
  } catch (error) {
    console.error(`Error processing request:`, error);

    if (error instanceof Error) {
      // Check if it's a timeout/abort error
      if (error.name === 'AbortError') {
        return NextResponse.json(
          { error: 'درخواست به دلیل کندی سرور لغو شد. لطفاً دوباره تلاش کنید.' },
          { status: 408 }
        );
      }
      
      // Check if it's a connection error
      if (error.message.includes('fetch failed') || error.message.includes('Connect Timeout Error')) {
        return NextResponse.json(
          { error: 'خطا در اتصال به سرور. لطفاً اتصال اینترنت و آدرس سرور را بررسی کنید.' },
          { status: 503 }
        );
      }
      
      return NextResponse.json(
        { error: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 },
    );
  }
}
