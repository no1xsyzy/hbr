#!/usr/bin/env node
/* global console */
import { mkdirSync, readFileSync, writeFileSync } from 'fs'

// load
const styles = JSON.parse(readFileSync('./data_hbr/styles.json', 'utf-8'))

// main
const sqls = [
  `CREATE TABLE styles (
id int, label char, chara_label char, name char, tier char, role char, type char,
image char, generalize boolean
);`,
  `CREATE TABLE skills (
style_id int, id int, label char, effect char, target_type char, hit_count int,
use_count int, sp_cost int, is_ex boolean, is_advanced boolean
);`,
  `CREATE TABLE parts (
skill_id int, skill_type char, diff_for_max int, multipliers_dp real, multipliers_hp real, multipliers_dr real,
parameters_str int, parameters_dex int, parameters_con int, parameters_spr int, parameters_wis int, parameters_luk int,
power0 real, power1 real, growth0 real, growth1 real, value0 real, value1 real,
target_type char, type char,
effect_category char, effect_limitType char, effect_exitCond char, effect_exitVal_0 int, effect_exitVal_1 int,
target_condition char
);`,
  `CREATE TABLE passives (
style_id int, limit_break int, label char, effect char, timing char, condition char
);`,
]

export function is_part_nested(part) {
  return ['SkillRandom', 'SkillCondition', 'SkillSwitch'].includes(part.skill_type)
}

function addStatement(...statements) {
  for (const statement of statements) {
    if (!statement) {
      return
    }
    if (!statement.endsWith(';')) {
      console.warn(`statement not end with semicolon: <<${statement}>>`)
    }
    if (!sqls.includes(statement)) {
      sqls.push(statement)
    }
  }
}

function addSkillRecursive(style_id, skill) {
  addStatement(
    `INSERT INTO skills (
${style_id}, ${skill.id}, "${skill.label}", "${skill.effect}", "${skill.target_type}", ${skill.hit_count},
${skill.use_count === -1 ? 999 : skill.use_count.at(-1)}, ${skill.sp_cost}, ${+skill.is_restricted}, ${+skill.is_adv}
);`,
  )

  for (const part of skill.parts) {
    addStatement(
      `INSERT INTO parts (
${skill.id}, "${part.skill_type}", ${part.diff_for_max}, ${part.multipliers.dp}, ${part.multipliers.hp}, ${part.multipliers.dr},
${part.parameters.str}, ${part.parameters.dex}, ${part.parameters.con}, ${part.parameters.spr}, ${part.parameters.wis}, ${part.parameters.luk},
${part.power[0]}, ${part.power[1]}, ${part.growth[0]}, ${part.growth[1]}, ${part.value[0]}, ${part.value[1]},
"${part.target_type}", "${part.type}",
"${part.effect.category}", "${part.effect.limitType}", "${part.effect.exitCond}", ${part.effect.exitVal[0]}, ${part.effect.exitVal[1]},
"${part.target_condition}"
);`,
    )
    if (is_part_nested(part)) {
      for (const subskill of part.strval) {
        addSkillRecursive(skill.id, subskill)
      }
    }
  }
}

function addPassive(style_id, limit_break_step, passive) {
  addStatement(
    `INSERT INTO passives (
${style_id}, ${limit_break_step}, "${passive.label}", "${passive.effect}", "${passive.timing}", "${passive.condition}"
);`,
  )
}

function addStyle(style) {
  addStatement(
    `INSERT INTO styles VALUES (
${style.id}, "${style.label}", "${style.chara_label}", "${style.name}", "${style.tier}", "${style.role}", "${style.type}",
"${style.image}", ${+style.generalize}
);`,
  )

  // skills
  for (const skill of style.skills) {
    addSkillRecursive(style.id, skill)
  }

  // passives
  for (const passive of style.passives) {
    addPassive(style.id, 0, passive)
  }
  for (const lb of style.limit_break.bonus_per_level) {
    for (const bonus of lb.bonus) {
      if (bonus.category === 'Passive') {
        addPassive(style.id, lb.step, bonus)
      }
    }
  }
}

for (const style of styles) {
  addStyle(style)

  // skills
  for (const skill of style.skills) {
    addSkillRecursive(style.id, skill)
  }

  // passives
  for (const passive of style.passives) {
    addPassive(style.id, 0, passive)
  }
  for (const lb of style.limit_break.bonus_per_level) {
    for (const bonus of lb.bonus) {
      if (bonus.category === 'Passive') {
        addPassive(style.id, lb.step, bonus)
      }
    }
  }
}

// write
mkdirSync('./data_gen', { recursive: true })
writeFileSync('./data_gen/hbr.sql', sqls.join('\n'), 'utf-8')
