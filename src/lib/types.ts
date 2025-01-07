export type SType = 'Slash' | 'Stab' | 'Strike'
export type Element = 'Fire' | 'Ice' | 'Thunder' | 'Light' | 'Dark' | 'Nonelement'
export type HitType = 'Main' | 'Before' | 'After'
export type Team = '31A' | '31B' | '31C' | '31D' | '31E' | '31F' | '30G' | '31X' | 'Angel Beats!' | 'Angel Beats'
export type Role = 'Attacker' | 'Breaker' | 'Debuffer' | 'Buffer' | 'Healer' | 'Defender' | 'Blaster' | 'Admiral'
export type Tier = 'A' | 'S' | 'SS'
export type Resist = [SType | Element, number] | ['IgnorePenetration', true]

export enum AbilityType {
  CriticalRate = 'CriticalRate',
  Dexterity = 'Dexterity',
  Dp = 'Dp',
  Generalize = 'Generalize',
  Luck = 'Luck',
  ParamAll = 'ParamAll',
  PassiveSkill = 'PassiveSkill',
  Power = 'Power',
  PursuitRateSlash = 'PursuitRateSlash',
  PursuitRateStab = 'PursuitRateStab',
  PursuitRateStrike = 'PursuitRateStrike',
  Skill = 'Skill',
  SkillEvolution = 'SkillEvolution',
  SkillGrowthAbility = 'SkillGrowthAbility',
  SkillLimitBreak = 'SkillLimitBreak',
  Sp = 'Sp',
  Spirit = 'Spirit',
  Toughness = 'Toughness',
  Wisdom = 'Wisdom',
}

export interface Hit {
  id: number
  type: HitType
  power_ratio: number
}

export interface Multipliers {
  dp: number
  hp: number
  dr: number
}

export interface StrvalSkill {
  strval: Skill[]
}

export interface StrvalEnemyTag {
  strval: [string, -1]
}

export interface NoStrval {
  strval: [-1 | null, -1 | null]
}

export interface NoCond {
  cond: ''
}

export interface WithCond {
  cond: string
}

export interface NoSstl {
  sstl: null
}

export interface WithSstl {
  sstl: string[]
}

export interface SkillPartParameters {
  str: 0 | 1 | 2
  wis: 0 | 1 | 2
  dex: 0 | 1 | 2
  spr: 0 | 1 | 2
  luk: 0 | 1 | 2
  con: 0 | 1 | 2
}

export interface Effect {
  category: string
  limitType: string
  exitCond: string
  exitVal: [number, number]
}

export type SkillTypeIndentifier =
  // AdditionalHitOn*
  | 'AdditionalHitOnAttacked'
  | 'AdditionalHitOnBreaking'
  | 'AdditionalHitOnExtraSkill'
  | 'AdditionalHitOnKill'
  | 'AdditionalHitOnKillCount'
  | 'AdditionalHitOnRemovingBuff'
  // Nested Parts
  | 'SkillCondition'
  | 'SkillRandom'
  | 'SkillSwitch'
  // Normal Parts
  | 'AdditionalTurn'
  | 'AllStatusUpValue'
  | 'ArrowCherryBlossoms'
  | 'AttackByOwnDpRate'
  | 'AttackBySp'
  | 'AttackDown'
  | 'AttackNormal'
  | 'AttackSkill'
  | 'AttackUp'
  | 'AttackUpIncludeNormal'
  | 'AttackUpPerToken'
  | 'Babied'
  | 'BreakDownTurnUp'
  | 'BreakGuard'
  | 'BuffCharge'
  | 'ConfusionRandom'
  | 'Cover'
  | 'CriticalDamageUp'
  | 'CriticalRateDown'
  | 'CriticalRateUp'
  | 'DamageRateChangeAttackSkill'
  | 'DamageRateResistDown'
  | 'DamageRateResistUp'
  | 'DamageRateUp'
  | 'DamageSp'
  | 'DebuffGuard'
  | 'DefenseDown'
  | 'DefenseUp'
  | 'DefenseUpFromEnemyGroup'
  | 'DefenseUpPerToken'
  | 'Dodge'
  | 'DoubleActionExtraSkill'
  | 'Diva'
  | 'EternalOath'
  | 'FightingSpirit'
  | 'FixedHpDamageRate'
  | 'FixedHpDamageRateAttack'
  | 'Fragile'
  | 'Funnel'
  | 'GiveAttackBuffUp'
  | 'GiveDebuffTurnUp'
  | 'GiveDebuffUp'
  | 'GiveDefenseDebuffUp'
  | 'GiveHealUp'
  | 'Hacking'
  | 'HealDown'
  | 'HealDp'
  | 'HealDpByDamage'
  | 'HealDpRate'
  | 'HealSkillUsedCount'
  | 'HealSp'
  | 'HealSpOnPreTurn'
  | 'HealSpRandom'
  | 'ImprisonRandom'
  | 'Invincible'
  | 'MemorySpirit'
  | 'MindEye'
  | 'Misfortune'
  | 'Morale'
  | 'OverDrivePointDown'
  | 'OverDrivePointUp'
  | 'OverDrivePointUpRandom'
  | 'PenetrationCriticalAttack'
  | 'Provoke'
  | 'RecoilRandom'
  | 'ReduceSp'
  | 'RegenerationDp'
  | 'RemoveBuff'
  | 'RemoveSpecialStatus'
  | 'ResistDown'
  | 'ResistDownOverwrite'
  | 'ResistUp'
  | 'Restraint'
  | 'ReviveDp'
  | 'ReviveDpRate'
  | 'RiceFieldZone'
  | 'SelfDamage'
  | 'ShadowClone'
  | 'Shredding'
  | 'SkillLimitCountUp'
  | 'SpecifySp'
  | 'StunRandom'
  | 'SuperBreak'
  | 'TokenAttack'
  | 'TokenChangeTimeline'
  | 'TokenSet'
  | 'TokenSetByAttacked'
  | 'TokenSetByAttacking'
  | 'TokenSetByHealedDp'
  | 'ToughnessUpValue'
  | 'Zone'
  | 'ZoneUpEternal'

export type TargetType =
  | 'Single'
  | 'All'
  | 'Self'
  | 'AllyFront'
  | 'AllyAll'
  | 'AllySub'
  | 'AllySingle'
  | 'AllyAllWithoutSelf'
  | 'AllySingleWithoutSelf'
  | 'Field'
  | 'None'

export interface SkillPartBase {
  skill_type: SkillTypeIndentifier
  target_type: TargetType
  type: SType | null
  elements: Element[]
  power: number[]
  value: number[]
  dv: number
  multipliers: Multipliers
  diff_for_max: number
  parameters: SkillPartParameters
  growth: number[]
  hits: Hit[]
  hit_condition: string
  target_condition: string
  effect: Effect
}

export type SkillPart0<x> = SkillPartBase & NoCond & NoSstl & NoStrval & { skill_type: x }
export type SkillPartWithCond<x> = SkillPartBase & WithCond & NoSstl & NoStrval & { skill_type: x }
export type SkillPartWithSstl<x> = SkillPartBase & NoCond & WithSstl & NoStrval & { skill_type: x }
export type SkillPartWithCondStrval<x> = SkillPartBase & WithCond & NoSstl & StrvalSkill & { skill_type: x }
export type SkillPartWithStrval<x> = SkillPartBase & NoCond & NoSstl & StrvalSkill & { skill_type: x }
export type SkillPartWithStrvalEnemyTag<x> = SkillPartBase & NoCond & NoSstl & StrvalEnemyTag & { skill_type: x }

// AdditionalHitOn*
export type AdditionalHitOnAttacked = SkillPart0<'AdditionalHitOnAttacked'>
export type AdditionalHitOnBreaking = SkillPart0<'AdditionalHitOnBreaking'>
export type AdditionalHitOnExtraSkill = SkillPart0<'AdditionalHitOnExtraSkill'>
export type AdditionalHitOnKill = SkillPart0<'AdditionalHitOnKill'>
export type AdditionalHitOnKillCount = SkillPart0<'AdditionalHitOnKillCount'>
export type AdditionalHitOnRemovingBuff = SkillPart0<'AdditionalHitOnRemovingBuff'>
// Nested Parts
export type SkillCondition = SkillPartWithCondStrval<'SkillCondition'>
export type SkillRandom = SkillPartWithStrval<'SkillRandom'>
export type SkillSwitch = SkillPartWithStrval<'SkillSwitch'>
// Normal Parts
export type AdditionalTurn = SkillPart0<'AdditionalTurn'>
export type AllStatusUpValue = SkillPart0<'AllStatusUpValue'>
export type ArrowCherryBlossoms = SkillPart0<'ArrowCherryBlossoms'>
export type AttackByOwnDpRate = SkillPart0<'AttackByOwnDpRate'>
export type AttackBySp = SkillPart0<'AttackBySp'>
export type AttackDown = SkillPart0<'AttackDown'>
export type AttackNormal = SkillPart0<'AttackNormal'>
export type AttackSkill = SkillPart0<'AttackSkill'>
export type AttackUp = SkillPart0<'AttackUp'>
export type AttackUpIncludeNormal = SkillPart0<'AttackUpIncludeNormal'>
export type AttackUpPerToken = SkillPart0<'AttackUpPerToken'>
export type Babied = SkillPart0<'Babied'>
export type BreakDownTurnUp = SkillPart0<'BreakDownTurnUp'>
export type BreakGuard = SkillPart0<'BreakGuard'>
export type BuffCharge = SkillPart0<'BuffCharge'>
export type ConfusionRandom = SkillPart0<'ConfusionRandom'>
export type Cover = SkillPart0<'Cover'>
export type CriticalDamageUp = SkillPart0<'CriticalDamageUp'>
export type CriticalRateDown = SkillPart0<'CriticalRateDown'>
export type CriticalRateUp = SkillPart0<'CriticalRateUp'>
export type DamageRateChangeAttackSkill = SkillPartWithCond<'DamageRateChangeAttackSkill'>
export type DamageRateResistDown = SkillPart0<'DamageRateResistDown'>
export type DamageRateResistUp = SkillPart0<'DamageRateResistUp'>
export type DamageRateUp = SkillPart0<'DamageRateUp'>
export type DamageSp = SkillPart0<'DamageSp'>
export type DebuffGuard = SkillPart0<'DebuffGuard'>
export type DefenseDown = SkillPart0<'DefenseDown'>
export type DefenseUp = SkillPart0<'DefenseUp'>
export type DefenseUpFromEnemyGroup = SkillPartWithStrvalEnemyTag<'DefenseUpFromEnemyGroup'>
export type DefenseUpPerToken = SkillPart0<'DefenseUpPerToken'>
export type Dodge = SkillPart0<'Dodge'>
export type DoubleActionExtraSkill = SkillPart0<'DoubleActionExtraSkill'>
export type Diva = SkillPart0<'Diva'>
export type EternalOath = SkillPart0<'EternalOath'>
export type FightingSpirit = SkillPart0<'FightingSpirit'>
export type FixedHpDamageRate = SkillPart0<'FixedHpDamageRate'>
export type FixedHpDamageRateAttack = SkillPart0<'FixedHpDamageRateAttack'>
export type Fragile = SkillPart0<'Fragile'>
export type Funnel = SkillPart0<'Funnel'>
export type GiveAttackBuffUp = SkillPart0<'GiveAttackBuffUp'>
export type GiveDebuffTurnUp = SkillPart0<'GiveDebuffTurnUp'>
export type GiveDebuffUp = SkillPart0<'GiveDebuffUp'>
export type GiveDefenseDebuffUp = SkillPart0<'GiveDefenseDebuffUp'>
export type GiveHealUp = SkillPart0<'GiveHealUp'>
export type Hacking = SkillPart0<'Hacking'>
export type HealDown = SkillPart0<'HealDown'>
export type HealDp = SkillPart0<'HealDp'>
export type HealDpByDamage = SkillPart0<'HealDpByDamage'>
export type HealDpRate = SkillPart0<'HealDpRate'>
export type HealSkillUsedCount = SkillPart0<'HealSkillUsedCount'>
export type HealSp = SkillPart0<'HealSp'>
export type HealSpOnPreTurn = SkillPart0<'HealSpOnPreTurn'>
export type HealSpRandom = SkillPart0<'HealSpRandom'>
export type ImprisonRandom = SkillPart0<'ImprisonRandom'>
export type Invincible = SkillPart0<'Invincible'>
export type MemorySpirit = SkillPart0<'MemorySpirit'>
export type MindEye = SkillPart0<'MindEye'>
export type Misfortune = SkillPart0<'Misfortune'>
export type Morale = SkillPart0<'Morale'>
export type OverDrivePointDown = SkillPart0<'OverDrivePointDown'>
export type OverDrivePointUp = SkillPart0<'OverDrivePointUp'>
export type OverDrivePointUpRandom = SkillPart0<'OverDrivePointUpRandom'>
export type PenetrationCriticalAttack = SkillPart0<'PenetrationCriticalAttack'>
export type Provoke = SkillPart0<'Provoke'>
export type RecoilRandom = SkillPart0<'RecoilRandom'>
export type ReduceSp = SkillPart0<'ReduceSp'>
export type RegenerationDp = SkillPart0<'RegenerationDp'>
export type RemoveBuff = SkillPart0<'RemoveBuff'>
export type RemoveSpecialStatus = SkillPartWithSstl<'RemoveSpecialStatus'>
export type ResistDown = SkillPart0<'ResistDown'>
export type ResistDownOverwrite = SkillPart0<'ResistDownOverwrite'>
export type ResistUp = SkillPart0<'ResistUp'>
export type Restraint = SkillPart0<'Restraint'>
export type ReviveDp = SkillPart0<'ReviveDp'>
export type ReviveDpRate = SkillPart0<'ReviveDpRate'>
export type RiceFieldZone = SkillPart0<'RiceFieldZone'>
export type SelfDamage = SkillPart0<'SelfDamage'>
export type ShadowClone = SkillPart0<'ShadowClone'>
export type Shredding = SkillPart0<'Shredding'>
export type SkillLimitCountUp = SkillPart0<'SkillLimitCountUp'>
export type SpecifySp = SkillPart0<'SpecifySp'>
export type StunRandom = SkillPart0<'StunRandom'>
export type SuperBreak = SkillPartWithCond<'SuperBreak'>
export type TokenAttack = SkillPart0<'TokenAttack'>
export type TokenChangeTimeline = SkillPart0<'TokenChangeTimeline'>
export type TokenSet = SkillPart0<'TokenSet'>
export type TokenSetByAttacked = SkillPart0<'TokenSetByAttacked'>
export type TokenSetByAttacking = SkillPart0<'TokenSetByAttacking'>
export type TokenSetByHealedDp = SkillPart0<'TokenSetByHealedDp'>
export type ToughnessUpValue = SkillPart0<'ToughnessUpValue'>
export type Zone = SkillPart0<'Zone'>
export type ZoneUpEternal = SkillPart0<'ZoneUpEternal'>

export type AdditionalHitPart =
  | AdditionalHitOnAttacked
  | AdditionalHitOnBreaking
  | AdditionalHitOnExtraSkill
  | AdditionalHitOnKill
  | AdditionalHitOnKillCount
  | AdditionalHitOnRemovingBuff

export type NormalPart =
  | AdditionalTurn
  | AllStatusUpValue
  | ArrowCherryBlossoms
  | AttackByOwnDpRate
  | AttackBySp
  | AttackDown
  | AttackNormal
  | AttackSkill
  | AttackUp
  | AttackUpIncludeNormal
  | AttackUpPerToken
  | Babied
  | BreakDownTurnUp
  | BreakGuard
  | BuffCharge
  | ConfusionRandom
  | Cover
  | CriticalDamageUp
  | CriticalRateDown
  | CriticalRateUp
  | DamageRateChangeAttackSkill
  | DamageRateResistDown
  | DamageRateResistUp
  | DamageRateUp
  | DamageSp
  | DebuffGuard
  | DefenseDown
  | DefenseUp
  | DefenseUpFromEnemyGroup
  | DefenseUpPerToken
  | Dodge
  | DoubleActionExtraSkill
  | Diva
  | EternalOath
  | FightingSpirit
  | FixedHpDamageRate
  | FixedHpDamageRateAttack
  | Fragile
  | Funnel
  | GiveAttackBuffUp
  | GiveDebuffTurnUp
  | GiveDebuffUp
  | GiveDefenseDebuffUp
  | GiveHealUp
  | Hacking
  | HealDown
  | HealDp
  | HealDpByDamage
  | HealDpRate
  | HealSkillUsedCount
  | HealSp
  | HealSpOnPreTurn
  | HealSpRandom
  | ImprisonRandom
  | Invincible
  | MemorySpirit
  | MindEye
  | Misfortune
  | Morale
  | OverDrivePointDown
  | OverDrivePointUp
  | OverDrivePointUpRandom
  | PenetrationCriticalAttack
  | Provoke
  | RecoilRandom
  | ReduceSp
  | RegenerationDp
  | RemoveBuff
  | RemoveSpecialStatus
  | ResistDown
  | ResistDownOverwrite
  | ResistUp
  | Restraint
  | ReviveDp
  | ReviveDpRate
  | RiceFieldZone
  | SelfDamage
  | ShadowClone
  | Shredding
  | SkillLimitCountUp
  | SpecifySp
  | StunRandom
  | SuperBreak
  | TokenAttack
  | TokenChangeTimeline
  | TokenSet
  | TokenSetByAttacked
  | TokenSetByAttacking
  | TokenSetByHealedDp
  | ToughnessUpValue
  | Zone
  | ZoneUpEternal

export type NestedPart = SkillRandom | SkillCondition | SkillSwitch

export type Part = AdditionalHitPart | NormalPart | NestedPart

export type NormalParts = NormalPart[]
export type NestedParts = [NestedPart]
export type AdditionalHitParts = [AdditionalHitPart, NormalPart]
export type Parts = NormalParts | NestedParts | AdditionalHitParts

export interface Skill {
  id: number
  label: string
  name: string
  desc: string
  hit_count: number
  target_type: string
  is_restricted: number
  auto_priority: number
  is_adv: boolean
  use_count: -1 | number[]
  sp_cost: number
  max_level: number
  overwrite: number
  effect: string
  cond: string
  parts: Parts
  hits: Hit[]
  in_date: string

  is_strval?: true
  image?: string
  style?: string
  team?: Team
  chara?: string
  role?: string
}

export interface AbilityTree {
  label: string
  name: string
  ability_list: Ability[]
}

export interface Style {
  id: number
  label: string
  chara_label: string
  type: SType
  chara: string
  name: string
  tier: Tier
  team: Team
  role: Role
  generalize: boolean
  elements: Element[]
  skills: Skill[]
  passives: Passive[]
  limit_break: {
    stat_up_per_level: number
    bonus_per_level: {
      step: number
      piece_num: number
      level_cap: number
      bonus: (Passive | Ability)[]
    }[]
  }
  ability_tree: AbilityTree[]
  in_date: string
}

export interface Ability {
  category: 'Ability'
  type: AbilityType
  value_type: 'Addition' | 'Ratio' | 'RealNumber'
  value: [number, number]
  skill: number | null | Skill | PassiveWithParts
  is_exclusive?: boolean
}

export interface PassiveWithParts {
  category: 'Passive'
  label: string
  name: string
  desc: string
  info: string
  timing: string
  condition: string
  effect: string
  auto_type: 'None'
  parts: NormalParts | AdditionalHitParts
}

export interface PassiveOfPursuit {
  category: 'Passive'
  label: string
  name: '[Auto] 追撃'
  desc: '後衛時 前衛のスキル攻撃に 確率で追撃'
  info: '追撃'
  timing: 'None'
  condition: 'IsFront()==0'
  effect: ''
  auto_type: 'Pursuit'
  skill: Skill
}

export type Passive = PassiveWithParts | PassiveOfPursuit

export interface Character {
  cards: {
    label: string
    role: Role
    tier: Tier
    type: SType
    ele: Element[]
    skills: { l: string; n: string; c: string; u: string; e: string[][] }[]
  }[]
}

export interface Enemy {
  label: string
  name: string
  base_param: {
    dp: number
    hp: number
    param_border: number
    eg: { dp: number[] }
  }
  resist: Resist[]
}

export interface Battle {
  label: string
  enemy_list: Enemy[]
}

export interface ScoreAttackRuleBase {
  id: number
  label: string
  name: string
  desc: string
  grade: number
}

export type CommandPattern = {
  id: number
  order: number
  once: boolean
  condition: string
  target_weight: []
  skill_list: string[]
}[]

/** 将敌人行动修改为 *extra* */
export interface ScoreAttackRuleCommandPattern extends ScoreAttackRuleBase {
  type: 'CommandPattern'
  extra: CommandPattern[]
}

/** 在 *arg* 层 OverDrive 前不能使用 */
export interface ScoreAttackRuleLimitMinOverDriveLv extends ScoreAttackRuleBase {
  type: 'LimitMinOverDriveLv'
  arg: number
}

/** 限制 *roles* （如为 `null` 则针对所有角色）使用技能次数为 *arg* */
export interface ScoreAttackRuleLimitSkillByUsedCount extends ScoreAttackRuleBase {
  type: 'LimitSkillByUsedCount'
  roles: Role[] | null
  arg: number
}

/** 限制回合数到 *arg* */
export interface ScoreAttackRuleLimitTurnCount extends ScoreAttackRuleBase {
  type: 'LimitTurnCount'
  arg: number
}

/** 使 *target* 的 DP 改变 *arg*% */
export interface ScoreAttackRuleMaxDpRate extends ScoreAttackRuleBase {
  type: 'MaxDpRate'
  target: 'Enemy' | 'Member'
  arg: number
}

/** 敌人的 HP+*arg*% */
export interface ScoreAttackRuleMaxHpRate extends ScoreAttackRuleBase {
  type: 'MaxHpRate'
  arg: number
}

/** 根据 *timing* 对 *target* 施加 *parts* */
export interface ScoreAttackRuleSkillPart extends ScoreAttackRuleBase {
  type: 'SkillPart'
  target: 'Enemy' | 'Member'
  timing: ['OnBattleStart' | 'OnEveryTurn' | 'OnFirstBattleStart']
  parts: NormalParts
  interval: number
}

export type ScoreAttackRule =
  | ScoreAttackRuleCommandPattern
  | ScoreAttackRuleLimitMinOverDriveLv
  | ScoreAttackRuleLimitSkillByUsedCount
  | ScoreAttackRuleLimitTurnCount
  | ScoreAttackRuleMaxDpRate
  | ScoreAttackRuleMaxHpRate
  | ScoreAttackRuleSkillPart

export interface ScoreAttackBattle {
  /** difficulty */ d: number
  /** enemy labels */ b: string[]
  bn: ({
    /** name */ n: string
    /** break rate */ d: [number, number]
    /** resist */ r: Resist[]
  } | null)[]
  /** line for border */ rbl: number[]
  /** line for dp */ dl: number[]
  /** line for hp */ hl: number[]
  /** line for attack rate */ al: number[]
  /** damage bonus cap */ db: number
  /** difficulty score */ ds: number
  /** no break bonus */ nbb: number
  /** max turn bonus, only if score_calc.calc_ver == 0 */ mtb: number
  /** turn limit */ tl: number
}

export interface ScoreAttack {
  label: string
  desc: string
  score_calc: {
    calc_ver: 0 | 1 | 2
    /** 中值回合分加成 */ btr: number
    /** 第几回合等于中值加成 */ btcfr: number
    /** 最小回合分加成（第一回合取到） */ min_tr: number
    /** 最大回合分加成（最末回合取到） */ max_tr: number
    /** 伤害分系数 */ tmdc: number
  }
  battles: ScoreAttackBattle[]
  missions: { desc: string; reward: unknown[] }[]
  highscore: { score: number; reward: unknown[] }[]
  totalscore: { score: number; reward: unknown[] }[]
  rules: ScoreAttackRule[]
}

export interface Translation {
  [label: string]: {
    [k: string]: string
  }
}

export interface Accessory {
  id: number
  label: string
  image: string
  name: string
  text: string
  effects: Ability[]
  skill: Skill[]
}

export interface MasterSkill {
  id: number
  label: string
  chara: string
  chara_label: string
  skill: Skill
}

export type StyleList = Style[]
export type SkillList = Skill[]
export type ScoreAttackList = ScoreAttack[]
export type BattleList = Battle[]
export type Accessories = Accessory[]
export type MasterSkills = MasterSkill[]

export type SimpleTranslate = { [k: string]: string }

export type Ser = () => string
export type Des = (s: string) => void
