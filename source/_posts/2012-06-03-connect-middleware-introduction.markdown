---
layout: post
title: "connect middleware introduction"
date: 2012-06-03 17:00
comments: true
tags: [nodejs]
---

[connect][ref1]是一个node的开发框架，connect作者对它做了[介绍][ref2]。
connect的精华就在于middleware堆栈,它允许你在一个请求到达或者对请求进行回复之前
对过程进行微调。比如，你可以写一个logger，追踪所有的URL请求，可以解析请求中的
query或数据等，还可以在发送回复之前对数据进行压缩以节省带宽。[connect][ref1]
默认已经提供了很丰富的middleware，也有许多第三方的[middleware可供使用][ref4]，必要
的时候也可以自己编写。由于connect是建立在nodejs的http模块基础上的，因此倚赖
http模块的实现，而且得很熟悉才行。

要注意的是现在express 2.x使用了connect 1.x版本，这个版本缺少一些middleware，
比如compress。而connect现在已经到了2.3.3版本，最近好像3.0也已见端倪，这几个
版本之间的middleware不一定兼容，所以交叉使用的时候可能会出现问题。

比如我从connect 1.8.7拿过来的compress在使用过程中
发现有时候会出现`Can't ... after they are sent.`的错误，于是我在拷贝
过来的compress中做了一点改动，对connect的[patch][ref3]再次做了hack。

```javascript
//Hack, override connect 1.x patch
var http = require('http')
, _resp = http.OutgoingMessage.prototype;

(function() {
    if (_resp._compressPatched) return;
    _resp.__defineGetter__('headerSent', function(){
        return this._header || this._headerSent;
    });
    _resp._compressPatched = true;

}());
```


[ref1]: http://github.com/senchalabs/connect
[ref2]: http://howtonode.org/connect-it
[ref3]: https://github.com/senchalabs/connect/blob/1.8.7/lib/patch.js
[ref4]: https://github.com/senchalabs/connect/wiki
