<script>
  export let x
  export let percentage = false
  export let nocolor = false

  $: small = 0 < x && x < 1
  $: one = x == 1
  $: big = 1 < x && x < 2
  $: bigger = 2 <= x && x < 3
  $: biggest = 3 <= x
  $: usecolor = !nocolor
  $: text = percentage ? `x${x * 100}%` : `x${x}`
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
