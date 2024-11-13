<script lang="ts">
  export let storeKey
  import * as echarts from 'echarts'

  import { styles, B服实装 } from '../lib/data.ts'
  import type { Style } from '../lib/types.ts'
  import { translate } from '../lib/translate.ts'

  import lsq from 'least-squares'

  export let active

  const days = 86400_000

  let root
  let chart

  function datasetFromMap(mapDstrStyles: {
    [datestring: string]: string[]
  }): [[Date, number][], { m: number; b: number }] {
    const pairsDateStyle: [Date, string[]][] = Object.keys(mapDstrStyles)
      .map((d) => [new Date(d), mapDstrStyles[d]])
      .sort((x, y) => x[0] - y[0])
    const source = []
    const r2x: number[] = []
    const r2y: number[] = []
    let acc: number = 0
    for (const [date, sls] of pairsDateStyle) {
      acc = acc + sls.length
      const the_styles: Style[] = sls.map((sl) => styles.find((st) => st.label == sl))
      source.push({
        date,
        num: sls.length,
        acc,
        styles: the_styles.map((st) => [st.image, translate(st).name, st.label]),
      })
      r2x.push(date.getTime())
      r2y.push(acc)
    }
    const mb = {}
    const fp = lsq(r2x, r2y, mb)
    const point_of = (x) => [new Date(x), fp(x)]
    return { dataset: { source }, ...mb, fp, point_of }
  }
  function mapDFromStyles(sts: Style[]): { [datestring: string]: string[] } {
    const mapDstrStyles: { [date: string]: string[] } = {}
    for (const style of sts) {
      const ds = style.in_date
      ;(mapDstrStyles[ds] ??= []).push(style.label)
    }
    return mapDstrStyles
  }

  const day0s = {
    W服: new Date('2022-02-10 02:00:00+00:00'),
    B服: new Date('2024-07-17 11:00:00+08:00'),
  }
  const color_w = '#ee8888'
  const color_b = '#5470c6'

  const baseOption = {
    title: {},
    tooltip: {
      formatter: (params) => {
        if (params.length) return
        const { value, seriesName } = params
        if (seriesName.includes('预测')) return
        return [
          `${seriesName}`,
          `${value.date.toISOString().split('T')[0]}`,
          `D+${((value.date - day0s[seriesName]) / 86400_000).toFixed(1)}`,
          `累计${value.acc}`,
          ...value.styles.map(
            ([img, name, label]) => `<img src="hbr/${img}" alt="${name}" height=20 >${name}(#${label})`,
          ),
        ].join('<br>')
      },
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
    },
    toolbox: {
      show: true,
      feature: {
        dataZoom: {},
        dataView: { readOnly: true },
        restore: {},
      },
    },
    xAxis: {
      type: 'time',
      axisPointer: { show: true },
      interval: 14 * days,
    },
    yAxis: {
      axisPointer: { show: true, label: { precision: 0 } },
      minInterval: 1,
    },
    series: [
      {
        name: 'W服',
        type: 'line',
        encode: { x: 'date', y: 'acc' },
        datasetIndex: 0,
        itemStyle: { color: color_w },
        lineStyle: { color: color_w },
      },
      {
        name: 'B服',
        type: 'line',
        encode: { x: 'date', y: 'acc' },
        datasetIndex: 1,
        itemStyle: { color: color_b },
        lineStyle: { color: color_b },
      },
      {
        name: 'W服预测',
        type: 'line',
        encode: { x: 0, y: 1 },
        datasetIndex: 2,
        itemStyle: { color: color_w + '77', opacity: 0 },
        lineStyle: { color: color_w + '77', width: 1, type: 'dashed' },
      },
      {
        name: 'B服预测',
        type: 'line',
        encode: { x: 0, y: 1 },
        datasetIndex: 3,
        itemStyle: { color: color_b + '77', opacity: 0 },
        lineStyle: { color: color_b + '77', width: 1, type: 'dashed' },
      },
    ],
  }

  $: bili = datasetFromMap(B服实装)
  $: wfs = datasetFromMap(mapDFromStyles(styles))

  function draw_line(point_of, from, to, interval) {
    const result = []
    if (interval < 0) interval = (from - to) / interval
    for (let i = from; i < to; i += interval) {
      result.push(point_of(i))
    }
    return result
  }

  $: x_w0 = day0s.W服.getTime()
  $: x_b0 = day0s.B服.getTime()
  $: x_wb = (wfs.b - bili.b) / (bili.m - wfs.m)
  $: x_end = x_wb + 365 * 86400_000

  $: wfs_guess = {
    source: [...draw_line(wfs.point_of, x_w0, x_wb, 14 * days), ...draw_line(wfs.point_of, x_wb, x_end, 14 * days)],
  }
  $: bili_guess = {
    source: [...draw_line(bili.point_of, x_b0, x_wb, 14 * days), ...draw_line(wfs.point_of, x_wb, x_end, 14 * days)],
  }

  // $: wfs_guess = { source: [p_w0, p_wb, p_end] }
  // $: bili_guess = { source: [p_b0, p_wb, p_end] }

  $: root && (chart = echarts.init(root))
  $: chart && chart.setOption(baseOption)
  $: chart && chart.setOption({ dataset: [wfs.dataset, bili.dataset, wfs_guess, bili_guess] })
  $: chart && active && chart.resize()
</script>

<div class="chart" bind:this={root}></div>

<style>
  .chart {
    width: 100%;
    height: 800px;
  }
</style>
