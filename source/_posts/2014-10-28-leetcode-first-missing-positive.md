title: leetcode: first missing positive
date: 2014-10-28 18:42:06
tags: [algorithm]
---
今天晚上又脑洞打开，一把年纪了，数学成了我的短处。昨天晚上一边看优酷一边解题，没想出来怎么在常量空间或者O(n)里处理这个问题。今天晚上突然想到一个绝妙的算法。十分钟左右搞定。

思想很简单：把每个数字A[i]挪到非递减排序后内所应在的位置上。如果数字不在(0, n]之间就跳过。比如`[2, 3, 7, -1, 4]`，按照排序顺序重新放置并忽略不在(0, n]范围内的数字就变成`[2, 2, 3, 4, 4]了`。然后就清楚了，再遍历一次新数组，第一个不满足条件`A[i] != i+1`的就是答案。

```c++
class Solution {
public:
    int firstMissingPositive(int A[], int n) {
        for (int i = 0; i < n; i++) {
            if (A[i] <= 0 || A[i] > n) {
                continue;
            } 

            int k = A[i];
            int p = A[k-1];
            while (k != p) {
                A[k-1] = k;
                k = p;
                if (p > n || p <= 0) break;
                p = A[k-1];
            }
        }

        for (int i = 0; i < n; i++) {
            if (A[i] != i+1) return i+1;
        }
        return n+1;
    }
};
```
我在网上看了下，这个同学跟我的[思路](http://yucoding.blogspot.com/2013/01/leetcode-question-28-first-missing.html)是一样的，不知道还有没有其他好的算法。