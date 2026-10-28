import { PHONE } from '@/constants';

export const isPhone = () => window.matchMedia(PHONE.query).matches;
