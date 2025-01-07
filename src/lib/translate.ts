import { translation } from './data'

type MaybeHasLabel = { translateLabel?: string; label?: string }

export function translate<T extends MaybeHasLabel>(x: T): T {
  return { ...x, ...translation[x?.translateLabel ?? x?.label ?? 'undefined'] }
}

export function translateLabel(label: string): { [k: string]: string } {
  return translation[label] ?? {}
}
