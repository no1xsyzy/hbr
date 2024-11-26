import { DEFAULT_INIT } from './prolog'
import { makeLocalStorage } from './store'

export const prolog_init = makeLocalStorage('PROLOG_INIT', DEFAULT_INIT)
export const server = makeLocalStorage<'WFS' | 'BILI'>('SERVER', 'WFS')
