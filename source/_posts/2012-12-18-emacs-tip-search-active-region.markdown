---
layout: post
title: "emacs tip: search active region"
date: 2012-12-18 13:56
comments: true
tags: [emacs]
---

WebStorm有一个小功能特别好，就是当你选择一段文字之后，进行搜索，它会直接搜索选中的文字。
emacs的搜索功能强大，但是得在进入搜索模式后，再选择要搜索的表达式，下面的这个defadvice
可以达到WebStorm的效果，如果当前有活动区域，则直接搜索此区域：

{% codeblock lang:scheme search-region %}

(defadvice isearch-forward-regexp (around sycao/search-region)
  "if there is an active region, search from it directly"
  (if (region-active-p)
      (progn
        (let ((beg (region-beginning))
              (end (region-end)))
          (deactivate-mark)
          (isearch-mode t t nil nil)
          (isearch-yank-string (buffer-substring-no-properties beg end))))
    ad-do-it))

(ad-activate 'isearch-forward-regexp)

{% endcodeblock %}
