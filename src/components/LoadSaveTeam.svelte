<script>
  import { createEventDispatcher } from 'svelte'
  // import { LocalStorage } from '../lib/store.ts';

  export let team = [null, null, null, null, null, null]

  let savedTeams = []

  // const teamStorage = LocalStorage('savedTeams', []);

  let dialog

  const dispatch = createEventDispatcher()

  function showModal() {
    const s = localStorage.getItem('savedTeams')
    if (s === null) {
      localStorage.setItem((savedTeams = []))
    }
    savedTeams = JSON.parse(localStorage.getItem('savedTeams'))
    dialog.showModal()
  }

  function save() {
    localStorage.setItem('savedTeams', JSON.stringify(savedTeams))
  }
</script>

<button on:click={() => showModal()}>存取队伍</button>

<dialog bind:this={dialog} on:click|self={() => dialog.close()}>
  <button class="close" on:click={() => dialog.close()}>X</button>
  {#each savedTeams as savedTeam, i}
    <div class="line">
      <div class="left">
        <span class="name">{savedTeam.name}</span>
      </div>
      <div class="right">
        ABCDEF
        <button
          class="rename"
          on:click={() => {
            const r = prompt('改名')
            if (r !== null) {
              savedTeam.name = r
              save()
            }
          }}>名</button
        >
        <button
          class="load"
          on:click={() => {
            team = savedTeam.team
          }}>取</button
        >
        <button
          class="erase"
          on:click={() => {
            savedTeams.splice(i, 1)
            savedTeams = savedTeams
            save()
          }}>删</button
        >
        <button
          class="write"
          on:click={() => {
            savedTeam.team = team
            save()
          }}>存</button
        >
      </div>
    </div>
  {/each}
  <div class="line">
    <div class="left"></div>
    <div class="right">
      <button
        on:click={() => {
          savedTeams = [...savedTeams, { name: '队伍 ' + (savedTeams.length + 1), team }]
          save()
        }}>新</button
      >
    </div>
  </div>
</dialog>

<style>
  dialog {
    width: 300px;
    height: 400px;
  }
  .close {
    color: red;
  }
  .line {
    display: flex;
    justify-content: space-between;
  }
  .left {
    text-align: left;
  }
  .right {
    text-align: right;
  }
  dialog button {
    width: 2em;
  }
</style>
