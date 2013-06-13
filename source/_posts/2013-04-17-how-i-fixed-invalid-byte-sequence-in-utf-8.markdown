---
layout: post
title: "how I fixed invalid byte sequence in UTF-8"
date: 2013-04-17T10:47:40+08:00
comments: true
external-url: 
tags: [ruby, octopress]
---

## TL;DR
The real problem I encounter and resolution is [here][1].

## About ArgumentError: invalid byte sequence in UTF-8
when I switch from linux box to Mac, I have to setup octopress 
for my blog. I have followed the guide, do `rvm requirements` and
 have ruby 1.9.3 installed cleanly. but when I hit `bundle install` every time, It just gives me nothing but an 
 `ArgumentError: invalid byte sequence in UTF-8` error. Since I'm
  not quite familiar with ruby, I googled a lot, and none of   
  the solutions fits me. After a long time of unlucky, finally I found the real problem. 
  <p>
  First things first, the real problem is that I had changed files under `/etc/paths.d/`, and vim leaved undelete hidden file under that path. The consequence is that `path_helper` will read all files (including hidden files) to build PATH variable, which then included unprintable chars which is invalid utf8 sequence. This is the reason `bundle install` complained about. but after I deleted all hidden files under `/etc/paths.d`, the problems still exists! Now that as [First Rule of Programming: It’s always your fault][2] said, the problem must be mine. After a few moment of pondering, I found the problem is that I'm in a tmux session and it cached PATH variable! So I quit tmux and restart, everything works great now.

[1]: http://daniel.hepper.net/blog/2012/03/down-the-rabbit-hole/
[2]: http://www.codinghorror.com/blog/2008/03/the-first-rule-of-programming-its-always-your-fault.html
