<script lang="ts">
  import { styles } from '../lib/data.ts'
  import { translate } from '../lib/translate.ts'
  interface Props {
    style: any
    size?: string
    translates?: boolean
  }

  let { style, size = '2em', translates = true }: Props = $props()

  let foundStyle = $derived(style?.label ? style : styles.find((s) => s.label === style))
  let src = $derived(foundStyle ? 'hbr/' + foundStyle.image : '')
  let alt = $derived(foundStyle ? (translates ? translate(foundStyle) : foundStyle).name : style)
</script>

<img style={'--size: ' + size} {src} {alt} />

<style>
  img {
    height: var(--size);
    width: var(--size);
  }
</style>
