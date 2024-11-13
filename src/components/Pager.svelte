<script>
  import { translateType } from '../lib/utils.ts'

  import Player from './Player.svelte'

  import SimNuke from './SimNuke.svelte'
  import SimODSP from './SimODSP.svelte'
  import Prolog from './Prolog.svelte'
  import EstimateBAcc from './EstimateBAcc.svelte'

  let pages = []
  let currentPageIndex = -1
  let pageCount = 0

  $: console.log('pages', pages)

  function makePage(name, type = 'nuke') {
    return {
      name,
      type,
      storeKey: 'PAGE_' + Math.trunc(Math.random() * 1e8),
    }
  }

  function addPage(type = 'nuke') {
    pageCount += 1
    pages = [...pages, makePage('标签' + pageCount, type)]
    if (currentPageIndex === -1) currentPageIndex = 0
  }

  const trace = (remark) => (data) => (console.log(remark, data), data)
</script>

<nav>
  {#each pages as page, i}
    <button
      on:click={(e) => {
        currentPageIndex = i
      }}
      class="simsel"
      class:current={currentPageIndex == i}
    >
      <span>{page.name}</span>
      <button
        class="del"
        on:click={(e) => {
          pages.splice(i, 1)
          pages = pages
        }}>x</button
      >
    </button>
  {/each}
  <button class="adds" on:click={(e) => addPage('nuke')}>+计算一发核弹</button>
  <button class="adds" on:click={(e) => addPage('odsp')}>+计算OD和SP</button>
  <button class="adds" on:click={(e) => addPage('prolog')}>+超级查询</button>
  <button class="adds" on:click={(e) => addPage('esacc_bili')}>+预测B服实装速度</button>
</nav>

{#each pages as page, i (page.storeKey)}
  {#if page.type == 'nuke'}
    <main class:active={i === currentPageIndex}>
      <SimNuke storeKey={page.storeKey} active={i === currentPageIndex} />
    </main>
  {:else if page.type == 'odsp'}
    <main class:active={i === currentPageIndex}>
      <SimODSP storeKey={page.storeKey} active={i === currentPageIndex} />
    </main>
  {:else if page.type == 'prolog'}
    <main class:active={i === currentPageIndex}>
      <Prolog storeKey={page.storeKey} active={i === currentPageIndex} />
    </main>
  {:else if page.type == 'esacc_bili'}
    <main class:active={i === currentPageIndex}>
      <EstimateBAcc storeKey={page.storeKey} active={i === currentPageIndex} />
    </main>
  {:else}
    <main class:active={i === currentPageIndex}>
      <div class="unknown">未知的页面类型 ({pages[currentPageIndex].type})，请刷新或删除本页面</div>
    </main>
  {/if}
{/each}
<main class:active={currentPageIndex === -1 || !pages[currentPageIndex]}>
  <div class="idle">少女祈祷中……</div>
</main>

<style>
  nav,
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
    background-color: grey;
    height: 40px;
    line-height: 40px;
  }
  nav .simsel {
    background-color: grey;
    border: none;
    height: 40px;
    margin: 0 5px;
    padding-left: 20px;
    &:hover {
      background-color: lightgrey;
    }
  }
  nav .del {
    background-color: transparent;
    border: none;
  }
  nav .del:hover {
    color: red;
  }
  nav .simsel.current {
    background-color: white;
  }
</style>
