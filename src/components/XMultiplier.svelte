<script lang="ts">
  interface Props {
    x: any
    percentage?: boolean
    nocolor?: boolean
  }

  let { x, percentage = false, nocolor = false }: Props = $props()

  let small = $derived(0 < x && x < 1)
  let one = $derived(x == 1)
  let big = $derived(1 < x && x < 2)
  let bigger = $derived(2 <= x && x < 3)
  let biggest = $derived(3 <= x)
  let usecolor = $derived(!nocolor)
  let text = $derived(percentage ? `x${x * 100}%` : `x${x}`)
</script>

<span class:small class:one class:big class:bigger class:biggest class:usecolor>{text}</span>

<style>
  .usecolor.small {
    color: white;
    background-color: red;
  }
  .usecolor.big {
    color: violet;
    background-color: white;
  }
  .usecolor.bigger {
    color: red;
    background-color: white;
  }
  .usecolor.biggest {
    color: darkred;
    background-color: white;
  }
</style>
