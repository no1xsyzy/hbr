import { makeLocalStorage } from './store'

export type UserBox = { [k: string]: number | undefined }

export const limit_break = makeLocalStorage<UserBox>('USER_BOX', {})
export const style_lv = makeLocalStorage<UserBox>('USER_BOX', {})
export const chara_lv = makeLocalStorage<UserBox>('USER_BOX', {})
