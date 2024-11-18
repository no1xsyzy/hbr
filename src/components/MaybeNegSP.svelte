<script lang="ts">
  let { sp } = $props()
  let neg_sp = $derived(sp < 0)
</script>

<span class:neg_sp>{sp}SP</span>

<style>
  .neg_sp {
    color: red;
  }
</style>
