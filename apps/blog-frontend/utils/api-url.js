export const normalizeApiUrl = (value, fallback = '') => {
  const resolvedUrl = String(value || fallback).trim().replace(/\/+$/, '');

  if (!resolvedUrl || /\/api$/i.test(resolvedUrl)) {
    return resolvedUrl;
  }

  return `${resolvedUrl}/api`;
};
