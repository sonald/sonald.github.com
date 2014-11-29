title: leetcode: triangle
date: 2014-11-24 19:24:29
tags: [algorithm]
---

[This](https://oj.leetcode.com/problems/triangle/) is also a problem which can be easily solved by dynamic programming (DP is so ubiquitous). Anyway, The **Note** said 
> Bonus point if you are able to do this using only O(n) extra space, where n is the total number of rows in the triangle.

Well, acctually the problem can be solved without extra space. The idea is quit simple:
We store the dp value (current minimum path sum) in-place from the bottom up, then the value in the tip of triangle is the result.

```C++
class Solution {
public:
    int minimumTotal(vector<vector<int> > &triangle) {        
        int n = triangle.size();

        for (int l = n-2; l >= 0; l--) {
            auto& v = triangle[l];
            auto& v2 = triangle[l+1];
            for (int i = 0; i < v.size(); i++) {
                v[i] += min(v2[i], v2[i+1]);
            }
        }
        return triangle[0][0];
    }
};
```
