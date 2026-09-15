import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

// Tailwind still supports these gradient aliases; preserve their background colors.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'bg-image': [{ 'bg-gradient-to': ['t', 'tr', 'r', 'br', 'b', 'bl', 'l', 'tl'] }],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
