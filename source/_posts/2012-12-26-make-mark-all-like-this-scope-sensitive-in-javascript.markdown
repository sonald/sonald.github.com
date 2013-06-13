---
layout: post
title: "make mark all like this scope sensitive in javascript"
date: 2012-12-26 11:58
comments: true
tags: [emacs, javascript]
---

sublime text 2的多cursor功能很强大，在做某些操作的时候很方便。但是标记
多cursor也很麻烦。emacs的[multiple-cursors][]可以用来模仿这个特性，而且
更好的是它完全可以融入emacs的环境里，配合其他mode来使用会更加强大。但是
有个小问题是它的标记是基于正则的，这在有些时候不太方便，比如在js里，我
想标记某个变量的所有实例，就很难。于是自己写了一个函数来解决这个问题。

{% codeblock sycao/js2-mark-token-at-point lang:scheme %}

(defun sycao/js2-mark-token-at-point ()
  "mark all semantic instances of the variable under cursor within the defining scope"
  (interactive)
  (mc/remove-fake-cursors)
  (let ((ref-node (js2-node-at-point))
        (ref-node-beg nil)
        name
        scope)

    (setq ref-node-beg (js2-node-abs-pos ref-node))
    (unless (region-active-p)
      (goto-char ref-node-beg)
      (push-mark (+ ref-node-beg (js2-node-len ref-node)))
      (activate-mark))

    (save-excursion
      (when (and ref-node (js2-name-node-p ref-node))
        (setq scope (js2-node-get-enclosing-scope ref-node)
              name (js2-name-node-name ref-node))
        (setq scope (js2-get-defining-scope scope name))
        (js2-visit-ast
         scope
         (lambda (node end-p)
           (when (and (not end-p)
                      (js2-name-node-p node)
                      (string= name (js2-name-node-name node)))
             (let* ((beg (js2-node-abs-pos node))
                    (end (+ beg (js2-node-len node)))
                    (new-scope (js2-node-get-enclosing-scope node))
                    (new-scope (js2-get-defining-scope new-scope name)))
               (if (and (eq new-scope scope)
                        (not (= beg end)))
                   (progn
                     (goto-char end)
                     (push-mark beg)
                     (exchange-point-and-mark)
                     (if (not (= ref-node-beg beg))
                         (mc/create-fake-cursor-at-point))
                     (exchange-point-and-mark)
                     ))))

           t)))))
  (if (> (mc/num-cursors) 1)
      (multiple-cursors-mode 1)
    (multiple-cursors-mode 0)))

{% endcodeblock %}


我参考了[js2-highlight-vars.el][]和mc/mark-all-like-this的代码。基本思
路就是利用js2-mode提供的api遍历ast，找到所有目标变量的引用，并进行标记。
需要注意一点的是，要把函数自身加入`mc--default-cmds-to-run-once`里，否
则会产生循环调用。

```scheme
(add-to-list 'mc--default-cmds-to-run-once 'sycao/js2-mark-token-at-point)
```

例如用下面的代码进行测试，如果光标在第二行的localVar上，执行
`sycao/js2-mark-token-at-point`就会标记第2、9、11行的localVar。

```javascript var localVar = 12;

function f() {
    var localVar = 10;

    function f2() {
        var localVar = 20;
        localVar++;
    }

    localVar += 1;
    f2 ();
    localVar += 9;
}
```

[js2-highlight-vars.el]: http://mihai.bazon.net/projects/editing-javascript-with-emacs-js2-mode/js2-highlight-vars-mode
[multiple-cursors]: https://github.com/magnars/multiple-cursors.el
