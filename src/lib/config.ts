import { LocalStorage } from './store'
import { DEFAULT_INIT } from './prolog'

export interface Config {
  prolog_init: string
}

export const config = new LocalStorage<Config>('CONFIG', {
  prolog_init: DEFAULT_INIT,
})
