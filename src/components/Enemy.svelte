<script lang="ts">
  import Symbol from './Symbol.svelte'
  let { enemy, chosen, onclick } = $props()
</script>

{#if enemy}
  <div class="enemy" class:chosen {onclick}>
    <div>{enemy.name}</div>
    <div>Border: {enemy.border}</div>
    <div>DP: {enemy.dp}</div>
    <div>HP: {enemy.hp}</div>
    {#each enemy.resist as resist}
      {#if resist.type === 'IgnorePenetration'}
        {#if resist.rate === true}
          <div>无视贯通</div>
        {/if}
      {:else}
        <div><Symbol symbol={resist.type} />抗性{resist.rate}%（x{(1 - resist.rate / 100).toFixed(2)}）</div>
      {/if}
    {/each}
  </div>
{:else}
  <div class="noenemy"></div>
{/if}

<style>
  .enemy {
    background-color: #a52a2a;
    color: white;
    border-radius: 13px;
    padding: 13px;
  }
  .chosen {
    border-style: solid;
    border-width: 1px;
    border-color: blue;
  }
  .noenemy {
    background-color: #a52a2a40;
    color: white;
    border-radius: 13px;
    padding: 13px;
  }
</style>
