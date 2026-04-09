import { PALETTE } from '../data/palette'

export function displayName(props: Record<string, unknown>): string {
  const keys = Object.keys(props).sort()

  // Properties mit 'name' oder 'title' bevorzugen
  for (const k of keys) {
    if (k.toLowerCase().includes('name') || k.toLowerCase().includes('title')) {
      if (props[k]) return String(props[k])
    }
  }
  // Dann IDs / Nummern
  for (const k of keys) {
    if (k.toLowerCase().endsWith('number') || k === 'id') {
      if (props[k]) return String(props[k])
    }
  }
  // Fallback: erster nicht-leerer String
  for (const k of keys) {
    const v = props[k]
    if (
      typeof v === 'string' &&
      v &&
      !['createdAt', 'updatedAt', 'status'].includes(k)
    ) {
      return v.slice(0, 50)
    }
  }
  return String(props['id'] ?? '?')
}

export function labelColor(label: string, allLabels: string[]): string {
  const sorted = [...allLabels].sort()
  const idx = sorted.indexOf(label)
  return PALETTE[(idx >= 0 ? idx : 0) % PALETTE.length]
}

export function primaryLabel(labels: string[]): string {
  if (!labels.length) return 'Unknown'
  const base = new Set(['Partner', 'InsurableObject'])
  const specific = labels.filter((l) => !base.has(l))
  return specific[0] ?? labels[0]
}
