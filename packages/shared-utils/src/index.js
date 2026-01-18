// @xld/shared-utils
// 共享工具函数库入口文件

/**
 * 导出所有共享工具函数
 * Export all shared utility functions
 */

// 通用工具函数
export * from './common.js';

// 日期处理相关
export * from './date.js';

// 验证器相关
export * from './validators.js';

// HTTP 请求相关（待实现）
// export * from './request.js';

export const version = '1.0.0';

console.log('@xld/shared-utils v' + version + ' loaded');
