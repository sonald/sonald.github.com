---
layout: post
title: "mosh is awesome"
date: 2012-04-13 10:23
comments: true
tags: [utils]
---

I occasionally came across [mosh][] yesterday, and try it today, and found it 
really awesome. It does what it promised 
> to keeps the session alive if the client goes to sleep and wakes up later,
> or temporarily loses its Internet connection.

that is power enough to draw your mind and it also supports *roaming*
> Mosh allows the client and server to "roam" and change IP addresses,
> while keeping the connection alive. 

I just get a chance to try that cool feature some days ago. My wired network accidentally 
losted, and my wireless connection took in charge a few seconds later, and as wireless got
connected, my mosh tunnel reestablished. 

If you see a log `mosh requires a UTF-8 locale` when running mosh, it means
there is something wrong with your ssh config. try this: 
```bash
mosh --server="LANG=$LANG mosh-server" user@ip [your cmd]
```

or FYI, see this [issue][]

If you ever use tmux or gnu screen, here comes the power
```bash
mosh sonald@remote-server tmux attach-session
```
This saves me a lot of trouble.

[mosh]: https://github.com/keithw/mosh
[issue]: https://github.com/keithw/mosh/issues/98
