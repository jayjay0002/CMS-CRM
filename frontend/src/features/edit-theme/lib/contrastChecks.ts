import type { ThemeColorRole, ThemeColors } from '@/entities/site'
import { contrastRatio, MIN_TEXT_CONTRAST } from '@/shared/lib'

type ContrastCheck = {
  foreground: ThemeColorRole
  background: ThemeColorRole
  // Where the combination appears, in plain words.
  where: string
}

// The combinations people read most on the site.
const CHECKS: readonly ContrastCheck[] = [
  { foreground: 'text', background: 'background', where: 'Text on the page background' },
  { foreground: 'text', background: 'surface', where: 'Text on the header and hero' },
  { foreground: 'text', background: 'surfaceSoft', where: 'Text on the soft band' },
  { foreground: 'background', background: 'primary', where: 'Button text on buttons' },
]

const RATIO_DECIMALS = 1

export type ContrastResult = {
  where: string
  ratio: string
  isReadable: boolean
}

export function contrastResults(colors: ThemeColors): ContrastResult[] {
  return CHECKS.map(({ foreground, background, where }) => {
    const ratio = contrastRatio(colors[foreground], colors[background])
    return { where, ratio: ratio.toFixed(RATIO_DECIMALS), isReadable: ratio >= MIN_TEXT_CONTRAST }
  })
}

export { MIN_TEXT_CONTRAST }
