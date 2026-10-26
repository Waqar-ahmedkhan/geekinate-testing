import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const orderLabel = (index) => String(index + 1).padStart(2, '0');
export const nextTask = () => new Promise((resolve) => setTimeout(resolve, 0));
export const sentenceCase = (text) => text.replace(/(?<=\s)[A-Z](?=[a-z])/g, (letter) => letter.toLowerCase());
export const joinNames = (names) => (names.length < 2 ? names.join('') : `${names.slice(0, -1).join(', ')} & ${names.at(-1)}`);
