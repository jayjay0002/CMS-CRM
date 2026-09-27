import { DEFAULT_THEME, type Theme } from '@/entities/site'

export type ThemePreset = {
  id: string
  name: string
  description: string
  theme: Theme
}

// Starting points; everything can still be adjusted color by color.
export const THEME_PRESETS: readonly ThemePreset[] = [
  {
    id: 'classic-red-wagon',
    name: 'Classic Red Wagon',
    description: 'Butter yellow, cherry red and navy. The original look.',
    theme: DEFAULT_THEME,
  },
  {
    id: 'midnight-carnival',
    name: 'Midnight Carnival',
    description: 'A night-fair navy with glowing butter and cherry.',
    theme: {
      colors: {
        background: '#141833',
        surface: '#232a5c',
        surfaceSoft: '#2e3672',
        text: '#fff6dc',
        primary: '#ff5a6e',
        primaryDark: '#c4243d',
        accent: '#ffd447',
      },
      headingFont: 'Titan One',
      bodyFont: 'DM Sans',
    },
  },
  {
    id: 'cotton-candy',
    name: 'Cotton Candy',
    description: 'Soft pink, mint and lavender with deep plum text.',
    theme: {
      colors: {
        background: '#fff7fb',
        surface: '#ffc9e0',
        surfaceSoft: '#d8f4e9',
        text: '#2d1f3f',
        primary: '#6b4fc8',
        primaryDark: '#4b3196',
        accent: '#e0629c',
      },
      headingFont: 'Bagel Fat One',
      bodyFont: 'Nunito',
    },
  },
  {
    id: 'retro-diner',
    name: 'Retro Diner',
    description: 'Mint and tomato red, like a 1950s soda fountain.',
    theme: {
      colors: {
        background: '#f5fbf7',
        surface: '#a6e3cc',
        surfaceSoft: '#e1f5ec',
        text: '#10323a',
        primary: '#d9481f',
        primaryDark: '#a3300f',
        accent: '#1f8a7a',
      },
      headingFont: 'Lilita One',
      bodyFont: 'Work Sans',
    },
  },
]
