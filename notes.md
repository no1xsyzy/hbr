# 关于 score attack 参数含义

## 第一版打分

```json
{
    "id": 145000026,
    "notice_id": 200000079,
    "label": "scoreAttack26",
    "name": "スコアアタック26",
    "desc": "イベントストーリーの強敵が\nスコアアタックに登場！\n高難易度やミッションをクリアして\nS以上確定ガチャチケットや\nジェネライズ素材をGETしよう",
    "hint": "",
    "score_calc": {
      "sbtr": 0.5,
      "lsbtr": 1.05,
      "sbnb": 30,
      "tmdc": 0.01, // 伤害分系数
      "etc": 30,
      "min_tr": 0,
      "max_tr": 0,
      "btcfr": 0,
      "btr": 0,
      "calc_ver": 1 // 第一版打分
    },
    "logo": "Logo_026.webp",
    "background": "EventBg_026.webp",
    "image": "EventTop_026.webp",
    "condition": "メインストーリー 第一章をクリア",
    "missions": [], // 任务奖励
    "highscore": [], // 最高记录奖励
    "totalscore": [], // 累计奖励
    "battles": [], // 难度
    "rules": [], // 选择挑战
    "in_date": "2024-07-05 02:00:00+00:00",
    "out_date": "2024-07-20 10:59:59+00:00"
}
```

## 第二版打分

1T 结束战斗为 x1.5 (max_tr/10000)
12T (btcfr) 结束战斗为 x1.2 (btr/10000)
30T 结束战斗为 x0.8 (min_tr/10000)
其余线性插值

```json
{
    "id": 145000055,
    "notice_id": 200000157,
    "label": "scoreAttack55",
    "name": "#55 The Wandering Lurker",
    "desc": "イベントストーリーの強敵が\nスコアアタックに登場！\n高難易度やミッションをクリアして\nS以上確定ガチャチケットや\nジェネライズ素材をGETしよう",
    "hint": "",
    "score_calc": {
      "sbtr": 0.5,
      "lsbtr": 1.05,
      "sbnb": 30,
      "tmdc": 0.0067, // 伤害分系数
      "etc": 30,
      "min_tr": 8000, // 最小回合加成
      "max_tr": 15000, // 最大回合加成
      "btcfr": 12, // 中值回合
      "btr": 12000, // 中值回合加成
      "calc_ver": 2
    },
    "logo": "Logo_055.webp",
    "background": "EventBg_055.webp",
    "image": "EventTop_055.webp",
    "condition": "メインストーリー 第一章をクリア",
    "missions": [], // 任务奖励
    "highscore": [], // 最高记录奖励
    "totalscore": [], // 累计奖励
    "battles": [], // 难度
    "rules": [], // 选择挑战
    "in_date": "2024-07-05 02:00:00+00:00",
    "out_date": "2024-07-20 10:59:59+00:00"
}
```

## 难度 `battles` 的含义

```json
{
    "id": 138003101,
    "label": "scoreAttackBattle_1_21",
    "nsabl": "",
    "c": "",  // 开放 condition
    "d": 1,  // 难度
    "dn": "ビギナー", // 难度描述（Beginner）
    "ds": 1000, // 难度分
    "rs": 3000, // 『推荐战力』
    "b": [
        "OctopusTailSolid_scoreattack_a", // 行动标签
    ],
    "bn": [
        {
        "n": "ソリッドテイル", // 名字
        "d": [ // 破坏率
            5, // 基础破坏率
            300  // 上限
        ],
        "r": [ // 抗性
            [
            "Light",
            95
            ],
            [
            "Dark",
            -50
            ]
        ]
        }
    ],
    "btl": "Scoreattack21_a",
    "is_c": false,
    "rbl": [ // border
        60,
        0,
        0
    ],
    "cpl": [
        [],
        [],
        []
    ],
    "bcpl": [
        [],
        [],
        []
    ],
    "dl": [  // dp
        14500,
        0,
        0
    ],
    "hl": [  // hp
        35500,
        0,
        0
    ],
    "eg": [],
    "al": [  // 攻击倍率
        1,
        0,
        0
    ],
    "db": 1000000,  // 伤害分无惩罚上限
    "dbnc": 1,  // 伤害分百分比？
    "nbb": 30,  // no break bonus 无破盾奖励分
    "mdb": 0,
    "mtb": 300,  // m? turn bonus
    "tl": 30  // turn limit
    // 回合分是 [1, d.mtb] [tl, 0] 的插值
}
```

对于未指明的难度，所有数值都是线性插值出来的