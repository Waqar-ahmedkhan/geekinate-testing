const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];

export const ctaSource = { value: 'direct' };

export const track = (event, props = {}) => {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...props });
};

export const referrerDomain = () => {
  if (typeof document === 'undefined' || !document.referrer) return '';
  try {
    const { hostname } = new URL(document.referrer);
    return hostname === window.location.hostname ? '' : hostname;
  } catch {
    return '';
  }
};

export const campaignFields = () => {
  if (typeof window === 'undefined') return {};
  const params = new URLSearchParams(window.location.search);
  return Object.fromEntries(UTM_KEYS.map((key) => [key, params.get(key)]).filter(([, value]) => value));
};
