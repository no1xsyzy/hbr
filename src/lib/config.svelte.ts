import { DEFAULT_INIT } from './prolog'
import type { Des, Ser } from './types'

const CONFIG_STORAGE_KEY = 'CONFIG'

export let prolog_init: string = $state(DEFAULT_INIT)

const ser: Ser = () => JSON.stringify({ prolog_init })
const des: Des = (storedString: string) => ({ prolog_init } = JSON.parse(storedString))

const listener = (event: StorageEvent) => {
  if (event.key === CONFIG_STORAGE_KEY && event.newValue !== null) {
    des(event.newValue)
  }
}

window.addEventListener('storage', listener)

$effect(() => {
  des(localStorage[CONFIG_STORAGE_KEY] ?? '{}')
})

$effect(() => {
  localStorage[CONFIG_STORAGE_KEY] = ser()
})
