import { translate } from './translate'
import { bInstalledStyles, styles } from './data'
import type { Part, Skill, Style, ScoreAttack, ScoreAttackBattle, Element } from './types'

export function segip(points: [number, number][], x: number) {
  if (points.length === 0) {
    throw 'no points for segip'
  }
  let max_smaller_point = null
  let min_larger_point = null
  for (const point of points) {
    if (point[0] == x) {
      return point[1]
    }
    if (point[0] < x) {
      if (max_smaller_point === null || point[0] > max_smaller_point[0]) {
        max_smaller_point = point
      }
    } else {
      if (min_larger_point === null || point[0] < min_larger_point[0]) {
        min_larger_point = point
      }
    }
  }
  if (max_smaller_point === null) {
    if (min_larger_point === null) throw Error(`impossible state`)
    return min_larger_point[1]
  } else if (min_larger_point === null) {
    return max_smaller_point[1]
  } else {
    const [x0, y0] = max_smaller_point
    const [x1, y1] = min_larger_point
    return ((x - x0) * (y1 - y0)) / (x1 - x0) + y0
  }
}

export function translateType(t: string): string
export function translateType(t: null): null

export function translateType(t: string | null): string | null {
  switch (t?.toLowerCase()) {
    case 'slash':
      return '斩'
    case 'stab':
      return '突'
    case 'strike':
      return '打'
    case 'fire':
      return '火'
    case 'ice':
      return '冰'
    case 'thunder':
      return '雷'
    case 'light':
      return '光'
    case 'dark':
      return '暗'
    default:
      return t
  }
}

type ParamKey = 'str' | 'wis' | 'dex' | 'spr' | 'luk' | 'con'
type ParamOptional = Record<ParamKey, number>

export function mat(param_mass: ParamOptional, param_val: ParamOptional) {
  let s = 0
  let c = 0
  const KEYS: ParamKey[] = ['str', 'wis', 'dex', 'spr', 'luk', 'con']
  for (const key of KEYS) {
    c += param_mass[key]
    s += param_mass[key] * param_val[key]
  }
  return s / c
}

type BattleAttrGetter = (battle: ScoreAttackBattle) => number

export function scoreAttackGetLine(scoreAttack: ScoreAttack, f: BattleAttrGetter): [number, number][] {
  return scoreAttack.battles.map((battle) => [battle.d, f(battle)])
}

export function totalScore(
  scoreAttack: ScoreAttack,
  difficulty: number,
  damageDealt: number,
  noBreak: boolean,
  multiplier: number,
  turnCount: number,
) {
  const getValue = (f: BattleAttrGetter) => segip(scoreAttackGetLine(scoreAttack, f), difficulty)
  const damageCap = getValue((b) => b.db)
  const baseScore = getValue((b) => b.ds)
  const noBreakBonus = noBreak ? getValue((b) => b.nbb) : 0
  const turnLimit = getValue((b) => b.tl)

  return scoreAttack.score_calc.calc_ver > 1
    ? Math.trunc(
        (baseScore + damageScore(scoreAttack.score_calc.tmdc, damageDealt, damageCap) + noBreakBonus) *
          turnMultiplier(scoreAttack, turnCount, turnLimit) *
          multiplier,
      )
    : Math.trunc(
        (baseScore +
          damageScore(scoreAttack.score_calc.tmdc, damageDealt, damageCap) +
          Math.trunc(
            segip(
              [
                [1, getValue((b) => b.mtb)],
                [turnLimit, 0],
              ],
              turnCount,
            ),
          ) +
          noBreakBonus) *
          multiplier,
      )
}

function turnMultiplier(scoreAttack: ScoreAttack, turnCount: number, turnLimit: number) {
  const t = scoreAttack.score_calc.btr,
    e = scoreAttack.score_calc.btcfr,
    a = scoreAttack.score_calc.min_tr,
    s = scoreAttack.score_calc.max_tr
  return (
    Math.round(
      100 *
        (turnCount > 1
          ? turnCount <= e
            ? ((e - turnCount) * (s - t)) / (10000 * (e - 1)) + 1.2
            : ((turnLimit - turnCount) * (t - a)) / (10000 * (turnLimit - e)) + 0.8
          : s / 10000),
    ) / 100
  )
}

const m = (x: number) => (x < 1 ? x : Math.log(x) + 1)

function damageScore(tmdc: number, damageDealt: number, damageCap: number) {
  return Math.trunc(tmdc * damageCap * m(damageDealt / damageCap))
}

function skillAnyParts(skill: Skill, partP: (part: Part) => boolean) {
  for (const part of skill.parts) {
    if (
      part.skill_type === 'SkillRandom' ||
      part.skill_type === 'SkillCondition' ||
      part.skill_type === 'SkillSwitch'
    ) {
      for (const skill of part.strval) if (skillAnyParts(skill, partP)) return true
    } else {
      if (partP(part)) return true
    }
  }
  return false
}

function styleAnyParts(style: Style, partP: (a: Part) => boolean) {
  for (const skill of style.skills) {
    if (skillAnyParts(skill, partP)) {
      return true
    }
  }
  return false
}

function isPartElement(element: Element) {
  if (element == 'Nonelement') {
    return (part: Part) => part.elements.length === 0
  } else {
    return (part: Part) => part.elements.includes(element)
  }
}

const isAoe = (part: Part) => part.skill_type === 'AttackSkill' && part.target_type === 'All'

const isAoePartOfElement = (element: Element) => (part: Part) => isAoe(part) && isPartElement(element)(part)

function arePrefixes(...strings: string[]) {
  for (let i = 0; i < strings.length - 1; i++) {
    if (!strings[i + 1].startsWith(strings[i])) {
      return false
    }
  }
  return true
}

function filterOneCond(style: Style, cond: string) {
  const cp = cond.toLowerCase().split(':')
  switch (true) {
    case cond === '':
      return true
    case cond === 'fire':
      return style.elements.includes('Fire')
    case cond === 'ice':
      return style.elements.includes('Ice')
    case cond === 'thunder':
      return style.elements.includes('Thunder')
    case cond === 'light':
      return style.elements.includes('Light')
    case cond === 'dark':
      return style.elements.includes('Dark')
    case cond === 'noelement':
      return style.elements.length === 0

    case cond === 'slash':
      return style.type === 'Slash'
    case cond === 'strike':
      return style.type === 'Strike'
    case cond === 'stab':
      return style.type === 'Stab'

    case arePrefixes('hasskill:f', cond, 'hasskill:fire'):
      return styleAnyParts(style, isPartElement('Fire'))
    case arePrefixes('hasskill:i', cond, 'hasskill:ice'):
      return styleAnyParts(style, isPartElement('Ice'))
    case arePrefixes('hasskill:t', cond, 'hasskill:thunder'):
      return styleAnyParts(style, isPartElement('Thunder'))
    case arePrefixes('hasskill:l', cond, 'hasskill:light'):
      return styleAnyParts(style, isPartElement('Light'))
    case arePrefixes('hasskill:d', cond, 'hasskill:dark'):
      return styleAnyParts(style, isPartElement('Dark'))

    case arePrefixes('hasaoe:f', cond, 'hasaoe:fire'):
      return styleAnyParts(style, isAoePartOfElement('Fire'))
    case arePrefixes('hasaoe:i', cond, 'hasaoe:ice'):
      return styleAnyParts(style, isAoePartOfElement('Ice'))
    case arePrefixes('hasaoe:t', cond, 'hasaoe:thunder'):
      return styleAnyParts(style, isAoePartOfElement('Thunder'))
    case arePrefixes('hasaoe:l', cond, 'hasaoe:light'):
      return styleAnyParts(style, isAoePartOfElement('Light'))
    case arePrefixes('hasaoe:d', cond, 'hasaoe:dark'):
      return styleAnyParts(style, isAoePartOfElement('Dark'))
    case arePrefixes('hasaoe', cond, 'hasaoe:any'):
      return styleAnyParts(style, isAoe)

    case cp[0] === 'c' && cp.length > 1:
      return style.chara.includes(cp[1])

    case cond === 'a':
      return style.tier === 'A'
    case cond === 's':
      return style.tier === 'S'
    case cond === 'ss':
      return style.tier === 'SS'

    case cond === '31a':
      return style.team === '31A'
    case cond === '31b':
      return style.team === '31B'
    case cond === '31c':
      return style.team === '31C'
    case cond === '30g':
      return style.team === '30G'
    case cond === '31d':
      return style.team === '31D'
    case cond === '31e':
      return style.team === '31E'
    case cond === '31f':
      return style.team === '31F'
    case cond === '31x':
      return style.team === '31X'

    case cp[0] === 'eval' && cp.length > 1:
      return eval(cp[1])

    default:
      return (
        [
          style.chara,
          style.name,
          translate(style).name,
          style.team,
          ...style.elements,
          ...style.elements.map((x) => translateType(x)),
          style.type,
          translateType(style.type),
        ].find((x) => x?.toLowerCase().includes(cond)) !== undefined
      )
  }
}

export function filterFromSearch(search: string): (style: Style, _: number, allStyles: Style[]) => boolean {
  return (style: Style /*  _: number, allStyles: Style[] */) => {
    if (search === '') return true
    for (const cond of search.toLowerCase().split(' ')) {
      if (!filterOneCond(style, cond)) return false
    }
    return true
  }
}

export function installedStyles(server: 'WFS' | 'BILI'): Style[] {
  if (server === 'WFS') {
    return styles
  } else if (server === 'BILI') {
    return bInstalledStyles
  } else {
    throw new Error(`unknown server ${server}`)
  }
}
