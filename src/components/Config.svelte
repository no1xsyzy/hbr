<script>
  import { prolog_init } from '../lib/config'
  import { server } from '../lib/config'
  import { prolog } from 'codemirror-lang-prolog'
  import CodeMirror from 'svelte-codemirror-editor'
</script>

<div class="item">
  <div class="label">Server</div>
  <div class="input">
    <input type="radio" bind:group={$server} value="WFS" /><label for="">WFS</label>
    <input type="radio" bind:group={$server} value="BILI" /><label for="">BILI</label>
  </div>
</div>

<div class="item">
  <div class="label"><label for="">Prolog Init</label></div>
  <div class="input"><CodeMirror bind:value={$prolog_init} lang={prolog()} /></div>
</div>

<style>
  div.item {
    display: grid;
    grid-template-columns: 200px 1fr;
    margin: 30px;
    max-width: 1200px;
  }
</style>
