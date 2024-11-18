<script lang="ts">
  import { styles, B服实装 } from '../lib/data.ts'

  import * as echarts from 'echarts'
  let { storeKey, active } = $props()

  function renderChart(root) {
    const chart = echarts.init(root)
  }
</script>

<div class="chart" use:renderChart></div>
