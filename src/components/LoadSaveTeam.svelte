<script lang="ts">
  // import { LocalStorage } from '../lib/store.ts';

  interface Props {
    team?: any
  }

  let { team = $bindable([null, null, null, null, null, null]) }: Props = $props()

  let savedTeams = $state([])

  // const teamStorage = LocalStorage('savedTeams', []);

  let dialog

  function startSelect() {
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

<button onclick={startSelect}>存取队伍</button>

<dialog
  bind:this={dialog}
  onclick={(ev) => {
    if (ev.target === dialog) dialog.close()
  }}
>
  <button class="close" onclick={() => dialog.close()}>X</button>
  {#each savedTeams as savedTeam, i}
    <div class="line">
      <div class="left">
        <span class="name">{savedTeam.name}</span>
      </div>
      <div class="right">
        ABCDEF
        <button
          class="rename"
          onclick={() => {
            const r = prompt('改名')
            if (r !== null) {
              savedTeam.name = r
              save()
            }
          }}>名</button
        >
        <button
          class="load"
          onclick={() => {
            team = savedTeam.team
          }}>取</button
        >
        <button
          class="erase"
          onclick={() => {
            savedTeams.splice(i, 1)
            savedTeams = savedTeams
            save()
          }}>删</button
        >
        <button
          class="write"
          onclick={() => {
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
        onclick={() => {
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
