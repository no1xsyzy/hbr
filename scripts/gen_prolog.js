#!/usr/bin/env node
/* global console */
import { mkdirSync, readFileSync, writeFileSync } from 'fs'
import check_gen from './check_gen.js'

const data = []

export function is_part_nested(part) {
  return ['SkillRandom', 'SkillCondition', 'SkillSwitch'].includes(part.skill_type)
}

function addStatement(...statements) {
  for (const statement of statements) {
    if (!statement) {
      return
    }
    if (!statement.endsWith('.')) {
      console.warn(`statement not end with dot: <<${statement}>>`)
    }
    if (!data.includes(statement)) {
      data.push(statement)
    }
  }
}

function addSkillRecursive(parentToken, skill) {
  addStatement(
    `has_skill('${parentToken}', 'Skill.${skill.label}').`,
    `category('Skill.${skill.label}', skill).`,
    `is_skill('Skill.${skill.label}').`,
    `name('Skill.${skill.label}', "${skill.name}").`,
    `skill_effect('Skill.${skill.label}', '${skill.effect}').`,
    `skill_target_type('Skill.${skill.label}', '${skill.target_type}').`,
    `skill_hit_count('Skill.${skill.label}', ${skill.hit_count}).`,
    `skill_use_count('Skill.${skill.label}', ${skill.use_count === -1 ? 999 : skill.use_count.at(-1)}).`,
    `skill_sp_cost('Skill.${skill.label}', ${skill.sp_cost}).`,
    skill.is_restricted ? `skill_is_ex('Skill.${skill.label}').` : '',
    skill.is_adv ? `skill_is_advanced('Skill.${skill.label}').` : '',
    skill.hit_count > 0
      ? `skill_hits('Skill.${skill.label}', ${JSON.stringify(
          skill.hits.length > 0
            ? skill.hits.map((hit) => hit.power_ratio)
            : Array(skill.hit_count).fill(1 / skill.hit_count),
        )}).`
      : '',
  )
  const counter = {}
  for (const part of skill.parts) {
    counter[part.skill_type] = (counter[part.skill_type] ?? 0) + 1
    const partToken =
      counter[part.skill_type] === 1
        ? `Skill.${skill.label}/Part.${part.skill_type}`
        : `Skill.${skill.label}/Part.${part.skill_type}+${counter[part.skill_type]}`
    // if (counter[part.skill_type] > 1) console.warn(`Skill.${skill.label} has more than one Part.${part.skill_type}`)

    addStatement(
      `is_part('${partToken}').`,
      `skill_part('Skill.${skill.label}', '${part.skill_type}', '${partToken}').`,
      `diff_for_max('${partToken}', ${part.diff_for_max}).`,
      ...part.elements.map((el) => `element('${partToken}', '${el}').`),
      `dp('${partToken}', ${part.multipliers.dp}).`,
      `hp('${partToken}', ${part.multipliers.hp}).`,
      `dr('${partToken}', ${part.multipliers.dr}).`,
      `parameters('${partToken}',` +
        ` ${part.parameters.str}, ${part.parameters.dex},` +
        ` ${part.parameters.con}, ${part.parameters.spr},` +
        ` ${part.parameters.wis}, ${part.parameters.luk}).`,
      // ...Object.entries(part.parameters).map((k, v) => (v > 0 ? `parameter('${partToken}', '${k}', ${v}).` : '')),
      `power('${partToken}', ${part.power[0]}, ${part.power[1]}).`,
      `target_type('${partToken}', '${part.target_type}').`,
      `stype('${partToken}', '${part.type}').`,
      `growth('${partToken}', ${part.growth[0]}, ${part.growth[1]}).`,
      ...part.hits.map((h) => `hit_at('${partToken}', '${h.type}').`),
      `effect('${partToken}', '${part.effect.category}', '${part.effect.limitType}', '${part.effect.exitCond}', '${part.effect.exitVal}').`,
      ...(part.target_condition === '' ? [] : [`target_cond('${partToken}', "${part.target_condition}").`]),
    )
    if (is_part_nested(part)) {
      for (const subskill of part.strval) {
        addSkillRecursive(partToken, subskill)
      }
    }
  }
}

function addPassive(style, limit_break_step, passive) {
  addStatement(`category('${passive.label}', passive).`)
  addStatement(`is_passive('${passive.label}').`)
  addStatement(`style_passive('Style.${style.label}', ${limit_break_step}, '${passive.label}').`)
  addStatement(`passive_effect('${passive.label}', '${passive.effect}').`)
  addStatement(`passive_timing('${passive.label}', '${passive.timing}').`)
  addStatement(`passive_cond('${passive.label}', '${passive.condition}').`)
  if (passive.effect === 'HealSp') {
    const x = passive.parts.find((pt) => pt.skill_type === 'HealSp')
    if (x === undefined) {
      console.warn(`passive '${passive.label}' is HealSp without power`)
    } else {
      addStatement(`passive_healsp_amount('${passive.label}', ${x.power[0]}).`)
    }
  }
}

function addStyle(style) {
  addStatement(`category('Style.${style.label}', style).`)
  addStatement(`is_style('Style.${style.label}').`)
  addStatement(`chara_style('Character.${style.chara_label}', 'Style.${style.label}').`)
  addStatement(`name('Style.${style.label}', "${style.name}").`)
  addStatement(`style_tier('Style.${style.label}', '${style.tier}').`)
  addStatement(`style_role('Style.${style.label}', '${style.role}').`)
  addStatement(`style_type('Style.${style.label}', '${style.type}').`)
  if (style.generalize) addStatement(`style_generalize('Style.${style.label}').`)

  // skills
  for (const skill of style.skills) {
    addSkillRecursive(`Style.${style.label}`, skill)
  }

  // passives
  for (const passive of style.passives) {
    addPassive(style, 0, passive)
  }
  for (const lb of style.limit_break.bonus_per_level) {
    for (const bonus of lb.bonus) {
      if (bonus.category === 'Passive') {
        addPassive(style, lb.step, bonus)
      }
    }
  }
}

const fromfile = './data_hbr/styles.json'
const tofile = './data_gen/hbr.pl'

if (check_gen({ froms: [fromfile], tos: [tofile] })) {
  const styles = JSON.parse(readFileSync(fromfile, 'utf-8'))

  for (const style of styles) {
    addStyle(style)
  }

  mkdirSync('./data_gen', { recursive: true })
  writeFileSync(tofile, data.join('\n'), 'utf-8')
}
