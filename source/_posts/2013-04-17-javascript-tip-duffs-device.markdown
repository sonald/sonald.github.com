---
layout: post
title: "javascript tip: Duff's Device"
date: 2013-04-17T23:56:58+08:00
comments: true
external-url: 
tags: [javascript, tip, performance]
---
偶尔在网上闲逛的时候，总能发现一些短小精悍的代码，优雅简练，下面这个就是一个例子：

    ```javascript
    var iterations = Math.ceil(values.length / 8);
    var startAt = values.length % 8;
    var i = 0;
    
    do {
        switch(startAt){
            case 0: process(values[i++]);
            case 7: process(values[i++]);
            case 6: process(values[i++]);
            case 5: process(values[i++]);
            case 4: process(values[i++]);
            case 3: process(values[i++]);
            case 2: process(values[i++]);
            case 1: process(values[i++]);
        }
        startAt = 0;
    } while (--iterations > 0);
    ```
原来是用C实现的，这里改成Javascript版本。它的作用是用来优化对一个大数组的循环访问。如果对Javascript感兴趣，可以看[这里][1]，作者是yahoo的大牛。

[1]: http://oreilly.com/server-administration/excerpts/even-faster-websites/writing-efficient-javascript.html
