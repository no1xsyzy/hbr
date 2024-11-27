<script>
  import { untrack } from 'svelte'

  let { value = $bindable(), min = null, max = null, ...rest } = $props()

  let thisValue = $state(value)

  $effect(() => {
    if (thisValue < min) {
      thisValue = min
    } else if (thisValue > max) {
      thisValue = max
    }
    if (untrack(() => value) !== thisValue) {
      value = thisValue
    }
  })
  $effect(() => {
    if (untrack(() => thisValue) !== value) {
      thisValue = value
    }
  })
</script>

<input type="number" bind:value={thisValue} {...rest} {min} {max} />
