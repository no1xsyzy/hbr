<script>
  const STORE_KEY = 'CONFIG'

  import { DEFAULT_INIT } from '../lib/prolog.ts'

  let prolog_init = DEFAULT_INIT

  $: ser = () => JSON.stringify({})
  const des = (storedString) => ({} = JSON.parse(storedString))

  const listener = (event) => {
    if (event.key === STORE_KEY && event.newValue !== null) {
      des(event.newValue)
    }
  }

  window.addEventListener('storage', listener)

  onDestroy(() => {
    window.removeEventListener('storage', listener)
  })

  $: des(localStorage[STORE_KEY] ?? '{}')

  $: localStorage[storeKey] = ser()
</script>
