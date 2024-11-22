<script>
  import { onDestroy, tick } from 'svelte'
  import SimNuke from './SimNuke.svelte'
  import SimODSP from './SimODSP.svelte'
  import Prolog from './Prolog.svelte'
  import EstimateBAcc from './EstimateBAcc.svelte'
  import Sql from './Sql.svelte'

  const ROOT_STORE_KEY = 'ROOT_STORE_KEY'

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
</script>

<nav>
  {#each pages as page, i}
    {@const current = currentPageKey === page.key}
    <div class="simsel" class:current>
      <button class="sel" onclick={(e) => (currentPageKey = page.key)}>{page.name}</button>
      <button
        class="del"
        onclick={() => {
          pages.splice(i, 1)
          const storeKey = page.storeKey
          tick().then(() => {
            localStorage.removeItem(storeKey)
          })
          if (current) {
            if (pages.length === 0) currentPageKey = null
            else if (pages.length === i) currentPageKey = pages.at(-1).key
            else currentPageKey = pages[i].key
          }
        }}
      >x
      </button>
    </div>
  {/each}
  <!-- <div class="padding"></div> -->
  <div class="adders">
    <button class="adds" onclick={() => addPage('nuke')}>+计算一发核弹</button>
    <button class="adds" onclick={() => addPage('odsp')}>+计算OD和SP</button>
    <button class="adds" onclick={() => addPage('prolog')}>+Prolog</button>
    <button class="adds" onclick={() => addPage('sql')}>+SQL</button>
    <button class="adds" onclick={() => addPage('esacc_bili')}>+预测B服实装速度</button>
  </div>
</nav>

{#each pages as page, i (page.key)}
  {@const active = currentPageKey === page.key}
  {@const setname = (name) => (page.name = name)}
  {#if page.type === 'nuke'}
    <main class:active>
      <SimNuke storeKey={page.storeKey} {active} {setname} />
    </main>
  {:else if page.type === 'odsp'}
    <main class:active>
      <SimODSP storeKey={page.storeKey} {active} {setname} />
    </main>
  {:else if page.type === 'prolog'}
    <main class:active>
      <Prolog storeKey={page.storeKey} {active} {setname} />
    </main>
  {:else if page.type === 'sql'}
    <main class:active>
      <Sql storeKey={page.storeKey} {active} {setname} />
    </main>
  {:else if page.type === 'esacc_bili'}
    <main class:active>
      <EstimateBAcc storeKey={page.storeKey} {active} {setname} />
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

    & .adders {
      margin-left: auto;
    }

    & .simsel {
      background-color: grey;
      border: none;
      height: 40px;
      white-space: collapse balance;

      &:hover {
        background-color: lightgrey;
      }

      & button {
        height: 100%;
        background-color: transparent;
        border: none;

        &.sel {
          padding: 0 10px;
        }

        &.del:hover {
          color: red;
        }
      }

      &.current {
        background-color: white;
      }
    }
  }

  nav .adds {
    height: 40px;
  }
</style>
