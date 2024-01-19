import { SortOrder, SortMethod } from '../enums';

/**
 * Defines the structure for pagination requests.
 *
 * @export
 * @interface PaginationRequest
 * @typedef {Object} PaginationRequest
 * @property {number} pageSize - Number of items per page.
 * @property {number} [page] - The page to request. Must be included if no `cursor`.
 * @property {string|null} [cursor] - The post ID to start with. Must be included if no `page`.
 * @property {SortOrder} [sortOrder] - Optional sorting order.
 * @property {SortMethod} [sortMethod] - Optional sorting method.
 */
export interface PaginationRequest {
  pageSize: number;
  page?: number;
  cursor?: string | null;
  sortOrder?: SortOrder;
  sortMethod?: SortMethod;
}
