#### 星火p2p下载的控制端，可以用来搭建自己的软件源，以辅助分发

#### 项目语言：node

> 客户端支持目前暂未上线，计划在3.3后上线

原理是bittorrent，使用aria2c作为做种工具

贡献者可根据此指南简单地为星火商店创建BT加速站，为加快用户的下载速度贡献一份自己的力量！

---

*注意：原理和BT下载相同，需要机器长期启动（家用机器可以用NAS或者树莓派之类的）和一个较好的网络环境。*

*移动宽带或者小品牌宽带可能会有难以穿透的问题导致加速效果很差，使用这些宽带的朋友就不建议使用了*

*BitTorrent下载或者PT的朋友应该会更熟悉*

---
## 搭建指南

### 准备阶段

搭建环境：`sudo apt install nodejs npm git aria2c screen`

获取仓库：`git clone https://gitee.com/deepin-community-store/sync-point-anchor `

进入仓库，然后执行`npm -i`即可完成准备

### 配置阶段

项目的配置文件在根目录的config.json保存
```
{
    "torrent_name": "http://d.store.deepinos.org.cn/store/torrent.json",// 下载种子文件的列表，里边是一个序列化的List
    "aria2c_rpc": 6800,// aria2c的RPC端口，在aria2c启动的时候指定
    "aria2c_host": "127.0.0.1",// aria2c的地址，一般同一台机器的话就直接用127.0.0.1就可以
    "target_path": "" // 要下载的目录，所有的deb都会下载到这个文件目录里
}

```
需要配置的选项：
* `target_path` 请把软件包保存目录填写到后面的引号中。最小可用空间大小：140G

高级配置项：

* `aria2c_rpc`
* `aria2c_host`

对于普通用户，保持默认即可

### 启动阶段
```bash
aria2c -D --enable-rpc=true --rpc-listen-all=true --rpc-listen-port=6800 --rpc-allow-origin-all=true --continue=true --check-integrity=true --bt-enable-lpd=true --enable-dht=true --listen-port=6881 --dht-listen-port=6881 --seed-ratio=0 --bt-max-open-files=9999999 --enable-peer-exchange=true --bt-max-peers=9999999 --max-concurrent-downloads=999999
```
启动aria2 服务


```
screen -S spark-sync-point-anchor
```
输入后按回车，然后输入
```
node production.js

```
然后`Ctrl+alt+D`，回到终端页面，即启动完毕


