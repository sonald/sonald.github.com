---
layout: post
title: "porting narcissus for nodejs"
date: 2012-12-19 18:53
comments: true
tags: [nodejs, javascript]
---

最近在看[narcissus][1]的代码，这是一个js实现的js解释器。为了方便导出AST，
交互式的检查运行环境，于是修改了一下代码，让它可以跑在nodejs上。
代码放在[github][2]上了，做的修改不多，主要原版年代久远，还使用了mozilla的
JS扩展，对这些部分进行一些修改即可。

主要修改要两个方面：

* 改写conditional catch clause。这个是mozilla的扩展，nodejs不支持。
例如
```javascript
        try {
            execute(parse(s), x2);
        } catch (e if e == THROW) {
            x.result = x2.result;
            throw e;
        } finally {
            ExecutionContext.current = x;
        }

```
改为
```javascript
        try {
            execute(parse(s), x2);
        } catch (e) {
            if (e == THROW) {
                x.result = x2.result;
                throw e;
            } else {
                throw e;
            }
        } finally {
            ExecutionContext.current = x;
        }

```

* RegExp对象不是callable的，
例如
```javascript
        if ((match = fpRegExp(input))) {
            token.type = NUMBER;
            token.value = parseFloat(match[0]);
        } else if ((match = /^0[xX][\da-fA-F]+|^0[0-7]*|^\d+/(input))) {
            ....
        }

```
改为
```javascript
        if ((match = fpRegExp.exec(input))) {
            token.type = NUMBER;
            token.value = parseFloat(match[0]);
        } else if ((match = /^0[xX][\da-fA-F]+|^0[0-7]*|^\d+/.exec(input))) {
            ....
        }
```


另外，添加了一些原代码运行需要的函数的实现，print、snarf和\_\_defineProperty__。
为了不影响宿主环境，所有代码都在一个新的vm上运行。

需要说明的是下面这个片段，如果没有，print和snarf运行时会出错，因为被narcissus认为
是非callable的。

```javascript
s = 'print.__proto__ = Function;' +
    'snarf.__proto__ = Function;';
vm.runInContext(s, runtime);
```

[1]: http://lxr.mozilla.org/mozilla/source/js/narcissus
[2]: http://github.com/sonald/node-narcissus
