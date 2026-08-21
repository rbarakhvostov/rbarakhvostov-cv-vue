import type { RolePart } from '../types'

export function splitRoles(value: string): RolePart[] {
  return value.split('|').map((part, index) => ({
    text: part.trim(),
    showSep: index > 0,
  }))
}
