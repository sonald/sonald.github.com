---
title: madness of window managers 1
date: 2016-03-22 16:20:47
tags: [wm, mutter]
---
搞了几个月的窗口管理器，不得不说这行真乱。即使有[icccm][]和[wm-spec][]这样的协议存在，但是每个wm在实现的时候也未必完全按照规范来。而有的时候大概
是因为协议本身有些地方说的就比较模糊或者设计得不够合理，导致各个wm的行为出现不一致。
比如[wm-spec][]里提到的
_NET_WORKAREA这个属性。xfwm4，compiz和mutter在同一个多屏幕配置下出现了完全不同的设置，导致在一些场景下有些窗口出现的位置出现奇怪的反直觉。

给个具体实例：
一个多屏环境，有三个工作区，有一个dock程序设置了STRUTS，数据分别是：

    xrandr信息：
    LVDS1 connected primary 800x600+0+0
    DP1 connected 1440x900+800+0

    dock设置的struts信息：
    _NET_WM_STRUT_PARTIAL(CARDINAL) = 0, 0, 0, 362, 0, 0, 0, 0, 0, 0, 49, 725

在这样一个配置下，三个wm给出的属性是：

xfwm4   **_NET_WORKAREA(CARDINAL) = 0, 0, 2240, 538, 0, 0, 2240, 538, 0, 0, 2240, 538, 0, 0, 2240, 538**

compiz  **_NET_WORKAREA(CARDINAL) = 0, 0, 2240, 900**

mutter  **_NET_WORKAREA(CARDINAL) = 725, 0, 1515, 900, 725, 0, 1515, 900, 725, 0, 1515, 900**

从我个人角度看mutter是最合理的。首先三个工作区都有数据，避开了struts所占据的位置，并且使工作区面积最大化
（1515x900 > 2240x538)，xfwm4其次，compiz最离谱，完全不遵守协议。尽管mutter看起来最符合规范，但是却导致有些程序在
放置窗口时出现了问题。比如eog这样的程序，在弹出下拉菜单时会尊重_NET_WORKAREA的设置，所以
它主动将弹出菜单强制放置在这个范围内（比如（734,126）），即使eog主窗口的位置可能不在此范围内（比如在LVDS1的（0,102）位置）。这导致视觉上，弹出菜单不在鼠标点击的位置弹出，反而偏移了很远。
而在compiz和xfwm4上此时却没有问题，因为它们的WORKAREA从（0,0）这个位置开始。有趣的是，如果双屏的分辨率稍作修改，变成如下所示：

    LVDS1 connected primary 1366x768+0+0
    DP1 connected 1440x900+1366+0

mutter上就不会出问题了。因为根据使工作区面积最大化的算法，_NET_WORKAREA变成了如下数据：

    _NET_WORKAREA(CARDINAL) = 0, 0, 2806, 698, 0, 0, 2806, 698, 0, 0, 2806, 698

但是这并不是说xfwm4上eog就不能出现类似现象，只要精心调整两屏的位置和分辨率，这个情况也能
构造出来。主要原因还是[wm-spec][]里对_NET_WORKAREA的描述并不是很精确，wm在实现时有很大的
自由性。像_NET_WORKAREA这种情况在wm的世界里似乎有很多。

[wm-spec]: https://specifications.freedesktop.org/wm-spec/latest/index.html
[icccm]: https://tronche.com/gui/x/icccm/
