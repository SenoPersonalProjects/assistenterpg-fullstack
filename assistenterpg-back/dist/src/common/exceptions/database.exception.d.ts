import { BaseException } from './base.exception';
export declare class DatabaseException extends BaseException {
    constructor(message: string, code: string, details?: any);
}
export declare function handlePrismaError(error: any): never;
