<script lang="ts">
  // import { styles } from '../lib/data'
  import { limit_break, style_lv, chara_lv } from '../lib/user_box'
  import StyleIcon from './StyleIcon.svelte'
  import type { Style } from '../lib/types'
  import { installedStyles } from '../lib/utils'
  import { server } from '../lib/config'
  import ConstraintedNumberInput from './ConstraintedNumberInput.svelte'
  import { styleById } from '../lib/data'

  const styles = $derived(installedStyles($server))

  const max_chara_lvs = (chara: string) => {
    let result = 0
    for (const style of styles) {
      if (style.chara_label === chara && $limit_break[style.label] !== undefined) {
        const r = style.limit_break.bonus_per_level.find((lb) => lb.step === $limit_break[style.label])?.level_cap ?? 0
        if (r > result) result = r
      }
    }
    if ($server === 'BILI') result -= 10
    return result
  }

  const max_lb = (style: Style) => Math.max(...style.limit_break.bonus_per_level.map((lb) => lb.step))

  $inspect('$limit_break', $limit_break)
  $inspect('$style_lv', $style_lv)
  $inspect('$chara_lv', $chara_lv)

  let dialog
  let load = ''
  let done = null
  let err = $state('')
  const doneLoadBili = () => {
    try {
      let response = JSON.parse(load)
      if (response.code === 0) {
        response = response.data
      } else if (response.code !== 0) {
        err = `BiliBili API Error: ${response.message}`
        return
      }
      const lb = {}
      const slv = {}
      const clv = {}
      for (const { role_id, limit_break_level, level } of response.mine_cards) {
        const { label, chara_label } = styleById[role_id] as Style
        lb[label] = limit_break_level
        slv[label] = 0
        clv[chara_label] = level
      }
      $limit_break = lb
      $style_lv = slv
      $chara_lv = clv
      dialog.close()
    } catch (e) {
      err = e.toString()
    }
  }
</script>

<!-- 这个 snippet 写成嵌套来直接使用组件的词法作用域。虽然可以 refactor 成为单独组件，但感觉没必要 -->
{#snippet styleCard(style: Style)}
  {@const max_clv = max_chara_lvs(style.chara_label)}
  {@const max_slv = $server === 'BILI' ? 0 : 10}
  <div class="item">
      <span
        class="head"
        class:disabled={$limit_break[style.label] === undefined}
        onclick={() => {
          if ($limit_break[style.label] === undefined) {
            $limit_break[style.label] = 0
            $style_lv[style.label] ??= max_slv
            $chara_lv[style.chara_label] ??= max_clv
          } else {
            $limit_break[style.label] = undefined
          }
        }}
      >
        <StyleIcon {style} size="80px" detailed />
      </span>
    {#if $limit_break[style.label] !== undefined}
      <span class="lb">突破：</span>
      <ConstraintedNumberInput class="lb1" bind:value={$limit_break[style.label]} min={0} max={max_lb(style)} />
      <span class="slv">SLv：</span>
      <ConstraintedNumberInput class="slv1" bind:value={$style_lv[style.label]} min={0} max={max_slv} />
      <span class="clv">CLv：</span>
      <ConstraintedNumberInput class="clv1" bind:value={$chara_lv[style.chara_label]} min={0} max={max_clv} />
    {/if}
  </div>
{/snippet}

<button onclick={()=>{done=doneLoadBili; dialog.showModal()}}>导入</button>

<div class="container">
  {#each styles as style}
    {@render styleCard(style)}
  {/each}
</div>

<dialog bind:this={dialog}>
  <input type="text" bind:value={load} />
  <div class="err">{err}</div>
  <button onclick={()=>{done?.()}}>确定</button>
  <button onclick={()=>{dialog.close()}}>取消</button>
</dialog>

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
      'head lb lb1'
      'head slv slv1'
      'head clv clv1';

    & :global(.lb1) {
      grid-area: lb1;
    }

    & :global(.slv1) {
      grid-area: slv1;
    }

    & :global(.clv1) {
      grid-area: clv1;
    }
  }

  .head {
    grid-area: head;
    aspect-ratio: 1;
  }

  .lb {
    grid-area: lb;
  }

  .slv {
    grid-area: slv;
  }

  .clv {
    grid-area: clv;
  }

  .err {
    color: red;
  }
</style>
