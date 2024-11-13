<script>
  export let team = [null, null, null, null, null, null]

  import LoadSaveTeam from './LoadSaveTeam.svelte'
  import Player from './Player.svelte'
</script>

<div class="playergrid">
  <LoadSaveTeam bind:team />

  {#each team as player, pos}
    <div>
      <Player
        {player}
        on:setStyle={(ev) => {
          player = ev.detail
        }}
      >
        <slot slot="param" name="param" {pos} let:style {style}></slot>
      </Player>
    </div>
  {/each}
</div>

<style>
  .playergrid {
    min-height: 200px;
    display: grid;
    grid-template-columns: 1fr 2fr 2fr 2fr 2fr 2fr 2fr;
    gap: 10px;
    margin: 25px 0px;
  }
</style>
