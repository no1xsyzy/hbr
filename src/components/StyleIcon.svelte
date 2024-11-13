<script lang="ts">
  export let style
  export let size = '2em'
  export let translates = true

  import { styles } from '../lib/data.ts'
  import { translate } from '../lib/translate.ts'

  $: foundStyle = style?.label ? style : styles.find((s) => s.label === style)
  $: src = foundStyle ? 'hbr/' + foundStyle.image : ''
  $: alt = foundStyle ? (translates ? translate(foundStyle) : foundStyle).name : style
</script>

<img style={'--size: ' + size} {src} {alt} />

<style>
  img {
    height: var(--size);
    width: var(--size);
  }
</style>
