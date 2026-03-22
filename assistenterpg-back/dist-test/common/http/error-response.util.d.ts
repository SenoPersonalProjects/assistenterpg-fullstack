import { Request } from 'express';
import { BaseException } from '../exceptions/base.exception';
export type ErrorResponseBody = {
    statusCode: number;
    timestamp: string;
    path: string;
    method: string;
    traceId: string;
    code: string;
    error: string;
    message: string | string[];
    details?: unknown;
    field?: string;
    stack?: string;
    errorType?: string;
};
type HttpExceptionPayload = {
    code: string;
    error: string;
    message: string | string[];
    details?: unknown;
    field?: string;
};
export declare function createErrorBase(request: Request, traceId: string, statusCode: number): Omit<ErrorResponseBody, 'code' | 'error' | 'message' | 'details' | 'field' | 'stack' | 'errorType'>;
export declare function normalizeHttpExceptionPayload(statusCode: number, response: unknown, fallbackMessage: string, baseException?: BaseException): HttpExceptionPayload;
export {};
