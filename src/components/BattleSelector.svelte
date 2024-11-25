<script>
  import { battles, score_attack, bScoreAttacks, bTopped, bBattleNames } from '../lib/data.ts'
  import { translateType, segip } from '../lib/utils.ts'

  let { setenemies } = $props()

  let sel = $state()

  let border_line = $derived(
    sel?.type !== 'score_attack'
      ? null
      : Array(sel.battle.battles[0].bn.length)
          .fill(0)
          .map((_, i) => {
            sel.battle.battles.map((this_b) => [this_b.d, this_b.rbl[i]])
          }),
  )

  let dp_lines = $derived(sel?.type !== 'score_attack' ? null : 1)
  let hp_lines = $derived(sel?.type !== 'score_attack' ? null : 1)
  let difficulty = $state(120)

  // let scoreAttackLines = $state()
  // let scoreAttackEnemies = $state()

  let [scoreAttackLines, scoreAttackEnemies] = $derived.by(() => {
    if (sel?.type !== 'score_attack') {
      return [null, null]
    }
    const attr_lines = [
      ['border', 'rbl'],
      ['dp', 'dl'],
      ['hp', 'hl'],
      ['attack', 'al'],
    ]
    const enemies = sel.battle.battles[0].bn.flatMap((e, index) =>
      e === null
        ? []
        : [
            {
              name: e.n,
              resist: e.r.map(([type, rate]) => ({ type: translateType(type), rate })).sort((x, y) => x.rate - y.rate),
              index,
              label: sel.battle.battles[0].b[index],
            },
          ],
    )

    const lines = {}
    for (const [a, b] of attr_lines) {
      lines[a] = []
      for (const { index } of enemies) {
        lines[a].push([])
        for (const kp of sel.battle.battles) {
          lines[a][index].push([kp.d, kp[b][index]])
        }
      }
    }
    return [lines, enemies]
  })

  let getRealEnemiesFromDifficulty = $derived.by(() => {
    if (sel?.type !== 'score_attack') return null
    const border_lines = []
    const dp_lines = []
    const hp_lines = []

    const nEnemies = sel.battle.battles[0].bn.length

    const rEnemies = sel.battle.battles[0].bn.map((e) =>
      e === null
        ? null
        : {
            name: e.n,
            resist: e.r.map(([type, rate]) => ({ type: translateType(type), rate })).sort((x, y) => x.rate - y.rate),
          },
    )

    for (let i = 0; i < nEnemies; i++) {
      border_lines.push([])
      dp_lines.push([])
      hp_lines.push([])
    }

    for (let kp of sel.battle.battles) {
      for (let i = 0; i < nEnemies; i++) {
        border_lines[i].push([kp.d, kp.rbl[i]])
        dp_lines[i].push([kp.d, kp.dl[i]])
        hp_lines[i].push([kp.d, kp.hl[i]])
      }
    }

    return (h) =>
      rEnemies.map((e, i) =>
        e === null
          ? null
          : {
              ...e,
              border: segip(border_lines[i], h),
              dp: segip(dp_lines[i], h),
              hp: segip(hp_lines[i], h),
            },
      )
  })

  let realEnemies = $derived.by(() => {
    if (sel?.type === 'normal')
      return sel.battle.enemy_list.map((e) =>
        e === null
          ? null
          : {
              name: e.name,
              border: e.base_param.param_border,
              dp: e.base_param.dp,
              hp: e.base_param.hp,
              resist: e.resist.map(([type, rate]) => ({ type: translateType(type), rate })),
            },
      )
    if (sel?.type === 'score_attack') return getRealEnemiesFromDifficulty(difficulty)
    return null
  })

  let search = $state('')

  function all(arr, { isFunc = false } = {}) {
    for (let it of arr) {
      if (!(isFunc ? it() : it)) {
        return false
      }
    }
    return true
  }

  const searchBattle = (s, top = 10) => {
    const p = s.startsWith('/')
      ? (b) => RegExp(s.slice(1)).test(b.label)
      : s.startsWith('*')
        ? (b) => b.label.toLowerCase().includes(s.slice(1).toLowerCase())
        : s === ''
          ? (b) => true
          : (b) => {
              const fn = friendlyNamesOnBattleCacheMe(b).join('\n').toLowerCase()
              return all(
                s
                  .split(/\s+/)
                  .map((si) =>
                    si.startsWith('!') ? !fn.includes(si.slice(1).toLowerCase()) : fn.includes(si.toLowerCase()),
                  ),
              )
            }

    let g = []
    for (let battle of battles) {
      if (p(battle)) {
        g.push({ battle, type: 'normal', rating: 100 + bTopped.includes(battle.label) * 10 })
      }
    }

    for (let battle of score_attack) {
      if (p(battle)) {
        g.push({
          battle,
          type: 'score_attack',
          rating: 100 + bTopped.includes(battle.label) * 10,
        })
      }
    }

    g.sort((x, y) => y.rating - x.rating)

    return g.slice(0, top)
  }

  const friendlyNamesOnBattleCacheMe = (battle) => {
    if (battle.friendlyNames !== undefined) {
      return battle.friendlyNames
    } else {
      return (battle.friendlyNames = friendlyNames(battle.label))
    }
  }

  const friendlyNames = (label) => {
    if (label in bBattleNames) {
      return [bBattleNames[label], label]
    }

    let match
    if (/scoreAttack(\d+)/.test(label)) {
      let fns = [label.replace(/scoreAttack(.+)/, 'W服高分第$1期')]
      let g = bScoreAttacks[label]
      if (g !== undefined) {
        fns.push('B服高分第' + g + '期')
      }
      return [...fns, label]
    }

    let split = label.split('_')

    const dungeonsPrework = (prefix) => {
      if (split[2].startsWith('R') && split.includes('GOLD'))
        return [`${prefix}第${+split[1].slice(3)}层稀有遭遇${+split[2].slice(3)}`, label]
      else if (split[2].startsWith('R'))
        return [`${prefix}第${+split[1].slice(3)}层随机遭遇${+split[2].slice(3)}`, label]
      else if (split[2].startsWith('S')) return [`${prefix}第${+split[1].slice(3)}层红点${+split[2].slice(3)}`, label]
      else if (split[2] === 'BOSS') return [`${prefix}第${+split[1].slice(3)}层 BOSS`, label]
      else if (split[2] === 'BOSS2nd') return [`${prefix}第${+split[1].slice(3)}层 BOSS 2阶段`, label]
      return [label, `*别名还没处理好*，但它应该是${prefix}的一部分`]
    }

    switch (split[0]) {
      // 主线
      case 'MC00':
        return [`序章 ${split[1]} ${split[2]}`, label]
      case 'MC01':
        return [`第一章 ${split[1]} ${split[2]}`, `1-${split[1]}`, label]
      case 'MC02':
        return [`第二章 ${split[1]} ${split[2]}`, `2-${split[1]}`, label]
      case 'MC03':
        return [`第三章 ${split[1]} ${split[2]}`, `3-${split[1]}`, label]
      case 'MC04':
        return [`第四章 上篇 ${split[1]} ${split[2]}`, `4-${split[1]}`, label]
      case 'MC04B':
        return [`第四章 下篇 ${split[1]} ${split[2]}`, `4B-${split[1]}`, label]
      case 'MC05A':
        return [`第五章 上篇 ${split[1]} ${split[2]}`, `5A-${split[1]}`, label]

      case 'JM02':
        return dungeonsPrework('宝珠迷宫')
      case 'JA06':
        return dungeonsPrework('黄金跳虫巢穴')
      case 'JA07':
        return dungeonsPrework('炎之回廊')
      case 'JA08':
        return dungeonsPrework('冰之回廊')
      case 'JA09':
        return dungeonsPrework('雷之回廊')
      case 'JA10':
        return dungeonsPrework('光之回廊')
      case 'JA11':
        return dungeonsPrework('暗之回廊')

      case 'Arena':
        const [a, b] = split[1].split('0')
        const c = { Easy: '初级', Normal: '中级', Hard: '高级', SuperHard: '超高级' }?.[a] ?? a
        let n = '竞技场' + c + ' 等级' + b
        if (split[2] !== undefined) {
          n = n + '（' + translateType(split[2]) + '）'
        }
        return [n, label]

      case 'VariableChallenge':
        switch (+split[1]) {
          case 1:
            return ['时之修炼场 5-10', label] // 5500
          case 2:
            return ['时之修炼场 14-15', label] // 6500
          case 3:
            return ['时之修炼场 18-20', label] // 7800
          case 4:
            return ['时之修炼场 23-25', label] // 9800
          case 5:
            return ['时之修炼场 27-30', label] // 11000
          case 6:
            return ['时之修炼场 32-40', label] // 12000
          case 7:
            return ['时之修炼场 41-50', label] // 13800
          case 8:
            return ['时之修炼场 51-60', label] // 14300
          case 9:
            return ['时之修炼场 61-70', label] // 14800
        }
        return [label, '*别名还没处理好*，但它应该是时之修炼场的一部分']
    }
    return [label, '*别名还没处理好*']
  }
</script>

<div class="battleselector">
  <div><input class="search" type="text" bind:value={search} /></div>
  <div>
    <select size="5" class="select" bind:value={sel}>
      {#each searchBattle(search) as info}
        <option value={info}>{friendlyNames(info.battle.label).join(' / ')}</option>
      {/each}
    </select>
  </div>
  {#if sel?.type === 'score_attack'}
    难度：<input type="number" bind:value={difficulty} />
  {/if}
  <button
    onclick={() => {
      if (realEnemies) setenemies(realEnemies)
    }}>→</button
  >
</div>

<style>
  .battleselector {
    border-radius: 13px;
    padding: 13px;
    background-color: cyan;
  }

  .search,
  .select {
    width: 450px;
    padding: 3px;
  }
</style>
