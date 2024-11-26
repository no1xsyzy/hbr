<script lang="ts">
  // import { styles } from '../lib/data'
  import { limit_break, style_lv, chara_lv } from '../lib/user_box'
  import StyleIcon from './StyleIcon.svelte'
  import type { Style } from '../lib/types'
  import { installedStyles } from '../lib/utils'
  import { server } from '../lib/config'

  const styles = $derived(installedStyles($server))

  const max_chara_lvs = (chara: string) => {
    let result = 0
    for (const style of styles) {
      if (style.chara_label === chara && $limit_break[style.label] !== undefined) {
        const r = style.limit_break.bonus_per_level.find(lb => lb.step === $limit_break[style.label])?.level_cap ?? 0
        if (r > result) result = r
      }
    }
    if ($server === 'BILI') result -= 10
    return result
  }

  const max_lb = (style: Style) =>
    Math.max(...style.limit_break.bonus_per_level.map(lb => lb.step))


  $inspect('$limit_break', $limit_break)
  $inspect('$style_lv', $style_lv)
  $inspect('$chara_lv', $chara_lv)

</script>

<div class="container">
  {#each styles as style}
    {@const max_clv = max_chara_lvs(style.chara_label)}
    <div class="item">
      <span class="head" class:disabled={$limit_break[style.label] === undefined}
            onclick={()=>{
             if($limit_break[style.label] === undefined){
               $limit_break[style.label] = 0
               $style_lv[style.label] ??= 0
               $chara_lv[style.chara_label] ??= max_clv
             }else{
               $limit_break[style.label] = undefined
             }
           }}>
        <StyleIcon {style} size="80px" detailed />
      </span>
      {#if $limit_break[style.label] !== undefined}
        <span class="lb">突破：</span>
        <input class="lb1" type="number" bind:value={$limit_break[style.label]} min="0" max={max_lb(style)} />
        <span class="slv">SLv：</span>
        <input class="slv1" type="number" bind:value={$style_lv[style.label]} min="0" max={$server === 'BILI'?0:10}>
        <span class="clv">CLv：</span>
        <input class="clv1" type="number" bind:value={$chara_lv[style.chara_label]} min="0" max={max_clv}
               onblur={()=>{if($chara_lv[style.chara_label]>max_clv){$chara_lv[style.chara_label]=max_clv}}}>
      {/if}
    </div>
  {/each}
</div>

<style>
  .disabled {
    filter: brightness(50%);
  }

  .container {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    grid-gap: 12px;
    max-width: 1080px;
    margin: 30px;
  }

  .item {
    height: 80px;
  }

  .item {
    display: grid;
    grid-template-columns: auto 1fr 1fr;
    grid-template-rows: 1fr 1fr 1fr;
    grid-template-areas:
    "head lb lb1"
    "head slv slv1"
    "head clv clv1";
  }

  .head {
    grid-area: head;
    aspect-ratio: 1;
  }

  .lb {
    grid-area: lb
  }

  .slv {
    grid-area: slv
  }

  .clv {
    grid-area: clv
  }
</style>
