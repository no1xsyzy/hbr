import { styles } from './data'
import type { Style, Skill, NormalPart, SkillPartParameters, Multipliers } from './types'
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

export function skillsFromTeam<T>(team: { params: T; style: Style }[]): (Skill & { ownerParams: T })[] {
  return team
    .filter((p) => p)
    .flatMap((pl) => {
      const currentStyle = pl.style.label
      const currentChara = pl.style.chara_label
      const sameCharaStyles = styles.filter((s) => s.chara_label === currentChara)
      return sameCharaStyles.flatMap(({ generalize, skills, label }) => {
        return skills.flatMap((s) =>
          s.is_restricted === 0 || generalize || label == currentStyle ? [{ ...s, ownerParams: pl.params }] : [],
        )
      })
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
