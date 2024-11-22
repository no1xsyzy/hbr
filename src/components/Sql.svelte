<script lang="ts">
  import CodeMirror from 'svelte-codemirror-editor'
  import { sql } from '@codemirror/lang-sql'
  import { onDestroy } from 'svelte'

  import { createDatabase } from '../lib/sql.ts'

  let db = createDatabase()

  const DEFAULT_SQL = 'SELECT * FROM styles'

  let { storeKey } = $props()

  let query = $state(DEFAULT_SQL)
  let limit = $state(5000)

  const ser = () => JSON.stringify({ query, limit })
  const des = (storedString) => ({ query = DEFAULT_SQL, limit = 5000 } = JSON.parse(storedString))

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

  const [ok, result] = $derived.by(() => {
    try {
      const stmt = db.prepare(query)
      const arr = []
      while (stmt.step() && arr.length < limit) arr.push(stmt.get())
      return [true, arr]
    } catch (e) {
      return [false, e.toString()]
    }
  })
</script>

<CodeMirror bind:value={query} lang={sql()} />

<br />
{#if ok}
  Total: {result.length} results
  <br />
  <table>
    <tbody>
      {#each result as r}
        <tr>
          {#each r as c}
            <td>{c}</td>
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>
{:else}
  <div class="error">{result}</div>
{/if}

<style>
  table {
    border-collapse: collapse;
    width: 100%;
  }

  table td {
    border: black solid 1px;
  }

  div.error {
    color: red;
  }
</style>
