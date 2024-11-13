<script lang="ts">
  export let storeKey
  export let active

  import { styles, B服实装 } from '../lib/data.ts'

  import * as echarts from 'echarts'

  let root

  $: root && (chart = echarts.init(root))
</script>

<div class="chart" bind:this={root}></div>
