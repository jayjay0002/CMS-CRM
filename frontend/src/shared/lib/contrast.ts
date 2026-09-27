// WCAG 2.x contrast between two #rrggbb colors.

const HEX_BASE = 16
const CHANNEL_MAX = 255
const HEX_CHANNEL_LENGTH = 2
const HEX_PREFIX_LENGTH = 1
const CHANNEL_COUNT = 3

// sRGB -> linear light, per the WCAG relative-luminance formula.
const LINEAR_THRESHOLD = 0.03928
const LINEAR_DIVISOR = 12.92
const GAMMA_OFFSET = 0.055
const GAMMA_DIVISOR = 1.055
const GAMMA = 2.4
const RED_WEIGHT = 0.2126
const GREEN_WEIGHT = 0.7152
const BLUE_WEIGHT = 0.0722
const LUMINANCE_WEIGHTS = [RED_WEIGHT, GREEN_WEIGHT, BLUE_WEIGHT] as const
const CONTRAST_OFFSET = 0.05

// Colors at or above this luminance count as light (the midpoint of the 0-1 scale).
export const LIGHT_LUMINANCE_THRESHOLD = 0.5

// Normal-size text needs at least this ratio (WCAG AA).
export const MIN_TEXT_CONTRAST = 4.5

function channels(hex: string): number[] {
  return Array.from({ length: CHANNEL_COUNT }, (_, index) => {
    const start = HEX_PREFIX_LENGTH + index * HEX_CHANNEL_LENGTH
    return Number.parseInt(hex.slice(start, start + HEX_CHANNEL_LENGTH), HEX_BASE) / CHANNEL_MAX
  })
}

function linear(channel: number): number {
  return channel <= LINEAR_THRESHOLD
    ? channel / LINEAR_DIVISOR
    : ((channel + GAMMA_OFFSET) / GAMMA_DIVISOR) ** GAMMA
}

export function relativeLuminance(hex: string): number {
  return channels(hex).reduce((sum, channel, index) => sum + linear(channel) * (LUMINANCE_WEIGHTS[index] ?? 0), 0)
}

export function contrastRatio(foreground: string, background: string): number {
  const [lighter, darker] = [relativeLuminance(foreground), relativeLuminance(background)].sort((a, b) => b - a)
  return ((lighter ?? 0) + CONTRAST_OFFSET) / ((darker ?? 0) + CONTRAST_OFFSET)
}
