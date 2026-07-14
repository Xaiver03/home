/**
 * Remove the old root-scoped homepage Service Worker when entering the blog.
 * It used to control /blog before the denylist was corrected. This deliberately
 * leaves Local Storage and application state untouched.
 */
export default defineNuxtPlugin(() => {
  if (!('serviceWorker' in navigator)) return;

  const cleanedKey = '__blog_root_service_worker_cleaned__';
  const cleanRootRegistration = async () => {
    const registrations = await navigator.serviceWorker.getRegistrations();
    const rootRegistrations = registrations.filter(
      (registration) => registration.scope === `${window.location.origin}/`,
    );

    if (!rootRegistrations.length) return;
    await Promise.all(rootRegistrations.map((registration) => registration.unregister()));

    if (navigator.serviceWorker.controller && !sessionStorage.getItem(cleanedKey)) {
      sessionStorage.setItem(cleanedKey, '1');
      window.location.reload();
    }
  };

  cleanRootRegistration().catch(() => {
    // Cache cleanup must never block the blog from rendering.
  });
});
