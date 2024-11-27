import { accessories, masterSkills, styleByLabel, styles } from './data'
import type { Element, Multipliers, NormalPart, Part, Resist, Skill, SkillPartParameters, Style, SType } from './types'
import { translateType, segip } from './utils'

const ATTACK_TYPES = [
  'AttackSkill',
  'TokenAttack',
  'PenetrationCriticalAttack',
  'DamageRateChangeAttackSkill',
  'AttackByOwnDpRate',
  'AttackBySp',
  'FixedHpDamageRateAttack',
]

export function styleCanUseSkills(style: Style): Skill[] {
  const chara = style.chara_label
  return styles
    .filter((st) => st.chara_label === chara)
    .flatMap(({ generalize, skills, label }) =>
      skills.filter(
        (sk) =>
          label === style.label ||
          ((sk.is_restricted === 0 || generalize) &&
            sk.name !== '通常攻撃' &&
            sk.name !== '追撃' &&
            sk.name !== '指揮行動'),
      ),
    )
    .concat(masterSkills.find((ms) => ms.chara_label === chara)?.skill ?? [])
    .concat(accessories.flatMap((acc) => acc.skill))
}

export function skillsFromTeam<T>(team: { params: T; style: Style }[]): (Skill & { ownerParams: T })[] {
  return team
    .filter((p) => p)
    .flatMap((pl) => {
      return styleCanUseSkills(pl.style).map((sk) => ({ ...sk, ownerParams: pl.params }))
    })
}

interface PartExt<ParamType> {
  ownerParams: ParamType
  name: string
  label: string
  key: string
  skHits: number[] | null
}

export function partsFromSkills<T>(skills: (Skill & { ownerParams: T })[]) {
  return skills.flatMap(function resolveNestedPartsFromSkill({
    ownerParams,
    parts,
    name,
    label,
    hits,
    hit_count,
  }): (NormalPart & PartExt<T>)[] {
    if (parts[0].skill_type === 'SkillSwitch') {
      return parts[0].strval
        .map((skk, i) => ({ ...skk, ownerParams, name: name + ' / ' + `SKILL ${i + 1}` }))
        .flatMap(resolveNestedPartsFromSkill)
    } else if (parts[0].skill_type === 'SkillRandom' || parts[0].skill_type === 'SkillCondition') {
      return parts[0].strval
        .map((skk) => ({ ...skk, ownerParams, name: name + ' / ' + skk.desc }))
        .flatMap(resolveNestedPartsFromSkill)
    } else {
      return (parts as NormalPart[]).map((pt, i) => {
        return ATTACK_TYPES.includes(pt.skill_type)
          ? {
              ...pt,
              ownerParams,
              name,
              label,
              key: label + '/' + i,
              skHits: hits.length > 0 ? hits.map((h) => h.power_ratio) : Array(hit_count).fill(1 / hit_count),
            }
          : {
              ...pt,
              ownerParams,
              name,
              label,
              key: label + '/' + i,
              skHits: null,
            }
      })
    }
  })
}

interface AttackData<ParamType> {
  key: string
  label: string
  name: string
  type: string | null
  element: string
  power: number[]
  params: SkillPartParameters
  diff_for_max: number
  multipliers: Multipliers
  growth: number[]
  hits: number[] | null
  ownerParams: ParamType
  extraParam?: {
    name: string
    type: 'integer' | 'number'
    min: number
    max: number
    default: number
    mul: (x: number) => number
  }
}

function attackDataFromPart<ParamType>(pt: NormalPart & PartExt<ParamType>): AttackData<ParamType> {
  return {
    key: pt.key,
    label: pt.label,
    name: pt.name,
    type: pt.type === null ? translateType(pt.type) : translateType(pt.type),
    element: translateType(pt.elements?.[0] ?? '无'),
    power: pt.power,
    params: pt.parameters,
    diff_for_max: pt.diff_for_max,
    multipliers: pt.multipliers,
    growth: pt.growth,
    hits: pt.skHits,
    ownerParams: pt.ownerParams,
  }
}

export function procOn<Key extends string, SourceType extends { [k in Key]: string }, RetType>(
  source: SourceType[],
  key: Key,
  processors: { [key: string]: (pt: SourceType) => RetType[] },
): RetType[] {
  return source.flatMap((pt) => processors[pt?.[key]]?.(pt) ?? [])
}

export function attackParts<ParamType>(parts: (NormalPart & PartExt<ParamType>)[]): AttackData<ParamType>[] {
  return procOn(parts, 'skill_type', {
    AttackSkill: (pt) => [attackDataFromPart(pt)],
    TokenAttack: (pt) => [
      {
        ...attackDataFromPart(pt),
        extraParam: {
          name: 'token',
          type: 'integer',
          min: 0,
          max: 10,
          default: 10,
          mul: (x) => 1 + x * pt.value[0],
        },
      },
    ],
    PenetrationCriticalAttack: (pt) => [
      {
        ...attackDataFromPart(pt),
        penetration: pt.value[0],
      },
    ],
    DamageRateChangeAttackSkill: (pt) => {
      const attackData = attackDataFromPart(pt)
      return [
        attackData,
        {
          ...attackData,
          name: pt.name + ' / ' + pt.cond,
          power: pt.power.map((x) => x * pt.value[1]),
          multipliers: { ...pt.multipliers, dr: pt.value[0] },
        },
      ]
    },
    AttackByOwnDpRate: (pt) => [
      {
        ...attackDataFromPart(pt),
        extraParam: {
          name: 'dp%',
          type: 'number',
          min: 0,
          max: 100,
          default: 100,
          mul: (x) =>
            segip(
              [
                [0, pt.value[0]],
                [100, pt.value[1]],
              ],
              x,
            ),
        },
      },
    ],
    AttackBySp: (pt) => [
      {
        ...attackDataFromPart(pt),
        extraParam: {
          name: 'sp',
          type: 'integer',
          min: 1,
          max: pt.value[0],
          default: pt.value[0],
          mul: (x) =>
            segip(
              [
                [0, 0],
                [pt.value[0], 1],
              ],
              x,
            ),
        },
      },
    ],
    FixedHpDamageRateAttack: (pt) => [
      {
        ...attackDataFromPart(pt),
      },
    ],
  })
}

export type Multiplier =
  | 'Attack'
  | 'AttackUp'
  | 'DefenseDown'
  | 'DpDefDown'
  | 'ResistDown'
  | 'MindEye'
  | 'Fragile'
  | 'CriticalDamageUp'
  | 'Field'
  | 'Funnel'
  | 'SuperBreak'
  | 'NotMultiplier'

export function multerOfPart(part: Part): Multiplier {
  switch (part.skill_type) {
    case 'AttackByOwnDpRate':
    case 'AttackBySp':
    case 'AttackSkill':
    case 'PenetrationCriticalAttack':
    case 'TokenAttack':
    case 'DamageRateChangeAttackSkill':
      return 'Attack'
    case 'AttackUp':
      return 'AttackUp'
    case 'DefenseDown':
      if (part.multipliers.hp === 0) {
        return 'DpDefDown'
      } else if (part.target_type === 'Single' || part.target_type === 'All') {
        return 'DefenseDown'
      } else {
        return 'NotMultiplier'
      }
    case 'ResistDown':
      return 'ResistDown'
    case 'MindEye':
      return 'MindEye'
    case 'Fragile':
      return 'Fragile'
    case 'Funnel':
      return 'Funnel'
    case 'RiceFieldZone':
    case 'Zone':
      return 'Field'
    case 'CriticalDamageUp':
      return 'CriticalDamageUp'
    case 'SuperBreak':
      return 'SuperBreak'
    default:
      return 'NotMultiplier'
  }
}

const tpNuke = (nuke: Part, ePar: number, border: number) => {
  const line: [number, number][] = [
    [-nuke.diff_for_max / 2, 0],
    [0, nuke.power[0]],
    [nuke.diff_for_max, nuke.power[1]],
  ]
  const truePower = segip(line, ePar - border)
  const truePowerCritical = segip(line, ePar - (border - 50))
  return [truePower, truePowerCritical]
}

const tpBuff = (part: Part, ePar: number) => {
  return segip(
    [
      [0, part.power[0]],
      [part.diff_for_max, part.power[1]],
    ],
    ePar,
  )
}

const tpDebuff = (part: Part, ePar: number, border: number) => {
  return segip(
    [
      [0, part.power[0]],
      [part.diff_for_max, part.power[1]],
    ],
    ePar - border,
  )
}

const tpFunnel = (part: Part) => {
  return Math.max(...part.power) * part.value[0]
}

const tpZone = (part: Part) => {
  return part.power[0]
}

export type WeakMultiplier = Record<SType | Element, number>

export function genWeakMultiplier(resist: Resist[]): WeakMultiplier {
  const weakMult = {
    Slash: 1,
    Stab: 1,
    Strike: 1,
    Fire: 1,
    Ice: 1,
    Thunder: 1,
    Light: 1,
    Dark: 1,
    Nonelement: 1,
  }
  for (const [typ, rate] of resist) {
    if (typ === 'IgnorePenetration') {
      return {
        Slash: 1,
        Stab: 1,
        Strike: 1,
        Fire: 1,
        Ice: 1,
        Thunder: 1,
        Light: 1,
        Dark: 1,
        Nonelement: 1,
      }
    } else {
      weakMult[typ] = (100 - rate) / 100
    }
  }
  return weakMult
}

type LimitBreak = 0 | 1 | 2 | 3 | 4
type StyleLB = [string, LimitBreak]
type Team5 = [StyleLB, StyleLB, StyleLB, StyleLB, StyleLB]
type Team6 = [StyleLB, StyleLB, StyleLB, StyleLB, StyleLB, StyleLB]

export function optimizedParam(
  target: 'HP+' | 'DP+' | 'NO' | 'INT' | 'CON' | 'DBF' | 'DS+' | 'DI+',
  border: number,
  style: string,
  limit_break: LimitBreak,
  level: number,
) {
  switch (target) {
    case 'HP+':
    case 'DP+':
      return [408, 438, 470, 504, 541][limit_break]
    case 'NO':
      return [386, 416, 447, 481, 517][limit_break]
    case 'INT':
      return [467, 498, 532, 567, 604][limit_break]
    case 'CON':
      return [432, 462, 495, 529, 565][limit_break]
    case 'DBF':
    case 'DI+':
      return [413, 442, 474, 508, 544][limit_break]
    case 'DS+':
      return [400, 430, 462, 496, 532][limit_break]
    default:
      throw new Error(`${target} is not a valid param target`)
  }
}

type NukeLikePart = Part & {
  skill_type:
    | 'AttackByOwnDpRate'
    | 'AttackBySp'
    | 'AttackSkill'
    | 'PenetrationCriticalAttack'
    | 'TokenAttack'
    | 'DamageRateChangeAttackSkill'
}

function isNuke(part: Part): part is NukeLikePart {
  return [
    'AttackByOwnDpRate',
    'AttackBySp',
    'AttackSkill',
    'PenetrationCriticalAttack',
    'TokenAttack',
    'DamageRateChangeAttackSkill',
  ].includes(part.skill_type)
}

export type GenTeam = {
  team: Team6
  power: number
}

export function estimatePower(
  border: number,
  weakMult: WeakMultiplier,
  ejector: StyleLB,
  nuke: NukeLikePart,
  teamRest: Team5,
): number {
  if (teamRest.length > 5) {
    throw new Error(`too huge team ${JSON.stringify(teamRest)}`)
  }
  const style = styleByLabel[ejector[0]]
  if (style === undefined) {
    throw new Error(`${ejector[0]} is not a valid style`)
  }
  const opt = nuke.multipliers.dp > 0 ? 'DP+' : nuke.multipliers.hp > 0 ? 'HP+' : 'NO'
  return tpNuke(nuke, optimizedParam(opt, border, ejector[0], ejector[1], 120), border)[1]
}

export function randomChoice<T>(lst: T[]): T {
  return lst[Math.trunc(Math.random() * lst.length)]
}

export function charaFromStyle(style: string) {
  const found = styleByLabel[style]
  if (found === undefined) {
    throw new Error(`${style} is not a valid style`)
  }
  return found.chara_label
}

export function genTeamGivenAttack(
  border: number,
  weakMult: WeakMultiplier,
  ejector: StyleLB,
  nuke: NukeLikePart & PartExt<null>,
  box: StyleLB[],
): GenTeam[] {
  const result: GenTeam[] = []
  for (let run = 0; run < 10; run++) {
    console.log(`${ejector} doing ${nuke.label} run ${run}`)
    const tmp: StyleLB[] = []
    const chars = new Set<string>()
    for (let i = 0; i < 5; i++) {
      const swap = randomChoice(box.filter(([style]) => !chars.has(charaFromStyle(style))))
      tmp.push(swap)
      chars.add(charaFromStyle(swap[0]))
    }
    let teamRest = tmp as Team5
    let power = estimatePower(border, weakMult, ejector, nuke, teamRest)
    for (const swap of box) {
      const chara = charaFromStyle(swap[0])
      if (chars.has(chara)) {
        const newRest = teamRest.map(([st, lb]) => (charaFromStyle(st) === chara ? swap : [st, lb])) as Team5
        const newPower = estimatePower(border, weakMult, ejector, nuke, newRest)
        if (newPower > power) {
          teamRest = newRest
          power = newPower
        }
      } else {
        for (let swapInto = 0; swapInto < 5; swapInto++) {
          const newRest = Array.from(teamRest) as Team5
          newRest[swapInto] = swap
          const newPower = estimatePower(border, weakMult, ejector, nuke, newRest)
          if (newPower > power) {
            chars.delete(charaFromStyle(teamRest[swapInto][0]))
            teamRest = newRest
            power = newPower
            chars.add(swap[0])
          }
        }
      }
    }
    result.push({
      team: [ejector, ...teamRest] as Team6,
      power: power,
    })
  }
  return result
}

export function genTeam(border: number, weakMult: WeakMultiplier, box: StyleLB[], ex_only: boolean): GenTeam[] {
  let result: GenTeam[] = []
  for (const ejector of box) {
    const style = styleByLabel[ejector[0]]
    if (style === undefined) {
      throw new Error(`${ejector[0]} is not a valid style`)
    }
    for (const skill of styleCanUseSkills(style)) {
      if (ex_only && !skill.is_restricted) continue
      for (const part of partsFromSkills<null>([{ ...skill, ownerParams: null }])) {
        if (isNuke(part)) {
          const newResult = genTeamGivenAttack(border, weakMult, ejector, part, box)
          result = result.concat(newResult)
        }
      }
    }
  }
  return result
}
