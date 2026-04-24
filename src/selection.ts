import type { Mode } from './types'

const OUTLINE: Partial<Record<Mode, string>> = {
  idle: 'outline outline-2 outline-sky-400',
  edit: 'outline outline-2 outline-amber-400',
  confirmDelete: 'outline outline-2 outline-red-500',
}

export const outlineFor = (selected: boolean, mode: Mode): string =>
  selected ? OUTLINE[mode] ?? '' : ''
