<script lang="ts">
  interface Props {
    symbol: any
    size?: string
    forceNeoSymbol?: boolean
  }

  let { symbol, size = '1em', forceNeoSymbol = false }: Props = $props()
  let neoSymbol = $derived(forceNeoSymbol || ['光', '冰', '打', '斩', '无', '暗', '火', '突', '雷'].includes(symbol))
  let useSymbol = $derived(['A', 'S', 'SS', '光', '冰', '打', '斩', '无', '暗', '火', '突', '雷'].includes(symbol))
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
    --color-front: white;
    --color-back: rgb(150, 150, 150);
    display: inline-block;
    width: var(--size);
    height: var(--size);
    font-weight: 400;
    font-family: '方正兰亭圆_GBK_准', sans-serif;
    font-size: calc(var(--size) / 2);
    aspect-ratio: 1;
    text-align: center;
    line-height: var(--size);
    border-width: calc(var(--size) / 16);
    border-style: solid;
    color: var(--color-front);
    border-color: var(--color-front);
    background-color: var(--color-back);
    border-radius: var(--size);
  }
  .neo_symbol.c-光 {
    --color-front: black;
    --color-back: white;
  }
  .neo_symbol.c-冰 {
    --color-front: white;
    --color-back: rgb(79, 87, 159);
  }
  .neo_symbol.c-打 {
    --color-front: white;
    --color-back: rgb(71, 122, 55);
  }
  .neo_symbol.c-斩 {
    --color-front: white;
    --color-back: rgb(143, 79, 159);
  }
  .neo_symbol.c-无 {
    --color-front: white;
    --color-back: rgb(150, 150, 150);
  }
  .neo_symbol.c-暗 {
    --color-front: white;
    --color-back: rgb(94, 94, 94);
  }
  .neo_symbol.c-火 {
    --color-front: white;
    --color-back: rgb(159, 79, 79);
  }
  .neo_symbol.c-突 {
    --color-front: white;
    --color-back: rgb(190, 122, 50);
  }
  .neo_symbol.c-雷 {
    --color-front: white;
    --color-back: rgb(134, 119, 51);
  }
</style>
