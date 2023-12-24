/**
 * Enum for sorting order (ascending or descending).
 * 
 * @enum {string}
 */
export enum SortOrder {
  ASC = "asc",
  DESC = "desc",
}

/**
 * Enum for sorting method (by date or A-Z).
 * 
 * @enum {string}
 */
export enum SortMethod {
  DATE = "date",
  ALPHA = "alpha",
}

/**
 * Enum for asynchronous event status, useful for conditionally displaying a loading indicator.
 * 
 * @enum {string}
 */
export enum AsyncStatus {
  IDLE = "idle",
  LOADING = "loading",
  SUCCEEDED = "succeeded",
  FAILED = "failed",
};