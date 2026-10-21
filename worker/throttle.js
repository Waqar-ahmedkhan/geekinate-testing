export const createThrottle = ({ ms, max }) => {
  const hits = new Map();
  return (key) => {
    const now = Date.now();
    const seen = (hits.get(key) || []).filter((stamp) => now - stamp < ms);
    hits.forEach((stamps, id) => {
      if (!stamps.some((stamp) => now - stamp < ms)) hits.delete(id);
    });
    if (seen.length >= max) return true;
    hits.set(key, [...seen, now]);
    return false;
  };
};
