#!/usr/bin/env node

/* global console */

import { mkdirSync, readFileSync, writeFileSync } from 'fs'

const styles = JSON.parse(readFileSync('./data_hbr/styles.json', 'utf-8'))
const bili_roles = JSON.parse(readFileSync('./data_bili/role_details.json', 'utf-8'))

const translation = {}

function setOrCompare(label, trans) {
  const l = translation[label]
  if (l === undefined) {
    translation[label] = trans
    return
  }
  for (const key in trans) {
    if (!(key in l)) {
      l[key] = trans[key]
    } else {
      if (l[key] !== trans[key]) {
        console.warn(`translation["${label}"].${key} has unmatched translation "${l[key]}" !== "${trans[key]}"`)
      }
    }
  }
}

function tryTranslateSubDesc(desc) {
  switch (desc) {
    case '攻撃力ダウン':
      return '攻击力降低'
    case '防御力ダウン':
      return '防御力降低'
    case '成功':
      return '成功'
    case '失敗':
      return '失败'
    case 'オーバードライブ中':
      return '超频中'
    case 'オーバードライブ中以外':
      return '未超频'
    case 'チャージ中':
      return '充能中'
    case '未チャージ':
      return '未充能'
    case '初回':
      return '首次'
    case '2回目以降':
      return '第二次起'
    case '挑発中':
      return '嘲讽中'
    case '挑発中以外':
      return '未嘲讽'
    case '破壊率200%以上':
      return '破坏率超过200%'
    case '破壊率200%未満':
      return '破坏率不足200%'
    case '追加ターン中':
      return '追加回合中'
    case '通常ターン中':
      return '通常回合中'
    default:
      console.warn(`unknown sub desc ${desc}`)
      return desc
  }
}

for (let role in bili_roles) {
  const { role_name, capacities, talent_list } = bili_roles[role]
  const style = styles.find((s) => s.label == role)
  if (typeof style === 'undefined') {
    throw Error(`role ${role} not exist in styles`)
  }
  const { skills, chara_label, limit_break } = style
  const { name, chara } = /^\[(?<name>.+)\]\s*(?<chara>\S.*\S|\S)\s*$/.exec(role_name).groups
  setOrCompare(role, { name, chara })
  setOrCompare(chara_label, { name: chara })

  for (let skill of skills) {
    try {
      if (skill.label.endsWith('AttackNormal')) {
        setOrCompare(skill.label, { name: '普通攻击' })
      } else if (skill.parts[0].skill_type === 'AttackNormal') {
        setOrCompare(skill.label, { name: '追击', desc: '追击敌人' })
      } else {
        if (skill.label.includes('Ev1')) continue // 目前尚不可知技能进化会在手册中如何表达，跳过
        const required_level =
          'Lv' +
          style.ability_tree
            .find((x) => x.label.endsWith('Skill'))
            ?.ability_list.find((ab) => ab.category === 'Ability' && ab.type === 'Skill' && ab.skill === skill.id)
            .requires.level

        const name = bili_roles[role].skills.find((s) => s.level === required_level)?.name
        const c = capacities.filter((c) => c.name === name)
        if (c.length !== 1) {
          throw Error(`style ${role} has ${capacities.length} skills at ${required_level}`)
        }
        setOrCompare(skill.label, {
          name: c[0].name,
          desc: c[0].info,
        })
        ;(function tryNested(skill, name) {
          if (skill.parts[0].skill_type === 'SkillSwitch') {
            // 目前尚不可知可切换技能如何表达，跳过
          } else if (['SkillRandom', 'SkillCondition'].includes(skill.parts[0].skill_type)) {
            // 无正确表达，手动更新
            for (const subskill of skill.parts[0].strval) {
              setOrCompare(subskill.label, { name: name + ' / ' + tryTranslateSubDesc(subskill.desc) })
              tryNested(subskill, name + ' / ' + tryTranslateSubDesc(subskill.desc))
            }
          }
        })(skill, name)
      }
    } catch (e) {
      console.error(skill.label, e)
    }
  }

  for (let { step, bonus } of limit_break.bonus_per_level) {
    if (bonus.length > 1) {
      throw Error(`role ${role} LB ${step} has more than one bonus`)
    }
    if (bonus.length == 0) continue
    if (bonus[0].category !== 'Passive') continue

    const talent = talent_list.find((t) => t.limit_break_level == step)
    if (talent === undefined) {
      throw Error(`role ${role} LB ${step} not found`)
    }

    setOrCompare(bonus[0].label, {
      name: talent.name,
      desc: talent.info,
    })
  }
}

mkdirSync('./data_gen', { recursive: true })
writeFileSync('./data_gen/translation.json', JSON.stringify(translation, null, 2))
