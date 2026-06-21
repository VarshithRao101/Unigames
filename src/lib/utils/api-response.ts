import { NextResponse } from "next/server";

export interface ApiResponseSuccess<T> {
  success: true;
  message?: string;
  data: T;
}

export interface ApiResponseError {
  success: false;
  error: {
    message: string;
    code: string;
    details?: any;
  };
}

/**
 * Standardized successful API response helper.
 */
export function apiSuccess<T>(data: T, message?: string, status = 200) {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
    } as ApiResponseSuccess<T>,
    { status }
  );
}

/**
 * Standardized error API response helper.
 */
export function apiError(
  message: string,
  code = "BAD_REQUEST",
  status = 400,
  details?: any
) {
  return NextResponse.json(
    {
      success: false,
      error: {
        message,
        code,
        details,
      },
    } as ApiResponseError,
    { status }
  );
}

/**
 * Standard HTTP Error responses for common situations.
 */
export const apiErrors = {
  badRequest: (message = "Invalid request parameters", details?: any) =>
    apiError(message, "BAD_REQUEST", 400, details),
  
  unauthorized: (message = "Authentication required") =>
    apiError(message, "UNAUTHORIZED", 401),
  
  forbidden: (message = "You do not have permission to perform this action") =>
    apiError(message, "FORBIDDEN", 403),
  
  notFound: (message = "Requested resource not found") =>
    apiError(message, "NOT_FOUND", 404),
  
  rateLimited: (message = "Too many requests. Please try again later.") =>
    apiError(message, "RATE_LIMITED", 429),
  
  serverError: (message = "An unexpected server error occurred", details?: any) =>
    apiError(message, "INTERNAL_SERVER_ERROR", 500, details),
};
