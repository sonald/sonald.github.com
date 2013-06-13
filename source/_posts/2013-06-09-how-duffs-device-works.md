title: how duffs device works
date: 2013-06-09 11:11:25
tags: [programming, tip]
---

[上次][1]看到一段JS的代码觉得很酷，今天偶尔看到[另一篇文章][2]，讲的是原C版的Duff's Device。自认为对C很有认识了，没想到这种诡异的写法还是难倒我了。现在才知道原来C的语法可以这么灵活。原文里给出了一个[链接][3]，是一个C的yacc语法文件。根据这个文件里switch和statement的描述可以很清楚的看出来，在switch中可以嵌入任何复杂的statement，而不仅仅是迭代语句。那到底生成的代码时怎么样的呢，它的工作原理在[文章][2]里已经进行了描述，但是想要知道到底是怎么样的，还是得看汇编，于是我将下面一段代码：

```c
    #include <stdio.h>
    
    int main(int argc, char *argv[])
    {
        int key = 2;
        switch(key)
            for (int i = 0; i < 10; ++i) {
                key = i;
            case 2: printf("case 2: key is %d\n", key);
            case 4: printf("case 4: key is %d\n", key);
            }
        return 0;
    }
```

用`clang -S -emit-llvm`反汇编了出来，核心的部分如下：

```llvm
  %key = alloca i32, align 4
  %i = alloca i32, align 4
  store i32 0, i32* %1
  store i32 %argc, i32* %2, align 4
  store i8** %argv, i8*** %3, align 8
  store i32 2, i32* %key, align 4
  %4 = load i32* %key, align 4
  switch i32 %4, label %19 [
    i32 2, label %11
    i32 4, label %13
  ]
                                                  ; No predecessors!
  store i32 0, i32* %i, align 4
  br label %6

; <label>:6                                       ; preds = %15, %5
  %7 = load i32* %i, align 4
  %8 = icmp slt i32 %7, 10
  br i1 %8, label %9, label %18

; <label>:9                                       ; preds = %6
  %10 = load i32* %i, align 4
  store i32 %10, i32* %key, align 4
  br label %11

; <label>:11                                      ; preds = %0, %9
  %12 = call i32 (i8*, ...)* @printf(i8* getelementptr inbounds ([10 x i8]* @.str, i32 0, i32 0))
  br label %13

; <label>:13                                      ; preds = %0, %11
  %14 = call i32 (i8*, ...)* @printf(i8* getelementptr inbounds ([10 x i8]* @.str1, i32 0, i32 0))
  br label %15

; <label>:15                                      ; preds = %13
  %16 = load i32* %i, align 4
  %17 = add nsw i32 %16, 1
  store i32 %17, i32* %i, align 4
  br label %6

; <label>:18                                      ; preds = %6
  br label %19

; <label>:19                                      ; preds = %18, %0
  ret i32 0

```
这个可读性还是很强的，基本上就是switch块和嵌入switch的循环被拆成两个独立的代码块，并且switch的分支语句会跳转到for循环体中带有相应label的部分。这个跳转只会影响for的第一次迭代，之后就是正常的循环了。另外，如果switch分支没有任何匹配的case，就会跳过整个循环（代码中switch的默认label是%19，对应函数的结尾处）。

这个技巧有什么用我也不知道，说不定什么时候能派上用场呢。

[1]: /2013/04/17/javascript-tip-duffs-device/
[2]: http://tenaciousc.com/how-duffs-device-works/
[3]: http://www.lysator.liu.se/c/ANSI-C-grammar-y.html
