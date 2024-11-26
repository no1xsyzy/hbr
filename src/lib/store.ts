import { writable, type Writable } from 'svelte/store'

export function makeLocalStorage<V>(key: string, value: V): Writable<V> {
  const { subscribe, set, update } = writable(
    key in localStorage ? JSON.parse(<string>localStorage.getItem(key)) : value,
  )
  const listener = (event: StorageEvent) => {
    if (event.key === key) {
      set(JSON.parse(<string>event.newValue))
    }
  }
  window.addEventListener('storage', listener) // would this leak?
  return {
    subscribe,
    set(value) {
      localStorage.setItem(key, JSON.stringify(value))
      set(value)
    },
    update,
  }
}
