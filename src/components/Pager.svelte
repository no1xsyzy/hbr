<script>
  import { onDestroy, tick } from 'svelte'
  import SimNuke from './SimNuke.svelte'
  import SimODSP from './SimODSP.svelte'
  import Prolog from './Prolog.svelte'
  import EstimateBAcc from './EstimateBAcc.svelte'
  import Sql from './Sql.svelte'
  import TeamOrchestration from './TeamOrchestration.svelte'
  import BoxEditor from './BoxEditor.svelte'
  import Config from './Config.svelte'

  const ROOT_STORE_KEY = 'ROOT_STORE_KEY'

  const AVAILABLE_PAGES = {
    'nuke': ['计算一发核弹', SimNuke],
    'odsp': ['计算OD和SP(WIP)', SimODSP],
    'prolog': ['Prolog', Prolog],
    'sql': ['SQL', Sql],
    'esacc_bili': ['预测B服实装速度', EstimateBAcc],
    'team_or': ['编队顶伤计算器(WIP)', TeamOrchestration],
    'box_edit': ['Box编辑', BoxEditor],
    'config': ['设置', Config],
  }

  let pages = $state([])
  let currentPageKey = $state(null)
  let pageCount = 0

  const ser = () => JSON.stringify({ pages, currentPageKey, pageCount })
  const des = (storedString) => ({ pages = [], currentPageKey = null, pageCount = 0 } = JSON.parse(storedString))

  const listener = (event) => {
    if (event.key === ROOT_STORE_KEY && event.newValue !== null) {
      des(event.newValue)
    }
  }
  window.addEventListener('storage', listener)
  onDestroy(() => {
    window.removeEventListener('storage', listener)
  })
  $effect(() => {
    des(localStorage[ROOT_STORE_KEY] ?? '{}')
  })
  $effect(() => {
    localStorage[ROOT_STORE_KEY] = ser()
  })

  function makePage(name, type) {
    const key = Math.trunc(Math.random() * 1e8)
    return {
      name,
      type,
      key,
      storeKey: 'PAGE_' + key,
    }
  }

  function addPage(type) {
    pageCount += 1
    const newPage = makePage('标签' + pageCount, type)
    pages.push(newPage)
    currentPageKey = newPage.key
  }


  function removePage(page, i, current) {
    pages.splice(i, 1)
    const storeKey = page.storeKey
    tick().then(() => { // defer this
      localStorage.removeItem(storeKey)
    })
    if (current) {
      if (pages.length === 0) currentPageKey = null
      else if (pages.length === i) currentPageKey = pages.at(-1).key
      else currentPageKey = pages[i].key
    }
  }

</script>

<nav>
  {#each pages as page, i}
    {@const current = currentPageKey === page.key}
    <label class="page-sel" class:current>
      <input type="radio" style:display="none" bind:group={currentPageKey} value={page.key} />
      {page.name}
      <button class="del" onclick={() => removePage(page, i, current)}>x</button>
    </label>
  {/each}
  <div class="adders">
    {#each Object.keys(AVAILABLE_PAGES) as p}
      <button class="adds" onclick={()=>addPage(p)}>+{AVAILABLE_PAGES[p][0]}</button>
    {/each}
  </div>
</nav>

{#each pages as page, i (page.key)}
  {@const active = currentPageKey === page.key}
  {@const setname = (name) => (page.name = name)}
  {@const [_, Component] = AVAILABLE_PAGES[page.type] ?? [null, null]}
  {#if Component}
    <main class:active>
      <Component storeKey={page.storeKey} {active} {setname} />
    </main>
  {:else}
    <main class:active>
      <div class="unknown">未知的页面类型 ({page.type})，请刷新或删除本页面</div>
    </main>
  {/if}
{/each}
<main class:active={currentPageKey === null}>
  <div class="idle">少女祈祷中……</div>
</main>

<style>
  main {
    width: 100%;
    max-width: 1280px;
    margin: auto;
  }

  .idle {
    width: 100%;
    height: 100%;
    text-align: center;
  }

  main {
    display: none;
  }

  main.active {
    display: inherit;
  }

  nav {
    width: 100%;
    padding: 0 calc((100vw - 1280px) / 2);
    background-color: grey;
    display: flex;
    flex-wrap: wrap;
    gap: 0;

    & .page-sel {
      background-color: grey;
      border: none;
      height: 40px;
      white-space: collapse;
      user-select: none;
      padding-left: 10px;

      &.current {
        background-color: white;
      }

      &:hover {
        background-color: lightgrey;
      }

      & button.del {
        height: 100%;
        background-color: transparent;
        border: none;

        &:hover {
          color: red;
        }
      }
    }

    & .adders {
      margin-left: auto;

      & .adds {
        height: 40px;
      }
    }
  }
</style>
