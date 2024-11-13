<script lang="ts">
  import { onDestroy } from 'svelte'

  export let apparentTeam
  export let storeKey

  import TeamSelector from './TeamSelector.svelte'
  import BattleSelector from './BattleSelector.svelte'
  import Enemy from './Enemy.svelte'
  import MaybeNegSP from './MaybeNegSP.svelte'
  import StyleIcon from './StyleIcon.svelte'

  import { styles } from '../lib/data.ts'
  import { translate } from '../lib/translate.ts'

  type Action = 'OD' | { style: string; skill: string }

  let team = [null, null, null, null, null, null]
  let params = Array(6)
    .fill(0)
    .map(() => ({
      breakthrough: 0,
      driveboost: 0,
      braceletEl: 'Fire',
      chain: 3,
      initSp: 1,
    }))
  let enemies = [null, null, null]
  let moves = [
    [
      { style: 'LShanhua03', skill: 'LShanhuaAttackNormal', target: 'ENEMY_1' },
      { style: 'MdAngelis03', skill: 'MdAngelisAttackNormal', target: 'ENEMY_1' },
      { style: 'SHiguchi04', skill: 'SHiguchiAttackNormal', target: 'ENEMY_1' },
    ],
    [
      { style: 'LShanhua03', skill: 'LShanhuaSkill51', target: 'MdAngelis03' },
      { style: 'MdAngelis03', skill: 'MdAngelisSkill01', target: 'AllyFront' },
      { style: 'SHiguchi04', skill: 'SHiguchiSkill52', target: 'MdAngelis03' },
    ],
    [
      { style: 'LShanhua03', skill: 'LShanhuaSkill51', target: 'MdAngelis03' },
      { style: 'MdAngelis03', skill: 'MdAngelisSkill51', target: 'ENEMY_1' },
      { style: 'SHiguchi04', skill: 'SHiguchiAttackNormal', target: 'ENEMY_1' },
    ],
    ['OD', 'pre', 3],
    // OD turn 1
    // OD turn 2
    // OD turn 3
    // normal turn
    ['OD', 'post', 1],
  ]
  let initialState = {}

  const des = (s) => {
    const parsed = JSON.parse(s)
    ;({
      team = [null, null, null, null, null, null],
      enemies = [null, null, null],
      moves = [],
      initialState = {},
    } = parsed)
  }

  const ser = () => JSON.stringify({ team, enemies, moves, initialState })

  $: des(localStorage[storeKey] ?? '{}')
  $: localStorage[storeKey] = JSON.stringify({ team, enemies, moves, initialState })

  const listener = (event) => {
    if (event.key === storeKey && event.newValue !== null) {
      des(event.newValue)
    }
  }

  window.addEventListener('storage', listener)

  onDestroy(() => {
    window.removeEventListener('storage', listener)
  })

  // $: states = moves.reduce(
  //   (states, action) => {
  //     const lastState = states.slice(-1)
  //     const nextState = { action } //
  //     return [...states, nextState]
  //   },
  //   [initialState],
  // ) //...

  const maxBreakthrough = (style) => {
    if (typeof style === 'string') style = styles.find((s) => s.label === style)
    return Math.max(...style.limit_break.bonus_per_level.map((b) => b.step))
  }

  let editCursor = null
  let dialog

  let editoryStyle
  let editorySkill
  let editoryTarget

  let dialogConfirm

  $: if (dialog) {
    if (editCursor) {
      const editory = moves[editCursor[0]][editCursor[1]]
      editoryStyle = editory.style
      editorySkill = editory.skill
      editoryTarget = editory.target
      dialogConfirm = () => {
        editory.style = editoryStyle
        editory.skill = editorySkill
        editory.target = editoryTarget
      }
      dialog.showModal()
    } else {
      dialog.close()
    }
  }

  // $: calculated = calculateMoves(moves)

  $: calculated = [
    {
      name: 'pre1T',
      type: 'pre',
      info: [
        [{ style: 'LShanhua03', sp: [4, 7] }],
        [{ style: 'MdAngelis03', sp: [4, 7] }],
        [{ style: 'SHiguchi04', sp: [4, 7] }],
      ],
    },
    {
      name: '1T',
      type: 'move',
      moveIndex: 0,
      moves: [
        {
          style: 'LShanhua03',
          skill: 'LShanhuaAttackNormal',
          after: [{ type: 'odchange', value: 7.5 }],
        },
        {
          style: 'MdAngelis03',
          skill: 'MdAngelisAttackNormal',
          after: [{ type: 'odchange', value: 7.5 }],
        },
        {
          style: 'SHiguchi04',
          skill: 'SHiguchiAttackNormal',
          after: [{ type: 'odchange', value: 7.5 }],
        },
      ],
    },
    { name: '敌人行动', type: 'enemy' },
    {
      name: 'pre2T',
      type: 'pre',
      info: [
        [{ style: 'LShanhua03', sp: [7, 10] }],
        [{ style: 'MdAngelis03', sp: [7, 10] }],
        [{ style: 'SHiguchi04', sp: [7, 10] }],
      ],
    },
    {
      name: '2T',
      type: 'move',
      moveIndex: 1,
      moves: [
        {
          style: 'LShanhua03',
          skill: 'LShanhuaSkill51',
          target: 'MdAngelis03',
          after: [{ type: 'spchange', sp: [10, -1] }],
        },
        {
          style: 'MdAngelis03',
          skill: 'MdAngelisSkill01',
          after: [{ type: 'spchange', sp: [10, 4] }],
        },
        {
          style: 'SHiguchi04',
          skill: 'SHiguchiSkill52',
          target: 'MdAngelis03',
          after: [{ type: 'spchange', sp: [10, 1] }],
        },
      ],
    },
    { name: '敌人行动', type: 'enemy' },
    {
      name: 'pre3T',
      type: 'pre',
      info: [
        [{ style: 'LShanhua03', sp: [-1, 2] }],
        [{ style: 'MdAngelis03', sp: [4, 7] }],
        [{ style: 'SHiguchi04', sp: [1, 4] }],
      ],
    },
    {
      name: '3T',
      type: 'move',
      moveIndex: 2,
      moves: [
        {
          style: 'LShanhua03',
          skill: 'LShanhuaSkill51',
          target: 'MdAngelis03',
          after: [{ type: 'spchange', sp: [2, -9] }],
        },
        {
          style: 'MdAngelis03',
          skill: 'MdAngelisSkill51',
          after: [
            { type: 'spchange', sp: [7, -7] },
            { type: 'odchange', value: 12.5 },
          ],
        },
        {
          style: 'SHiguchi04',
          skill: 'SHiguchiAttackNormal',
          after: [{ type: 'odchange', value: 7.5 }],
        },
      ],
    },
  ]

  const charaSkills = (styleLabel) => {
    const style = styles.find((s) => s.label === styleLabel)
    const chara = style.chara_label
    return styles.flatMap(({ generalize, skills, label, chara_label }) =>
      label === styleLabel || generalize
        ? skills
        : chara_label === chara
          ? skills.filter((s) => s.is_restricted === 0)
          : [],
    )
  }
</script>

<TeamSelector bind:team>
  <div slot="param" let:pos class="param flex" let:style>
    <div>
      突破
      <input class="attr" type="number" bind:value={params[pos].breakthrough} min="0" max={maxBreakthrough(style)} />
    </div>
    <div>
      OD耳环
      <select bind:value={params[pos].driveboost}>
        <option value={0}>无</option>
        <option value={10}>+10%</option>
        <option value={12}>+12%</option>
        <option value={15}>+15%</option>
      </select>
    </div>
    <div>
      手环
      <select bind:value={params[pos].braceletEl}>
        <option value="Noelement">无</option>
        <option value="Fire">火</option>
        <option value="Ice">冰</option>
        <option value="Thunder">雷</option>
        <option value="Light">光</option>
        <option value="Dark">暗</option>
      </select>
    </div>
    <div>
      项链
      <select bind:value={params[pos].chain}>
        <option value={0}>SP+0</option>
        <option value={1}>SP+1</option>
        <option value={2}>SP+2</option>
        <option value={3}>SP+3</option>
      </select>
    </div>
    <div>初始SP<input class="attr" type="number" bind:value={params[pos].initSp} /></div>
  </div>
</TeamSelector>

<div class="enemygrid">
  <BattleSelector
    on:setenemies={(ev) => {
      enemies = [...ev.detail, null, null].slice(0, 3)
    }}
  />
  <Enemy enemy={enemies[2]} />
  <Enemy enemy={enemies[0]} />
  <Enemy enemy={enemies[1]} />
</div>

{#each calculated as turn, i}
  {#if turn.type === 'move'}
    <div class="turn move">
      <div class="pos0">{turn.name}</div>
      {#each turn.moves as col, i}
        <div class="cell move {'pos' + (i + 1)}">
          <StyleIcon style={col.style} />
          {translate({ label: col.skill }).name}
          {#if col?.target && !col.target.startsWith('ENEMY_') && !col.target.startsWith('Ally')}
            <StyleIcon style={col.target} />
          {/if}
          <span class="padding"></span>
          <button class="moveedit" on:click={() => (editCursor = [turn.moveIndex, i])}>*</button>
        </div>

        <div class="cell after {'pos' + (i + 1)}">
          {#each col?.after ?? [] as after}
            {#if after.type === 'spchange'}
              <span>
                <MaybeNegSP sp={after.sp[0]} />→<MaybeNegSP sp={after.sp[1]} />
              </span>
            {:else if after.type === 'odchange'}
              <span>+{after.value}%OD</span>
            {/if}
          {/each}
        </div>
      {/each}
    </div>
  {:else if turn.type === 'pre'}
    <div class="turn pre">
      <div class="pos0">{turn.name}</div>
      {#each turn.info as c, i}
        <div class="cell pre {'pos' + (i + 1)}">
          {#each c as r}
            <StyleIcon style={r.style} />
            <MaybeNegSP sp={r.sp[0]} /> → <MaybeNegSP sp={r.sp[1]} />
          {/each}
        </div>
      {/each}
    </div>
  {:else if turn.type === 'enemy'}
    <div class="turn enemy">
      <div class="pos0">{turn.name}</div>
    </div>
  {/if}
{/each}

<div class="turn new">
  <button class="add" on:click={() => moves.push([])}>+</button>
  <button class="minus" on:click={() => moves.pop()}>-</button>
</div>

<dialog bind:this={dialog}>
  <button class="cancel" on:click={() => (editCursor = null)}>取消</button>
</dialog>

<style>
  .param.flex {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: flex-start;
    align-items: flex-start;
    align-content: flex-start;
    & .attr {
      width: 6ch;
    }
  }

  .enemygrid {
    display: grid;
    grid-template-columns: 5fr 2fr 2fr 2fr;
    gap: 10px;
    margin: 25px 0px;
  }

  .turn {
    display: grid;
    grid-template-columns: auto 5fr 5fr 5fr 1fr 1fr 1fr;
    gap: 2px;
    margin: 2em 0;
  }

  .turn.move {
    grid-template-rows: 2em 1em;
    & .cell.move {
      grid-row: 1 / 2;
      padding: 0.5em 0;
      border: 1px solid;
      border-radius: 1em;
      display: flex;
      align-items: center;
      & .padding {
        flex-grow: 1;
      }
      & .moveedit {
        height: 2rem;
        aspect-ratio: 1;
        border: none;
        padding: 0;
        border-radius: 2rem;
        background: none;
      }
    }
    & .cell.after {
      grid-row: 2 / 3;
      display: flex;
      align-items: center;
      justify-content: space-evenly;
    }
    & .pos0 {
      grid-row: 1 / 3;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid;
      border-radius: 3em;
      width: calc(3em + 2px);
      height: calc(3em + 2px);
    }
  }

  .turn.pre {
    /* grid-template-rows: 2em; */
    & .cell {
      height: 2em;
      padding: 0.5em 0;
      border: 1px solid;
      border-radius: 1em;
      display: flex;
      align-items: center;
    }
    & .pos0 {
      grid-row: 1 / 2;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid;
      border-radius: 3em;
      width: calc(3em + 2px);
      height: 2em;
    }
  }

  .turn.enemy {
    display: grid;
    grid-template-columns: auto;
    /* grid-template-columns: auto 5fr 5fr 5fr 1fr 1fr 1fr; */
    grid-template-rows: 2em;
    gap: 2px;
    margin: 2em 0;
    & .cell {
      grid-row: 1 / 2;
    }
    & .pos0 {
      grid-row: 1 / 2;
      grid-column: 1 / 2;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid;
      border-radius: 3em;
      /* width: calc(3em + 2px); */
      height: 2em;
    }
  }

  .turn.new {
    display: grid;
    grid-template-columns: auto auto;
    grid-template-rows: 2em;
    & .add {
      grid-row: 1 / 2;
      grid-column: 1 / 2;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid;
      border-top-left-radius: 3rem;
      border-bottom-left-radius: 3rem;
    }
    & .minus {
      grid-row: 1 / 2;
      grid-column: 2 / 3;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid;
      border-top-right-radius: 3rem;
      border-bottom-right-radius: 3rem;
    }
  }

  .pos0 {
    grid-column: 1 / 2;
  }
  .pos1 {
    grid-column: 2 / 3;
  }
  .pos2 {
    grid-column: 3 / 4;
  }
  .pos3 {
    grid-column: 4 / 5;
  }
  .pos4 {
    grid-column: 5 / 6;
  }
  .pos5 {
    grid-column: 6 / 7;
  }
  .pos6 {
    grid-column: 7 / 8;
  }
</style>
