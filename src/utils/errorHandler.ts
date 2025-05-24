// src/utils/errorHandler.ts
import { NextResponse } from 'next/server';

export class ErrorHandler {
  // Generic error response method
  static handleError(error: unknown, defaultMessage = 'An unexpected error occurred'): NextResponse {
    if (error instanceof Error) {
      console.error(`[ERROR] ${error.message}`, error.stack);

      // Differentiate between different error types
      if (error.name === 'ValidationError') {
        return NextResponse.json({
          error: 'Validation Failed',
          details: error.message,
        }, { status: 400 });
      }

      if (error.name === 'UnauthorizedError') {
        return NextResponse.json({
          error: 'Unauthorized',
          details: error.message,
        }, { status: 401 });
      }

      if (error.name === 'NotFoundError') {
        return NextResponse.json({
          error: 'Not Found',
          details: error.message,
        }, { status: 404 });
      }
    }

    // Generic server error for unhandled cases
    return NextResponse.json({
      error: 'Internal Server Error',
      details: defaultMessage,
    }, { status: 500 });
  }

  // Specific method for API-related errors
  static handleApiError(error: unknown): NextResponse {
    return this.handleError(error, 'API request failed');
  }

  // Method to log errors without sending a response
  static logError(error: unknown, context?: string): void {
    console.error(`[ERROR${context ? ` in ${context}` : ''}]`, error);
  }
}
