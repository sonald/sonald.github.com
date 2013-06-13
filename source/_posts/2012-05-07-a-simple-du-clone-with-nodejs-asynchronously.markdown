---
layout: post
title: "a simple du clone with nodejs asynchronously"
date: 2012-05-07 18:46
comments: true
tags: [nodejs]
---

最近一直在关注[Node.js][1]，感觉与之前一直用的编程模型有很大的区别。Node.js完全基于异步回调和事件机制的体系，
给如何更好的编写JS带来一些挑战，我也是刚刚进入web编程这个领域，所以有许多概念需要再清晰和明确。昨天尝试用
Node.js写了一个简单的du，一个同步版本，一个异步版本。

同步的比较简单，非常直觉，大家都很熟悉：
{% include_code du-sync du.js %}

异步版本：
{% include_code du-async du-async.js %}
可以看出两个版本在结构上其实有很大的区别。在使用callback的异步方案中，我使用了[EventEmitter][2]，当然不是必须的，
然后在进程的[exit事件][3]时，输出总大小。这里的问题是，这种方法我无法准确的以某个顺序输出参数列出的每一个路径的大小，
比如
    ./du.js dirA dirB dirC
如此来调用，就不能用exit事件去处理了，这是Node.js中异步编程的一个困难所在。
为了解决这种问题，有很多不同的方案。有一种模式叫promise，node实现[node-promise][4]，
据说老版本的Node.js中提供了promise语义，后来被去除了，promise对我来说比较难理解，也是第一次接触，所以打算做更多的
探索再说。

[1]: http://nodejs.org/
[2]: http://nodemanual.org/latest/nodejs_ref_guide/eventemitter.html
[3]: http://nodemanual.org/latest/nodejs_ref_guide/process.html#process.event.exit
[4]: https://github.com/kriszyp/node-promise
