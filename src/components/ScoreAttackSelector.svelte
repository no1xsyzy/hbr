<script>
  import { score_attack, bScoreAttacks, bTopped, bBattleNames } from '../lib/data.ts'
  import { translateType, segip } from '../lib/utils.ts'

  let { setenemies } = $props()

  let sel = $state()

  let border_line = $derived(
    Array(sel.battle.battles[0].bn.length)
      .fill(0)
      .map((_, i) => {
        sel.battle.battles.map((this_b) => [this_b.d, this_b.rbl[i]])
      }),
  )

  let difficulty = $state(120)

  let [scoreAttackLines, scoreAttackEnemies] = $derived.by(() => {
    const scoreAttackLines = {}
    const attr_lines = [
      ['border', 'rbl'],
      ['dp', 'dl'],
      ['hp', 'hl'],
      ['attack', 'al'],
    ]
    const scoreAttackEnemies = sel.battle.battles[0].bn.flatMap((e, index) =>
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
      scoreAttackLines[a] = []
      for (const { index } of scoreAttackEnemies) {
        scoreAttackLines[a].push([])
        for (const kp of sel.battle.battles) {
          scoreAttackLines[a][index].push([kp.d, kp[b][index]])
        }
      }
    }
    return [scoreAttackLines, scoreAttackEnemies]
  })

  let [border_lines, dp_lines, hp_lines] = $derived.by(() => {
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

    return [border_lines, dp_lines, hp_lines]
  })

  let realEnemies = $derived(
    rEnemies.map((e, i) =>
      e === null
        ? null
        : {
            ...e,
            border: segip(border_lines[i], difficulty),
            dp: segip(dp_lines[i], difficulty),
            hp: segip(hp_lines[i], difficulty),
          },
    ),
  )

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

    for (let battle of score_attack) {
      if (p(battle)) {
        g.push({
          battle,
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
