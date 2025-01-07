<script lang="ts">
  import { styleByLabel } from '../lib/data.ts'
  import { translate } from '../lib/translate.ts'
  import Symbol from './Symbol.svelte'
  import type { Style } from '../lib/types'
  import { translateType } from '../lib/utils'

  interface Props {
    style: Style | string
    size?: string
    translates?: boolean
    detailed?: boolean
  }

  let { style, size = '2em', translates = true, detailed = false }: Props = $props()

  let foundStyle = $derived(style?.label ? style : styleByLabel[style])
  let src = $derived(foundStyle ? 'hbr/' + foundStyle.image : '')
  let alt = $derived(foundStyle ? (translates ? translate(foundStyle) : foundStyle).name : style)
</script>

<div class="root" style:--size={size}>
  <img {src} {alt} />
  {#if detailed}
    <div class="detail">
      {#each [foundStyle.tier, ...foundStyle.elements, foundStyle.type] as el}
        <Symbol symbol={translateType(el)} size={'calc(' + size + ' * 0.3)'} />
      {/each}
    </div>
  {/if}
</div>

<style>
  .root {
    height: var(--size);
    width: var(--size);
    overflow: hidden;
  }

  img {
    width: 100%;
  }

  .detail {
    position: relative;
    top: calc(0px - var(--size));
  }
</style>
