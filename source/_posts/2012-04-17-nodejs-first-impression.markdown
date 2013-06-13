---
layout: post
title: "Nodejs: first impression"
date: 2012-04-17 11:28
comments: true
tags: [nodejs]
---

Nodejs is incredible, especially for a front-end developer.  what is Node,
I just quote from [website][node]:
> Node.js is a platform built on Chrome's JavaScript runtime for easily
> building fast, scalable network applications. Node.js uses an 
> event-driven, non-blocking I/O model that makes it lightweight and 
> efficient, perfect for data-intensive real-time applications that run 
> across distributed devices.

After some digging, I wrote a simple wc clone, here is it:
{% include_code wc.js %}

You need to install optimist `npm install optimist` to run this file.

__update__:
a really great sum-up of resources for you to [dive into node][1]

[node]: http://nodejs.org
[1]: http://awebfactory.com.ar/node/470
