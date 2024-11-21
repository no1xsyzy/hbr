#!/usr/bin/env node
/* global console */
import { mkdirSync, readFileSync, writeFileSync } from 'fs'
import check_gen from './check_gen.js'

// load

// main
const sqls = [
  `CREATE TABLE styles
   (
       id          int,
       label       char,
       chara_label char,
       name        char,
       tier        char,
       role        char,
       type        char,
       image       char,
       generalize  boolean
   );`,
  `CREATE TABLE subskills
   (
       container int,
       skill_id  int
   );`,
  `CREATE TABLE skills
   (
       id          int,
       label       char,
       effect      char,
       target_type char,
       hit_count   int,
       use_count   int,
       sp_cost     int,
       is_ex       boolean,
       is_advanced boolean
   );`,
  `CREATE TABLE parts
   (
       skill_id         int,
       part_index       int,
       skill_type       char,
       diff_for_max     int,
       multipliers_dp   real,
       multipliers_hp   real,
       multipliers_dr   real,
       parameters_str   int,
       parameters_dex   int,
       parameters_con   int,
       parameters_spr   int,
       parameters_wis   int,
       parameters_luk   int,
       power0           real,
       power1           real,
       growth0          real,
       growth1          real,
       value0           real,
       value1           real,
       target_type      char,
       type             char,
       effect_category  char,
       effect_limitType char,
       effect_exitCond  char,
       effect_exitVal_0 int,
       effect_exitVal_1 int,
       target_condition char
   );`,
  `CREATE UNIQUE INDEX skill_parts ON parts (skill_id, part_index);`,
  `CREATE TABLE passives
   (
       style_id    int,
       limit_break int,
       id          int,
       label       char,
       effect      char,
       timing      char,
       condition   char
   );`,
]

/**
 * @param {import('../src/lib/types.ts').Part} part
 */
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

function addSkillRecursive(container, skill) {
  addStatement(
    `INSERT INTO subskills
         (container, skill_id)
     VALUES (${container}, ${skill.id});`,
    `INSERT INTO skills
     (id, label, effect, target_type, hit_count, use_count, sp_cost, is_ex, is_advanced)
     VALUES (${skill.id}, '${skill.label}', '${skill.effect}', '${skill.target_type}', ${skill.hit_count},
             ${skill.use_count === -1 ? 999 : skill.use_count.at(-1)}, ${skill.sp_cost}, ${+skill.is_restricted},
             ${+skill.is_adv});`,
  )

  for (let index = 0; index < skill.parts.length; index++) {
    const part = skill.parts[index]
    addStatement(
      `INSERT INTO parts
       (skill_id, part_index, skill_type, diff_for_max,
        multipliers_dp, multipliers_hp, multipliers_dr, parameters_str,
        parameters_dex, parameters_con, parameters_spr, parameters_wis, parameters_luk,
        power0, power1, growth0, growth1, value0, value1,
        target_type, type,
        effect_category, effect_limitType, effect_exitCond, effect_exitVal_0, effect_exitVal_1,
        target_condition)
       VALUES (${skill.id}, ${index}, '${part.skill_type}', ${part.diff_for_max}, ${part.multipliers.dp},
               ${part.multipliers.hp},
               ${part.multipliers.dr},
               ${part.parameters.str}, ${part.parameters.dex}, ${part.parameters.con}, ${part.parameters.spr},
               ${part.parameters.wis}, ${part.parameters.luk},
               ${part.power[0]}, ${part.power[1]}, ${part.growth[0] ?? 0}, ${part.growth[1] ?? 0}, ${part.value[0]},
               ${part.value[1]},
               '${part.target_type}', '${part.type}',
               '${part.effect.category}', '${part.effect.limitType}', '${part.effect.exitCond}',
               ${part.effect.exitVal[0]}, ${part.effect.exitVal[1]},
               '${part.target_condition}');`,
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
    `INSERT INTO passives
         (style_id, limit_break, id, label, effect, timing, condition)
     VALUES (${style_id}, ${limit_break_step}, ${passive.id}, '${passive.label}', '${passive.effect}',
             '${passive.timing}',
             '${passive.condition}');`,
  )

  if (passive.auto_type === 'None') {
    if (passive.parts === undefined) {
      console.log(`passive '${passive.label}' parts null?`)
    }
    for (let index = 0; index < passive.parts.length; index++) {
      const part = passive.parts[index]
      addStatement(
        `INSERT INTO parts
         (skill_id, part_index, skill_type, diff_for_max,
          multipliers_dp, multipliers_hp, multipliers_dr, parameters_str,
          parameters_dex, parameters_con, parameters_spr, parameters_wis, parameters_luk,
          power0, power1, growth0, growth1, value0, value1,
          target_type, type,
          effect_category, effect_limitType, effect_exitCond, effect_exitVal_0, effect_exitVal_1,
          target_condition)
         VALUES (${passive.id}, ${index}, '${part.skill_type}', ${part.diff_for_max}, ${part.multipliers.dp},
                 ${part.multipliers.hp},
                 ${part.multipliers.dr},
                 ${part.parameters.str}, ${part.parameters.dex}, ${part.parameters.con}, ${part.parameters.spr},
                 ${part.parameters.wis}, ${part.parameters.luk},
                 ${part.power[0]}, ${part.power[1]}, ${part.growth[0] ?? 0}, ${part.growth[1] ?? 0}, ${part.value[0]},
                 ${part.value[1]},
                 '${part.target_type}', '${part.type}',
                 '${part.effect.category}', '${part.effect.limitType}', '${part.effect.exitCond}',
                 ${part.effect.exitVal[0]}, ${part.effect.exitVal[1]},
                 '${part.target_condition}');`,
      )
    }
  }
}

function addStyle(style) {
  addStatement(
    `INSERT INTO styles
         (id, label, chara_label, name, tier, role, type, image, generalize)
     VALUES (${style.id}, '${style.label}', '${style.chara_label}', '${style.name}', '${style.tier}', '${style.role}',
             '${style.type}',
             '${style.image}', ${+style.generalize});`,
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

const fromfile = './data_hbr/styles.json'
const tofile = './data_gen/hbr.sql'

if (check_gen({ froms: [fromfile], tos: [tofile] })) {
  const styles = JSON.parse(readFileSync(fromfile, 'utf-8'))

  for (const style of styles) {
    addStyle(style)
  }

  mkdirSync('./data_gen', { recursive: true })
  writeFileSync(tofile, sqls.join('\n'), 'utf-8')
}
