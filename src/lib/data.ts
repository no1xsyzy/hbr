import type { Style, Skill, Character, Battle, ScoreAttack, Translation, SimpleTranslate } from './types'

export const styles = (await import('../../data_hbr/styles.json')).default as Style[]
export const skills = (await import('../../data_hbr/skills.json')).default as unknown as Skill[] // TODO: check on that later
export const characters = (await import('../../data_hbr/characters.json')).default as Character[]
export const battles = (await import('../../data_hbr/battles.json')).default as Battle[]
export const score_attack = (await import('../../data_hbr/score_attack.json')).default as ScoreAttack[]
export const translation = (await import('../../data_gen/translation.json')).default as Translation

import databili from './databili.toml'

export const { ACNames, CCNames, 国服高分, 当前国服置顶, BattleNames, B服实装 } = databili as {
  ACNames: SimpleTranslate
  CCNames: SimpleTranslate
  国服高分: SimpleTranslate
  当前国服置顶: string[]
  BattleNames: SimpleTranslate
  B服实装: { [k: string]: string[] }
}
