export class LocalStorage<T> {
  key: string
  value: T
  subscriptions: (((value: T) => void) | null)[]
  subscribers: number
  handler: ((event: StorageEvent) => void) | null

  constructor(key: string, init: T) {
    this.key = key
    this.subscriptions = []
    this.handler = null
    const stored = localStorage.getItem(key)
    if (stored === null) {
      this.value = init
      localStorage.setItem(key, JSON.stringify(init))
    } else {
      this.value = JSON.parse(stored)
    }

    this.subscribers = 0
  }

  _startListen() {
    this.handler = (event: StorageEvent) => {
      if (event.key === this.key && event.newValue !== null) {
        this.set(JSON.parse(event.newValue))
      }
    }
    window.addEventListener('storage', this.handler)
  }

  _stopListen() {
    if (this.handler === null) return
    window.removeEventListener('storage', this.handler)
    this.handler = null
  }

  subscribe(subscription: (value: T) => void) {
    if (this.subscribers === 0) this._startListen()
    this.subscribers++
    const i = this.subscriptions.push(subscription) - 1

    subscription(this.value)

    return () => {
      this.subscriptions[i] = null
      this.subscribers--
      if (this.subscribers === 0) this._stopListen()
    }
  }

  set(value: T): void {
    this.value = value
    localStorage.setItem(this.key, JSON.stringify(value))
    for (const subscription of this.subscriptions) {
      if (subscription !== null) {
        subscription(value)
      }
    }
  }
}
