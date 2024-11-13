import data from '../../data_gen/hbr.pl?raw'
import pl from './tau-prolog'
import DEFAULT_INIT from './main.pl?raw'
export { DEFAULT_INIT }

export function doQuery<Answer extends { links: { [key: string]: { id: string } | { value: number } } }>(
  query: string | string[],
  cbanswer: (answer: Answer, env: unknown) => void,
  {
    cbstart = null,
    cbend = null,
    cberror = console.error,
    init = null,
  }: {
    cbstart?: ((env: unknown) => void) | null
    cbend?: ((reason: 'end' | 'limit' | 'terminate', env: unknown) => void) | null
    cberror?: (phase: string, error: unknown, env: unknown) => void
    init?: string | null
  } = {},
) {
  init ??= DEFAULT_INIT
  const program = init + '\n' + data

  if (typeof query === 'object' && query.length) {
    query = query.join(',') + '.'
  }

  const env = { program, init, data, query, terminate: false }
  if (cbstart !== null) cbstart(env)

  const session = pl.create(null)
  session.consult(program, {
    success: function () {
      session.query(query, {
        success: function answerNext() {
          if (env.terminate) {
            if (cbend !== null) {
              cbend('terminate', env)
            }
            return
          }
          session.answer({
            success: function (answer: Answer) {
              cbanswer(answer, env)
              answerNext()
            },
            error: function (err: unknown) {
              cberror('answer', err, env)
            },
            fail: function () {
              if (cbend !== null) {
                cbend('end', env)
              }
            },
            limit: function () {
              if (cbend !== null) {
                cbend('limit', env)
              }
            },
          })
        },
        error: function (err: unknown) {
          cberror('query', err, env)
        },
      })
    },
    error: function (err: unknown) {
      cberror('consult', err, env)
    },
  })
}

export const presets: { name: string; query: string; cols: string }[] = [
  {
    name: '前排SP+2时AOE小技能SP与威力对比',
    query: `is_style(StyleCaster),
style_passive_healsp_dungeon1t(StyleCaster, LBStyleUsing, HealSpSum),
LBStyleUsingMinusOne is LBStyleUsing - 1,
\\+(style_passive_healsp_dungeon1t(StyleCaster, LBStyleUsingMinusOne, HealSpSum)),
style_tier(StyleCaster, 'SS'),
UsableSpPerBattle is HealSpSum + 4,
chara_style(Character, StyleCaster),
chara_style(Character, StyleProvidingSkill),
style_tier(StyleProvidingSkill, StyleProvidingSkillTier),
has_skill(StyleProvidingSkill, Skill),
\\+(name(Skill, "通常攻撃")),
\\+(name(Skill, "追撃")),
style_can_use_skill(StyleCaster, Skill),
is_aoe(Skill),
skill_infinite_use(Skill),
skill_sp_cost(Skill, SpCost),
SpPercentage is SpCost / UsableSpPerBattle,
SpRest is UsableSpPerBattle - SpCost,
skill_attack_power(Skill, Power),
skill_hit_count(Skill, HitCount),
Power >= 3630.
`,
    cols: `StyleCaster: icon h=使用卡面
LBStyleUsing: number h=突破数
HealSpSum: number h=卡面被动回复
UsableSpPerBattle: number h=总可用量
Character: icon_and_name h=角色
StyleProvidingSkill: icon h=技能所在卡面
StyleProvidingSkillTier: text h=技能所在卡面稀有度
Skill: name h=技能
HitCount: number h=hit数
SpCost: number h=技能消耗
SpPercentage: percentage sort_asc_1 h=消耗百分比
SpRest: number h=剩余SP
Power: number h=伤害 sort_desc_2
LBStyleUsingMinusOne: hidden
`,
  },
  {
    name: '所有风格及一些信息',
    query: `is_style(Style),
style_tier(Style, Tier).
`,
    cols: `Style: icon_and_name
Tier: text
`,
  },
]
