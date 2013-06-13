---
layout: post
title: "a pattern for creating js object"
date: 2012-06-11 11:07
comments: true
tags: [js]
---

在看一些node模块的代码的时候，发现很多都会使用一种奇怪的方式构造对象。
比如下面这个：

```javascript
function dnode (wrapper) {
    if (!(this instanceof dnode)) return new dnode(wrapper);

    this.proto = protocol(wrapper);
    this.stack = [];
    this.streams = [];
    return this;
}
```

代码来自[dnode][1]，它奇怪的地方是`if (!(this instanceof dnode)) return new dnode(wrapper);`
这条语句。
为什么要这么写呢：其实理由很简单，为了避免js程序员们忘记在调用构造函数时前面家`new`而导致
污染了全局对象。
所以在构造时留了个心眼，如果`this`求值不是`dnode`实例，那就说明你忘记加`new`了，
这时候上面的保险做法可以保证正确的执行。

再比如下面这个例子（从node-glob摘抄过来）：

```javascript
function Glob (pattern, options, cb) {
  if (!(this instanceof Glob)) {
    return new Glob(pattern, options, cb)
  }

  if (typeof cb === "function") {
    this.on("error", cb)
    this.on("end", function (matches) {
      // console.error("cb with matches", matches)
      cb(null, matches)
    })
  }
  ...
}
```

更新：[dailyjs上提到][2]ECMAScript 5.1计划让builtin的构造函数支持类似的用法。

[1]: https://github.com/substack/dnode
[2]: http://dailyjs.com/2012/06/11/js101-constructor-functions
