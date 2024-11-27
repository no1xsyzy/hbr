import type {
  Style,
  Skill,
  Character,
  Battle,
  ScoreAttack,
  Translation,
  SimpleTranslate,
  MasterSkill,
  Accessory,
} from './types'

export const styles = (await import('../../data_hbr/styles.json')).default as Style[]
export const skills = (await import('../../data_hbr/skills.json')).default as Skill[]
export const characters = (await import('../../data_hbr/characters.json')).default as Character[]
export const battles = (await import('../../data_hbr/battles.json')).default as Battle[]
export const score_attack = (await import('../../data_hbr/score_attack.json')).default as ScoreAttack[]
export const masterSkills = (await import('../../data_hbr/masterSkills.json')).default as unknown as MasterSkill[]
export const accessories = (await import('../../data_hbr/accessories.json')).default as Accessory[]

export const translation = (await import('../../data_gen/translation.json')).default as Translation

import databili from './databili.toml'

export const { bACNames, bCCNames, bScoreAttacks, bTopped, bBattleNames, bInstall, bEvent } = databili as {
  bACNames: SimpleTranslate
  bCCNames: SimpleTranslate
  bScoreAttacks: SimpleTranslate
  bTopped: string[]
  bBattleNames: SimpleTranslate
  bInstall: { [k: string]: string[] }
  bEvent: {
    gatcha: { from: Date; till: Date; title: string; tags: string[]; dynamic: string }[]
    redeem: { from: Date | 'now'; till: Date; code: string; content: string; dynamic: string }[]
    x3: { from: Date; till: Date; event: number; dynamic: string }[]
    scoreattack: { from: Date; till: Date; title: string; dynamic: string }[]
    maintenance: { from: Date; till: Date; content: string[] }[]
  }
}

export const bInstalledStyleLabels = Object.keys(bInstall)
  .filter((k) => new Date(k) < new Date())
  .flatMap((k) => bInstall[k])

export const styleByLabel = Object.fromEntries(styles.map((st) => [st.label, st]))
export const styleById = Object.fromEntries(styles.map((st) => [st.id, st]))
export const stylesByChara = Object.groupBy(styles, (st) => st.chara_label)

const bInstalledStyleLabelsSet = new Set(bInstalledStyleLabels)

export const bInstalledStyles = styles.filter((st) => bInstalledStyleLabelsSet.has(st.label))
