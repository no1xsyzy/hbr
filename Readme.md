# 各种HBR功能集合

## 功能一览、其他计划
[*] 核弹计算
[*] Prolog 加持的超级查询（附带几个默认查询）
[*] B服实装速度预测
[ ] 排轴器（包括OD、SP检查）
[ ] 建立data子仓库，以免去每个环境需要重新拉取所有数据的问题

## 如何使用

### 1、在线版
暂时还没找到合适的托管位置（没被墙、不按流量计费、不限访问，尽量可以自动化部署，只需要部署静态资源）

### 2、使用编译好的包
暂时还不可用。当然你也可以在下一步中把 yarn dev 改为 yarn build 自行编译。

### 3、开发模式直接用
安装 node 和 yarn
```sh
$ git clone
$ yarn
$ cp sessdata.example.json && vi sessdata.json # 从官方『入队培训手册』中提取 cookies
$ node scripts/update_hbr.js
$ node scripts/update_bili.js
$ node scripts/gen_prolog.js
$ node scripts/gen_translate.js
$ node scripts/validate.js # 如果要验证一下是否存在新的类型的数据的话
$ yarn dev
```
