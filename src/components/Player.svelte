<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  const dispatch = createEventDispatcher()

  import { translateType, filterFromSearch } from '../lib/utils.ts'
  import { styles, translation } from '../lib/data.ts'
  import { translate, translateLabel } from '../lib/translate.ts'

  import StyleIcon from './StyleIcon.svelte'

  const HBR_QUEST_IMG_PREFIX = `https://www.hbr.quest/hbr`

  export interface Player {
    style: string
    param: any
  }

  export let player: Player

  let dialog
  let search = ''

  function showDialog() {
    search = ''
    dialog.showModal()
  }

  $: searchedStyles = styles.filter(filterFromSearch(search))
</script>

{#if player === null}
  <button class="noplayer" on:click={showDialog}>+</button>
{:else}
  <div class="player">
    <button on:click={showDialog}>编队</button>
    <button on:click={() => dispatch('setStyle', null)}>解除</button>
    <div>
      <StyleIcon style={player} size="100px" />
      <!-- <img src={'hbr/' + player.style.image} alt={player.style.label} /> -->
    </div>
    <div>
      {translateLabel(player).name}
    </div>
    <slot name="param" style={player}></slot>
  </div>
{/if}

<dialog bind:this={dialog}>
  <input class="search" placeholder="搜索" type="text" bind:value={search} />
  <button class="cancel" on:click={() => dialog.close()}>取消</button>
  <div class="flex scroll">
    {#each searchedStyles as st (st.label)}
      <div
        class="altStyle"
        on:click={() => {
          dispatch('setStyle', st.label)
          dialog.close()
        }}
      >
        <StyleIcon style={st} size="100px" />
      </div>
    {/each}
  </div>
</dialog>

<style>
  .noplayer {
    color: pink;
    font-size: 4em;
    background-color: grey;
    border-radius: 13px;
    padding: 13px;
    width: 100%;
    max-width: 180px;
    height: 100%;
    border: none;
  }
  .player {
    background-color: pink;
    border-radius: 13px;
    padding: 13px;
    max-width: 180px;
    height: 100%;
  }
  .flex {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: flex-start;
    align-items: flex-start;
    align-content: flex-start;
  }
  .attr {
    width: 6ch;
  }
  .style,
  .style > img {
    width: 198px;
  }
  dialog {
    width: 800px;
    height: 600px;
    padding: 0;
    border: 0;
    overflow: hidden;
  }
  dialog > input.search {
    padding: 5px;
    height: 20px;
    border: none;
    border-radius: 0;
  }
  dialog > button.cancel {
    height: 34px;
    padding: 5px;
    border: none;
  }
  dialog .scroll {
    width: 800px;
    height: 600px;
    overflow-y: scroll;
    scrollbar-width: thin;
  }
</style>
