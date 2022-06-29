星火p2p下载的控制端，可以用来搭建自己的软件源，目前暂未上线，这个项目可以控制aria2c下载deb源文件同时分享出去
项目使用nodejs写的启动需要先安装nodejs环境，搭建好node环境后在项目的根目录执行，目前我自己在做源种，我这里的网络环境不好可能会有点慢，甚至不一定能穿透连上

```
npm i
```
然后临时启动可以使用
```
npm start
```
或者是
```
node development.js
```
以上两个都是使用开发环境修改代码后会有热更新

生产环境使用
```
node production.js
```
这三条命令都是只在当前终端，关闭终端就会关闭程序

在后台执行可以使用pm2来启动对应的环境文件
```
pm2 --name  项目名字   环境文件
```
除此之外还需要手动启动aria2c，需要指定rpc端口

项目的配置文件在根目录的config.json保存
```
{
    "torrent_name": "http://d.store.deepinos.org.cn/store/torrent.json",// 下载种子文件的列表，里边是一个序列化的List
    "aria2c_rpc": 6800,// aria2c的RPC端口，在aria2c启动的时候指定
    "aria2c_host": "127.0.0.1",// aria2c的地址，一般同一台机器的话就直接用127.0.0.1就可以
    "target_path": "" // 要下载的目录，所有的deb都会下载到这个文件目录里
}

```

