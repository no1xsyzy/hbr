<script lang="ts">
  import { onDestroy } from 'svelte'

  import { translateType, segip, mat } from '../lib/utils.ts'
  import { styles } from '../lib/data.ts'
  import { translate } from '../lib/translate.ts'
  import { LocalStorage } from '../lib/store.ts'

  import BattleSelector from './BattleSelector.svelte'
  import Enemy from './Enemy.svelte'
  import Symbol from './Symbol.svelte'
  import TeamSelector from './TeamSelector.svelte'

  let { storeKey } = $props()

  // $: store = new LocalStorage(storeKey)

  const simpleFixed = (num, pass) => num.toFixed(pass).replace(/\.?0+$/, '')

  let team = $state([null, null, null, null, null, null])
  let params = $state(
    Array(6)
      .fill(0)
      .map(() => ({
        str: 300,
        dex: 300,
        con: 300,
        spr: 300,
        wis: 300,
        luk: 300,
      })),
  )
  let enemies = $state([null, null, null])
  let focusAt = $state(0)
  let nukeLabel = $state(null)
  let extraParam = $state(null)
  let attackUps = $state({})
  let defenseDowns = $state({})
  let isCritical = $state(true)
  let criticalRateUps = $state({})
  let criticalDamageUps = $state({})
  let zone = $state(null)
  let breakRate = $state(100)
  let fragiles = $state({})
  let mindEyes = $state({})
  let funnels = $state({})

  const des = (storedString) =>
    ({
      team = [null, null, null, null, null, null],
      params = Array(6)
        .fill(0)
        .map(() => ({
          str: 300,
          dex: 300,
          con: 300,
          spr: 300,
          wis: 300,
          luk: 300,
        })),
      enemies = [null, null, null],
      focusAt = 0,
      nukeLabel = null,
      extraParam = null,
      attackUps = {},
      defenseDowns = {},
      isCritical = true,
      criticalRateUps = {},
      criticalDamageUps = {},
      zone = null,
      breakRate = 100,
      fragiles = {},
      mindEyes = {},
      funnels = {},
    } = JSON.parse(storedString))

  const ser = () =>
    JSON.stringify({
      team,
      params,
      enemies,
      focusAt,
      nukeLabel,
      extraParam,
      attackUps,
      defenseDowns,
      isCritical,
      criticalRateUps,
      criticalDamageUps,
      zone,
      breakRate,
      fragiles,
      mindEyes,
      funnels,
    })

  const listener = (event) => {
    if (event.key === storeKey && event.newValue !== null) {
      des(event.newValue)
    }
  }

  window.addEventListener('storage', listener)

  onDestroy(() => {
    window.removeEventListener('storage', listener)
  })

  $effect(() => {
    des(localStorage[storeKey] ?? '{}')
  })

  $effect(() => {
    localStorage[storeKey] = ser()
  })

  $effect.pre(() => {
    focusAt ??= enemies.flatMap((x, i) => (x ? [i] : []))?.[0] ?? null
  })

  let focusEnemy = $derived(enemies[focusAt] ?? null)

  const multiplierFromResists = (rs) => rs.map((r) => 1 - 0.01 * r.rate).reduce((x, y) => x * y, 1)

  const ATTACK_TYPES = [
    'AttackSkill',
    'TokenAttack',
    'PenetrationCriticalAttack',
    'DamageRateChangeAttackSkill',
    'AttackByOwnDpRate',
    'AttackBySp',
    'FixedHpDamageRateAttack',
  ]

  const attackDataFromPart = (pt) => ({
    key: pt.key,
    label: pt.label,
    name: pt.name,
    type: translateType(pt.type),
    element: translateType(pt.elements?.[0] ?? '无'),
    power: pt.power,
    params: pt.parameters,
    diff_for_max: pt.diff_for_max,
    multipliers: pt.multipliers,
    growth: pt.growth,
    hits: pt.skHits,
    ownerParams: pt.ownerParams,
  })

  $inspect('team', team)

  let apparentTeam = $derived(
    team.flatMap((pl, i) => (pl ? [{ style: styles.find((s) => s.label === pl), params: params[i] }] : [])),
  )

  $inspect('apparentTeam', apparentTeam)

  let allSkills = $derived(
    apparentTeam
      .filter((p) => p)
      .flatMap((pl) => {
        const currentStyle = pl.style.label
        const currentChara = pl.style.chara_label
        const sameCharaStyles = styles.filter((s) => s.chara_label === currentChara)
        return sameCharaStyles.flatMap(({ generalize, skills, label }) => {
          return skills.flatMap((s) =>
            s.is_restricted === 0 || generalize || label == pl.style.label ? [{ ...s, ownerParams: pl.params }] : [],
          )
        })
      }),
  )

  $inspect('allSkills', allSkills)

  let allParts = $derived(
    allSkills.flatMap(function resolveNestedPartsFromSkill({ ownerParams, parts, name, label, hits, hit_count }) {
      if (parts[0].skill_type === 'SkillSwitch') {
        return parts[0].strval
          .map((skk, i) => ({ ...skk, ownerParams, name: name + ' / ' + `SKILL ${i + 1}` }))
          .flatMap(resolveNestedPartsFromSkill)
      } else if (['SkillRandom', 'SkillCondition'].includes(parts[0].skill_type)) {
        return parts[0].strval
          .map((skk) => ({ ...skk, ownerParams, name: name + ' / ' + skk.desc }))
          .flatMap(resolveNestedPartsFromSkill)
      } else {
        const count = {}
        return parts.map((pt, i) => {
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
              }
        })
      }
    }),
  )

  let allNukes = $derived(
    allParts.flatMap((pt) => {
      switch (pt.skill_type) {
        case 'AttackSkill':
          return [attackDataFromPart(pt)]
        case 'TokenAttack':
          return [
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
          ]
        case 'PenetrationCriticalAttack':
          return [
            {
              ...attackDataFromPart(pt),
              penetration: pt.value[0],
            },
          ]
        case 'DamageRateChangeAttackSkill':
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
        case 'AttackByOwnDpRate':
          return [
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
          ]
        case 'AttackBySp':
          return [
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
          ]
        case 'FixedHpDamageRateAttack': // TODO:
          return [
            {
              ...attackDataFromPart(pt),
            },
          ]
        default:
          return []
      }
    }),
  )

  const injectNukeTruePower = (nuke) => {
    const ePar = mat(nuke.params, nuke.ownerParams)
    const line = [
      [-nuke.diff_for_max / 2, 0],
      [0, nuke.power[0]],
      [nuke.diff_for_max, nuke.power[1]],
    ]
    const truePower = segip(line, ePar - focusEnemy?.border ?? 300)
    const truePowerCritical = segip(line, ePar - ((focusEnemy?.border ?? 300) - 50))
    return { ...nuke, truePower, truePowerCritical }
  }

  const injectBuffTruePower = (effect) => {
    const ePar = mat(effect.params, effect.ownerParams)
    return {
      ...effect,
      truePower: segip(
        [
          [0, effect.power[0]],
          [effect.diff_for_max, effect.power[1]],
        ],
        ePar,
      ),
    }
  }

  const injectDebuffTruePower = (effect) => {
    const ePar = mat(effect.params, effect.ownerParams)
    const line = [
      [0, effect.power[0]],
      [effect.diff_for_max, effect.power[1]],
    ]
    return {
      ...effect,
      truePower: segip(line, ePar - focusEnemy?.border ?? 300),
    }
  }

  const injectFunnelTruePower = (effect) => {
    return { ...effect, truePower: Math.max(...effect.power) * effect.value[0] }
  }

  const injectZoneTruePower = (effect) => {
    return { ...effect, truePower: effect.power }
  }

  let nuke = $state()
  let extraParamCfg = $state(null)

  $effect.pre(() => {
    const theNuke = allNukes.find((x) => x.label === nukeLabel)
    if (theNuke) {
      nuke = injectNukeTruePower(theNuke)
      const newExtraParamCfg = nuke?.extraParam ?? null
      if (newExtraParamCfg === null) {
        extraParam = null
      } else {
        if (newExtraParamCfg.name !== extraParamCfg?.name) {
          extraParam = newExtraParamCfg.default
        }
        extraParamCfg = newExtraParamCfg
      }
    } else {
      nuke = extraParamCfg = extraParam = null
    }
  })

  let attackType = $derived(nuke?.type ?? '')
  let attackElement = $derived(nuke?.element ?? '')

  const partFapper =
    (skill_type, truePowerInjector, { elemented = false, includeValue = false } = {}) =>
    (pt) => {
      if (pt.skill_type !== skill_type) return []

      const element = translateType(pt.elements?.[0] ?? null)
      if (elemented && element !== null && element !== attackElement) return []

      const type = translateType(pt.type)
      if (elemented && type !== null && type !== attackType) return []

      const effect = {
        key: pt.key,
        label: pt.label,
        name: pt.name,
        element,
        type,
        power: pt.power,
        growth: pt.growth,
        params: pt.parameters,
        diff_for_max: pt.diff_for_max,
        ownerParams: pt.ownerParams,
      }
      if (includeValue) {
        effect.value = pt.value
      }

      return [truePowerInjector(effect)]
    }

  const byTruePower = (x, y) => y.truePower - x.truePower

  let allAttackUps = $derived(
    allParts.flatMap(partFapper('AttackUp', injectBuffTruePower, { elemented: true })).sort(byTruePower),
  )
  let allDefDowns = $derived(
    allParts.flatMap(partFapper('DefenseDown', injectDebuffTruePower, { elemented: true })).sort(byTruePower),
  )
  let allCriticalRateUps = $derived(
    allParts.flatMap(partFapper('CriticalRateUp', injectBuffTruePower, { elemented: true })).sort(byTruePower),
  )
  let allCriticalDamageUps = $derived(
    allParts.flatMap(partFapper('CriticalDamageUp', injectBuffTruePower, { elemented: true })).sort(byTruePower),
  )

  let penetration = $derived(!!nuke?.penetration)
  let resistsTyp = $derived((focusEnemy?.resist ?? []).filter((r) => r.type == attackType))
  let resistsEl = $derived((focusEnemy?.resist ?? []).filter((r) => r.type == attackElement))
  let resists = $derived((focusEnemy?.resist ?? []).filter((r) => r.type == attackType || r.type == attackElement))
  let resistTypPlier = $derived(multiplierFromResists(resistsTyp))
  let resistElPlier = $derived(multiplierFromResists(resistsEl))
  let resistPlier = $derived(penetration ? nuke?.penetration + 1 : multiplierFromResists(resists))

  let isWeak = $derived(resistPlier > 1)
  let allMindEyes = $derived(allParts.flatMap(partFapper('MindEye', injectBuffTruePower)).sort(byTruePower))
  let allFragiles = $derived(allParts.flatMap(partFapper('Fragile', injectDebuffTruePower)).sort(byTruePower))
  let allFunnels = $derived(
    allParts.flatMap(partFapper('Funnel', injectFunnelTruePower, { includeValue: true })).sort(byTruePower),
  )
  let allCharges = $derived(
    allParts
      .filter((pt) => pt.skill_type == 'BuffCharge')
      .map(injectBuffTruePower)
      .sort(byTruePower),
  )

  let allZones = $derived(
    allParts.flatMap(partFapper('Zone', injectBuffTruePower, { elemented: true })).sort(byTruePower),
  )

  const eNoEl = (xx) =>
    Math.round(
      xx
        .sort((x, y) => y.truePower - x.truePower)
        .flatMap(({ stack, ...r }) => Array(stack).fill(r))
        .slice(0, 2)
        .map((x) => x.truePower)
        .reduce((x, y) => x + y, 0) * 10000,
    ) / 10000
  const eEl = (effects) =>
    Math.round(
      (eNoEl(effects.filter((x) => x.element === null)) + eNoEl(effects.filter((x) => x.element === attackElement))) *
        10000,
    ) / 10000

  function makeX(allXs, simX) {
    const result = []
    for (const label in simX) {
      result.push({ ...allXs.find((x) => x.label === label), stack: simX[label] })
    }
    return result
  }

  function eFromX(allXs, stackX, element) {
    const sortedAllXss =
      element === null
        ? [[...allXs].sort((x, y) => y.truePower - x.truePower)]
        : [(x) => x.element === null, (x) => x.element === element].map((flt) =>
            allXs.filter(flt).sort((x, y) => y.truePower - x.truePower),
          )
    let totalPower = 0
    for (const sortedAllXs of sortedAllXss) {
      let stacking = 0
      for (const x of sortedAllXs) {
        let cstack = stackX?.[x.key] ?? 0
        while (cstack > 0) {
          cstack -= 1
          totalPower += x.truePower
          stacking += 1
          if (stacking === 2) {
            break
          }
        }
        if (stacking === 2) {
          break
        }
      }
    }
    return Math.round(totalPower * 10000) / 10000
  }

  let eExtra = $derived(extraParamCfg ? extraParamCfg.mul(extraParam) : 1)
  let eAttackUps = $derived(eFromX(allAttackUps, attackUps, attackElement) + 1)

  let eDefenseDowns = $derived(eFromX(allDefDowns, defenseDowns, attackElement) + 1)
  let eCriticalDamageUps = $derived(
    isCritical ? eFromX(allCriticalDamageUps, criticalDamageUps, attackElement) + 1.5 : 1,
  )
  let eFragiles = $derived(isWeak ? eFromX(allFragiles, fragiles, null) + 1 : 1)
  let eMindEyes = $derived(isWeak ? eFromX(allMindEyes, mindEyes, null) + 1 : 1)
  let eZone = $derived(allZones.find((z) => z.label === zone)?.truePower ?? 1)
  let eBreak = $derived(breakRate / 100)
  let eFunnel = $derived(eFromX(allFunnels, funnels, null) + 1)

  let hits = $derived(
    nuke?.hits.concat(
      makeX(allFunnels, funnels)
        .sort((x, y) => y.truePower - x.truePower)
        .flatMap(({ stack, ...r }) => Array(stack).fill(r))
        .slice(0, 2)
        .flatMap((f) => Array(Math.max(...f.power)).fill(f.value[0])),
    ) ?? [],
  )

  let beforeFunnel = $derived(
    nuke !== null
      ? Math.round(
          (isCritical ? nuke.truePowerCritical : nuke.truePower) *
            (eExtra *
              eAttackUps *
              eDefenseDowns *
              eCriticalDamageUps *
              eFragiles *
              eMindEyes *
              eZone *
              eBreak *
              resistPlier),
        )
      : 0,
  )

  let sDamageRange = $derived(hits.map((h) => [1, 0.9, 1.1].map((x) => Math.round(h * beforeFunnel * x))))
  let totalDmg = $derived(sDamageRange.map((x) => x[0]).reduce((x, y) => x + y, 0))

  let totalDmgRange = $derived([
    sDamageRange.map((x) => x[1]).reduce((x, y) => x + y, 0),
    sDamageRange.map((x) => x[2]).reduce((x, y) => x + y, 0),
  ])
</script>

{#snippet param({ pos, style })}
  <div class="flex">
    <div>力<input class="attr" type="number" bind:value={params[pos].str} /></div>
    <div>敏<input class="attr" type="number" bind:value={params[pos].dex} /></div>
    <div>体<input class="attr" type="number" bind:value={params[pos].con} /></div>
    <div>精<input class="attr" type="number" bind:value={params[pos].spr} /></div>
    <div>智<input class="attr" type="number" bind:value={params[pos].wis} /></div>
    <div>运<input class="attr" type="number" bind:value={params[pos].luk} /></div>
  </div>
{/snippet}

<TeamSelector bind:team {param} />

<div class="enemygrid">
  <BattleSelector
    setenemies={(es) => {
      enemies = [...es, null, null].slice(0, 3)
    }}
  />
  <Enemy enemy={enemies[2]} chosen={focusAt == 2} onclick={() => (focusAt = 2)} />
  <Enemy enemy={enemies[0]} chosen={focusAt == 0} onclick={() => (focusAt = 0)} />
  <Enemy enemy={enemies[1]} chosen={focusAt == 1} onclick={() => (focusAt = 1)} />
</div>

<div class="damagegrid">
  <div class="cell skill" class:hasextra={extraParamCfg !== null}>
    <div>技能选择</div>
    <div>
      <select bind:value={nukeLabel}>
        <option value={null}> - </option>
        {#each allNukes as s, i (s.key)}
          <option value={s.label}>{translate(s).name}</option>
        {/each}
      </select>
    </div>
    {#if nuke !== null}
      <div>技能强度 {nuke.power[0]} ~ {nuke.power[1]}</div>
      <div class="skillTruePower">
        (实值: <span class:active={!isCritical}>{Math.round(nuke.truePower)}</span> /
        <span class:active={isCritical}>(暴击时) {Math.round(nuke.truePowerCritical)}</span> )
      </div>
      <Symbol symbol={attackElement} />
      <Symbol symbol={attackType} />
    {/if}
  </div>

  {#if extraParamCfg !== null}
    <div class="cell extra">
      <div>技能额外参数 (x{simpleFixed(eExtra, 4)})</div>
      <div>
        {extraParamCfg.name}：
        {#if extraParamCfg.type === 'integer'}
          <input type="number" bind:value={extraParam} min={extraParamCfg.min} max={extraParamCfg.max} />
        {:else if extraParamCfg.type === 'number'}
          <input type="number" bind:value={extraParam} min={extraParamCfg.min} max={extraParamCfg.max} />
          <input type="range" bind:value={extraParam} min={extraParamCfg.min} max={extraParamCfg.max} />
        {:else}
          未完成：未知的额外参数类型 {extraParamCfg.type}
        {/if}
      </div>
    </div>
  {/if}

  <div class="cell aup" class:enabled={eAttackUps > 1}>
    <div>加攻 (x{simpleFixed(eAttackUps, 4)})</div>
    {#each allAttackUps as atkUp (atkUp.key)}
      {((attackUps[atkUp.key] ??= 0), '')}
      <div>
        <button onclick={() => (attackUps[atkUp.key] -= attackUps[atkUp.key] > 0)}> - </button>
        <span>
          <Symbol symbol={atkUp.element} />
          {translate(atkUp).name}
          (+{simpleFixed(atkUp.truePower * 100, 2)}%) x {attackUps[atkUp.key] ?? 0}
        </span>
        <button onclick={() => (attackUps[atkUp.key] += attackUps[atkUp.key] < 2)}> + </button>
      </div>
    {/each}
  </div>

  <div class="cell ddown" class:enabled={eDefenseDowns > 1}>
    <div>降防 (x{simpleFixed(eDefenseDowns, 4)})</div>
    {#each allDefDowns as defDown (defDown.key)}
      {((defenseDowns[defDown.key] ??= 0), '')}
      <div>
        <button onclick={() => (defenseDowns[defDown.key] -= defenseDowns[defDown.key] > 0)}> - </button>
        <Symbol symbol={defDown.element} />
        <span>
          {translate(defDown).name}
          (+{simpleFixed(defDown.truePower * 100, 2)}%) x {defenseDowns[defDown.key] ?? 0}
        </span>
        <button onclick={() => (defenseDowns[defDown.key] += defenseDowns[defDown.key] < 2)}> + </button>
      </div>
    {/each}
  </div>

  <div class="cell critical" class:enabled={isCritical}>
    <div>
      <label><input type="checkbox" bind:checked={isCritical} />暴击</label>
      (x{simpleFixed(eCriticalDamageUps, 4)})
    </div>
    {#each allCriticalDamageUps as cDmgUp (cDmgUp.key)}
      {((criticalDamageUps[cDmgUp.key] ??= 0), '')}
      <div>
        <button onclick={() => (criticalDamageUps[cDmgUp.key] -= criticalDamageUps[cDmgUp.key] > 0)}> - </button>
        <span>
          <Symbol symbol={cDmgUp.element} forceNeoSymbol="1" />
          {translate(cDmgUp).name}
          (+{simpleFixed(cDmgUp.truePower * 100, 2)}%) x {criticalDamageUps[cDmgUp.key]}
        </span>
        <button onclick={() => (criticalDamageUps[cDmgUp.key] += criticalDamageUps[cDmgUp.key] < 2)}> + </button>
      </div>
    {/each}
  </div>

  <div class="cell zone" class:enabled={zone !== null}>
    <div>场地 (x{eZone})</div>
    <div><label><input type="radio" bind:group={zone} value={null} />无场地</label></div>
    {#each allZones as z (z.key)}
      <div>
        <label>
          <input type="radio" bind:group={zone} value={z.key} />
          <Symbol symbol={z.element} />
          {translate(z).name}
        </label>
      </div>
    {/each}
  </div>

  <div class="cell break">
    <div>破坏 (x{eBreak})</div>
    <div><input type="number" bind:value={breakRate} /></div>
    <div><input type="range" bind:value={breakRate} min={100} max={999} /></div>
  </div>

  {#if penetration}
    <div class="cell resist enabled">
      <div class="title">贯通 (x{resistPlier})</div>
    </div>
  {:else}
    <div class="cell resist" class:enabled={resistPlier > 1}>
      <div class="title">总克制 (x{resistPlier})</div>
      <div class="cell elementresist" class:enabled={resistElPlier > 1}>
        <div>元素克制 (x{resistElPlier})</div>
        {#each resistsEl as r}
          <div>{r.type} {r.rate}</div>
        {/each}
      </div>

      <div class="cell typeresist" class:enabled={resistTypPlier > 1}>
        <div><div>武器克制 (x{resistTypPlier})</div></div>
        {#each resistsTyp as r}
          <div>{r.type} {r.rate}</div>
        {/each}
      </div>
    </div>
  {/if}

  <div class="cell mind" class:enabled={eMindEyes > 1} class:disabled={!isWeak}>
    心眼 (x{eMindEyes})
    {#each allMindEyes as mind (mind.key)}
      {((mindEyes[mind.key] ??= 0), '')}
      <div>
        <button onclick={() => (mindEyes[mind.key] -= mindEyes[mind.key] > 0)} disabled={!isWeak}> - </button>
        {translate(mind).name} (+{simpleFixed(mind.truePower * 100, 2)}%) x {mindEyes[mind.key]}
        <button onclick={() => (mindEyes[mind.key] += mindEyes[mind.key] < 2)} disabled={!isWeak}> + </button>
      </div>
    {/each}
  </div>

  <div class="cell fragile" class:enabled={eFragiles > 1} class:disabled={!isWeak}>
    <div>脆弱 (x{eFragiles})</div>
    {#each allFragiles as fragile (fragile.key)}
      {((fragiles[fragile.key] ??= 0), '')}
      <div>
        <button onclick={() => (fragiles[fragile.key] -= fragiles[fragile.key] > 0)} disabled={!isWeak}> - </button>
        {translate(fragile).name} (+{simpleFixed(fragile.truePower * 100, 2)}%) x {fragiles[fragile.key]}
        <button onclick={() => (fragiles[fragile.key] += fragiles[fragile.key] < 2)} disabled={!isWeak}> + </button>
      </div>
    {/each}
  </div>

  <div class="cell funnel" class:enabled={eFunnel > 1}>
    连击 (x{eFunnel})
    {#each allFunnels as funnel (funnel.key)}
      {((funnels[funnel.key] ??= 0), '')}
      <div>
        <button onclick={() => (funnels[funnel.key] -= funnels[funnel.key] > 0)}> - </button>
        {translate(funnel).name} (+{simpleFixed(funnel.truePower * 100, 2)}%) x {funnels[funnel.key]}
        <button onclick={() => (funnels[funnel.key] += funnels[funnel.key] < 2)}> + </button>
      </div>
    {/each}
  </div>

  <div class="cell totaldmg">
    <table class="dmgtable">
      <thead>
        <tr>
          <th class="td1">序</th>
          <th class="td3">中值</th>
          <th class="tdl"></th>
          <th class="td3 tdm">下限</th>
          <th class="tdm"></th>
          <th class="td3 tdm">上限</th>
          <th class="tdr"></th>
        </tr>
      </thead>
      <tbody>
        {#each sDamageRange as [m, l, r], i}
          <tr>
            <td class="td1">{i + 1}</td>
            <td class="td3">{m}</td>
            <td class="tdl">(</td>
            <td class="td3 tdm">{l}</td>
            <td class="tdm">~</td>
            <td class="td3 tdm">{r}</td>
            <td class="tdr">)</td>
          </tr>
        {/each}
        <tr>
          <td class="td1">总</td>
          <td class="td3">{totalDmg}</td>
          <td class="tdl">(</td>
          <td class="td3 tdm">{totalDmgRange[0]}</td>
          <td class="tdm">~</td>
          <td class="td3 tdm">{totalDmgRange[1]}</td>
          <td class="tdr">)</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>

<style>
  .flex {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: flex-start;
    align-items: flex-start;
    align-content: flex-start;
  }
  .attr {
    width: 6ch;
  }

  .enemygrid {
    display: grid;
    grid-template-columns: 5fr 2fr 2fr 2fr;
    gap: 10px;
    margin: 25px 0px;
  }

  .enemychoose.chosen {
    /* TODO */
    color: red;
  }

  .damagegrid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    grid-template-rows: auto auto auto auto auto;
    gap: 2px;
  }
  .damagegrid .cell.skill {
    grid-row: 1 / 4;
  }
  .damagegrid .cell.skill.hasextra {
    grid-row: 1 / 3;
  }
  .damagegrid .cell.extra {
    grid-row: 3 / 4;
  }
  .damagegrid .cell.aup {
    grid-row: 2 / 3;
    grid-column: 2 / 3;
  }
  .damagegrid .cell.ddown {
    grid-row: 3 / 4;
    grid-column: 2 / 3;
  }
  .damagegrid .cell.break {
    grid-row: 4 / 5;
    grid-column: 3 / 4;
  }
  .damagegrid .cell.funnel {
    grid-row: 4 / 5;
    grid-column: 2 / 3;
  }
  .damagegrid .cell.resist {
    grid-row: 1 / 2;
    grid-column: 3 / 4;
  }
  .damagegrid .cell.fragile {
    grid-row: 3 / 4;
    grid-column: 3 / 4;
  }
  .damagegrid .cell.mind {
    grid-row: 2 / 3;
    grid-column: 3 / 4;
  }
  .cell {
    min-height: 150px;
  }
  .cell.critical {
    grid-row: 1 / 2;
    grid-column: 2 / 3;
  }
  .cell.zone {
    grid-row: 4 / 5;
    grid-column: 1 / 2;
  }

  .cell.totaldmg {
    grid-row: 5 / 6;
    grid-column: 1 / 4;
  }

  .cell {
    border-radius: 13px;
    padding: 13px;
    border-style: solid;
    border-color: black;
    background-color: lightgrey;
  }
  /* .cell.skill {background-color: grey} */
  .cell.aup.enabled {
    background-color: #feb2b2;
  }
  .cell.ddown.enabled {
    background-color: #9ae6b4;
  }
  .cell.critical.enabled {
    background-color: #faf089;
  }
  .cell.zone.enabled {
    background-color: #90cdf4;
  }
  .cell.break {
    background-color: #fbd38d;
  }
  .cell.resist {
    background-color: transparent;
    border-color: black;
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: calc(1em + 13px) 1fr;
  }
  .cell.resist .title {
    grid-column: 1 / 3;
  }
  .cell.resist .elementresist.enabled {
    background-color: #faf089;
  }
  .cell.resist .typeresist.enabled {
    background-color: #d6bcfa;
  }
  .cell.fragile.enabled {
    background-color: #90cdf4;
  }
  .cell.mind.enabled {
    background-color: #feb2b2;
  }
  .cell.funnel.enabled {
    background-color: #92d9b8;
  }
  .cell.totaldmg {
    background-color: orange;
  }

  .cell.disabled {
    background: repeating-linear-gradient(135deg, #cc2211 0, #cc2211 8px, lightgrey 8px, lightgrey 16px);

    border-color: #cc2211;
    cursor: not-allowed;
  }

  .skillTruePower > span:not(.active) {
    color: darkgrey;
    text-decoration: line-through;
  }

  .dmgtable {
    border-collapse: collapse;
  }
  .dmgtable td {
    border: solid;
    border-width: 1px;
    text-align: right;
  }
  .dmgtable td.td1 {
    width: 2ch;
  }
  .dmgtable td.td3 {
    width: 6ch;
  }

  .dmgtable td.tdl,
  .dmgtable td.tdm {
    border-right: none;
  }
  .dmgtable td.tdr,
  .dmgtable td.tdm {
    border-left: none;
  }
</style>
