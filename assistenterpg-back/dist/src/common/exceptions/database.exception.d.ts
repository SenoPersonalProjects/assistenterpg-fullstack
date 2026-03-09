import { BaseException } from './base.exception';
export declare class DatabaseException extends BaseException {
    constructor(message: string, code: string, details?: unknown);
}
export declare function handlePrismaError(error: unknown): never;
