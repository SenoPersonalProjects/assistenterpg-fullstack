export declare class PaginationQueryDto {
    page?: number;
    limit?: number;
}
export type PaginatedResult<T> = {
    items: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
};
