# 各种HBR功能集合

## 功能一览、其他计划
* [x] 核弹计算
* [x] Prolog 加持的超级查询（附带几个默认查询）
* [x] B服实装速度预测
* [ ] 排轴器（包括OD、SP检查）
* [ ] 建立data子仓库，以免去每个环境需要重新拉取所有数据的问题

## 如何使用

### 1、在线版
暂时还没找到合适的托管位置（没被墙、不按流量计费、不限访问，尽量可以自动化部署，只需要部署静态资源）

### 2、使用编译好的包
暂时还不可用。当然你也可以在下一步中把 yarn dev 改为 yarn build 自行编译。

### 3、开发模式直接用
安装 node 和 yarn
```sh
$ git clone https://github.com/no1xsyzy/hbr.git
$ cd hbr
$ yarn
$ cp sessdata.example.json && vi sessdata.json # 从官方『入队培训手册』中提取 cookies
$ node ./scripts/update_hbr.js
$ node ./scripts/update_bili.js
$ node ./scripts/generate.js
$ node ./scripts/validate.js # 如果要验证一下是否存在新的类型的数据的话
$ yarn dev
```

## 文件结构

```
.
|-- data_hbr      # hbr.quest 数据（克隆时不存在）
|-- data_bili     # 国服特定数据（克隆时不存在）
|-- data_gen      # 预处理过的数据（克隆时不存在）
|-- dist          # build 输出目录（克隆时不存在）
|-- public        # 公共资源
|   |-- hbr       # hbr本身的资源（克隆时不存在）
|   `-- symbol    # 一些符号
|-- scripts       # 抓取、预处理脚本
|-- src           # 主程序代码
|   |-- components         # svelte 组件
|   |   `-- Pager.svelte   # 分页器，添加新页面需要修改它
|   `-- lib
|       |-- main.pl        # Prolog 使用的默认初始化
|       `-- databili.toml  # 国服不可抓取的信息（手工维护）
|-- index.html    # 入口网页
|-- notes.md      # 一些笔记
|-- Readme.md     # 自述文件（就是你在看的这个）
|-- sessdata.json # 需要填入国服入队培训手册的对应cookie来正确获取信息（克隆时不存在）
`-- sessdata.example.json # 上面这个文件的模板
```
