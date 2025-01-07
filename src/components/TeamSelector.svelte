<!-- @migration-task Error while migrating Svelte code: Cannot reassign or bind to each block argument in runes mode. Use the array and index variables instead (e.g. `array[i] = value` instead of `entry = value`) -->
<script lang="ts">
  import LoadSaveTeam from './LoadSaveTeam.svelte'
  import Player from './Player.svelte'
  import type { Snippet } from 'svelte'

  interface Props {
    team: [string | null, string | null, string | null, string | null, string | null, string | null]
    param: Snippet<[{ pos: number, style: string }]>
  }

  let { team = $bindable([null, null, null, null, null, null]), param: param_render }: Props = $props()
</script>

<div class="playergrid">
  <LoadSaveTeam bind:team />

  {#each team as player, pos}
    {#snippet param({ style })}
      {@render param_render?.({ pos, style })}
    {/snippet}
    <div>
      <Player {player} {param} setStyle={(st) => (team[pos] = st)} />
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
