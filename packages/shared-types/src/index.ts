// @xld/shared-types
// 共享 TypeScript 类型定义

/**
 * API 响应通用类型
 * Common API response types
 */
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

/**
 * 分页参数类型
 * Pagination parameters
 */
export interface PaginationParams {
  page: number;
  pageSize: number;
}

/**
 * 分页响应类型
 * Pagination response
 */
export interface PaginationResponse<T = any> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * 用户信息类型
 * User information type
 */
export interface UserInfo {
  id: number;
  email: string;
  username?: string;
  avatar?: string;
  role?: string;
}

// 导出版本号
export const version = '1.0.0';
