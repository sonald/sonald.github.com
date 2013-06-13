---
layout: post
title: "baidu offline map data is wrong"
date: 2013-04-23T16:56:56+08:00
comments: true
external-url: 
tags: [map, android, tip]
---

今天遇到一个问题，百度android sdk扫不出离线地图包，后来发现主要问题是官方文档说明没有及时更新。


说实话，感觉百度的地图sdk有不少问题，官方api文档语焉不详，给出的demo有问题，说明更新也不及时。最可恶的是按照说明下载的离线数据包在程序里面扫不出来，几度让人怀疑自己的智商。期间试过多种方法，比如安装百度地图app，从百度地图里先下载离线地图，然后再回到自己的app，发现无法加载。从官方下载的离线数据包，根据
[说明][2]导入（当然，取决于你使用的sdk版本，说明可能是错的）sd卡后同样无法加载。


最后发现导入数据包的正确方法是解压zip包，将里面的vmp目录拷贝到SD卡根目录的BaiduMapSDK目录下（没有就创建一个）。[MKOfflineMap][1]的scan函数返回值
一直都是0，所以不要理会它。[这里][3]关于离线包在SD卡上的存储未知的说明是正确的，而[下载页面][2]给出的说明是错的。

另外一种可以成功的方法是把sd卡里面所有的离线包删除，然后使用[MKOfflineMap][1]的searchCity搜索城市地图，并用start函数手动下载离线数据包（比如北京），然后scan会正确加载离线数据（虽然这个时候scan函数返回值还是0）。

bonus: 另外，官网上的sdk包有bug，所以你可能需要联系百度地图团队（比如百度hi）获取一个更新的版本。遇到问题，去问百度客服吧，你的智商没问题。

[1]: http://developer.baidu.com/map/android_refer/index.html
[2]: http://shouji.baidu.com/map/map.html?from=3052
[3]: http://developer.baidu.com/map/sdkandev-10.htm
