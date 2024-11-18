<script lang="ts">
  import { onDestroy } from 'svelte'
  import { DEFAULT_INIT, doQuery, presets } from '../lib/prolog.ts'
  import pl from '../lib/tau-prolog.ts'
  import { styles, skills, characters } from '../lib/data.ts'
  import { translate } from '../lib/translate.ts'

  let { storeKey } = $props()

  let query = $state(presets[0].query)
  let cols = $state(presets[0].cols)
  let result = $state([])

  const ser = () => JSON.stringify({ query, cols, result })
  const des = (storedString) =>
    ({ query = presets[0].query, cols = presets[0].cols, result = [] } = JSON.parse(storedString))

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

  let status: 'idle' | 'running' | 'terminating' | 'terminated' | 'finished' | 'limit' | ['error', string] =
    $state('idle')

  let running = $derived(status === 'running' || status === 'terminating')

  // let defined_cols = $state([])
  // let sorter = $state([])
  // let headers = $state({})

  let [defined_cols, sorter, headers] = $derived.by(() => {
    const defined_cols = []
    const sorter = []
    const headers = {}
    for (let col of cols.split('\n')) {
      try {
        col = col.trim()
        if (!col) continue
        const [_, key, c] = /(.+?):\s*(.*)/.exec(col)
        const configs = c.split(/\s+/)
        let defined = false
        for (const config of configs) {
          if (['icon', 'name', 'icon_and_name', 'number', 'percentage', 'hidden', 'text', 'auto'].includes(config)) {
            defined = true
            defined_cols.push([key, config])
          } else if (/^sort_/.exec(config)) {
            const [_, dir, priority] = /^sort_(asc|desc)_(\d+)/.exec(config)
            sorter.push([priority, key, dir])
          } else if (/^h=/.exec(config)) {
            const [_, header] = /^h=(.+)/.exec(config)
            headers[key] = header
          } else {
            console.warn(`unknown config '${config}'`)
          }
        }
        if (!defined) defined_cols.push([key, 'auto'])
      } catch {
        continue
      }
    }
    return [defined_cols, sorter.sort((x, y) => x[0] - y[0]), headers]
  })

  let extra_cols = $derived(
    [...new Set(result.flatMap((row) => Object.keys(row)))]
      .filter((key) => defined_cols.find((c) => c[0] === key) === undefined)
      .map((key) => [key, 'text']),
  )

  let all_cols = $derived([...defined_cols, ...extra_cols])

  let sorted_result = $derived(
    [...result].sort((x, y) => {
      for (let [_, key, dir] of sorter) {
        if (x[key] < y[key]) return 1 - 2 * +(dir == 'asc') // true = -1 ; false = 1
        if (x[key] > y[key]) return 2 * +(dir == 'asc') - 1 // true = 1 ; false = -1
      }
      return 0
    }),
  )

  const iconFromStyleLabel = (label) => styles.find((st) => st.label === label)?.image ?? ''
  const iconFromSkillLabel = (label) => skills.find((sk) => sk.label === label)?.image ?? ''
  const iconFromCharaLabel = (label) => characters.find((c) => c.label === label)?.image ?? ''

  const iconFromToken = (token) => {
    const [_, category, label] = /^(.+)\.(.+)$/.exec(token)
    switch (category) {
      case 'Style':
        return iconFromStyleLabel(label)
      case 'Skill':
        return iconFromSkillLabel(label)
      case 'Character':
        return iconFromCharaLabel(label)
    }
  }

  const nameFromStyleLabel = (label) => translate(styles.find((st) => st.label === label))?.name ?? ''
  const nameFromSkillLabel = (label) => translate(skills.find((sk) => sk.label === label))?.name ?? ''
  const nameFromCharaLabel = (label) =>
    translate(characters.find((c) => c.label === label))
      ?.name.split(' — ')
      .find((x) => x) ?? ''

  const nameFromToken = (token) => {
    const [_, category, label] = /^(.+)\.(.+)$/.exec(token)
    switch (category) {
      case 'Style':
        return nameFromStyleLabel(label)
      case 'Skill':
        return nameFromSkillLabel(label)
      case 'Character':
        return nameFromCharaLabel(label)
    }
  }

  const ddd = () => {
    if (running) {
      return
    }
    result = []
    status = 'running'
    doQuery(
      query,
      (answer, env) => {
        if (status === 'terminating') {
          env.terminate = true
          return
        }
        const row = {}
        for (var link in answer.links) {
          const v = answer.links[link]
          if (pl.type.is_number(v)) {
            row[link] = v.value
          } else if (pl.type.is_atom(v)) {
            row[link] = v.id
          } else {
            console.warn('!!!', link, v)
          }
          env.add_col(link)
        }
        env.rows.push(row)
      },
      {
        cbstart(env) {
          env.cols = []
          env.add_col = (x) => {
            if (!env.cols.includes(x)) {
              env.cols.push(x)
              return true
            }
            return false
          }
          env.rows = []
        },
        cbend(reason, env) {
          switch (reason) {
            case 'end':
              status = 'finished'
              break
            case 'limit':
              status = 'limit'
              break
            case 'termiate':
              status = 'terminated'
              break
          }
          result = env.rows
        },
        cberror(phase, err, env) {
          status = ['error', phase]
          console.error('[HBR超级查询]', phase, err)
        },
      },
    )
  }
</script>

<div>
  预设：
  {#each presets as preset}
    <button
      onclick={() => {
        query = preset.query
        cols = preset.cols
      }}>{preset.name}</button
    >
  {/each}
</div>

<form class="input">
  <textarea
    bind:value={query}
    onkeydown={(e) => {
      if (e.keyCode == 13 && e.ctrlKey) ddd()
    }}
    spellcheck="false"
  ></textarea>

  <textarea
    bind:value={cols}
    onkeydown={(e) => {
      if (e.keyCode == 13 && e.ctrlKey) ddd()
    }}
    spellcheck="false"
  ></textarea>

  <button
    disabled={running}
    onclick={(e) => {
      ddd()
    }}>开始计算</button
  >
  <button
    disabled={!running}
    onclick={(e) => {
      status = 'terminating'
    }}>中止计算</button
  >
</form>

{#if status === 'idle'}
  <p>空闲</p>
{:else if status === 'running'}
  <p>正在计算中……</p>
{:else if status === 'terminating'}
  <p>正在中止……</p>
{:else if status === 'terminated'}
  <p>被中止</p>
{:else if status === 'finished'}
  <p>完成</p>
{:else if status === 'limit'}
  <p>完成（数量超出上限）</p>
{:else if status[0] === 'error'}
  <p>在{status[1]}阶段发生错误！具体内容见浏览器控制台</p>
{/if}

{#if sorted_result.length > 0}
  <table class="result">
    <thead>
      <tr>
        {#each all_cols as [key, output]}
          {#if output !== 'hidden'}
            <th>{headers[key] ?? key}</th>
          {/if}
        {/each}
      </tr>
    </thead>
    <tbody>
      {#each sorted_result as line}
        <tr>
          {#each all_cols as [key, output]}
            {#if output === 'hidden'}
              <!-- nothing -->
            {:else if output === 'auto'}
              <td>{line[key]}</td>
            {:else if output === 'number'}
              <td>{line[key]}</td>
            {:else if output === 'text'}
              <td>{line[key]}</td>
            {:else if output === 'percentage'}
              <td>{Math.trunc(line[key] * 100)}%</td>
            {:else if output === 'icon'}
              <td>
                <img src={'hbr/' + iconFromToken(line[key])} alt={line[key]} />
              </td>
            {:else if output === 'name'}
              <td>{nameFromToken(line[key])}</td>
            {:else if output === 'icon_and_name'}
              <td>
                <div class="flex">
                  <img src={'hbr/' + iconFromToken(line[key])} alt={line[key]} />
                  {nameFromToken(line[key])}
                </div>
              </td>
            {:else}
              <!-- just in case -->
              <td>{line[key]}</td>
            {/if}
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>
{/if}

<style>
  .input {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto 4em;
    gap: 10px;
    height: 30vh;
  }
  .result {
    border: 1px solid black;
    border-collapse: collapse;
    width: 100%;
  }
  .result th,
  .result td {
    border: 1px solid black;
    text-align: center;
  }
  img {
    height: 2em;
    aspect-ratio: 1;
    vertical-align: middle;
  }
  .flex {
    display: flex;
    align-items: center;
  }
</style>
