/**
 * 全局配置API
 */

// 获取全局配置（包括about页面配置和网站链接）
export const getGlobalConfig = async () => {
  try {
    // 设置5秒超时
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const res = await fetch('/api/configuration/reception/getConfig', {
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.warn('全局配置API调用失败，使用降级方案:', error.message);
    // 返回空对象，让组件使用默认配置
    return {};
  }
};

export const getLatestArticles = async () => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const res = await fetch('/api/article/reception/searchArticle', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: {
          orderByTime: true,
        },
        currentPage: 1,
        pageSize: 6,
      }),
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.warn('最新文章加载失败:', error.message);
    return {
      count: 0,
      rows: [],
    };
  }
};

export const getArticleCategories = async () => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const res = await fetch('/api/article/reception/getAllArticleTypes', {
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.warn('文章分类加载失败:', error.message);
    return [];
  }
};

export const getArticlesByCategory = async (categoryId) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(`/api/article/reception/getArticleByTypeId/${categoryId}/1/6`, {
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.warn('分类文章加载失败:', error.message);
    return {
      count: 0,
      rows: [],
    };
  }
};
