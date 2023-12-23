import { SortOrder, SortMethod } from "../enums";

/**
 * Defines the structure for pagination requests.
 *
 * @export
 * @interface PaginationRequest
 * @typedef {Object} PaginationRequest
 * @property {number} pageSize - Number of items per page.
 * @property {number} skipCount - Number of items to skip for pagination.
 * @property {SortOrder} [sortOrder] - Optional sorting order.
 * @property {SortMethod} [sortMethod] - Optional sorting method.
 */
export interface PaginationRequest {
  pageSize: number;
  skipCount: number;
  sortOrder?: SortOrder;
  sortMethod?: SortMethod;
}