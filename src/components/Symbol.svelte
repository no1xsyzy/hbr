<script>
  export let symbol
  export let size = '1em'
  export let forceNeoSymbol = false
  $: neoSymbol = forceNeoSymbol || ['光', '冰', '打', '斩', '无', '暗', '火', '突', '雷'].includes(symbol)
  $: useSymbol = ['A', 'S', 'SS', '光', '冰', '打', '斩', '无', '暗', '火', '突', '雷'].includes(symbol)
</script>

{#if symbol === null}
  <!-- render nothing -->
{:else if neoSymbol}
  <span class="neo_symbol c-{symbol}" style={'--size: ' + size}>{symbol}</span>
{:else if useSymbol}
  <img class="symbol" src={'symbol/' + symbol + '.png'} alt={symbol} style={'--size: ' + size} />
{:else}
  <span class="symbol" style={'--size: ' + size}> {symbol} </span>
{/if}

<style>
  .symbol {
    width: var(--size);
    height: var(--size);
  }
  img.symbol {
    vertical-align: middle;
  }
  span.symbol {
    border-radius: var(--size);
    border: 4px solid white;
  }
  span.neo_symbol {
    --color-a: white;
    --color-b: rgb(150, 150, 150);
    display: inline-block;
    width: calc(var(--size) * 2);
    height: calc(var(--size) * 2);
    font-weight: 400;
    font-family: '方正兰亭圆_GBK_准';
    aspect-ratio: 1;
    text-align: center;
    line-height: calc(var(--size) * 2);
    border-width: calc(var(--size) / 8);
    border-style: solid;
    color: var(--color-a);
    border-color: var(--color-a);
    background-color: var(--color-b);
    border-radius: var(--size);
  }
  .neo_symbol.c-光 {
    --color-a: black;
    --color-b: white;
  }
  .neo_symbol.c-冰 {
    --color-a: white;
    --color-b: rgb(79, 87, 159);
  }
  .neo_symbol.c-打 {
    --color-a: white;
    --color-b: rgb(71, 122, 55);
  }
  .neo_symbol.c-斩 {
    --color-a: white;
    --color-b: rgb(143, 79, 159);
  }
  .neo_symbol.c-无 {
    --color-a: white;
    --color-b: rgb(150, 150, 150);
  }
  .neo_symbol.c-暗 {
    --color-a: white;
    --color-b: rgb(94, 94, 94);
  }
  .neo_symbol.c-火 {
    --color-a: white;
    --color-b: rgb(159, 79, 79);
  }
  .neo_symbol.c-突 {
    --color-a: white;
    --color-b: rgb(190, 122, 50);
  }
  .neo_symbol.c-雷 {
    --color-a: white;
    --color-b: rgb(134, 119, 51);
  }
</style>
