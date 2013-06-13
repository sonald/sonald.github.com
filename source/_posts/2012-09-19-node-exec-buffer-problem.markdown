---
layout: post
title: "node exec buffer problem"
date: 2012-09-19 19:21
comments: true
tags: [nodejs]
---

最近遇到一个诡异的问题，由于代码逻辑过于复杂，一开始还没想到是这个问题。
后来使用强大的[node-inspector][1]大致定位到出错的位置，经过仔细分析，
发现这个问题竟然出在child\_process.exec的buffer上。

出错的代码经过简化大致是这样的：
{% include_code exec_bad.js %} 

一般没有问题，但是如果sdb2的分区大小足够大，当格式化正在进行的过程中，会收到SIGTERM退出。
原因其实很简单，就是exec有一个内部的buffer来缓冲输出，默认的buffer大小是200K，所以当
输出大小超过时就被kill了。看child\_process的代码就很清楚了：

这是execFile函数的一部分，基本上就是buffer了所有的输出，在child退出时传递给callback。
```

  child.stdout.setEncoding(options.encoding);
  child.stderr.setEncoding(options.encoding);

  child.stdout.addListener('data', function(chunk) {
    stdout += chunk;
    if (stdout.length > options.maxBuffer) {
      err = new Error('maxBuffer exceeded.');
      kill();
    }
  });

```

所以只要传递一个更大的buffer就可以了：
{% include_code exec_well.js %} 

但是这种方法不容易扩展，所以如果需要更灵活的处理，用spawn比较好。

[1]: https://github.com/dannycoates/node-inspector
