export const scrollProgress = { raw: 0, damped: 0, offset: 0, driven: false, reduced: false };

export const pageOffset = () => (scrollProgress.driven ? scrollProgress.offset : window.scrollY);
