<script lang="ts">
  import { type Snippet } from 'svelte'
  import { translateType, filterFromSearch } from '../lib/utils.ts'
  import { styles, translation } from '../lib/data.ts'
  import { translate, translateLabel } from '../lib/translate.ts'

  import StyleIcon from './StyleIcon.svelte'

  const HBR_QUEST_IMG_PREFIX = `https://www.hbr.quest/hbr`

  interface Player<Params> {
    style: string
    params: Params
  }

  interface Props {
    player: string
    param?: Snippet<[{ style: string }]>
    setStyle: (style: string | null) => void
  }

  let { player = $bindable(), param = null, setStyle }: Props = $props()

  let dialog
  let search = $state('')

  function showDialog() {
    search = ''
    dialog.showModal()
  }

  let searchedStyles = $derived(styles.filter(filterFromSearch(search)))
</script>

{#if player === null}
  <button class="noplayer" onclick={showDialog}>+</button>
{:else}
  <div class="player">
    <button onclick={showDialog}>编队</button>
    <button onclick={() => setStyle(null)}>解除</button>
    <div>
      <StyleIcon style={player} size="100px" />
      <!-- <img src={'hbr/' + player.style.image} alt={player.style.label} /> -->
    </div>
    <div>
      {translateLabel(player).name}
    </div>
    {@render param?.({ style: player })}
  </div>
{/if}

<dialog bind:this={dialog}>
  <input class="search" placeholder="搜索" type="text" bind:value={search} />
  <button class="cancel" onclick={() => dialog.close()}>取消</button>
  <div class="flex scroll">
    {#each searchedStyles as st (st.label)}
      <div
        class="altStyle"
        onclick={() => {
          setStyle(st.label)
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
