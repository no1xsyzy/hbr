<script>
  export let sp
  $: neg_sp = sp < 0
</script>

<span class:neg_sp>{sp}SP</span>

<style>
  .neg_sp {
    color: red;
  }
</style>
