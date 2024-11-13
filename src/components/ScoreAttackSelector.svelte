<script>
  import { createEventDispatcher } from 'svelte'
  import { score_attack, ACNames, CCNames, 国服高分, 当前国服置顶, BattleNames } from '../lib/data.ts'
  import { translateType, segip } from '../lib/utils.ts'

  const dispatch = createEventDispatcher()

  let sel

  $: border_line = Array(sel.battle.battles[0].bn.length)
    .fill(0)
    .map((_, i) => {
      sel.battle.battles.map((this_b) => [this_b.d, this_b.rbl[i]])
    })

  let difficulty = 120

  let scoreAttackLines
  let scoreAttackEnemies

  $: {
    const newScoreAttackLines = {}
    const attr_lines = [
      ['border', 'rbl'],
      ['dp', 'dl'],
      ['hp', 'hl'],
      ['attack', 'al'],
    ]
    scoreAttackEnemies = sel.battle.battles[0].bn.flatMap((e, index) =>
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

    for (const [a, b] of attr_lines) {
      newScoreAttackLines[a] = []
      for (const { index } of scoreAttackEnemies) {
        newScoreAttackLines[a].push([])
        for (const kp of sel.battle.battles) {
          newScoreAttackLines[a][index].push([kp.d, kp[b][index]])
        }
      }
    }
    scoreAttackLines = newScoreAttackLines
  }

  let border_lines = []
  let dp_lines = []
  let hp_lines = []

  $: {
    let new_border_lines = []
    let new_dp_lines = []
    let new_hp_lines = []

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

    border_lines = new_border_lines
    dp_lines = new_dp_lines
    hp_lines = new_hp_lines
  }

  $: realEnemies = rEnemies.map((e, i) =>
    e === null
      ? null
      : {
          ...e,
          border: segip(border_lines[i], difficulty),
          dp: segip(dp_lines[i], difficulty),
          hp: segip(hp_lines[i], difficulty),
        },
  )

  let search = ''

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

    for (let battle of score_attack) {
      if (p(battle)) {
        g.push({
          battle,
          rating: 100 + 当前国服置顶.includes(battle.label) * 10,
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
    if (label in BattleNames) {
      return [BattleNames[label], label]
    }

    let match
    if (/scoreAttack(\d+)/.test(label)) {
      let fns = [label.replace(/scoreAttack(.+)/, 'W服高分第$1期')]
      let g = 国服高分[label]
      if (g !== undefined) {
        fns.push('B服高分第' + g + '期')
      }
      return [...fns, label]
    }
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
  难度：<input type="number" bind:value={difficulty} />
  <button
    on:click={() => {
      if (realEnemies) dispatch('setenemies', realEnemies)
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
