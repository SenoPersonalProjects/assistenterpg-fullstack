import { HttpException, HttpStatus } from '@nestjs/common';
export interface ErrorDetails {
    code?: string;
    message: string;
    details?: any;
    field?: string;
    timestamp?: string;
    path?: string;
    stack?: string;
}
export declare class BaseException extends HttpException {
    readonly code: string;
    readonly details?: any;
    readonly field?: string;
    readonly timestamp: string;
    constructor(message: string, status: HttpStatus, code?: string, details?: any, field?: string);
}
